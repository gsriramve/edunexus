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
  PrincipalExamOverviewDto,
  PrincipalExamStatsDto,
  PrincipalUpcomingExamDto,
  DepartmentExamResultDto,
  RecentExamResultDto,
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

  /**
   * Get comprehensive exam overview for principal
   */
  async getExamOverview(tenantId: string): Promise<PrincipalExamOverviewDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch all required data in parallel
    const [
      allExams,
      examResults,
      departments,
    ] = await Promise.all([
      // All exams with subject and department info
      this.prisma.exam.findMany({
        where: { tenantId },
        include: {
          subject: {
            include: {
              course: {
                include: { department: true },
              },
            },
          },
          results: true,
        },
        orderBy: { date: 'desc' },
      }),
      // All exam results with student department info
      this.prisma.examResult.findMany({
        where: { tenantId },
        include: {
          exam: {
            include: {
              subject: {
                include: {
                  course: {
                    include: { department: true },
                  },
                },
              },
            },
          },
          student: {
            include: { department: true },
          },
        },
      }),
      // All departments
      this.prisma.department.findMany({
        where: { tenantId },
        select: { id: true, name: true },
      }),
    ]);

    // Calculate exam stats
    const completedExams = allExams.filter((e) => new Date(e.date) < today);
    const ongoingExams = allExams.filter((e) => {
      const examDate = new Date(e.date);
      return examDate >= today && examDate <= todayEnd;
    });
    const upcomingExams = allExams.filter((e) => new Date(e.date) > todayEnd);

    // Calculate total students appeared and pass rate
    const examsWithResults = completedExams.filter((e) => e.results.length > 0);
    const totalStudentsAppeared = examResults.length;

    // Calculate pass rate (passing = >= 40% of total marks)
    let totalPassed = 0;
    examResults.forEach((result) => {
      const passingMarks = Number(result.exam.totalMarks) * 0.4;
      if (Number(result.marks) >= passingMarks) {
        totalPassed++;
      }
    });

    const averagePassRate = totalStudentsAppeared > 0
      ? Math.round((totalPassed / totalStudentsAppeared) * 100 * 10) / 10
      : 0;

    const stats: PrincipalExamStatsDto = {
      totalExams: allExams.length,
      completed: completedExams.length,
      ongoing: ongoingExams.length,
      upcoming: upcomingExams.length,
      totalStudentsAppeared,
      averagePassRate,
      resultsPublished: examsWithResults.length,
      resultsPending: completedExams.length - examsWithResults.length,
    };

    // Build upcoming exams list
    const upcomingExamsList: PrincipalUpcomingExamDto[] = upcomingExams
      .slice(0, 10)
      .map((exam) => ({
        id: exam.id,
        name: exam.name,
        type: exam.type,
        department: exam.subject.course?.department?.name || 'All Departments',
        departmentId: exam.subject.course?.department?.id || '',
        date: exam.date.toISOString().split('T')[0],
        subjectName: exam.subject.name,
        totalMarks: Number(exam.totalMarks),
      }));

    // Build department-wise results
    const deptResultsMap = new Map<string, {
      appeared: number;
      passed: number;
      distinction: number;
      firstClass: number;
      secondClass: number;
      failed: number;
    }>();

    // Initialize departments
    departments.forEach((dept) => {
      deptResultsMap.set(dept.id, {
        appeared: 0,
        passed: 0,
        distinction: 0,
        firstClass: 0,
        secondClass: 0,
        failed: 0,
      });
    });

    // Process all results
    examResults.forEach((result) => {
      const deptId = result.student.departmentId;
      if (!deptId) return;

      let deptStats = deptResultsMap.get(deptId);
      if (!deptStats) {
        deptStats = { appeared: 0, passed: 0, distinction: 0, firstClass: 0, secondClass: 0, failed: 0 };
        deptResultsMap.set(deptId, deptStats);
      }

      const totalMarks = Number(result.exam.totalMarks);
      const marks = Number(result.marks);
      const percentage = (marks / totalMarks) * 100;
      const passingMarks = totalMarks * 0.4;

      deptStats.appeared++;

      if (marks >= passingMarks) {
        deptStats.passed++;
        if (percentage >= 75) {
          deptStats.distinction++;
        } else if (percentage >= 60) {
          deptStats.firstClass++;
        } else {
          deptStats.secondClass++;
        }
      } else {
        deptStats.failed++;
      }
    });

    const departmentResults: DepartmentExamResultDto[] = departments.map((dept) => {
      const stats = deptResultsMap.get(dept.id) || {
        appeared: 0,
        passed: 0,
        distinction: 0,
        firstClass: 0,
        secondClass: 0,
        failed: 0,
      };
      return {
        departmentId: dept.id,
        department: dept.name,
        appeared: stats.appeared,
        passed: stats.passed,
        passRate: stats.appeared > 0 ? Math.round((stats.passed / stats.appeared) * 100) : 0,
        distinction: stats.distinction,
        firstClass: stats.firstClass,
        secondClass: stats.secondClass,
        failed: stats.failed,
      };
    }).filter((d) => d.appeared > 0);

    // Build recent results (exams with results, sorted by most recent)
    const examsWithResultsSorted = examsWithResults
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const recentResults: RecentExamResultDto[] = examsWithResultsSorted.map((exam) => {
      const examResultsForExam = examResults.filter((r) => r.exam.id === exam.id);
      const passed = examResultsForExam.filter((r) => {
        const passingMarks = Number(r.exam.totalMarks) * 0.4;
        return Number(r.marks) >= passingMarks;
      }).length;

      return {
        examId: exam.id,
        examName: exam.name,
        department: exam.subject.course?.department?.name || 'All Departments',
        departmentId: exam.subject.course?.department?.id || '',
        passRate: examResultsForExam.length > 0
          ? Math.round((passed / examResultsForExam.length) * 100)
          : 0,
        publishedDate: exam.date.toISOString().split('T')[0],
        totalStudents: examResultsForExam.length,
      };
    });

    return {
      stats,
      upcomingExams: upcomingExamsList,
      departmentResults,
      recentResults,
    };
  }
}
