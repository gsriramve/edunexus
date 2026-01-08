import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

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

  async findByUserId(tenantId: string, userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, tenantId },
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

  async getDashboard(tenantId: string, studentId: string) {
    const student = await this.findOne(tenantId, studentId);

    // Get attendance percentage
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: { studentId, tenantId },
    });

    const totalClasses = attendanceRecords.length || 1;
    const presentClasses = attendanceRecords.filter((a: { status: string }) => a.status === 'present').length;
    const attendancePercentage = Math.round((presentClasses / totalClasses) * 100);

    // Get pending fees
    const pendingFees = await this.prisma.studentFee.aggregate({
      where: {
        studentId,
        tenantId,
        status: { in: ['pending', 'partial'] },
      },
      _sum: { amount: true },
    });

    // Get upcoming exams count
    const upcomingExams = await this.prisma.exam.count({
      where: {
        tenantId,
        date: { gte: new Date() },
      },
    });

    // Get unread notifications
    const notifications = await this.prisma.notification.count({
      where: {
        userId: student.userId,
        readAt: null,
      },
    });

    return {
      studentId: student.id,
      name: student.user.name,
      rollNo: student.rollNo,
      department: student.department.name,
      departmentCode: student.department.code,
      semester: student.semester,
      batch: student.batch,
      cgpa: 8.5, // TODO: Calculate from results
      attendancePercentage,
      pendingFees: Number(pendingFees._sum.amount || 0),
      upcomingExams,
      notifications,
      email: student.user.email,
    };
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
}
