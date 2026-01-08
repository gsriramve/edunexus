import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryStudentsDto } from './dto/hod-students.dto';
import { Decimal } from '@prisma/client/runtime/library';

// Thresholds for at-risk determination
const ATTENDANCE_THRESHOLD = 75;
const CGPA_THRESHOLD = 6.0;

@Injectable()
export class HodStudentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get HoD's department ID from their staff record
   */
  private async getHodDepartment(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: 'hod',
      },
      include: {
        staff: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user || !user.staff || !user.staff.departmentId) {
      throw new ForbiddenException('User is not an HoD or has no department assigned');
    }

    return {
      staffId: user.staff.id,
      departmentId: user.staff.departmentId,
      department: user.staff.department,
    };
  }

  /**
   * Calculate attendance percentage for a student
   */
  private calculateAttendance(attendance: { status: string }[]): number {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    return Math.round((present / attendance.length) * 100 * 10) / 10;
  }

  /**
   * Calculate CGPA from exam results (simplified)
   */
  private calculateCGPA(examResults: { marks: Decimal | null; exam: { totalMarks: number } }[]): number {
    if (examResults.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    examResults.forEach((result) => {
      if (result.marks !== null && result.exam.totalMarks > 0) {
        const marks = Number(result.marks);
        const percentage = (marks / result.exam.totalMarks) * 100;
        // Convert percentage to 10-point scale
        const gradePoint = Math.min(percentage / 10, 10);
        totalWeightedScore += gradePoint;
        totalWeight += 1;
      }
    });

    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : 0;
  }

  /**
   * Determine if a student is at risk
   */
  private isAtRisk(attendance: number, cgpa: number): { atRisk: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (attendance < ATTENDANCE_THRESHOLD) {
      reasons.push('Low Attendance');
    }
    if (cgpa > 0 && cgpa < CGPA_THRESHOLD) {
      reasons.push('Low CGPA');
    }

    return {
      atRisk: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Get all students in the HoD's department with stats
   */
  async getStudents(tenantId: string, userId: string, query: QueryStudentsDto) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Build where clause
    const whereClause: any = {
      tenantId,
      departmentId,
    };

    if (query.search) {
      whereClause.OR = [
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { rollNo: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.semester) {
      whereClause.semester = parseInt(query.semester);
    }

    if (query.section && query.section !== 'all') {
      whereClause.section = query.section;
    }

    // Get students with attendance and exam results
    const students = await this.prisma.student.findMany({
      where: whereClause,
      include: {
        user: true,
        attendance: {
          where: { tenantId },
        },
        examResults: {
          where: { tenantId },
          include: {
            exam: true,
          },
        },
      },
      orderBy: [{ semester: 'asc' }, { rollNo: 'asc' }],
    });

    // Transform students
    const transformedStudents = students.map((student) => {
      const attendancePercentage = this.calculateAttendance(student.attendance);
      const cgpa = this.calculateCGPA(student.examResults);
      const { atRisk, reasons } = this.isAtRisk(attendancePercentage, cgpa);

      return {
        id: student.id,
        rollNo: student.rollNo,
        name: student.user.name,
        email: student.user.email,
        semester: student.semester,
        section: student.section,
        batch: student.batch,
        cgpa,
        attendance: attendancePercentage,
        status: student.status,
        atRisk,
        riskReasons: reasons,
      };
    });

    // Calculate stats
    const total = students.length;
    const activeStudents = students.filter((s) => s.status === 'active').length;
    const onLeave = students.filter((s) => s.status === 'on_leave').length;
    const detained = students.filter((s) => s.status === 'detained' || s.status === 'suspended').length;
    const atRiskCount = transformedStudents.filter((s) => s.atRisk).length;

    const avgAttendance =
      transformedStudents.length > 0
        ? Math.round(
            (transformedStudents.reduce((sum, s) => sum + s.attendance, 0) /
              transformedStudents.length) *
              10
          ) / 10
        : 0;

    const studentsWithCGPA = transformedStudents.filter((s) => s.cgpa > 0);
    const avgCGPA =
      studentsWithCGPA.length > 0
        ? Math.round(
            (studentsWithCGPA.reduce((sum, s) => sum + s.cgpa, 0) / studentsWithCGPA.length) * 10
          ) / 10
        : 0;

    // Calculate semester-wise data
    const semesterMap = new Map<number, { students: typeof transformedStudents }>();
    transformedStudents.forEach((student) => {
      if (!semesterMap.has(student.semester)) {
        semesterMap.set(student.semester, { students: [] });
      }
      semesterMap.get(student.semester)!.students.push(student);
    });

    const semesterData = Array.from(semesterMap.entries())
      .map(([semester, data]) => {
        const semStudents = data.students;
        const avgSemAttendance =
          semStudents.length > 0
            ? Math.round(
                (semStudents.reduce((sum, s) => sum + s.attendance, 0) / semStudents.length) * 10
              ) / 10
            : 0;

        const semStudentsWithCGPA = semStudents.filter((s) => s.cgpa > 0);
        const avgSemCGPA =
          semStudentsWithCGPA.length > 0
            ? Math.round(
                (semStudentsWithCGPA.reduce((sum, s) => sum + s.cgpa, 0) /
                  semStudentsWithCGPA.length) *
                  10
              ) / 10
            : null;

        return {
          semester,
          students: semStudents.length,
          avgAttendance: avgSemAttendance,
          avgCGPA: avgSemCGPA,
          atRisk: semStudents.filter((s) => s.atRisk).length,
        };
      })
      .sort((a, b) => a.semester - b.semester);

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      stats: {
        total,
        activeStudents,
        onLeave,
        detained,
        avgAttendance,
        avgCGPA,
        atRisk: atRiskCount,
      },
      semesterData,
      students: transformedStudents,
    };
  }

  /**
   * Get single student details
   */
  async getStudentById(tenantId: string, userId: string, studentId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
        departmentId,
      },
      include: {
        user: {
          include: {
            profile: {
              include: {
                contacts: true,
                addresses: true,
              },
            },
          },
        },
        attendance: {
          where: { tenantId },
          orderBy: { date: 'desc' },
          take: 30,
        },
        examResults: {
          where: { tenantId },
          include: {
            exam: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: { exam: { date: 'desc' } },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found in your department');
    }

    const attendancePercentage = this.calculateAttendance(student.attendance);
    const cgpa = this.calculateCGPA(student.examResults);
    const { atRisk, reasons } = this.isAtRisk(attendancePercentage, cgpa);

    return {
      id: student.id,
      rollNo: student.rollNo,
      name: student.user.name,
      email: student.user.email,
      semester: student.semester,
      section: student.section,
      batch: student.batch,
      status: student.status,
      admissionDate: student.admissionDate,
      cgpa,
      attendance: attendancePercentage,
      atRisk,
      riskReasons: reasons,
      profile: student.user.profile,
      parents: student.parent.map((p) => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        relationship: p.relation,
      })),
      recentAttendance: student.attendance.slice(0, 10).map((a) => ({
        date: a.date,
        status: a.status,
      })),
      recentExams: student.examResults.slice(0, 10).map((r) => ({
        id: r.id,
        examName: r.exam.name,
        subjectName: r.exam.subject.name,
        marks: r.marks,
        totalMarks: r.exam.totalMarks,
        date: r.exam.date,
      })),
    };
  }

  /**
   * Get at-risk students
   */
  async getAtRiskStudents(tenantId: string, userId: string) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId,
        status: 'active',
      },
      include: {
        user: true,
        attendance: {
          where: { tenantId },
        },
        examResults: {
          where: { tenantId },
          include: {
            exam: true,
          },
        },
      },
    });

    const atRiskStudents = students
      .map((student) => {
        const attendancePercentage = this.calculateAttendance(student.attendance);
        const cgpa = this.calculateCGPA(student.examResults);
        const { atRisk, reasons } = this.isAtRisk(attendancePercentage, cgpa);

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (reasons.length >= 2) {
          riskLevel = 'high';
        } else if (attendancePercentage < 60 || (cgpa > 0 && cgpa < 5)) {
          riskLevel = 'high';
        } else if (reasons.length === 1) {
          riskLevel = 'medium';
        }

        return {
          id: student.id,
          rollNo: student.rollNo,
          name: student.user.name,
          email: student.user.email,
          semester: student.semester,
          section: student.section,
          batch: student.batch,
          cgpa,
          attendance: attendancePercentage,
          status: student.status,
          atRisk,
          riskReasons: reasons,
          riskLevel,
        };
      })
      .filter((s) => s.atRisk)
      .sort((a, b) => {
        // Sort by risk level (high first) then by attendance
        const riskOrder = { high: 0, medium: 1, low: 2 };
        if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }
        return a.attendance - b.attendance;
      });

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      count: atRiskStudents.length,
      students: atRiskStudents,
    };
  }

  /**
   * Get top performing students
   */
  async getTopPerformers(tenantId: string, userId: string, limit: number = 10) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId,
        status: 'active',
      },
      include: {
        user: true,
        examResults: {
          where: { tenantId },
          include: {
            exam: true,
          },
        },
      },
    });

    const studentsWithCGPA = students
      .map((student) => ({
        id: student.id,
        rollNo: student.rollNo,
        name: student.user.name,
        semester: student.semester,
        cgpa: this.calculateCGPA(student.examResults),
      }))
      .filter((s) => s.cgpa > 0)
      .sort((a, b) => b.cgpa - a.cgpa)
      .slice(0, limit)
      .map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      students: studentsWithCGPA,
    };
  }

  /**
   * Get semester-wise overview
   */
  async getSemesterOverview(tenantId: string, userId: string) {
    const result = await this.getStudents(tenantId, userId, {});

    return {
      department: result.department,
      semesterData: result.semesterData,
    };
  }
}
