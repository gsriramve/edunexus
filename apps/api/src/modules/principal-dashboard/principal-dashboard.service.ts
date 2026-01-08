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
  PrincipalFeeOverviewDto,
  PrincipalFeeStatsDto,
  DepartmentFeeDto,
  FeeCategoryDto,
  RecentTransactionDto,
  MonthlyCollectionDto,
  PaymentMethodStatsDto,
  PrincipalAcademicsOverviewDto,
  PrincipalAcademicStatsDto,
  DepartmentCurriculumDto,
  RecentCurriculumUpdateDto,
  SemesterProgressDto,
  PrincipalReportsOverviewDto,
  ReportStatsDto,
  ReportCategoryDto,
  ReportTemplateDto,
  RecentReportDto,
  ScheduledReportDto,
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

  /**
   * Get comprehensive fee overview for principal
   */
  async getFeeOverview(tenantId: string): Promise<PrincipalFeeOverviewDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    // Get last 6 months for trend
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    // Fetch all required data in parallel
    const [
      allFees,
      departments,
      recentPaidFees,
    ] = await Promise.all([
      // All student fees with student and department info
      this.prisma.studentFee.findMany({
        where: { tenantId },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              department: { select: { id: true, name: true } },
            },
          },
        },
      }),
      // All departments
      this.prisma.department.findMany({
        where: { tenantId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      // Recent paid fees for transactions
      this.prisma.studentFee.findMany({
        where: {
          tenantId,
          status: 'paid',
          paidDate: { not: null },
        },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              department: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { paidDate: 'desc' },
        take: 20,
      }),
    ]);

    // Calculate fee stats
    const totalExpected = allFees.reduce((sum, f) => sum + Number(f.amount), 0);
    const totalCollected = allFees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + Number(f.paidAmount || f.amount), 0);
    const partialCollected = allFees
      .filter((f) => f.status === 'partial')
      .reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
    const pendingAmount = totalExpected - totalCollected - partialCollected;

    // Count students by payment status
    const studentFeeMap = new Map<string, { paid: boolean; partial: boolean; pending: boolean }>();
    allFees.forEach((fee) => {
      const existing = studentFeeMap.get(fee.studentId) || { paid: false, partial: false, pending: false };
      if (fee.status === 'paid') existing.paid = true;
      else if (fee.status === 'partial') existing.partial = true;
      else existing.pending = true;
      studentFeeMap.set(fee.studentId, existing);
    });

    let studentsPaid = 0;
    let studentsPending = 0;
    let studentsPartial = 0;
    studentFeeMap.forEach((status) => {
      if (status.pending && !status.paid && !status.partial) studentsPending++;
      else if (status.partial || (status.pending && (status.paid || status.partial))) studentsPartial++;
      else if (status.paid && !status.pending && !status.partial) studentsPaid++;
      else studentsPartial++; // mixed status
    });

    // This month collection
    const thisMonthFees = allFees.filter(
      (f) => f.paidDate && new Date(f.paidDate) >= startOfMonth
    );
    const thisMonthCollection = thisMonthFees.reduce(
      (sum, f) => sum + Number(f.paidAmount || f.amount),
      0
    );

    // Last month collection
    const lastMonthFees = allFees.filter(
      (f) =>
        f.paidDate &&
        new Date(f.paidDate) >= startOfLastMonth &&
        new Date(f.paidDate) <= endOfLastMonth
    );
    const lastMonthCollection = lastMonthFees.reduce(
      (sum, f) => sum + Number(f.paidAmount || f.amount),
      0
    );

    // Overdue count
    const overdueCount = allFees.filter(
      (f) => (f.status === 'pending' || f.status === 'partial') && new Date(f.dueDate) < today
    ).length;

    const collectionRate = totalExpected > 0
      ? Math.round(((totalCollected + partialCollected) / totalExpected) * 100)
      : 0;

    const stats: PrincipalFeeStatsDto = {
      totalExpected,
      totalCollected: totalCollected + partialCollected,
      collectionRate,
      pendingAmount,
      studentsPaid,
      studentsPending,
      studentsPartial,
      thisMonthCollection,
      lastMonthCollection,
      overdueCount,
    };

    // Build department-wise fees
    const deptFeeMap = new Map<string, {
      students: Set<string>;
      expected: number;
      collected: number;
      defaulters: Set<string>;
    }>();

    departments.forEach((dept) => {
      deptFeeMap.set(dept.id, {
        students: new Set(),
        expected: 0,
        collected: 0,
        defaulters: new Set(),
      });
    });

    allFees.forEach((fee) => {
      const deptId = fee.student.department?.id;
      if (!deptId) return;

      let deptData = deptFeeMap.get(deptId);
      if (!deptData) {
        deptData = { students: new Set(), expected: 0, collected: 0, defaulters: new Set() };
        deptFeeMap.set(deptId, deptData);
      }

      deptData.students.add(fee.studentId);
      deptData.expected += Number(fee.amount);

      if (fee.status === 'paid') {
        deptData.collected += Number(fee.paidAmount || fee.amount);
      } else if (fee.status === 'partial') {
        deptData.collected += Number(fee.paidAmount || 0);
        if (new Date(fee.dueDate) < today) {
          deptData.defaulters.add(fee.studentId);
        }
      } else if (new Date(fee.dueDate) < today) {
        deptData.defaulters.add(fee.studentId);
      }
    });

    const departmentFees: DepartmentFeeDto[] = departments.map((dept) => {
      const data = deptFeeMap.get(dept.id) || {
        students: new Set(),
        expected: 0,
        collected: 0,
        defaulters: new Set(),
      };
      const pending = data.expected - data.collected;
      return {
        departmentId: dept.id,
        department: dept.name,
        students: data.students.size,
        expected: data.expected,
        collected: data.collected,
        pending,
        collectionRate: data.expected > 0 ? Math.round((data.collected / data.expected) * 100) : 0,
        defaulters: data.defaulters.size,
      };
    }).filter((d) => d.students > 0);

    // Build fee categories
    const categoryMap = new Map<string, { collected: number; expected: number }>();
    allFees.forEach((fee) => {
      const category = fee.feeType || 'Other';
      const existing = categoryMap.get(category) || { collected: 0, expected: 0 };
      existing.expected += Number(fee.amount);
      if (fee.status === 'paid') {
        existing.collected += Number(fee.paidAmount || fee.amount);
      } else if (fee.status === 'partial') {
        existing.collected += Number(fee.paidAmount || 0);
      }
      categoryMap.set(category, existing);
    });

    const feeCategories: FeeCategoryDto[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category: this.formatFeeType(category),
        collected: data.collected,
        expected: data.expected,
        percentage: data.expected > 0 ? Math.round((data.collected / data.expected) * 100) : 0,
      }))
      .sort((a, b) => b.expected - a.expected);

    // Build recent transactions
    const recentTransactions: RecentTransactionDto[] = recentPaidFees
      .filter((f) => f.paidDate)
      .slice(0, 10)
      .map((fee) => ({
        id: fee.id,
        studentId: fee.studentId,
        studentName: fee.student.user?.name || 'Unknown',
        department: fee.student.department?.name || 'Unknown',
        departmentId: fee.student.department?.id || '',
        amount: Number(fee.paidAmount || fee.amount),
        feeType: this.formatFeeType(fee.feeType),
        date: fee.paidDate!.toISOString().split('T')[0],
        paymentMethod: fee.paymentMethod,
      }));

    // Build monthly trend (last 6 months)
    const monthlyMap = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap.set(key, 0);
    }

    allFees
      .filter((f) => f.paidDate && new Date(f.paidDate) >= sixMonthsAgo)
      .forEach((fee) => {
        const paidDate = new Date(fee.paidDate!);
        const key = `${paidDate.getFullYear()}-${paidDate.getMonth()}`;
        const current = monthlyMap.get(key) || 0;
        monthlyMap.set(key, current + Number(fee.paidAmount || fee.amount));
      });

    const monthlyTrend: MonthlyCollectionDto[] = Array.from(monthlyMap.entries())
      .map(([key, collected]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: monthNames[month],
          year,
          collected,
        };
      });

    // Build payment method stats
    const methodMap = new Map<string, { count: number; amount: number }>();
    allFees
      .filter((f) => f.status === 'paid' && f.paymentMethod)
      .forEach((fee) => {
        const method = fee.paymentMethod || 'Unknown';
        const existing = methodMap.get(method) || { count: 0, amount: 0 };
        existing.count++;
        existing.amount += Number(fee.paidAmount || fee.amount);
        methodMap.set(method, existing);
      });

    const totalPaidCount = Array.from(methodMap.values()).reduce((sum, m) => sum + m.count, 0);
    const paymentMethods: PaymentMethodStatsDto[] = Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method: this.formatPaymentMethod(method),
        count: data.count,
        amount: data.amount,
        percentage: totalPaidCount > 0 ? Math.round((data.count / totalPaidCount) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      stats,
      departmentFees,
      feeCategories,
      recentTransactions,
      monthlyTrend,
      paymentMethods,
    };
  }

  /**
   * Format fee type for display
   */
  private formatFeeType(feeType: string): string {
    return feeType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format payment method for display
   */
  private formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      upi: 'UPI',
      card: 'Card',
      netbanking: 'Net Banking',
      wallet: 'Wallet',
      cash: 'Cash',
      dd: 'Demand Draft',
      cheque: 'Cheque',
    };
    return methodMap[method.toLowerCase()] || method;
  }

  /**
   * Get comprehensive academics overview for principal
   */
  async getAcademicsOverview(tenantId: string): Promise<PrincipalAcademicsOverviewDto> {
    // Fetch all required data in parallel
    const [
      courses,
      subjects,
      departments,
      students,
      examResults,
    ] = await Promise.all([
      // All courses with department info
      this.prisma.course.findMany({
        where: { tenantId },
        include: {
          department: { select: { id: true, name: true } },
          subjects: { select: { id: true, credits: true, syllabus: true, semester: true } },
        },
      }),
      // All subjects with course info
      this.prisma.subject.findMany({
        where: { tenantId },
        include: {
          course: {
            include: { department: { select: { id: true, name: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      // All departments
      this.prisma.department.findMany({
        where: { tenantId },
        select: { id: true, name: true },
      }),
      // All active students
      this.prisma.student.findMany({
        where: { tenantId, status: 'active' },
        select: { id: true },
      }),
      // Exam results for pass rate calculation
      this.prisma.examResult.findMany({
        where: { tenantId },
        include: {
          exam: {
            include: {
              subject: {
                include: {
                  course: { include: { department: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    // Calculate academic stats
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.subjects.length > 0).length;
    const totalSubjects = subjects.length;
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const studentsEnrolled = students.length;

    // Calculate average pass rate from exam results
    let totalPassed = 0;
    let totalResults = examResults.length;
    examResults.forEach((result) => {
      const passingMarks = Number(result.exam.totalMarks) * 0.4;
      if (Number(result.marks) >= passingMarks) {
        totalPassed++;
      }
    });
    const averagePassRate = totalResults > 0
      ? Math.round((totalPassed / totalResults) * 100 * 10) / 10
      : 0;

    const stats: PrincipalAcademicStatsDto = {
      totalCourses,
      activeCourses,
      totalSubjects,
      totalCredits,
      averagePassRate,
      studentsEnrolled,
    };

    // Build department curriculum status
    const deptCurriculumMap = new Map<string, {
      courses: Set<string>;
      subjects: number;
      credits: number;
      withSyllabus: number;
      totalResults: number;
      passed: number;
    }>();

    // Initialize departments
    departments.forEach((dept) => {
      deptCurriculumMap.set(dept.id, {
        courses: new Set(),
        subjects: 0,
        credits: 0,
        withSyllabus: 0,
        totalResults: 0,
        passed: 0,
      });
    });

    // Process subjects
    subjects.forEach((subject) => {
      const deptId = subject.course.department?.id;
      if (!deptId) return;

      let deptData = deptCurriculumMap.get(deptId);
      if (!deptData) {
        deptData = { courses: new Set(), subjects: 0, credits: 0, withSyllabus: 0, totalResults: 0, passed: 0 };
        deptCurriculumMap.set(deptId, deptData);
      }

      deptData.courses.add(subject.courseId);
      deptData.subjects++;
      deptData.credits += subject.credits;
      if (subject.syllabus && subject.syllabus.trim().length > 0) {
        deptData.withSyllabus++;
      }
    });

    // Process exam results for department pass rates
    examResults.forEach((result) => {
      const deptId = result.exam.subject.course?.department?.id;
      if (!deptId) return;

      const deptData = deptCurriculumMap.get(deptId);
      if (!deptData) return;

      deptData.totalResults++;
      const passingMarks = Number(result.exam.totalMarks) * 0.4;
      if (Number(result.marks) >= passingMarks) {
        deptData.passed++;
      }
    });

    const departmentCurriculum: DepartmentCurriculumDto[] = departments.map((dept) => {
      const data = deptCurriculumMap.get(dept.id) || {
        courses: new Set(),
        subjects: 0,
        credits: 0,
        withSyllabus: 0,
        totalResults: 0,
        passed: 0,
      };

      const syllabusCompletionRate = data.subjects > 0
        ? Math.round((data.withSyllabus / data.subjects) * 100)
        : 0;

      let syllabusStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
      if (syllabusCompletionRate >= 90) syllabusStatus = 'completed';
      else if (syllabusCompletionRate > 0) syllabusStatus = 'in_progress';

      const passRate = data.totalResults > 0
        ? Math.round((data.passed / data.totalResults) * 100)
        : 0;

      return {
        departmentId: dept.id,
        department: dept.name,
        courses: data.courses.size,
        subjects: data.subjects,
        credits: data.credits,
        syllabusStatus,
        syllabusCompletionRate,
        passRate,
      };
    }).filter((d) => d.courses > 0 || d.subjects > 0);

    // Build recent curriculum updates (based on recently updated subjects)
    const recentUpdates: RecentCurriculumUpdateDto[] = subjects
      .slice(0, 10)
      .map((subject) => {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(subject.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        let action = 'Updated';
        const daysSinceCreate = Math.floor(
          (Date.now() - new Date(subject.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreate <= 7) {
          action = 'New Subject Added';
        } else if (subject.syllabus && subject.syllabus.length > 0) {
          action = 'Syllabus Updated';
        }

        let dateStr: string;
        if (daysSinceUpdate === 0) dateStr = 'Today';
        else if (daysSinceUpdate === 1) dateStr = 'Yesterday';
        else if (daysSinceUpdate < 7) dateStr = `${daysSinceUpdate} days ago`;
        else if (daysSinceUpdate < 14) dateStr = '1 week ago';
        else dateStr = `${Math.floor(daysSinceUpdate / 7)} weeks ago`;

        return {
          id: subject.id,
          courseName: subject.course.name,
          subjectName: subject.name,
          department: subject.course.department?.name || 'Unknown',
          departmentId: subject.course.department?.id || '',
          action,
          date: dateStr,
        };
      });

    // Build semester progress
    const semesterMap = new Map<number, { total: number; withSyllabus: number }>();

    // Initialize semesters 1-8
    for (let i = 1; i <= 8; i++) {
      semesterMap.set(i, { total: 0, withSyllabus: 0 });
    }

    subjects.forEach((subject) => {
      const sem = subject.semester;
      if (sem < 1 || sem > 8) return;

      const data = semesterMap.get(sem)!;
      data.total++;
      if (subject.syllabus && subject.syllabus.trim().length > 0) {
        data.withSyllabus++;
      }
    });

    const semesterProgress: SemesterProgressDto[] = Array.from(semesterMap.entries())
      .filter(([_, data]) => data.total > 0)
      .map(([semester, data]) => ({
        semester,
        totalSubjects: data.total,
        withSyllabus: data.withSyllabus,
        completionPercentage: data.total > 0
          ? Math.round((data.withSyllabus / data.total) * 100)
          : 0,
      }));

    return {
      stats,
      departmentCurriculum,
      recentUpdates,
      semesterProgress,
    };
  }

  /**
   * Get comprehensive reports overview for principal
   */
  async getReportsOverview(tenantId: string): Promise<PrincipalReportsOverviewDto> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch all required data in parallel
    const [
      reportTemplates,
      reportJobs,
      scheduledReports,
    ] = await Promise.all([
      // Report templates
      this.prisma.reportTemplate.findMany({
        where: { tenantId },
        orderBy: { category: 'asc' },
      }),
      // Report jobs (generated reports)
      this.prisma.reportJob.findMany({
        where: { tenantId },
        include: {
          template: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Scheduled reports
      this.prisma.scheduledReport.findMany({
        where: { tenantId },
        include: {
          template: { select: { name: true } },
        },
        orderBy: { nextRunAt: 'asc' },
      }),
    ]);

    // Calculate report stats
    const generatedThisMonth = reportJobs.filter(
      (job) => new Date(job.createdAt) >= startOfMonth
    ).length;

    const pendingJobs = reportJobs.filter(
      (job) => job.status === 'pending' || job.status === 'processing'
    ).length;

    const stats: ReportStatsDto = {
      totalTemplates: reportTemplates.length,
      generatedThisMonth,
      scheduledReports: scheduledReports.filter((s) => s.isActive).length,
      pendingJobs,
    };

    // Group templates by category
    const categoryMap = new Map<string, {
      templates: typeof reportTemplates;
    }>();

    reportTemplates.forEach((template) => {
      const category = template.category || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { templates: [] });
      }
      categoryMap.get(category)!.templates.push(template);
    });

    // Get last generated date for each template
    const lastGeneratedMap = new Map<string, Date>();
    reportJobs
      .filter((job) => job.status === 'completed')
      .forEach((job) => {
        if (job.templateId && !lastGeneratedMap.has(job.templateId)) {
          lastGeneratedMap.set(job.templateId, job.createdAt);
        }
      });

    // Build category list with icons
    const categoryIcons: Record<string, string> = {
      academic: 'GraduationCap',
      attendance: 'Calendar',
      financial: 'Wallet',
      staff: 'Users',
      student: 'Users',
      exam: 'FileText',
      Other: 'FileText',
    };

    const categories: ReportCategoryDto[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: this.formatCategoryName(category),
        icon: categoryIcons[category.toLowerCase()] || 'FileText',
        reports: data.templates.map((template): ReportTemplateDto => {
          const lastGenerated = lastGeneratedMap.get(template.id);
          return {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            reportType: template.reportType,
            format: 'PDF', // Default format; actual format is in job
            lastGenerated: lastGenerated
              ? lastGenerated.toISOString().split('T')[0]
              : null,
          };
        }),
      })
    );

    // Build recent reports list
    const recentReports: RecentReportDto[] = reportJobs
      .slice(0, 10)
      .map((job) => ({
        id: job.id,
        name: job.name || job.template?.name || 'Unknown Report',
        generatedBy: 'System', // Could be enhanced to track user
        date: job.createdAt.toISOString(),
        status: job.status as 'pending' | 'processing' | 'completed' | 'failed',
        size: job.fileSize ? this.formatFileSize(Number(job.fileSize)) : null,
        outputUrl: job.fileUrl,
      }));

    // Build scheduled reports list
    const scheduledReportsList: ScheduledReportDto[] = scheduledReports.map(
      (schedule) => ({
        id: schedule.id,
        name: schedule.name || schedule.template?.name || 'Unknown Report',
        frequency: this.formatFrequency(schedule.frequency, schedule.dayOfWeek, schedule.time),
        nextRun: schedule.nextRunAt?.toISOString() || 'Not scheduled',
        recipients: schedule.recipients?.length > 0 ? schedule.recipients.join(', ') : 'None',
        isActive: schedule.isActive,
      })
    );

    return {
      stats,
      categories,
      recentReports,
      scheduledReports: scheduledReportsList,
    };
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(category: string): string {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') + ' Reports';
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Format frequency for display
   */
  private formatFrequency(frequency: string, dayOfWeek?: number | null, time?: string | null): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let result = frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase();

    if (dayOfWeek !== null && dayOfWeek !== undefined && frequency.toLowerCase() === 'weekly') {
      result += ` (${days[dayOfWeek]})`;
    }

    if (time) {
      result += ` at ${time}`;
    }

    return result;
  }
}
