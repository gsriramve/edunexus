import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../documents/s3.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async create(tenantId: string, createStudentDto: CreateStudentDto) {
    // Check if roll number already exists
    const existingRollNo = await this.prisma.student.findFirst({
      where: { tenantId, rollNo: createStudentDto.rollNo },
    });

    if (existingRollNo) {
      throw new ConflictException('Roll number already exists');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findFirst({
      where: { tenantId, email: createStudentDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Verify department exists
    const department = await this.prisma.department.findFirst({
      where: { id: createStudentDto.departmentId, tenantId },
    });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    // Create user and student in a transaction
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: createStudentDto.email,
          name: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
          role: 'student',
          status: 'active',
        },
      });

      // Create user profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          gender: createStudentDto.gender,
          dob: createStudentDto.dateOfBirth ? new Date(createStudentDto.dateOfBirth) : null,
          bloodGroup: createStudentDto.bloodGroup,
          nationality: createStudentDto.nationality,
        },
      });

      // Create student record
      const student = await tx.student.create({
        data: {
          tenantId,
          userId: user.id,
          rollNo: createStudentDto.rollNo,
          departmentId: createStudentDto.departmentId,
          batch: createStudentDto.batch,
          semester: createStudentDto.semester || 1,
          section: createStudentDto.section,
          status: 'active',
          admissionDate: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return student;
    });

    return result;
  }

  async findAll(tenantId: string, query: StudentQueryDto) {
    const { search, departmentId, batch, semester, section, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (batch) {
      where.batch = batch;
    }

    if (semester) {
      where.semester = semester;
    }

    if (section) {
      where.section = section;
    }

    if (status) {
      where.status = status.toLowerCase();
    }

    if (search) {
      where.OR = [
        { rollNo: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      total,
      limit,
      offset,
    };
  }

  async findOne(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async findByUserId(tenantId: string, clerkUserId: string) {
    // First, find the user by Clerk user ID
    const user = await this.prisma.user.findFirst({
      where: { clerkUserId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Then find the student by the database user ID
    const student = await this.prisma.student.findFirst({
      where: { userId: user.id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: {
              include: {
                addresses: true,
                contacts: true,
                emergency: true,
                documents: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  include: {
                    contacts: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(tenantId: string, id: string, updateStudentDto: UpdateStudentDto) {
    const existing = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    // Update student and user in a transaction
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update user name if provided
      if (updateStudentDto.firstName || updateStudentDto.lastName) {
        const currentUser = await tx.user.findFirst({
          where: { id: existing.userId },
        });

        if (currentUser) {
          const nameParts = currentUser.name.split(' ');
          const firstName = updateStudentDto.firstName || nameParts[0] || '';
          const lastName = updateStudentDto.lastName || nameParts.slice(1).join(' ') || '';

          await tx.user.update({
            where: { id: existing.userId },
            data: {
              name: `${firstName} ${lastName}`.trim(),
            },
          });
        }
      }

      // Update user profile if profile fields are provided
      const profileData: any = {};
      if (updateStudentDto.bloodGroup !== undefined) profileData.bloodGroup = updateStudentDto.bloodGroup;
      if (updateStudentDto.nationality !== undefined) profileData.nationality = updateStudentDto.nationality;
      if (updateStudentDto.gender !== undefined) profileData.gender = updateStudentDto.gender;
      if (updateStudentDto.dateOfBirth !== undefined) profileData.dob = new Date(updateStudentDto.dateOfBirth);

      if (Object.keys(profileData).length > 0) {
        await tx.userProfile.upsert({
          where: { userId: existing.userId },
          create: {
            userId: existing.userId,
            tenantId,
            ...profileData,
          },
          update: profileData,
        });
      }

      // Update student record
      const student = await tx.student.update({
        where: { id },
        data: {
          semester: updateStudentDto.semester,
          section: updateStudentDto.section,
          status: updateStudentDto.status?.toLowerCase(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return student;
    });

    return result;
  }

  /**
   * Format time from HH:mm to 12-hour format
   */
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Calculate CGPA from exam results
   */
  private calculateCGPA(examResults: { marks: any; exam: { totalMarks: number } }[]): number {
    if (examResults.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    examResults.forEach((result) => {
      if (result.marks !== null && result.exam.totalMarks > 0) {
        const marks = Number(result.marks);
        const percentage = (marks / result.exam.totalMarks) * 100;
        const gradePoint = Math.min(percentage / 10, 10);
        totalWeightedScore += gradePoint;
        totalWeight += 1;
      }
    });

    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
  }

  async getDashboard(tenantId: string, studentId: string) {
    const student = await this.findOne(tenantId, studentId);

    // Get today's date and day of week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();

    // Parallel data fetching for better performance
    const [
      attendanceRecords,
      pendingFeesResult,
      upcomingExamsCount,
      notificationCount,
      recentNotifications,
      examResults,
      todayTimetable,
    ] = await Promise.all([
      // Get attendance records
      this.prisma.studentAttendance.findMany({
        where: { studentId, tenantId },
      }),
      // Get pending fees
      this.prisma.studentFee.aggregate({
        where: {
          studentId,
          tenantId,
          status: { in: ['pending', 'partial'] },
        },
        _sum: { amount: true },
      }),
      // Get upcoming exams count for this student's semester subjects
      this.prisma.exam.count({
        where: {
          tenantId,
          date: { gte: today },
          subject: {
            semester: student.semester,
            course: { departmentId: student.departmentId },
          },
        },
      }),
      // Get unread notifications count
      this.prisma.notification.count({
        where: {
          userId: student.userId,
          readAt: null,
        },
      }),
      // Get recent notifications
      this.prisma.notification.findMany({
        where: {
          userId: student.userId,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Get exam results for CGPA calculation
      this.prisma.examResult.findMany({
        where: { studentId, tenantId },
        include: {
          exam: {
            select: { totalMarks: true, type: true, subject: { select: { name: true } } },
          },
        },
      }),
      // Get today's timetable for the student's semester/department
      this.prisma.timetable.findMany({
        where: {
          tenantId,
          dayOfWeek,
          isActive: true,
          teacherSubject: {
            subject: {
              semester: student.semester,
              course: { departmentId: student.departmentId },
            },
          },
        },
        include: {
          teacherSubject: {
            include: {
              subject: true,
              staff: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
      }),
    ]);

    // Calculate attendance percentage
    const totalClasses = attendanceRecords.length || 1;
    const presentClasses = attendanceRecords.filter(
      (a: { status: string }) => a.status === 'present' || a.status === 'late'
    ).length;
    const attendancePercentage = attendanceRecords.length > 0
      ? Math.round((presentClasses / totalClasses) * 100)
      : 0;

    // Calculate CGPA from exam results
    const cgpa = this.calculateCGPA(examResults);

    // Format today's schedule
    const todaySchedule = todayTimetable.map((slot) => ({
      id: slot.id,
      time: this.formatTime(slot.startTime),
      endTime: this.formatTime(slot.endTime),
      subject: slot.teacherSubject.subject.name,
      subjectCode: slot.teacherSubject.subject.code,
      room: slot.room,
      type: slot.teacherSubject.subject.isLab ? 'Lab' : 'Lecture',
      teacher: slot.teacherSubject.staff?.user?.name || 'TBA',
    }));

    // Format recent notifications
    const formattedNotifications = recentNotifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'info',
      time: this.formatRelativeTime(n.createdAt),
      createdAt: n.createdAt,
      read: !!n.readAt,
    }));

    // Generate AI insights based on student data
    const aiInsights = this.generateAIInsights(
      examResults,
      attendancePercentage,
      cgpa,
      Number(pendingFeesResult._sum.amount || 0),
    );

    return {
      studentId: student.id,
      name: student.user.name,
      rollNo: student.rollNo,
      department: student.department.name,
      departmentCode: student.department.code,
      semester: student.semester,
      batch: student.batch,
      cgpa,
      attendancePercentage,
      pendingFees: Number(pendingFeesResult._sum.amount || 0),
      upcomingExams: upcomingExamsCount,
      notifications: notificationCount,
      email: student.user.email,
      todaySchedule,
      recentNotifications: formattedNotifications,
      aiInsights,
    };
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  }

  private generateAIInsights(
    examResults: any[],
    attendancePercentage: number,
    cgpa: number,
    pendingFees: number,
  ): Array<{ type: string; text: string; positive: boolean }> {
    const insights: Array<{ type: string; text: string; positive: boolean }> = [];

    // Analyze exam performance
    if (examResults.length > 0) {
      // Group results by subject
      const subjectResults = new Map<string, number[]>();
      for (const result of examResults) {
        const subjectName = result.exam?.subject?.name || 'Unknown';
        const percentage = (Number(result.marks) / result.exam.totalMarks) * 100;
        if (!subjectResults.has(subjectName)) {
          subjectResults.set(subjectName, []);
        }
        subjectResults.get(subjectName)?.push(percentage);
      }

      // Find best and weakest subjects
      let bestSubject = { name: '', avg: 0 };
      let weakestSubject = { name: '', avg: 100 };

      for (const [name, scores] of subjectResults) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > bestSubject.avg) bestSubject = { name, avg };
        if (avg < weakestSubject.avg) weakestSubject = { name, avg };
      }

      if (bestSubject.name && bestSubject.avg >= 70) {
        insights.push({
          type: 'performance',
          text: `Strong performance in ${bestSubject.name} (${Math.round(bestSubject.avg)}% avg)`,
          positive: true,
        });
      }

      if (weakestSubject.name && weakestSubject.avg < 60) {
        insights.push({
          type: 'focus',
          text: `Focus on ${weakestSubject.name} - identified as area needing improvement`,
          positive: false,
        });
      }
    }

    // Attendance insight
    if (attendancePercentage >= 85) {
      insights.push({
        type: 'attendance',
        text: `Excellent attendance record at ${attendancePercentage}%`,
        positive: true,
      });
    } else if (attendancePercentage < 75) {
      insights.push({
        type: 'attendance',
        text: `Attendance at ${attendancePercentage}% - aim for 75% minimum`,
        positive: false,
      });
    }

    // CGPA-based placement probability
    if (cgpa > 0) {
      const placementProbability = Math.min(95, Math.max(50, 50 + (cgpa - 6) * 10));
      insights.push({
        type: 'placement',
        text: `${Math.round(placementProbability)}% placement probability based on current CGPA`,
        positive: placementProbability >= 70,
      });
    }

    // Fee reminder
    if (pendingFees > 0) {
      insights.push({
        type: 'fees',
        text: `Pending fees: ₹${(pendingFees / 1000).toFixed(0)}K - clear before deadline`,
        positive: false,
      });
    }

    // Return top 3 insights or default insights if none generated
    if (insights.length === 0) {
      return [
        { type: 'welcome', text: 'Welcome! Complete your profile to get personalized insights', positive: true },
        { type: 'tip', text: 'Attend classes regularly to maintain good standing', positive: true },
        { type: 'tip', text: 'Check the career hub for placement opportunities', positive: true },
      ];
    }

    return insights.slice(0, 3);
  }

  async getStats(tenantId: string) {
    const [total, active, byDepartment, byBatch, bySemester] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId, status: 'active' } }),
      this.prisma.student.groupBy({
        by: ['departmentId'],
        where: { tenantId, status: 'active' },
        _count: true,
      }),
      this.prisma.student.groupBy({
        by: ['batch'],
        where: { tenantId, status: 'active' },
        _count: true,
      }),
      this.prisma.student.groupBy({
        by: ['semester'],
        where: { tenantId, status: 'active' },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byDepartment,
      byBatch: byBatch.sort((a: { batch: string }, b: { batch: string }) => b.batch.localeCompare(a.batch)),
      bySemester: bySemester.sort((a: { semester: number }, b: { semester: number }) => a.semester - b.semester),
    };
  }

  async getAcademics(tenantId: string, studentId: string) {
    const student = await this.findOne(tenantId, studentId);

    // Get subjects for current semester
    const subjects = await this.prisma.subject.findMany({
      where: {
        tenantId,
        semester: student.semester,
      },
      include: {
        teacherSubjects: {
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    name: true,
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get exam results
    const results = await this.prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { exam: { date: 'desc' } },
    });

    return {
      currentSemester: student.semester,
      subjects: subjects.map((s: any) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        credits: s.credits,
        isLab: s.isLab,
        teacher: s.teacherSubjects[0]?.staff?.user?.name,
      })),
      results: results.map((r: any) => ({
        examId: r.examId,
        examType: r.exam.type,
        subject: r.exam.subject?.name,
        date: r.exam.date,
        marks: Number(r.marks),
        totalMarks: r.exam.totalMarks,
        grade: r.grade,
      })),
    };
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    // Update both student and user status to inactive (soft delete)
    await this.prisma.$transaction([
      this.prisma.student.update({
        where: { id },
        data: { status: 'inactive' },
      }),
      this.prisma.user.update({
        where: { id: existing.userId },
        data: { status: 'inactive' },
      }),
    ]);
  }

  /**
   * Upload profile photo for a student
   * Validates file type and size, uploads to S3, and updates UserProfile
   */
  async uploadProfilePhoto(
    tenantId: string,
    studentId: string,
    file: Express.Multer.File,
  ): Promise<{ photoUrl: string }> {
    // Validate file type
    if (!ALLOWED_PHOTO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed types: JPEG, PNG, WebP',
      );
    }

    // Validate file size
    if (file.size > MAX_PHOTO_SIZE) {
      throw new BadRequestException(
        'File size too large. Maximum size is 5MB',
      );
    }

    // Get student and verify they exist
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: {
          select: {
            id: true,
            profile: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Generate S3 key for profile photo
    const extension = file.mimetype.split('/')[1];
    const key = `tenants/${tenantId}/profiles/${student.userId}.${extension}`;

    // Upload to S3
    const uploadResult = await this.s3Service.uploadBuffer(
      key,
      file.buffer,
      file.mimetype,
      {
        'tenant-id': tenantId,
        'user-id': student.userId,
        'uploaded-at': new Date().toISOString(),
      },
    );

    // Update UserProfile with new photo URL
    await this.prisma.userProfile.upsert({
      where: { userId: student.userId },
      update: { photoUrl: uploadResult.url },
      create: {
        userId: student.userId,
        photoUrl: uploadResult.url,
      },
    });

    return { photoUrl: uploadResult.url };
  }
}
