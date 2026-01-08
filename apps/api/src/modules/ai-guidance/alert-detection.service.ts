import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AlertType,
  AlertSeverity,
  SuggestedActionDto,
} from './dto/ai-guidance.dto';

/**
 * Alert Detection Service
 *
 * Monitors student metrics and detects disengagement patterns:
 * - Attendance drops
 * - Grade declines
 * - Activity drops
 * - Feedback concerns
 *
 * Generates alerts with suggested actions for intervention.
 */

export interface DetectedAlert {
  studentId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  thresholdValue: number;
  changePercent?: number;
  timeframe: string;
  description: string;
  suggestedActions: SuggestedActionDto[];
}

export interface AlertThresholds {
  attendanceWarning: number;
  attendanceCritical: number;
  cgpaDropWarning: number;
  cgpaDropCritical: number;
  sgiDropWarning: number;
  sgiDropCritical: number;
  activityDropPercent: number;
  feedbackScoreLow: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  attendanceWarning: 75,
  attendanceCritical: 60,
  cgpaDropWarning: 0.3,
  cgpaDropCritical: 0.5,
  sgiDropWarning: 10,
  sgiDropCritical: 20,
  activityDropPercent: 50,
  feedbackScoreLow: 2.5,
};

@Injectable()
export class AlertDetectionService {
  private readonly logger = new Logger(AlertDetectionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Run full alert detection for a tenant
   */
  async runDetection(
    tenantId: string,
    options: {
      studentId?: string;
      departmentId?: string;
      alertTypes?: AlertType[];
      thresholds?: Partial<AlertThresholds>;
    } = {}
  ): Promise<DetectedAlert[]> {
    const {
      studentId,
      departmentId,
      alertTypes = Object.values(AlertType),
      thresholds: customThresholds,
    } = options;

    const thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
    const alerts: DetectedAlert[] = [];

    // Build student filter
    const studentWhere: any = { tenantId };
    if (studentId) studentWhere.id = studentId;
    if (departmentId) studentWhere.departmentId = departmentId;

    // Get students to check
    const students = await this.prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        rollNo: true,
        semester: true,
        userId: true,
        user: {
          select: { name: true },
        },
      },
    });

    this.logger.log(`Running alert detection for ${students.length} students`);

    for (const student of students) {
      // Check each alert type
      if (alertTypes.includes(AlertType.ATTENDANCE_DROP)) {
        const attendanceAlerts = await this.checkAttendance(tenantId, student.id, thresholds);
        alerts.push(...attendanceAlerts);
      }

      if (alertTypes.includes(AlertType.GRADE_DECLINE)) {
        const gradeAlerts = await this.checkGrades(tenantId, student.id, thresholds);
        alerts.push(...gradeAlerts);
      }

      if (alertTypes.includes(AlertType.ACTIVITY_DROP)) {
        const activityAlerts = await this.checkActivity(tenantId, student.id, thresholds);
        alerts.push(...activityAlerts);
      }

      if (alertTypes.includes(AlertType.FEEDBACK_CONCERN)) {
        const feedbackAlerts = await this.checkFeedback(tenantId, student.id, thresholds);
        alerts.push(...feedbackAlerts);
      }
    }

    this.logger.log(`Detection complete: ${alerts.length} alerts found`);
    return alerts;
  }

  /**
   * Check attendance metrics
   */
  private async checkAttendance(
    tenantId: string,
    studentId: string,
    thresholds: AlertThresholds
  ): Promise<DetectedAlert[]> {
    const alerts: DetectedAlert[] = [];

    // Get recent attendance data
    // For now, we'll check the latest semester snapshot
    const snapshot = await this.prisma.semesterSnapshot.findFirst({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!snapshot || snapshot.overallAttendance === null) return alerts;

    const currentAttendance = snapshot.overallAttendance;

    // Check against thresholds
    if (currentAttendance < thresholds.attendanceCritical) {
      alerts.push({
        studentId,
        alertType: AlertType.ATTENDANCE_DROP,
        severity: AlertSeverity.CRITICAL,
        metricName: 'overall_attendance',
        currentValue: currentAttendance,
        thresholdValue: thresholds.attendanceCritical,
        timeframe: `Semester ${snapshot.semester}`,
        description: `Attendance has dropped to ${currentAttendance}%, which is critically low and may affect exam eligibility.`,
        suggestedActions: [
          { action: 'Immediate counseling session with student', priority: 'urgent', assignedTo: 'mentor' },
          { action: 'Notify parent/guardian about attendance concern', priority: 'high', assignedTo: 'hod' },
          { action: 'Investigate reasons for absences', priority: 'high', assignedTo: 'mentor' },
        ],
      });
    } else if (currentAttendance < thresholds.attendanceWarning) {
      alerts.push({
        studentId,
        alertType: AlertType.ATTENDANCE_DROP,
        severity: AlertSeverity.WARNING,
        metricName: 'overall_attendance',
        currentValue: currentAttendance,
        thresholdValue: thresholds.attendanceWarning,
        timeframe: `Semester ${snapshot.semester}`,
        description: `Attendance is at ${currentAttendance}%, approaching the minimum requirement.`,
        suggestedActions: [
          { action: 'Discuss attendance importance with student', priority: 'medium', assignedTo: 'mentor' },
          { action: 'Set up weekly attendance check-ins', priority: 'medium', assignedTo: 'teacher' },
        ],
      });
    }

    return alerts;
  }

  /**
   * Check grade/CGPA metrics
   */
  private async checkGrades(
    tenantId: string,
    studentId: string,
    thresholds: AlertThresholds
  ): Promise<DetectedAlert[]> {
    const alerts: DetectedAlert[] = [];

    // Get recent snapshots to compare
    const snapshots = await this.prisma.semesterSnapshot.findMany({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (snapshots.length < 2) return alerts;

    const [current, previous] = snapshots;

    if (current.cgpa === null || previous.cgpa === null) return alerts;

    const cgpaDrop = previous.cgpa - current.cgpa;
    const changePercent = (cgpaDrop / previous.cgpa) * 100;

    if (cgpaDrop >= thresholds.cgpaDropCritical) {
      alerts.push({
        studentId,
        alertType: AlertType.GRADE_DECLINE,
        severity: AlertSeverity.CRITICAL,
        metricName: 'cgpa',
        currentValue: current.cgpa,
        previousValue: previous.cgpa,
        thresholdValue: thresholds.cgpaDropCritical,
        changePercent,
        timeframe: `Semester ${previous.semester} to ${current.semester}`,
        description: `CGPA dropped significantly from ${previous.cgpa} to ${current.cgpa} (${cgpaDrop.toFixed(2)} points).`,
        suggestedActions: [
          { action: 'Schedule academic counseling session', priority: 'urgent', assignedTo: 'mentor' },
          { action: 'Identify struggling subjects and arrange tutoring', priority: 'high', assignedTo: 'teacher' },
          { action: 'Create academic recovery plan', priority: 'high', assignedTo: 'mentor' },
        ],
      });
    } else if (cgpaDrop >= thresholds.cgpaDropWarning) {
      alerts.push({
        studentId,
        alertType: AlertType.GRADE_DECLINE,
        severity: AlertSeverity.WARNING,
        metricName: 'cgpa',
        currentValue: current.cgpa,
        previousValue: previous.cgpa,
        thresholdValue: thresholds.cgpaDropWarning,
        changePercent,
        timeframe: `Semester ${previous.semester} to ${current.semester}`,
        description: `CGPA decreased from ${previous.cgpa} to ${current.cgpa}. Early intervention recommended.`,
        suggestedActions: [
          { action: 'Review recent exam performance with student', priority: 'medium', assignedTo: 'teacher' },
          { action: 'Check for any personal issues affecting academics', priority: 'medium', assignedTo: 'mentor' },
        ],
      });
    }

    // Also check backlogs
    if (current.backlogs > 0) {
      const severity = current.backlogs >= 3 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
      alerts.push({
        studentId,
        alertType: AlertType.GRADE_DECLINE,
        severity,
        metricName: 'backlogs',
        currentValue: current.backlogs,
        thresholdValue: 0,
        timeframe: `Semester ${current.semester}`,
        description: `Student has ${current.backlogs} active backlog${current.backlogs > 1 ? 's' : ''}.`,
        suggestedActions: [
          { action: 'Create backlog clearance plan', priority: 'high', assignedTo: 'mentor' },
          { action: 'Arrange special coaching for backlog subjects', priority: 'medium', assignedTo: 'teacher' },
        ],
      });
    }

    return alerts;
  }

  /**
   * Check activity/engagement metrics
   */
  private async checkActivity(
    tenantId: string,
    studentId: string,
    thresholds: AlertThresholds
  ): Promise<DetectedAlert[]> {
    const alerts: DetectedAlert[] = [];

    // Get SGI data to check engagement
    const sgiRecords = await this.prisma.studentGrowthIndex.findMany({
      where: { tenantId, studentId },
      orderBy: { calculatedAt: 'desc' },
      take: 2,
    });

    if (sgiRecords.length < 2) return alerts;

    const [current, previous] = sgiRecords;

    // Check engagement score drop
    const engagementDrop = previous.engagementScore - current.engagementScore;
    const changePercent = (engagementDrop / previous.engagementScore) * 100;

    if (changePercent >= thresholds.activityDropPercent) {
      alerts.push({
        studentId,
        alertType: AlertType.ACTIVITY_DROP,
        severity: AlertSeverity.WARNING,
        metricName: 'engagement_score',
        currentValue: current.engagementScore,
        previousValue: previous.engagementScore,
        thresholdValue: previous.engagementScore * (1 - thresholds.activityDropPercent / 100),
        changePercent,
        timeframe: 'Last month',
        description: `Campus engagement dropped by ${changePercent.toFixed(0)}% - student may be disengaging.`,
        suggestedActions: [
          { action: 'Check on student well-being', priority: 'medium', assignedTo: 'mentor' },
          { action: 'Encourage participation in upcoming events', priority: 'low', assignedTo: 'teacher' },
        ],
      });
    }

    // Check overall SGI drop
    const sgiDrop = previous.sgiScore - current.sgiScore;
    if (sgiDrop >= thresholds.sgiDropCritical) {
      alerts.push({
        studentId,
        alertType: AlertType.ACTIVITY_DROP,
        severity: AlertSeverity.CRITICAL,
        metricName: 'sgi_score',
        currentValue: current.sgiScore,
        previousValue: previous.sgiScore,
        thresholdValue: previous.sgiScore - thresholds.sgiDropCritical,
        changePercent: (sgiDrop / previous.sgiScore) * 100,
        timeframe: 'Last month',
        description: `Student Growth Index dropped significantly from ${previous.sgiScore} to ${current.sgiScore}.`,
        suggestedActions: [
          { action: 'Comprehensive review of student progress', priority: 'high', assignedTo: 'mentor' },
          { action: 'Create intervention plan', priority: 'high', assignedTo: 'hod' },
        ],
      });
    } else if (sgiDrop >= thresholds.sgiDropWarning) {
      alerts.push({
        studentId,
        alertType: AlertType.ACTIVITY_DROP,
        severity: AlertSeverity.WARNING,
        metricName: 'sgi_score',
        currentValue: current.sgiScore,
        previousValue: previous.sgiScore,
        thresholdValue: previous.sgiScore - thresholds.sgiDropWarning,
        changePercent: (sgiDrop / previous.sgiScore) * 100,
        timeframe: 'Last month',
        description: `Student Growth Index decreased from ${previous.sgiScore} to ${current.sgiScore}.`,
        suggestedActions: [
          { action: 'Discuss progress concerns with student', priority: 'medium', assignedTo: 'mentor' },
        ],
      });
    }

    return alerts;
  }

  /**
   * Check feedback-related concerns
   */
  private async checkFeedback(
    tenantId: string,
    studentId: string,
    thresholds: AlertThresholds
  ): Promise<DetectedAlert[]> {
    const alerts: DetectedAlert[] = [];

    // Get latest feedback summary
    const summary = await this.prisma.feedbackSummary.findFirst({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!summary || summary.overallScore === null) return alerts;

    if (summary.overallScore < thresholds.feedbackScoreLow) {
      alerts.push({
        studentId,
        alertType: AlertType.FEEDBACK_CONCERN,
        severity: summary.overallScore < 2.0 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        metricName: 'feedback_score',
        currentValue: summary.overallScore,
        thresholdValue: thresholds.feedbackScoreLow,
        timeframe: `${summary.month}/${summary.year} feedback cycle`,
        description: `360° feedback score is ${summary.overallScore}/5, indicating concerns from evaluators.`,
        suggestedActions: [
          { action: 'Review detailed feedback with student', priority: 'high', assignedTo: 'mentor' },
          { action: 'Create behavioral improvement plan', priority: 'medium', assignedTo: 'mentor' },
        ],
      });
    }

    return alerts;
  }

  /**
   * Save detected alerts to database
   */
  async saveAlerts(tenantId: string, alerts: DetectedAlert[]): Promise<number> {
    let savedCount = 0;

    for (const alert of alerts) {
      // Check for existing similar alert (to avoid duplicates)
      const existing = await this.prisma.disengagementAlert.findFirst({
        where: {
          tenantId,
          studentId: alert.studentId,
          alertType: alert.alertType,
          metricName: alert.metricName,
          status: { in: ['new', 'acknowledged', 'in_progress'] },
        },
      });

      if (existing) {
        // Update existing alert if values changed significantly
        await this.prisma.disengagementAlert.update({
          where: { id: existing.id },
          data: {
            currentValue: alert.currentValue,
            previousValue: alert.previousValue,
            changePercent: alert.changePercent,
            severity: alert.severity,
            description: alert.description,
            suggestedActions: alert.suggestedActions as any,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new alert
        await this.prisma.disengagementAlert.create({
          data: {
            tenantId,
            studentId: alert.studentId,
            alertType: alert.alertType,
            severity: alert.severity,
            metricName: alert.metricName,
            currentValue: alert.currentValue,
            previousValue: alert.previousValue,
            thresholdValue: alert.thresholdValue,
            changePercent: alert.changePercent,
            timeframe: alert.timeframe,
            description: alert.description,
            suggestedActions: alert.suggestedActions as any,
          },
        });
        savedCount++;
      }
    }

    this.logger.log(`Saved ${savedCount} new alerts (${alerts.length - savedCount} updated)`);
    return savedCount;
  }

  /**
   * Get alert statistics for a tenant
   */
  async getAlertStats(tenantId: string): Promise<{
    totalAlerts: number;
    unresolvedAlerts: number;
    criticalAlerts: number;
    byType: { type: string; count: number }[];
    bySeverity: { severity: string; count: number }[];
  }> {
    const [total, unresolved, critical, byType, bySeverity] = await Promise.all([
      this.prisma.disengagementAlert.count({ where: { tenantId } }),
      this.prisma.disengagementAlert.count({
        where: { tenantId, status: { in: ['new', 'acknowledged', 'in_progress'] } },
      }),
      this.prisma.disengagementAlert.count({
        where: { tenantId, severity: 'critical', status: { in: ['new', 'acknowledged', 'in_progress'] } },
      }),
      this.prisma.disengagementAlert.groupBy({
        by: ['alertType'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.disengagementAlert.groupBy({
        by: ['severity'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      totalAlerts: total,
      unresolvedAlerts: unresolved,
      criticalAlerts: critical,
      byType: byType.map((b) => ({ type: b.alertType, count: b._count })),
      bySeverity: bySeverity.map((b) => ({ severity: b.severity, count: b._count })),
    };
  }
}
