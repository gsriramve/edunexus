import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface StudentQueryParams {
  search?: string;
  branch?: string;
  semester?: number;
  status?: string;
  batch?: string;
  page?: number;
  limit?: number;
}

export interface CertificateRequestParams {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminRecordsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get student records statistics
   */
  async getStats(tenantId: string) {
    const [
      totalStudents,
      activeStudents,
      graduatedStudents,
      droppedStudents,
      pendingCertificates,
      pendingTCs,
    ] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId, status: 'active' } }),
      this.prisma.student.count({ where: { tenantId, status: 'graduated' } }),
      this.prisma.student.count({ where: { tenantId, status: 'dropped' } }),
      this.prisma.certificateRequest.count({
        where: { tenantId, status: { in: ['pending', 'processing'] } },
      }),
      this.prisma.certificateRequest.count({
        where: {
          tenantId,
          status: { in: ['pending', 'processing'] },
          certificateType: { code: 'tc' },
        },
      }),
    ]);

    // Count students with incomplete profiles (missing section)
    const profilesIncomplete = await this.prisma.student.count({
      where: {
        tenantId,
        section: null,
      },
    });

    return {
      totalStudents,
      activeStudents,
      graduatedStudents,
      droppedOut: droppedStudents,
      pendingCertificates,
      pendingTCs,
      profilesIncomplete,
    };
  }

  /**
   * Get list of students with filters
   */
  async getStudents(tenantId: string, params: StudentQueryParams) {
    const {
      search,
      branch,
      semester,
      status,
      batch,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.StudentWhereInput = {
      tenantId,
      ...(status && status !== 'all' && { status }),
      ...(batch && batch !== 'all' && { batch }),
      ...(semester && { semester }),
      ...(branch && branch !== 'all' && {
        department: { code: branch },
      }),
      ...(search && {
        OR: [
          { rollNo: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  photoUrl: true,
                  contacts: {
                    where: { isPrimary: true },
                    select: { number: true },
                    take: 1,
                  },
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
          fees: {
            where: { status: { in: ['pending', 'overdue'] } },
            select: { status: true },
            take: 1,
          },
        },
        orderBy: { rollNo: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    // Calculate CGPA and attendance for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // Get CGPA from exam results
        const examResults = await this.prisma.examResult.findMany({
          where: { studentId: student.id, tenantId },
          include: {
            exam: {
              include: { subject: { select: { credits: true } } },
            },
          },
        });

        let cgpa = 0;
        if (examResults.length > 0) {
          let totalPoints = 0;
          let totalCredits = 0;
          for (const result of examResults) {
            const percentage = (Number(result.marks) / result.exam.totalMarks) * 100;
            const gradePoints = this.calculateGradePoints(percentage);
            totalPoints += gradePoints * result.exam.subject.credits;
            totalCredits += result.exam.subject.credits;
          }
          cgpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 10) / 10 : 0;
        }

        // Get attendance percentage
        const attendanceRecords = await this.prisma.studentAttendance.findMany({
          where: { studentId: student.id, tenantId },
          select: { status: true },
        });

        let attendance = 100;
        if (attendanceRecords.length > 0) {
          const present = attendanceRecords.filter(
            (a: { status: string }) => a.status === 'present' || a.status === 'late'
          ).length;
          attendance = Math.round((present / attendanceRecords.length) * 100);
        }

        // Determine fee status
        let feeStatus = 'paid';
        if (student.fees.length > 0) {
          feeStatus = student.fees[0].status === 'overdue' ? 'overdue' : 'pending';
        }

        // Get phone and photo from profile
        const phone = student.user.profile?.contacts?.[0]?.number || null;
        const photo = student.user.profile?.photoUrl || '';

        // Calculate profile completion
        let profileComplete = 100;
        if (!student.section) profileComplete -= 10;
        if (!phone) profileComplete -= 15;
        if (!photo) profileComplete -= 10;

        return {
          id: student.id,
          rollNo: student.rollNo,
          name: student.user.name,
          email: student.user.email,
          phone,
          photo,
          branch: student.department.code,
          branchName: student.department.name,
          semester: student.semester,
          section: student.section || '-',
          batch: student.batch,
          status: student.status,
          cgpa,
          attendance,
          feeStatus,
          profileComplete,
        };
      })
    );

    return {
      data: studentsWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get student details by ID
   */
  async getStudentDetails(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: true,
        department: true,
        parent: {
          include: {
            user: { select: { name: true } },
          },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  /**
   * Get certificate types
   */
  async getCertificateTypes(tenantId: string) {
    const types = await this.prisma.certificateType.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });

    // If no types exist, return default types
    if (types.length === 0) {
      return [
        { id: 'default-1', code: 'bonafide', name: 'Bonafide Certificate', fee: 100 },
        { id: 'default-2', code: 'study', name: 'Study Certificate', fee: 100 },
        { id: 'default-3', code: 'character', name: 'Character Certificate', fee: 100 },
        { id: 'default-4', code: 'tc', name: 'Transfer Certificate', fee: 500 },
        { id: 'default-5', code: 'migration', name: 'Migration Certificate', fee: 300 },
        { id: 'default-6', code: 'conduct', name: 'Conduct Certificate', fee: 100 },
        { id: 'default-7', code: 'medium', name: 'Medium of Instruction', fee: 150 },
        { id: 'default-8', code: 'provisional', name: 'Provisional Certificate', fee: 200 },
      ];
    }

    return types.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      fee: Number(t.fee),
    }));
  }

  /**
   * Get certificate requests
   */
  async getCertificateRequests(tenantId: string, params: CertificateRequestParams) {
    const { status, type, page = 1, limit = 20 } = params;

    const where: Prisma.CertificateRequestWhereInput = {
      tenantId,
      ...(status && status !== 'all' && { status }),
      ...(type && type !== 'all' && { certificateType: { code: type } }),
    };

    const [requests, total] = await Promise.all([
      this.prisma.certificateRequest.findMany({
        where,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
          certificateType: true,
        },
        orderBy: { requestDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.certificateRequest.count({ where }),
    ]);

    return {
      data: requests.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        rollNo: r.student.rollNo,
        name: r.student.user.name,
        type: r.certificateType.name,
        typeCode: r.certificateType.code,
        purpose: r.purpose,
        requestDate: r.requestDate.toISOString().split('T')[0],
        status: r.status,
        certificateNumber: r.certificateNumber,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create certificate request
   */
  async createCertificateRequest(
    tenantId: string,
    data: {
      studentId: string;
      certificateTypeId: string;
      purpose: string;
    }
  ) {
    return this.prisma.certificateRequest.create({
      data: {
        tenantId,
        studentId: data.studentId,
        certificateTypeId: data.certificateTypeId,
        purpose: data.purpose,
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
        certificateType: true,
      },
    });
  }

  /**
   * Update certificate request status
   */
  async updateCertificateStatus(
    tenantId: string,
    requestId: string,
    data: {
      status: string;
      processedBy?: string;
      remarks?: string;
    }
  ) {
    const updateData: Prisma.CertificateRequestUpdateInput = {
      status: data.status,
      remarks: data.remarks,
    };

    if (data.status === 'processing') {
      updateData.processedDate = new Date();
      updateData.processedBy = data.processedBy;
    } else if (data.status === 'issued') {
      updateData.issuedDate = new Date();
      updateData.issuedBy = data.processedBy;
      // Generate certificate number
      const count = await this.prisma.certificateRequest.count({
        where: { tenantId, status: 'issued' },
      });
      updateData.certificateNumber = `CERT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }

    return this.prisma.certificateRequest.update({
      where: { id: requestId },
      data: updateData,
    });
  }

  private calculateGradePoints(percentage: number): number {
    if (percentage >= 90) return 10;
    if (percentage >= 80) return 9;
    if (percentage >= 70) return 8;
    if (percentage >= 60) return 7;
    if (percentage >= 50) return 6;
    if (percentage >= 40) return 4;
    return 0;
  }
}
