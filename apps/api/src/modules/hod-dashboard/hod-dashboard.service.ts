import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  HodDashboardResponseDto,
  DepartmentStatsDto,
  FacultyOverviewDto,
  SemesterOverviewDto,
  AlertDto,
  EventDto,
  PendingApprovalDto,
} from './dto/hod-dashboard.dto';

// Thresholds
const ATTENDANCE_THRESHOLD = 75;
const CGPA_THRESHOLD = 6.0;

// Types for internal use
interface StudentWithStats {
  id: string;
  semester: number;
  status: string;
  attendancePercentage: number;
  cgpa: number;
  atRisk: boolean;
}

@Injectable()
export class HodDashboardService {
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
      hodName: user.name,
      hodDesignation: user.staff.designation,
    };
  }

  /**
   * Calculate attendance percentage
   */
  private calculateAttendance(attendance: { status: string }[]): number {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    return Math.round((present / attendance.length) * 100 * 10) / 10;
  }

  /**
   * Calculate CGPA from exam results
   */
  private calculateCGPA(examResults: { marks: Decimal | null; exam: { totalMarks: number } }[]): number {
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

  /**
   * Get complete dashboard data
   */
  async getDashboard(tenantId: string, userId: string): Promise<HodDashboardResponseDto> {
    const { departmentId, department, hodName, hodDesignation } = await this.getHodDepartment(tenantId, userId);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();

    // Parallel data fetching
    const [
      facultyData,
      studentsData,
      subjectsCount,
      todayTimetable,
      upcomingExams,
    ] = await Promise.all([
      // Faculty with their subjects and timetable
      this.prisma.staff.findMany({
        where: {
          tenantId,
          departmentId,
        },
        include: {
          user: true,
          teacherSubjects: {
            where: { tenantId },
            include: {
              subject: true,
              timetables: {
                where: {
                  dayOfWeek,
                  isActive: true,
                },
              },
            },
          },
        },
      }),
      // Students with attendance and exam results
      this.prisma.student.findMany({
        where: {
          tenantId,
          departmentId,
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
      }),
      // Active subjects count
      this.prisma.subject.count({
        where: {
          tenantId,
          course: {
            departmentId,
          },
        },
      }),
      // Today's timetable for the department
      this.prisma.timetable.findMany({
        where: {
          tenantId,
          dayOfWeek,
          isActive: true,
          teacherSubject: {
            staff: {
              departmentId,
            },
          },
        },
        include: {
          teacherSubject: {
            include: {
              staff: {
                include: {
                  user: true,
                },
              },
              subject: true,
            },
          },
        },
      }),
      // Upcoming exams
      this.prisma.exam.findMany({
        where: {
          tenantId,
          date: {
            gte: today,
          },
          subject: {
            course: {
              departmentId,
            },
          },
        },
        include: {
          subject: true,
        },
        orderBy: {
          date: 'asc',
        },
        take: 4,
      }),
    ]);

    // Calculate faculty overview
    const facultyOverview: FacultyOverviewDto[] = facultyData.slice(0, 5).map((staff) => {
      // Count classes today from timetable through teacherSubjects
      const classesToday = staff.teacherSubjects.reduce(
        (count: number, ts: { timetables: unknown[] }) => count + ts.timetables.length,
        0
      );

      return {
        id: staff.id,
        name: staff.user.name,
        employeeId: staff.employeeId,
        designation: staff.designation,
        subjectCount: staff.teacherSubjects.length,
        attendancePercentage: 100, // Staff attendance not tracked in current schema
        classesToday,
        isOnLeave: false, // Leave requests not in current schema
      };
    });

    // Calculate student stats
    const studentStats: StudentWithStats[] = studentsData.map((student) => {
      const attendance = this.calculateAttendance(student.attendance);
      const cgpa = this.calculateCGPA(student.examResults);
      const atRisk = attendance < ATTENDANCE_THRESHOLD || (cgpa > 0 && cgpa < CGPA_THRESHOLD);
      return {
        id: student.id,
        semester: student.semester,
        status: student.status,
        attendancePercentage: attendance,
        cgpa,
        atRisk,
      };
    });

    // Calculate semester-wise overview
    const semesterMap = new Map<number, StudentWithStats[]>();
    studentStats.forEach((student) => {
      if (!semesterMap.has(student.semester)) {
        semesterMap.set(student.semester, []);
      }
      semesterMap.get(student.semester)!.push(student);
    });

    const semesterOverview: SemesterOverviewDto[] = Array.from(semesterMap.entries())
      .map(([semester, students]) => {
        const avgAttendance =
          students.length > 0
            ? Math.round(
                (students.reduce((sum: number, s: StudentWithStats) => sum + s.attendancePercentage, 0) / students.length) * 10
              ) / 10
            : 0;

        const studentsWithCGPA = students.filter((s: StudentWithStats) => s.cgpa > 0);
        const avgCGPA =
          studentsWithCGPA.length > 0
            ? Math.round(
                (studentsWithCGPA.reduce((sum: number, s: StudentWithStats) => sum + s.cgpa, 0) / studentsWithCGPA.length) * 10
              ) / 10
            : null;

        return {
          semester,
          students: students.length,
          avgAttendance,
          avgCGPA,
          atRisk: students.filter((s: StudentWithStats) => s.atRisk).length,
        };
      })
      .sort((a, b) => a.semester - b.semester);

    // Calculate department stats
    const totalAttendance = studentStats.reduce((sum: number, s: StudentWithStats) => sum + s.attendancePercentage, 0);
    const studentsWithCGPA = studentStats.filter((s: StudentWithStats) => s.cgpa > 0);
    const totalCGPA = studentsWithCGPA.reduce((sum: number, s: StudentWithStats) => sum + s.cgpa, 0);

    const stats: DepartmentStatsDto = {
      totalFaculty: facultyData.length,
      totalStudents: studentsData.length,
      activeSubjects: subjectsCount,
      avgAttendance: studentStats.length > 0 ? Math.round((totalAttendance / studentStats.length) * 10) / 10 : 0,
      avgCGPA: studentsWithCGPA.length > 0 ? Math.round((totalCGPA / studentsWithCGPA.length) * 10) / 10 : 0,
      atRiskStudents: studentStats.filter((s: StudentWithStats) => s.atRisk).length,
      presentToday: facultyOverview.filter((f) => !f.isOnLeave).length,
      onLeaveToday: facultyOverview.filter((f) => f.isOnLeave).length,
    };

    // Generate alerts based on data
    const alerts: AlertDto[] = [];

    // Low attendance alerts
    const lowAttendanceStudents = studentStats.filter((s: StudentWithStats) => s.attendancePercentage < ATTENDANCE_THRESHOLD);
    if (lowAttendanceStudents.length > 0) {
      // Group by semester
      const semesterGroups = new Map<number, number>();
      lowAttendanceStudents.forEach((s: StudentWithStats) => {
        semesterGroups.set(s.semester, (semesterGroups.get(s.semester) || 0) + 1);
      });

      semesterGroups.forEach((count, semester) => {
        alerts.push({
          id: `att-sem-${semester}`,
          type: 'attendance',
          message: `${count} students in Semester ${semester} have attendance below ${ATTENDANCE_THRESHOLD}%`,
          severity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low',
          time: 'Current',
        });
      });
    }

    // At-risk students alert
    const atRiskCount = studentStats.filter((s: StudentWithStats) => s.atRisk).length;
    if (atRiskCount > 0) {
      alerts.push({
        id: 'at-risk-total',
        type: 'academic',
        message: `${atRiskCount} students are at academic risk (low attendance or CGPA)`,
        severity: atRiskCount > 20 ? 'high' : atRiskCount > 10 ? 'medium' : 'low',
        time: 'Current',
      });
    }

    // Sort alerts by severity
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Generate upcoming events from exams
    const upcomingEvents: EventDto[] = upcomingExams.map((exam) => ({
      id: exam.id,
      title: `${exam.name} - ${exam.subject.name}`,
      date: exam.date.toISOString().split('T')[0],
      time: '9:00 AM',
      type: 'exam' as const,
      description: `${exam.type} examination`,
    }));

    // No pending approvals since LeaveRequest model doesn't exist
    const pendingApprovals: PendingApprovalDto[] = [];

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      hodInfo: {
        name: hodName,
        designation: hodDesignation,
      },
      stats,
      facultyOverview,
      semesterOverview,
      recentAlerts: alerts.slice(0, 5),
      upcomingEvents,
      pendingApprovals,
    };
  }

  /**
   * Get department stats only (lightweight endpoint)
   */
  async getStats(tenantId: string, userId: string): Promise<DepartmentStatsDto> {
    const dashboard = await this.getDashboard(tenantId, userId);
    return dashboard.stats;
  }

  /**
   * Get faculty overview only
   */
  async getFacultyOverview(tenantId: string, userId: string): Promise<FacultyOverviewDto[]> {
    const dashboard = await this.getDashboard(tenantId, userId);
    return dashboard.facultyOverview;
  }

  /**
   * Get alerts only
   */
  async getAlerts(tenantId: string, userId: string): Promise<AlertDto[]> {
    const dashboard = await this.getDashboard(tenantId, userId);
    return dashboard.recentAlerts;
  }
}
