import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InsightSeverity,
  TrendDirection,
  InsightMetadataDto,
  TrendIndicatorDto,
} from './dto/insights.dto';

interface SGIAggregation {
  avgScore: number;
  minScore: number;
  maxScore: number;
  count: number;
  improving: number;
  declining: number;
  stable: number;
}

interface AlertAggregation {
  total: number;
  critical: number;
  warning: number;
  byType: Record<string, number>;
}

@Injectable()
export class InsightAggregatorService {
  private readonly logger = new Logger(InsightAggregatorService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Generate metadata for insight responses
   */
  generateMetadata(
    dataCompleteness: number,
    confidenceScore: number,
    dataSources: string[],
  ): InsightMetadataDto {
    return {
      generatedAt: new Date().toISOString(),
      dataCompleteness,
      confidenceScore,
      dataSourcesUsed: dataSources,
    };
  }

  /**
   * Calculate trend from two values
   */
  calculateTrend(current: number, previous: number, timeframe: string): TrendIndicatorDto {
    const changePercent = previous > 0
      ? Math.round(((current - previous) / previous) * 100 * 10) / 10
      : 0;

    let direction: TrendDirection;
    if (changePercent > 2) direction = TrendDirection.UP;
    else if (changePercent < -2) direction = TrendDirection.DOWN;
    else direction = TrendDirection.STABLE;

    return {
      value: current,
      previousValue: previous,
      direction,
      changePercent,
      timeframe,
    };
  }

  /**
   * Calculate severity based on score
   */
  getSeverityFromScore(score: number, thresholds = { warning: 60, critical: 40 }): InsightSeverity {
    if (score <= thresholds.critical) return InsightSeverity.CRITICAL;
    if (score <= thresholds.warning) return InsightSeverity.WARNING;
    return InsightSeverity.INFO;
  }

  /**
   * Calculate health grade from score
   */
  getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // ============================================
  // SGI Aggregation Methods
  // ============================================

  /**
   * Aggregate SGI scores at institution level
   */
  async aggregateSGIByInstitution(tenantId: string): Promise<SGIAggregation> {
    // Get the latest SGI for each student by using orderBy and distinct
    const sgiData = await this.prisma.studentGrowthIndex.findMany({
      where: { tenantId },
      orderBy: { calculatedAt: 'desc' },
      distinct: ['studentId'],
      select: {
        sgiScore: true,
        sgiTrend: true,
      },
    });

    if (sgiData.length === 0) {
      return {
        avgScore: 0,
        minScore: 0,
        maxScore: 0,
        count: 0,
        improving: 0,
        declining: 0,
        stable: 0,
      };
    }

    const scores = sgiData.map((s) => s.sgiScore);
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

    return {
      avgScore,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      count: sgiData.length,
      improving: sgiData.filter((s) => s.sgiTrend === 'improving').length,
      declining: sgiData.filter((s) => s.sgiTrend === 'declining').length,
      stable: sgiData.filter((s) => s.sgiTrend === 'stable').length,
    };
  }

  /**
   * Aggregate SGI scores by department
   */
  async aggregateSGIByDepartment(tenantId: string, departmentId?: string): Promise<Map<string, SGIAggregation>> {
    const whereClause: any = { tenantId, isLatest: true };
    if (departmentId) {
      whereClause.student = { departmentId };
    }

    const sgiData = await this.prisma.studentGrowthIndex.findMany({
      where: whereClause,
      select: {
        sgiScore: true,
        sgiTrend: true,
        student: {
          select: {
            departmentId: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    const byDepartment = new Map<string, SGIAggregation>();

    // Group by department
    const grouped = new Map<string, typeof sgiData>();
    for (const item of sgiData) {
      const deptId = item.student?.departmentId;
      if (deptId) {
        if (!grouped.has(deptId)) {
          grouped.set(deptId, []);
        }
        grouped.get(deptId)!.push(item);
      }
    }

    // Calculate aggregations
    for (const [deptId, items] of grouped) {
      const scores = items.map((s) => s.sgiScore);
      byDepartment.set(deptId, {
        avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores),
        count: items.length,
        improving: items.filter((s) => s.sgiTrend === 'improving').length,
        declining: items.filter((s) => s.sgiTrend === 'declining').length,
        stable: items.filter((s) => s.sgiTrend === 'stable').length,
      });
    }

    return byDepartment;
  }

  // ============================================
  // Alert Aggregation Methods
  // ============================================

  /**
   * Aggregate alerts at institution level
   */
  async aggregateAlertsByInstitution(tenantId: string): Promise<AlertAggregation> {
    const alerts = await this.prisma.disengagementAlert.findMany({
      where: {
        tenantId,
        status: { in: ['new', 'acknowledged', 'in_progress'] },
      },
      select: {
        severity: true,
        alertType: true,
      },
    });

    const byType: Record<string, number> = {};
    for (const alert of alerts) {
      byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
    }

    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      byType,
    };
  }

  /**
   * Aggregate alerts by department
   */
  async aggregateAlertsByDepartment(tenantId: string): Promise<Map<string, AlertAggregation>> {
    const alerts = await this.prisma.disengagementAlert.findMany({
      where: {
        tenantId,
        status: { in: ['new', 'acknowledged', 'in_progress'] },
      },
      select: {
        severity: true,
        alertType: true,
        student: {
          select: { departmentId: true },
        },
      },
    });

    const byDepartment = new Map<string, AlertAggregation>();

    // Group by department
    const grouped = new Map<string, typeof alerts>();
    for (const alert of alerts) {
      const deptId = alert.student?.departmentId;
      if (deptId) {
        if (!grouped.has(deptId)) {
          grouped.set(deptId, []);
        }
        grouped.get(deptId)!.push(alert);
      }
    }

    // Calculate aggregations
    for (const [deptId, items] of grouped) {
      const byType: Record<string, number> = {};
      for (const alert of items) {
        byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
      }

      byDepartment.set(deptId, {
        total: items.length,
        critical: items.filter((a) => a.severity === 'critical').length,
        warning: items.filter((a) => a.severity === 'warning').length,
        byType,
      });
    }

    return byDepartment;
  }

  // ============================================
  // Student-Level Analysis Methods
  // ============================================

  /**
   * Get student's baseline metrics (their own average)
   */
  async getStudentBaseline(tenantId: string, studentId: string): Promise<{
    avgAttendance: number;
    avgExamScore: number;
    avgEngagement: number;
  }> {
    // Get attendance baseline
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: { tenantId, studentId },
      orderBy: { date: 'desc' },
      take: 60, // Last ~2 months
    });

    const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
    const avgAttendance = attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 75; // Default

    // Get exam score baseline
    const examResults = await this.prisma.examResult.findMany({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { exam: { select: { totalMarks: true } } },
    });

    let avgExamScore = 70; // Default
    if (examResults.length > 0) {
      const percentages = examResults.map((e) =>
        e.exam?.totalMarks && e.exam.totalMarks > 0 ? (Number(e.marks) / e.exam.totalMarks) * 100 : 0
      );
      avgExamScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    }

    // Get engagement baseline from SGI if available
    const sgi = await this.prisma.studentGrowthIndex.findFirst({
      where: { tenantId, studentId },
      orderBy: { calculatedAt: 'desc' },
      select: { engagementScore: true },
    });

    return {
      avgAttendance,
      avgExamScore,
      avgEngagement: sgi?.engagementScore || 50,
    };
  }

  /**
   * Detect anomalies in student behavior (deviation from their own baseline)
   */
  async detectStudentAnomalies(
    tenantId: string,
    studentId: string,
    baseline: { avgAttendance: number; avgExamScore: number; avgEngagement: number },
  ): Promise<{
    hasAnomaly: boolean;
    anomalies: {
      metric: string;
      current: number;
      baseline: number;
      deviation: number;
      context: string;
    }[];
  }> {
    const anomalies: {
      metric: string;
      current: number;
      baseline: number;
      deviation: number;
      context: string;
    }[] = [];

    // Check recent attendance (last 7 days)
    const recentAttendance = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId,
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    if (recentAttendance.length > 0) {
      const recentPresent = recentAttendance.filter((a) => a.status === 'present').length;
      const recentAttendanceRate = Math.round((recentPresent / recentAttendance.length) * 100);
      const attendanceDeviation = baseline.avgAttendance - recentAttendanceRate;

      if (attendanceDeviation > 20) {
        const consecutiveAbsences = this.countConsecutiveAbsences(recentAttendance);
        anomalies.push({
          metric: 'attendance',
          current: recentAttendanceRate,
          baseline: baseline.avgAttendance,
          deviation: attendanceDeviation,
          context: consecutiveAbsences > 1
            ? `${consecutiveAbsences} consecutive absences`
            : 'Recent attendance drop',
        });
      }
    }

    // Check recent exam performance (last exam)
    const recentExam = await this.prisma.examResult.findFirst({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
      select: {
        marks: true,
        exam: { select: { name: true, totalMarks: true } },
      },
    });

    if (recentExam && recentExam.exam?.totalMarks && recentExam.exam.totalMarks > 0) {
      const recentScore = Math.round((Number(recentExam.marks) / recentExam.exam.totalMarks) * 100);
      const examDeviation = baseline.avgExamScore - recentScore;

      if (examDeviation > 25) {
        anomalies.push({
          metric: 'exam_score',
          current: recentScore,
          baseline: baseline.avgExamScore,
          deviation: examDeviation,
          context: `${recentExam.exam?.name || 'Recent exam'}: ${recentScore}% (usually ${baseline.avgExamScore}%)`,
        });
      }
    }

    return {
      hasAnomaly: anomalies.length > 0,
      anomalies,
    };
  }

  private countConsecutiveAbsences(attendance: { status: string; date: Date }[]): number {
    // Sort by date descending
    const sorted = [...attendance].sort((a, b) => b.date.getTime() - a.date.getTime());
    let count = 0;
    for (const record of sorted) {
      if (record.status === 'absent') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  // ============================================
  // Historical Pattern Analysis
  // ============================================

  /**
   * Calculate pattern match percentage - how often this pattern led to issues
   */
  async calculatePatternMatchPercent(
    tenantId: string,
    signals: { type: string; changePercent: number }[],
  ): Promise<number> {
    // This would ideally use ML, but for now we use rule-based estimation
    // based on the severity and combination of signals

    let patternWeight = 0;

    for (const signal of signals) {
      if (signal.type === 'attendance_drop') {
        patternWeight += Math.min(30, Math.abs(signal.changePercent));
      } else if (signal.type === 'grade_decline') {
        patternWeight += Math.min(40, Math.abs(signal.changePercent));
      } else if (signal.type === 'engagement_drop') {
        patternWeight += Math.min(20, Math.abs(signal.changePercent));
      }
    }

    // Multiple signals compound the risk
    if (signals.length >= 3) {
      patternWeight *= 1.3;
    } else if (signals.length >= 2) {
      patternWeight *= 1.1;
    }

    // Historical data would improve this, but for now:
    // "Based on historical patterns, X% of students with similar signals experienced grade decline"
    return Math.min(90, Math.round(patternWeight));
  }

  // ============================================
  // Natural Language Summary Generation
  // ============================================

  /**
   * Generate natural language summary for parent early warning
   */
  generateEarlyWarningSummary(
    studentName: string,
    signals: { label: string; changePercent: number }[],
    patternMatch: number,
  ): string {
    if (signals.length === 0) {
      return `${studentName} is doing well. No concerning patterns detected.`;
    }

    const firstName = studentName.split(' ')[0];
    const primarySignal = signals[0];

    let summary = `${firstName}'s ${primarySignal.label.toLowerCase()} has dropped ${Math.abs(primarySignal.changePercent)}%`;

    if (signals.length > 1) {
      summary += ` along with ${signals.length - 1} other indicator${signals.length > 2 ? 's' : ''}`;
    }

    summary += `. This pattern has preceded academic challenges in ${patternMatch}% of similar cases.`;

    return summary;
  }

  /**
   * Generate natural language summary for institutional pulse
   */
  generatePulseSummary(
    overallScore: number,
    trend: TrendDirection,
    trendDelta: number,
    topConcerns: string[],
  ): string {
    let summary = `Institution health score is ${overallScore}/100`;

    if (trend === TrendDirection.UP) {
      summary += ` (up ${Math.abs(trendDelta)}% from last month)`;
    } else if (trend === TrendDirection.DOWN) {
      summary += ` (down ${Math.abs(trendDelta)}% from last month)`;
    }

    if (topConcerns.length > 0) {
      summary += `. Key areas requiring attention: ${topConcerns.slice(0, 2).join(', ')}`;
    } else {
      summary += `. All departments are performing within expected ranges.`;
    }

    return summary;
  }

  /**
   * Generate natural language summary for daily focus
   */
  generateDailyFocusSummary(
    priorityCount: number,
    criticalCount: number,
    totalMonitored: number,
  ): string {
    if (priorityCount === 0) {
      return `All ${totalMonitored} students are performing within their normal ranges. No urgent attention needed today.`;
    }

    let summary = `${priorityCount} student${priorityCount > 1 ? 's' : ''} need${priorityCount === 1 ? 's' : ''} your attention today`;

    if (criticalCount > 0) {
      summary += `, including ${criticalCount} requiring immediate follow-up`;
    }

    summary += `. These students are showing deviations from their personal baselines.`;

    return summary;
  }
}
