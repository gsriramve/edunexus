import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PrincipalDashboardResponseDto,
  InstitutionStatsDto,
  DepartmentPerformanceDto,
  AlertDto,
  ActivityDto,
  EventDto,
  SemesterDistributionDto,
  FeeCollectionDto,
} from './dto/principal-dashboard.dto';

// Thresholds
const ATTENDANCE_THRESHOLD = 75;

@Injectable()
export class PrincipalDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate attendance percentage from records
   */
  private calculateAttendance(attendance: { status: string }[]): number {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    return Math.round((present / attendance.length) * 100 * 10) / 10;
  }

  /**
   * Get complete principal dashboard data
   */
  async getDashboard(tenantId: string): Promise<PrincipalDashboardResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parallel data fetching for better performance
    const [
      departmentsData,
      staffData,
      studentsWithAttendance,
      feeData,
      upcomingExams,
      recentAuditLogs,
    ] = await Promise.all([
      // Departments with HoD info and counts
      this.prisma.department.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: {
              students: true,
              staff: true,
            },
          },
          staff: {
            where: {
              user: { role: 'hod' },
            },
            include: {
              user: { select: { name: true } },
            },
            take: 1,
          },
        },
      }),
      // Staff counts (Staff model doesn't have status field, count all)
      this.prisma.staff.count({
        where: { tenantId },
      }),
      // Students with attendance for stats
      this.prisma.student.findMany({
        where: { tenantId, status: 'active' },
        include: {
          attendance: {
            where: { tenantId },
          },
        },
      }),
      // Fee data
      this.prisma.studentFee.groupBy({
        by: ['status'],
        where: { tenantId },
        _sum: { amount: true },
        _count: true,
      }),
      // Upcoming exams
      this.prisma.exam.findMany({
        where: {
          tenantId,
          date: { gte: today },
        },
        include: {
          subject: {
            include: {
              course: {
                include: { department: true },
              },
            },
          },
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      // Recent audit logs for activities
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate institution stats
    const totalDepartments = departmentsData.length;
    const departmentsWithHod = departmentsData.filter((d) => d.staff.length > 0).length;

    const totalStaff = staffData; // staffData is now just a count
    const activeStaff = staffData; // All staff considered active (no status field)

    const totalStudents = studentsWithAttendance.length;
    const activeStudents = totalStudents; // Already filtered by active

    // Calculate overall average attendance
    let totalAttendanceSum = 0;
    let studentsWithRecords = 0;
    studentsWithAttendance.forEach((student) => {
      if (student.attendance.length > 0) {
        totalAttendanceSum += this.calculateAttendance(student.attendance);
        studentsWithRecords++;
      }
    });
    const avgAttendance = studentsWithRecords > 0
      ? Math.round((totalAttendanceSum / studentsWithRecords) * 10) / 10
      : 0;

    // Fee calculations
    const paidFees = feeData.find((f) => f.status === 'paid');
    const pendingFees = feeData.filter((f) => f.status === 'pending' || f.status === 'partial');
    const totalFeeCollected = Number(paidFees?._sum.amount || 0);
    const totalPendingFees = pendingFees.reduce((sum, f) => sum + Number(f._sum.amount || 0), 0);

    const institutionStats: InstitutionStatsDto = {
      totalDepartments,
      departmentsWithHod,
      totalStaff,
      activeStaff,
      totalStudents,
      activeStudents,
      avgAttendance,
      totalFeeCollected,
      pendingFees: totalPendingFees,
      upcomingExams: upcomingExams.length,
    };

    // Build department performance
    const departmentPerformance: DepartmentPerformanceDto[] = await Promise.all(
      departmentsData.map(async (dept) => {
        // Get students in this department with attendance
        const deptStudents = studentsWithAttendance.filter(
          (s) => s.departmentId === dept.id
        );

        // Calculate department average attendance
        let deptAttendanceSum = 0;
        let deptStudentsWithRecords = 0;
        let atRiskCount = 0;

        deptStudents.forEach((student) => {
          if (student.attendance.length > 0) {
            const attendance = this.calculateAttendance(student.attendance);
            deptAttendanceSum += attendance;
            deptStudentsWithRecords++;
            if (attendance < ATTENDANCE_THRESHOLD) {
              atRiskCount++;
            }
          }
        });

        const deptAvgAttendance = deptStudentsWithRecords > 0
          ? Math.round((deptAttendanceSum / deptStudentsWithRecords) * 10) / 10
          : 0;

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          hodName: dept.staff[0]?.user?.name || null,
          studentCount: dept._count.students,
          staffCount: dept._count.staff,
          avgAttendance: deptAvgAttendance,
          atRiskStudents: atRiskCount,
        };
      })
    );

    // Build semester distribution
    const semesterMap = new Map<number, { count: number; attendanceSum: number; withRecords: number }>();
    studentsWithAttendance.forEach((student) => {
      if (!semesterMap.has(student.semester)) {
        semesterMap.set(student.semester, { count: 0, attendanceSum: 0, withRecords: 0 });
      }
      const entry = semesterMap.get(student.semester)!;
      entry.count++;
      if (student.attendance.length > 0) {
        entry.attendanceSum += this.calculateAttendance(student.attendance);
        entry.withRecords++;
      }
    });

    const semesterDistribution: SemesterDistributionDto[] = Array.from(semesterMap.entries())
      .map(([semester, data]) => ({
        semester,
        studentCount: data.count,
        avgAttendance: data.withRecords > 0
          ? Math.round((data.attendanceSum / data.withRecords) * 10) / 10
          : 0,
      }))
      .sort((a, b) => a.semester - b.semester);

    // Fee collection summary - use StudentFee with paidDate
    const thisMonthFees = await this.prisma.studentFee.aggregate({
      where: {
        tenantId,
        paidDate: { gte: startOfMonth },
        status: 'paid',
      },
      _sum: { paidAmount: true },
    });

    const overdueCount = await this.prisma.studentFee.count({
      where: {
        tenantId,
        status: 'pending',
        dueDate: { lt: today },
      },
    });

    const totalFeesExpected = totalFeeCollected + totalPendingFees;
    const feeCollection: FeeCollectionDto = {
      totalCollected: totalFeeCollected,
      totalPending: totalPendingFees,
      collectionRate: totalFeesExpected > 0
        ? Math.round((totalFeeCollected / totalFeesExpected) * 100)
        : 0,
      thisMonthCollected: Number(thisMonthFees._sum.paidAmount || 0),
      overdueCount,
    };

    // Build alerts based on data analysis
    const recentAlerts: AlertDto[] = [];

    // Low attendance alerts by department
    departmentPerformance.forEach((dept) => {
      if (dept.atRiskStudents > 0) {
        recentAlerts.push({
          id: `att-${dept.id}`,
          type: 'attendance',
          message: `${dept.atRiskStudents} students in ${dept.code} have attendance below ${ATTENDANCE_THRESHOLD}%`,
          severity: dept.atRiskStudents > 20 ? 'high' : dept.atRiskStudents > 10 ? 'medium' : 'low',
          departmentId: dept.id,
          departmentCode: dept.code,
          count: dept.atRiskStudents,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Departments without HoD
    const deptsWithoutHod = departmentPerformance.filter((d) => !d.hodName);
    if (deptsWithoutHod.length > 0) {
      recentAlerts.push({
        id: 'no-hod',
        type: 'staff',
        message: `${deptsWithoutHod.length} department(s) do not have an assigned HoD`,
        severity: deptsWithoutHod.length > 2 ? 'high' : 'medium',
        count: deptsWithoutHod.length,
        createdAt: new Date().toISOString(),
      });
    }

    // Overdue fees alert
    if (overdueCount > 0) {
      recentAlerts.push({
        id: 'overdue-fees',
        type: 'fee',
        message: `${overdueCount} students have overdue fee payments`,
        severity: overdueCount > 50 ? 'high' : overdueCount > 20 ? 'medium' : 'low',
        count: overdueCount,
        createdAt: new Date().toISOString(),
      });
    }

    // Sort alerts by severity
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    recentAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Build recent activities from audit logs
    const recentActivities: ActivityDto[] = recentAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entityType || 'System',
      entityId: log.entityId || undefined,
      performedBy: log.userName || 'System',
      performedAt: log.timestamp.toISOString(),
      details: log.entityName || undefined,
    }));

    // Build upcoming events from exams
    const upcomingEvents: EventDto[] = upcomingExams.slice(0, 5).map((exam) => ({
      id: exam.id,
      title: `${exam.name} - ${exam.subject.name}`,
      type: 'exam' as const,
      date: exam.date.toISOString().split('T')[0],
      time: '9:00 AM',
      departmentId: exam.subject.course?.department?.id,
      departmentCode: exam.subject.course?.department?.code,
      description: `${exam.type} examination`,
    }));

    return {
      institutionStats,
      departmentPerformance,
      semesterDistribution,
      feeCollection,
      recentAlerts: recentAlerts.slice(0, 5),
      recentActivities,
      upcomingEvents,
    };
  }

  /**
   * Get institution stats only (lightweight endpoint)
   */
  async getStats(tenantId: string): Promise<InstitutionStatsDto> {
    const dashboard = await this.getDashboard(tenantId);
    return dashboard.institutionStats;
  }

  /**
   * Get department performance only
   */
  async getDepartmentPerformance(tenantId: string): Promise<DepartmentPerformanceDto[]> {
    const dashboard = await this.getDashboard(tenantId);
    return dashboard.departmentPerformance;
  }

  /**
   * Get alerts only
   */
  async getAlerts(tenantId: string): Promise<AlertDto[]> {
    const dashboard = await this.getDashboard(tenantId);
    return dashboard.recentAlerts;
  }

  /**
   * Get fee collection summary
   */
  async getFeeCollection(tenantId: string): Promise<FeeCollectionDto> {
    const dashboard = await this.getDashboard(tenantId);
    return dashboard.feeCollection;
  }
}
