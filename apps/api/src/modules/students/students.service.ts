import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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

    // Check if registration number already exists
    const existingRegNo = await this.prisma.student.findFirst({
      where: { tenantId, registrationNo: createStudentDto.registrationNo },
    });

    if (existingRegNo) {
      throw new ConflictException('Registration number already exists');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createStudentDto.email },
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
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: createStudentDto.email,
          role: 'STUDENT',
          profile: {
            firstName: createStudentDto.firstName,
            lastName: createStudentDto.lastName,
            phone: createStudentDto.phone,
            gender: createStudentDto.gender,
            dateOfBirth: createStudentDto.dateOfBirth,
            bloodGroup: createStudentDto.bloodGroup,
            nationality: createStudentDto.nationality,
          },
        },
      });

      // Create student record
      const student = await tx.student.create({
        data: {
          tenantId,
          userId: user.id,
          rollNo: createStudentDto.rollNo,
          registrationNo: createStudentDto.registrationNo,
          departmentId: createStudentDto.departmentId,
          batchYear: createStudentDto.batchYear,
          currentSemester: createStudentDto.currentSemester,
          status: 'ACTIVE',
          fatherName: createStudentDto.fatherName,
          motherName: createStudentDto.motherName,
          parentPhone: createStudentDto.parentPhone,
          parentEmail: createStudentDto.parentEmail,
          address: createStudentDto.address,
          city: createStudentDto.city,
          state: createStudentDto.state,
          pincode: createStudentDto.pincode,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
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
    const { search, departmentId, batchYear, semester, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (batchYear) {
      where.batchYear = batchYear;
    }

    if (semester) {
      where.currentSemester = semester;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { rollNo: { contains: search, mode: 'insensitive' } },
        { registrationNo: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
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

  async update(tenantId: string, id: string, updateStudentDto: UpdateStudentDto) {
    const existing = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    // Update student and user profile
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user profile if name/phone changed
      if (updateStudentDto.firstName || updateStudentDto.lastName || updateStudentDto.phone) {
        const currentUser = await tx.user.findFirst({
          where: { id: existing.userId },
        });

        const currentProfile = (currentUser?.profile as any) || {};

        await tx.user.update({
          where: { id: existing.userId },
          data: {
            profile: {
              ...currentProfile,
              ...(updateStudentDto.firstName && { firstName: updateStudentDto.firstName }),
              ...(updateStudentDto.lastName && { lastName: updateStudentDto.lastName }),
              ...(updateStudentDto.phone && { phone: updateStudentDto.phone }),
            },
          },
        });
      }

      // Update student record
      const student = await tx.student.update({
        where: { id },
        data: {
          currentSemester: updateStudentDto.currentSemester,
          status: updateStudentDto.status?.toUpperCase(),
          address: updateStudentDto.address,
          city: updateStudentDto.city,
          state: updateStudentDto.state,
          pincode: updateStudentDto.pincode,
          parentPhone: updateStudentDto.parentPhone,
          parentEmail: updateStudentDto.parentEmail,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
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
    const profile = student.user.profile as any;

    // Get attendance percentage (mock calculation)
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: { studentId, tenantId },
    });

    const totalClasses = attendanceRecords.length || 1;
    const presentClasses = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const attendancePercentage = Math.round((presentClasses / totalClasses) * 100);

    // Get pending fees
    const pendingFees = await this.prisma.studentFee.aggregate({
      where: {
        studentId,
        tenantId,
        status: { in: ['PENDING', 'PARTIAL'] },
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
      name: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
      rollNo: student.rollNo,
      department: student.department.name,
      departmentCode: student.department.code,
      semester: student.currentSemester,
      batchYear: student.batchYear,
      cgpa: 8.5, // TODO: Calculate from results
      attendancePercentage,
      pendingFees: pendingFees._sum.amount || 0,
      upcomingExams,
      notifications,
      email: student.user.email,
      phone: profile?.phone,
    };
  }

  async getStats(tenantId: string) {
    const [total, active, byDepartment, byBatch, bySemester] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.student.groupBy({
        by: ['departmentId'],
        where: { tenantId, status: 'ACTIVE' },
        _count: true,
      }),
      this.prisma.student.groupBy({
        by: ['batchYear'],
        where: { tenantId, status: 'ACTIVE' },
        _count: true,
      }),
      this.prisma.student.groupBy({
        by: ['currentSemester'],
        where: { tenantId, status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byDepartment,
      byBatch: byBatch.sort((a, b) => b.batchYear - a.batchYear),
      bySemester: bySemester.sort((a, b) => a.currentSemester - b.currentSemester),
    };
  }

  async getAcademics(tenantId: string, studentId: string) {
    const student = await this.findOne(tenantId, studentId);

    // Get subjects for current semester
    const subjects = await this.prisma.subject.findMany({
      where: {
        tenantId,
        semester: student.currentSemester,
        // Filter by department/course if needed
      },
      include: {
        teacherSubjects: {
          include: {
            staff: {
              include: {
                user: {
                  select: {
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
      currentSemester: student.currentSemester,
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        credits: s.credits,
        isLab: s.isLab,
        teacher: s.teacherSubjects[0]?.staff?.user?.profile,
      })),
      results: results.map(r => ({
        examId: r.examId,
        examType: r.exam.type,
        subject: r.exam.subject?.name,
        date: r.exam.date,
        marks: r.marks,
        totalMarks: r.exam.totalMarks,
        grade: r.grade,
      })),
    };
  }
}
