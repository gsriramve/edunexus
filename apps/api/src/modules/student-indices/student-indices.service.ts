import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SgiCalculatorService } from './sgi-calculator.service';
import { CriCalculatorService } from './cri-calculator.service';
import {
  SgiQueryDto,
  CriQueryDto,
  UpdateIndexConfigDto,
  BulkCalculateSgiDto,
  BulkCalculateCriDto,
} from './dto/student-indices.dto';

@Injectable()
export class StudentIndicesService {
  private readonly logger = new Logger(StudentIndicesService.name);

  constructor(
    private prisma: PrismaService,
    private sgiCalculator: SgiCalculatorService,
    private criCalculator: CriCalculatorService,
  ) {}

  // ============================================
  // SGI (Student Growth Index) Operations
  // ============================================

  /**
   * Get SGI for a student
   */
  async getSgi(tenantId: string, studentId: string, query: SgiQueryDto) {
    const { month, year, limit } = query;

    // If specific month/year requested, get that record
    if (month && year) {
      const sgi = await this.prisma.studentGrowthIndex.findFirst({
        where: { tenantId, studentId, month, year },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
        },
      });

      if (!sgi) {
        throw new NotFoundException(`SGI not found for ${month}/${year}`);
      }

      return sgi;
    }

    // Otherwise, get history
    const history = await this.prisma.studentGrowthIndex.findMany({
      where: { tenantId, studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: limit || 12,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return {
      studentId,
      history,
      latest: history[0] || null,
    };
  }

  /**
   * Calculate and store SGI for a student
   */
  async calculateSgi(tenantId: string, studentId: string, month: number, year: number) {
    // Validate student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Calculate SGI
    const result = await this.sgiCalculator.calculateSgi({
      studentId,
      tenantId,
      month,
      year,
    });

    // Upsert the SGI record
    const sgi = await this.prisma.studentGrowthIndex.upsert({
      where: {
        tenantId_studentId_month_year: {
          tenantId,
          studentId,
          month,
          year,
        },
      },
      create: {
        tenantId,
        studentId,
        month,
        year,
        academicScore: result.scores.academicScore,
        engagementScore: result.scores.engagementScore,
        skillsScore: result.scores.skillsScore,
        behavioralScore: result.scores.behavioralScore,
        sgiScore: result.sgiScore,
        sgiTrend: result.trend,
        trendDelta: result.trendDelta,
        academicBreakdown: result.breakdown.academic,
        engagementBreakdown: result.breakdown.engagement,
        skillsBreakdown: result.breakdown.skills,
        behavioralBreakdown: result.breakdown.behavioral,
        insightsSummary: result.insights,
        recommendations: result.recommendations,
        dataCompleteness: result.dataCompleteness,
        calculatedAt: new Date(),
      },
      update: {
        academicScore: result.scores.academicScore,
        engagementScore: result.scores.engagementScore,
        skillsScore: result.scores.skillsScore,
        behavioralScore: result.scores.behavioralScore,
        sgiScore: result.sgiScore,
        sgiTrend: result.trend,
        trendDelta: result.trendDelta,
        academicBreakdown: result.breakdown.academic,
        engagementBreakdown: result.breakdown.engagement,
        skillsBreakdown: result.breakdown.skills,
        behavioralBreakdown: result.breakdown.behavioral,
        insightsSummary: result.insights,
        recommendations: result.recommendations,
        dataCompleteness: result.dataCompleteness,
        calculatedAt: new Date(),
      },
    });

    // Check if alert threshold breached
    await this.checkSgiAlerts(tenantId, studentId, result.sgiScore, result.trend);

    return {
      ...sgi,
      calculated: result,
    };
  }

  /**
   * Bulk calculate SGI for multiple students
   */
  async bulkCalculateSgi(tenantId: string, dto: BulkCalculateSgiDto) {
    const { departmentId, batch, month, year } = dto;

    // Build query
    const where: any = { tenantId, status: 'active' };
    if (departmentId) where.departmentId = departmentId;
    if (batch) where.batch = batch;

    // Get students
    const students = await this.prisma.student.findMany({
      where,
      select: { id: true },
    });

    this.logger.log(`Calculating SGI for ${students.length} students`);

    const results = {
      total: students.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Calculate for each student
    for (const student of students) {
      try {
        await this.calculateSgi(tenantId, student.id, month, year);
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${student.id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Get SGI statistics for tenant/department
   */
  async getSgiStats(tenantId: string, departmentId?: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const where: any = { tenantId, month: currentMonth, year: currentYear };

    // Get all SGIs for current month
    const sgis = await this.prisma.studentGrowthIndex.findMany({
      where,
      include: {
        student: {
          include: {
            department: true,
          },
        },
      },
    });

    // Filter by department if specified
    const filteredSgis = departmentId
      ? sgis.filter(s => s.student?.departmentId === departmentId)
      : sgis;

    // Calculate stats
    const totalStudents = filteredSgis.length;
    const avgSgi = totalStudents > 0
      ? filteredSgis.reduce((sum, s) => sum + s.sgiScore, 0) / totalStudents
      : 0;

    const improvingCount = filteredSgis.filter(s => s.sgiTrend === 'improving').length;
    const decliningCount = filteredSgis.filter(s => s.sgiTrend === 'declining').length;
    const stableCount = filteredSgis.filter(s => s.sgiTrend === 'stable').length;

    // Group by department
    const byDepartment = sgis.reduce((acc, sgi) => {
      const deptId = sgi.student?.departmentId || 'unknown';
      const deptName = sgi.student?.department?.name || 'Unknown';

      if (!acc[deptId]) {
        acc[deptId] = {
          departmentId: deptId,
          departmentName: deptName,
          scores: [],
          improving: 0,
          declining: 0,
          stable: 0,
        };
      }

      acc[deptId].scores.push(sgi.sgiScore);
      if (sgi.sgiTrend === 'improving') acc[deptId].improving++;
      else if (sgi.sgiTrend === 'declining') acc[deptId].declining++;
      else acc[deptId].stable++;

      return acc;
    }, {} as Record<string, any>);

    const departmentStats = Object.values(byDepartment).map((d: any) => ({
      departmentId: d.departmentId,
      departmentName: d.departmentName,
      averageSgi: Math.round((d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length) * 10) / 10,
      studentCount: d.scores.length,
      improvingCount: d.improving,
      decliningCount: d.declining,
      stableCount: d.stable,
    }));

    // Top performers
    const topPerformers = filteredSgis
      .sort((a, b) => b.sgiScore - a.sgiScore)
      .slice(0, 10);

    // At risk students (SGI < 40)
    const config = await this.getConfig(tenantId);
    const atRiskStudents = filteredSgis
      .filter(s => s.sgiScore < config.sgiAlertThreshold)
      .sort((a, b) => a.sgiScore - b.sgiScore);

    return {
      tenantAverageSgi: Math.round(avgSgi * 10) / 10,
      totalStudents,
      improvingCount,
      decliningCount,
      stableCount,
      byDepartment: departmentStats,
      topPerformers,
      atRiskStudents,
      month: currentMonth,
      year: currentYear,
    };
  }

  // ============================================
  // CRI (Career Readiness Index) Operations
  // ============================================

  /**
   * Get CRI for a student
   */
  async getCri(tenantId: string, studentId: string, query: CriQueryDto) {
    const { latestOnly, limit } = query;

    if (latestOnly) {
      const cri = await this.prisma.careerReadinessIndex.findFirst({
        where: { tenantId, studentId, isLatest: true },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true, code: true } },
            },
          },
        },
      });

      if (!cri) {
        throw new NotFoundException('CRI not found for student');
      }

      return cri;
    }

    // Get history
    const history = await this.prisma.careerReadinessIndex.findMany({
      where: { tenantId, studentId },
      orderBy: { assessmentDate: 'desc' },
      take: limit || 10,
    });

    return {
      studentId,
      history,
      latest: history.find(h => h.isLatest) || history[0] || null,
    };
  }

  /**
   * Calculate and store CRI for a student
   */
  async calculateCri(tenantId: string, studentId: string) {
    // Validate student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Calculate CRI
    const result = await this.criCalculator.calculateCri({
      studentId,
      tenantId,
    });

    // Mark previous CRI as not latest
    await this.prisma.careerReadinessIndex.updateMany({
      where: { tenantId, studentId, isLatest: true },
      data: { isLatest: false },
    });

    // Create new CRI record
    const cri = await this.prisma.careerReadinessIndex.create({
      data: {
        tenantId,
        studentId,
        criScore: result.criScore,
        placementProbability: result.placementProbability,
        salaryBand: result.salaryBand,
        resumeScore: result.scores.resumeScore,
        interviewScore: result.scores.interviewScore,
        skillRoleFitScore: result.scores.skillRoleFitScore,
        industryExposureScore: result.scores.industryExposureScore,
        skillGaps: result.skillGaps as any,
        targetRoles: result.targetRoles as any,
        topMatchingCompanies: result.topMatchingCompanies as any,
        actionPlan: result.actionPlan as any,
        confidenceScore: result.confidenceScore,
        isLatest: true,
        assessmentDate: new Date(),
      },
    });

    // Check if alert threshold breached
    await this.checkCriAlerts(tenantId, studentId, result.criScore);

    return {
      ...cri,
      calculated: result,
    };
  }

  /**
   * Bulk calculate CRI for multiple students
   */
  async bulkCalculateCri(tenantId: string, dto: BulkCalculateCriDto) {
    const { departmentId, batch } = dto;

    // Build query
    const where: any = { tenantId, status: 'active' };
    if (departmentId) where.departmentId = departmentId;
    if (batch) where.batch = batch;

    // Get students
    const students = await this.prisma.student.findMany({
      where,
      select: { id: true },
    });

    this.logger.log(`Calculating CRI for ${students.length} students`);

    const results = {
      total: students.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Calculate for each student
    for (const student of students) {
      try {
        await this.calculateCri(tenantId, student.id);
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${student.id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Get CRI statistics
   */
  async getCriStats(tenantId: string, departmentId?: string) {
    const where: any = { tenantId, isLatest: true };

    const cris = await this.prisma.careerReadinessIndex.findMany({
      where,
      include: {
        student: {
          include: {
            department: true,
          },
        },
      },
    });

    // Filter by department if specified
    const filteredCris = departmentId
      ? cris.filter(c => c.student?.departmentId === departmentId)
      : cris;

    const totalStudents = filteredCris.length;
    const avgCri = totalStudents > 0
      ? filteredCris.reduce((sum, c) => sum + c.criScore, 0) / totalStudents
      : 0;

    const avgProbability = totalStudents > 0
      ? filteredCris.reduce((sum, c) => sum + c.placementProbability, 0) / totalStudents
      : 0;

    // Placement readiness count
    const placementReadyCount = filteredCris.filter(c => c.criScore >= 70).length;
    const needsImprovementCount = filteredCris.filter(c => c.criScore < 50).length;

    // Salary band distribution
    const salaryBandDistribution = filteredCris.reduce((acc, c) => {
      acc[c.salaryBand] = (acc[c.salaryBand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by department
    const byDepartment = cris.reduce((acc, cri) => {
      const deptId = cri.student?.departmentId || 'unknown';
      const deptName = cri.student?.department?.name || 'Unknown';

      if (!acc[deptId]) {
        acc[deptId] = {
          departmentId: deptId,
          departmentName: deptName,
          scores: [],
        };
      }

      acc[deptId].scores.push(cri.criScore);
      return acc;
    }, {} as Record<string, any>);

    const departmentStats = Object.values(byDepartment).map((d: any) => ({
      departmentId: d.departmentId,
      departmentName: d.departmentName,
      averageCri: Math.round((d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length) * 10) / 10,
      studentCount: d.scores.length,
    }));

    // Aggregate skill gaps across all students
    const allSkillGaps: Record<string, number> = {};
    filteredCris.forEach(cri => {
      const gaps = cri.skillGaps as any[] || [];
      gaps.forEach((gap: any) => {
        allSkillGaps[gap.skill] = (allSkillGaps[gap.skill] || 0) + 1;
      });
    });

    const topSkillGaps = Object.entries(allSkillGaps)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, studentsAffected: count }));

    return {
      tenantAverageCri: Math.round(avgCri * 10) / 10,
      totalStudents,
      placementReadyCount,
      needsImprovementCount,
      averagePlacementProbability: Math.round(avgProbability * 100) / 100,
      salaryBandDistribution,
      byDepartment: departmentStats,
      topSkillGaps,
    };
  }

  // ============================================
  // Configuration Operations
  // ============================================

  /**
   * Get index configuration
   */
  async getConfig(tenantId: string) {
    let config = await this.prisma.indexConfiguration.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = await this.prisma.indexConfiguration.create({
        data: {
          tenantId,
          sgiAcademicWeight: 40,
          sgiEngagementWeight: 30,
          sgiSkillsWeight: 20,
          sgiBehavioralWeight: 10,
          criResumeWeight: 25,
          criInterviewWeight: 25,
          criSkillFitWeight: 25,
          criExposureWeight: 25,
          sgiAlertThreshold: 40,
          criAlertThreshold: 50,
        },
      });
    }

    return config;
  }

  /**
   * Update index configuration
   */
  async updateConfig(tenantId: string, dto: UpdateIndexConfigDto) {
    // Validate SGI weights sum to 100
    if (dto.sgiAcademicWeight !== undefined ||
        dto.sgiEngagementWeight !== undefined ||
        dto.sgiSkillsWeight !== undefined ||
        dto.sgiBehavioralWeight !== undefined) {
      const config = await this.getConfig(tenantId);
      const newWeights = {
        academic: dto.sgiAcademicWeight ?? config.sgiAcademicWeight,
        engagement: dto.sgiEngagementWeight ?? config.sgiEngagementWeight,
        skills: dto.sgiSkillsWeight ?? config.sgiSkillsWeight,
        behavioral: dto.sgiBehavioralWeight ?? config.sgiBehavioralWeight,
      };

      const sum = newWeights.academic + newWeights.engagement + newWeights.skills + newWeights.behavioral;
      if (sum !== 100) {
        throw new BadRequestException(`SGI weights must sum to 100 (current: ${sum})`);
      }
    }

    // Validate CRI weights sum to 100
    if (dto.criResumeWeight !== undefined ||
        dto.criInterviewWeight !== undefined ||
        dto.criSkillFitWeight !== undefined ||
        dto.criExposureWeight !== undefined) {
      const config = await this.getConfig(tenantId);
      const newWeights = {
        resume: dto.criResumeWeight ?? config.criResumeWeight,
        interview: dto.criInterviewWeight ?? config.criInterviewWeight,
        skillFit: dto.criSkillFitWeight ?? config.criSkillFitWeight,
        exposure: dto.criExposureWeight ?? config.criExposureWeight,
      };

      const sum = newWeights.resume + newWeights.interview + newWeights.skillFit + newWeights.exposure;
      if (sum !== 100) {
        throw new BadRequestException(`CRI weights must sum to 100 (current: ${sum})`);
      }
    }

    return this.prisma.indexConfiguration.update({
      where: { tenantId },
      data: dto,
    });
  }

  // ============================================
  // Alert Operations
  // ============================================

  /**
   * Get students with low SGI scores (public alert retrieval)
   */
  async getSgiAlerts(tenantId: string, departmentId?: string, threshold?: number) {
    const config = await this.getConfig(tenantId);
    const alertThreshold = threshold ?? config.sgiAlertThreshold;

    const where: any = {
      tenantId,
      sgiScore: { lt: alertThreshold },
    };

    const recentSgis = await this.prisma.studentGrowthIndex.findMany({
      where,
      orderBy: { sgiScore: 'asc' },
      take: 50,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    // Filter by department if specified
    const filtered = departmentId
      ? recentSgis.filter(s => s.student.department?.id === departmentId)
      : recentSgis;

    return filtered.map(sgi => ({
      studentId: sgi.studentId,
      studentName: sgi.student.user?.name,
      department: sgi.student.department?.name,
      sgiScore: sgi.sgiScore,
      trend: sgi.sgiTrend,
      alertLevel: sgi.sgiScore < 30 ? 'critical' : 'warning',
    }));
  }

  /**
   * Get students with low CRI scores (public alert retrieval)
   */
  async getCriAlerts(tenantId: string, departmentId?: string, threshold?: number) {
    const config = await this.getConfig(tenantId);
    const alertThreshold = threshold ?? config.criAlertThreshold;

    const lowCris = await this.prisma.careerReadinessIndex.findMany({
      where: {
        tenantId,
        isLatest: true,
        criScore: { lt: alertThreshold },
      },
      orderBy: { criScore: 'asc' },
      take: 50,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    // Filter by department if specified
    const filtered = departmentId
      ? lowCris.filter(c => c.student.department?.id === departmentId)
      : lowCris;

    return filtered.map(cri => ({
      studentId: cri.studentId,
      studentName: cri.student.user?.name,
      department: cri.student.department?.name,
      criScore: cri.criScore,
      placementProbability: cri.placementProbability,
      alertLevel: cri.criScore < 30 ? 'critical' : 'warning',
    }));
  }

  /**
   * Check and create SGI alerts (internal)
   */
  private async checkSgiAlerts(tenantId: string, studentId: string, sgiScore: number, trend: string) {
    const config = await this.getConfig(tenantId);

    if (sgiScore < config.sgiAlertThreshold || trend === 'declining') {
      // Check if similar alert already exists and is not resolved
      const existingAlert = await this.prisma.disengagementAlert.findFirst({
        where: {
          tenantId,
          studentId,
          alertType: trend === 'declining' ? 'grade_decline' : 'activity_drop',
          status: { in: ['new', 'acknowledged', 'in_progress'] },
        },
      });

      if (!existingAlert) {
        await this.prisma.disengagementAlert.create({
          data: {
            tenantId,
            studentId,
            alertType: sgiScore < config.sgiAlertThreshold ? 'activity_drop' : 'grade_decline',
            severity: sgiScore < 30 ? 'critical' : 'warning',
            metricName: 'sgi_score',
            currentValue: sgiScore,
            thresholdValue: config.sgiAlertThreshold,
            description: `Student's SGI score (${sgiScore}) is ${trend === 'declining' ? 'declining' : 'below threshold'}`,
            suggestedActions: [
              { action: 'Schedule mentor meeting', priority: 'high' },
              { action: 'Review academic progress', priority: 'medium' },
            ],
            status: 'new',
          },
        });
      }
    }
  }

  /**
   * Check and create CRI alerts
   */
  private async checkCriAlerts(tenantId: string, studentId: string, criScore: number) {
    const config = await this.getConfig(tenantId);

    if (criScore < config.criAlertThreshold) {
      // Check if similar alert already exists
      const existingAlert = await this.prisma.disengagementAlert.findFirst({
        where: {
          tenantId,
          studentId,
          alertType: 'activity_drop',
          metricName: 'cri_score',
          status: { in: ['new', 'acknowledged', 'in_progress'] },
        },
      });

      if (!existingAlert) {
        await this.prisma.disengagementAlert.create({
          data: {
            tenantId,
            studentId,
            alertType: 'activity_drop',
            severity: criScore < 30 ? 'critical' : 'warning',
            metricName: 'cri_score',
            currentValue: criScore,
            thresholdValue: config.criAlertThreshold,
            description: `Student's CRI score (${criScore}) is below threshold. Career readiness needs attention.`,
            suggestedActions: [
              { action: 'Schedule career counseling session', priority: 'high' },
              { action: 'Review skill development plan', priority: 'medium' },
              { action: 'Connect with placement cell', priority: 'high' },
            ],
            status: 'new',
          },
        });
      }
    }
  }
}
