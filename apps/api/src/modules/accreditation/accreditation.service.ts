import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateMetricDto,
  UpdateMetricDto,
  QueryMetricsDto,
  CreateValueDto,
  UpdateValueDto,
  BulkUpdateValuesDto,
  QueryValuesDto,
  CreateReportDto,
  UpdateReportDto,
  QueryReportsDto,
  Framework,
  Trend,
  ReportStatus,
  FrameworkSummaryDto,
  CategorySummaryDto,
  DashboardSummaryDto,
  DataCollectionStatusDto,
  ComparisonDto,
} from './dto/accreditation.dto';

@Injectable()
export class AccreditationService {
  constructor(private readonly prisma: PrismaService) {}

  // ============ METRIC OPERATIONS ============

  async createMetric(tenantId: string, dto: CreateMetricDto) {
    // Check for duplicate
    const existing = await this.prisma.accreditationMetric.findFirst({
      where: {
        tenantId,
        framework: dto.framework,
        criterionCode: dto.criterionCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Metric ${dto.criterionCode} already exists for ${dto.framework}`);
    }

    return this.prisma.accreditationMetric.create({
      data: {
        tenantId,
        ...dto,
        weightage: dto.weightage || 1,
      },
    });
  }

  async updateMetric(tenantId: string, id: string, dto: UpdateMetricDto) {
    const metric = await this.prisma.accreditationMetric.findFirst({
      where: { id, tenantId },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    return this.prisma.accreditationMetric.update({
      where: { id },
      data: dto,
    });
  }

  async getMetric(tenantId: string, id: string) {
    const metric = await this.prisma.accreditationMetric.findFirst({
      where: { id, tenantId },
      include: {
        values: {
          orderBy: { academicYear: 'desc' },
          take: 5,
        },
      },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    return metric;
  }

  async queryMetrics(tenantId: string, query: QueryMetricsDto) {
    const where: Prisma.AccreditationMetricWhereInput = { tenantId };

    if (query.framework) where.framework = query.framework;
    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.accreditationMetric.findMany({
        where,
        include: {
          values: {
            where: { isLatest: true },
            take: 1,
          },
        },
        orderBy: [{ category: 'asc' }, { criterionCode: 'asc' }],
        take: query.limit || 100,
        skip: query.offset || 0,
      }),
      this.prisma.accreditationMetric.count({ where }),
    ]);

    return { data, total };
  }

  async getMetricsByFramework(tenantId: string, framework: Framework) {
    return this.prisma.accreditationMetric.findMany({
      where: { tenantId, framework, isActive: true },
      include: {
        values: {
          where: { isLatest: true },
          take: 1,
        },
      },
      orderBy: [{ category: 'asc' }, { criterionCode: 'asc' }],
    });
  }

  async deleteMetric(tenantId: string, id: string) {
    const metric = await this.prisma.accreditationMetric.findFirst({
      where: { id, tenantId },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    return this.prisma.accreditationMetric.delete({ where: { id } });
  }

  // ============ VALUE OPERATIONS ============

  async createValue(tenantId: string, dto: CreateValueDto) {
    // Verify metric exists
    const metric = await this.prisma.accreditationMetric.findFirst({
      where: { id: dto.metricId, tenantId },
    });

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    // Get previous value for trend calculation
    const previousValue = await this.prisma.accreditationValue.findFirst({
      where: { metricId: dto.metricId, isLatest: true },
    });

    // Mark previous as not latest
    if (previousValue) {
      await this.prisma.accreditationValue.update({
        where: { id: previousValue.id },
        data: { isLatest: false },
      });
    }

    // Calculate normalized value and score
    let normalizedValue = dto.normalizedValue;
    let score = dto.score;

    if (dto.rawValue !== undefined && metric.maxScore > 0) {
      normalizedValue = normalizedValue ?? Math.min((dto.rawValue / metric.maxScore) * 100, 100);
      score = score ?? (normalizedValue / 100) * metric.maxScore * (metric.weightage || 1);
    }

    // Calculate trend
    let trend: string | undefined;
    if (previousValue?.rawValue !== undefined && previousValue?.rawValue !== null && dto.rawValue !== undefined) {
      const change = dto.rawValue - (previousValue.rawValue as number);
      if (change > 0) trend = Trend.IMPROVING;
      else if (change < 0) trend = Trend.DECLINING;
      else trend = Trend.STABLE;
    }

    return this.prisma.accreditationValue.create({
      data: {
        tenantId,
        metricId: dto.metricId,
        academicYear: dto.academicYear,
        rawValue: dto.rawValue,
        normalizedValue,
        score,
        supportingData: dto.supportingData as Prisma.InputJsonValue,
        remarks: dto.remarks,
        previousValue: previousValue?.rawValue,
        trend,
        calculatedAt: new Date(),
        isLatest: true,
      },
      include: {
        metric: true,
      },
    });
  }

  async updateValue(tenantId: string, id: string, dto: UpdateValueDto) {
    const value = await this.prisma.accreditationValue.findFirst({
      where: { id, tenantId },
      include: { metric: true },
    });

    if (!value) {
      throw new NotFoundException('Value not found');
    }

    // Recalculate normalized and score if raw value changed
    let normalizedValue = dto.normalizedValue;
    let score = dto.score;

    if (dto.rawValue !== undefined && value.metric.maxScore > 0) {
      normalizedValue = normalizedValue ?? Math.min((dto.rawValue / value.metric.maxScore) * 100, 100);
      score = score ?? (normalizedValue / 100) * value.metric.maxScore * (value.metric.weightage || 1);
    }

    return this.prisma.accreditationValue.update({
      where: { id },
      data: {
        rawValue: dto.rawValue,
        normalizedValue,
        score,
        supportingData: dto.supportingData as Prisma.InputJsonValue,
        remarks: dto.remarks,
        calculatedAt: new Date(),
      },
      include: { metric: true },
    });
  }

  async bulkUpdateValues(tenantId: string, dto: BulkUpdateValuesDto) {
    const results = {
      updated: 0,
      created: 0,
      errors: [] as string[],
    };

    for (const valueData of dto.values) {
      try {
        // Check if value exists for this metric and year
        const existing = await this.prisma.accreditationValue.findFirst({
          where: {
            tenantId,
            metricId: valueData.metricId,
            academicYear: dto.academicYear,
          },
        });

        if (existing) {
          await this.updateValue(tenantId, existing.id, {
            rawValue: valueData.rawValue,
            supportingData: valueData.supportingData,
            remarks: valueData.remarks,
          });
          results.updated++;
        } else {
          await this.createValue(tenantId, {
            metricId: valueData.metricId,
            academicYear: dto.academicYear,
            rawValue: valueData.rawValue,
            supportingData: valueData.supportingData,
            remarks: valueData.remarks,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Failed to update metric ${valueData.metricId}: ${error}`);
      }
    }

    return results;
  }

  async queryValues(tenantId: string, query: QueryValuesDto) {
    const where: Prisma.AccreditationValueWhereInput = { tenantId };

    if (query.academicYear) where.academicYear = query.academicYear;
    if (query.latestOnly) where.isLatest = true;

    if (query.framework || query.category) {
      where.metric = {};
      if (query.framework) where.metric.framework = query.framework;
      if (query.category) where.metric.category = query.category;
    }

    const [data, total] = await Promise.all([
      this.prisma.accreditationValue.findMany({
        where,
        include: {
          metric: true,
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0,
      }),
      this.prisma.accreditationValue.count({ where }),
    ]);

    return { data, total };
  }

  async verifyValue(tenantId: string, id: string, verifierId: string) {
    const value = await this.prisma.accreditationValue.findFirst({
      where: { id, tenantId },
    });

    if (!value) {
      throw new NotFoundException('Value not found');
    }

    return this.prisma.accreditationValue.update({
      where: { id },
      data: {
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      },
    });
  }

  // ============ REPORT OPERATIONS ============

  async createReport(tenantId: string, dto: CreateReportDto) {
    // Check for duplicate
    const existing = await this.prisma.accreditationReport.findFirst({
      where: {
        tenantId,
        framework: dto.framework,
        academicYear: dto.academicYear,
      },
    });

    if (existing) {
      throw new ConflictException(`Report already exists for ${dto.framework} ${dto.academicYear}`);
    }

    return this.prisma.accreditationReport.create({
      data: {
        tenantId,
        ...dto,
        status: ReportStatus.DRAFT,
      },
    });
  }

  async updateReport(tenantId: string, id: string, dto: UpdateReportDto) {
    const report = await this.prisma.accreditationReport.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updateData: Prisma.AccreditationReportUpdateInput = { ...dto };

    if (dto.totalScore !== undefined && dto.maxScore !== undefined) {
      updateData.percentage = (dto.totalScore / dto.maxScore) * 100;
    }

    return this.prisma.accreditationReport.update({
      where: { id },
      data: updateData,
    });
  }

  async getReport(tenantId: string, id: string) {
    const report = await this.prisma.accreditationReport.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async queryReports(tenantId: string, query: QueryReportsDto) {
    const where: Prisma.AccreditationReportWhereInput = { tenantId };

    if (query.framework) where.framework = query.framework;
    if (query.academicYear) where.academicYear = query.academicYear;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.accreditationReport.findMany({
        where,
        orderBy: [{ academicYear: 'desc' }, { framework: 'asc' }],
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.accreditationReport.count({ where }),
    ]);

    return { data, total };
  }

  async submitReport(tenantId: string, id: string, submitterId: string) {
    const report = await this.prisma.accreditationReport.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.REVIEW) {
      throw new BadRequestException('Report must be in review status to submit');
    }

    return this.prisma.accreditationReport.update({
      where: { id },
      data: {
        status: ReportStatus.SUBMITTED,
        submittedAt: new Date(),
        submittedBy: submitterId,
      },
    });
  }

  async deleteReport(tenantId: string, id: string) {
    const report = await this.prisma.accreditationReport.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status === ReportStatus.SUBMITTED || report.status === ReportStatus.APPROVED) {
      throw new BadRequestException('Cannot delete submitted or approved reports');
    }

    return this.prisma.accreditationReport.delete({ where: { id } });
  }

  // ============ SUMMARY & ANALYTICS ============

  async getFrameworkSummary(
    tenantId: string,
    framework: Framework,
    academicYear: string,
  ): Promise<FrameworkSummaryDto> {
    // Get all metrics with latest values
    const metrics = await this.prisma.accreditationMetric.findMany({
      where: { tenantId, framework, isActive: true },
      include: {
        values: {
          where: { academicYear },
          take: 1,
        },
      },
      orderBy: [{ category: 'asc' }, { criterionCode: 'asc' }],
    });

    // Get previous year values for trend
    const prevYear = this.getPreviousAcademicYear(academicYear);
    const previousValues = await this.prisma.accreditationValue.findMany({
      where: {
        tenantId,
        academicYear: prevYear,
        metric: { framework },
      },
    });
    const prevValueMap = new Map(previousValues.map(v => [v.metricId, v]));

    // Group by category
    const categoryMap = new Map<string, typeof metrics>();
    metrics.forEach(m => {
      const existing = categoryMap.get(m.category) || [];
      existing.push(m);
      categoryMap.set(m.category, existing);
    });

    // Calculate category summaries
    const categories: CategorySummaryDto[] = [];
    let totalScore = 0;
    let maxScore = 0;
    let completedMetrics = 0;

    categoryMap.forEach((categoryMetrics, category) => {
      let catScore = 0;
      let catMaxScore = 0;
      let catCompleted = 0;

      const metricsWithValues = categoryMetrics.map(m => {
        const value = m.values[0];
        const prevValue = prevValueMap.get(m.id);

        catMaxScore += m.maxScore * (m.weightage || 1);
        maxScore += m.maxScore * (m.weightage || 1);

        if (value?.score !== undefined && value?.score !== null) {
          catScore += value.score;
          totalScore += value.score;
          catCompleted++;
          completedMetrics++;
        }

        return {
          id: m.id,
          framework: m.framework as Framework,
          criterionCode: m.criterionCode,
          criterionName: m.criterionName,
          category: m.category,
          description: m.description || undefined,
          maxScore: m.maxScore,
          weightage: m.weightage || 1,
          minThreshold: m.minThreshold || undefined,
          maxThreshold: m.maxThreshold || undefined,
          currentValue: value ? {
            rawValue: value.rawValue || undefined,
            normalizedValue: value.normalizedValue || undefined,
            score: value.score || undefined,
            trend: value.trend as Trend || undefined,
            previousValue: prevValue?.rawValue || undefined,
            academicYear: value.academicYear,
          } : undefined,
        };
      });

      const catTrend = this.calculateTrend(catScore, prevValueMap, categoryMetrics);

      categories.push({
        category,
        totalMetrics: categoryMetrics.length,
        completedMetrics: catCompleted,
        totalMaxScore: catMaxScore,
        currentScore: catScore,
        percentage: catMaxScore > 0 ? (catScore / catMaxScore) * 100 : 0,
        trend: catTrend,
        metrics: metricsWithValues,
      });
    });

    // Calculate overall trend
    const previousYearScore = previousValues.reduce((sum, v) => sum + (v.score || 0), 0);
    let overallTrend = Trend.STABLE;
    if (previousYearScore > 0) {
      const change = totalScore - previousYearScore;
      if (change > previousYearScore * 0.05) overallTrend = Trend.IMPROVING;
      else if (change < -previousYearScore * 0.05) overallTrend = Trend.DECLINING;
    }

    // Get grade for NAAC
    let grade: string | undefined;
    if (framework === Framework.NAAC) {
      grade = this.calculateNaacGrade(maxScore > 0 ? (totalScore / maxScore) * 100 : 0);
    }

    return {
      framework,
      academicYear,
      totalScore,
      maxScore,
      percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      grade,
      categories,
      trend: overallTrend,
      previousYearScore: previousYearScore > 0 ? previousYearScore : undefined,
      completionPercentage: metrics.length > 0 ? (completedMetrics / metrics.length) * 100 : 0,
    };
  }

  async getDashboard(tenantId: string, academicYear: string): Promise<DashboardSummaryDto> {
    const [nba, naac, nirf] = await Promise.all([
      this.getFrameworkSummary(tenantId, Framework.NBA, academicYear).catch(() => undefined),
      this.getFrameworkSummary(tenantId, Framework.NAAC, academicYear).catch(() => undefined),
      this.getFrameworkSummary(tenantId, Framework.NIRF, academicYear).catch(() => undefined),
    ]);

    // Calculate overall health
    const scores = [nba?.percentage, naac?.percentage, nirf?.percentage].filter(Boolean) as number[];
    const avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    let overallHealth: 'excellent' | 'good' | 'needs_attention' | 'critical' = 'critical';
    if (avgPercentage >= 80) overallHealth = 'excellent';
    else if (avgPercentage >= 60) overallHealth = 'good';
    else if (avgPercentage >= 40) overallHealth = 'needs_attention';

    // Get pending actions (metrics with low scores or missing values)
    const pendingActions = this.getPendingActions(nba, naac, nirf);

    // Get recent updates
    const recentValues = await this.prisma.accreditationValue.findMany({
      where: { tenantId, academicYear },
      include: { metric: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    const recentUpdates = recentValues.map(v => ({
      metricName: v.metric.criterionName,
      framework: v.metric.framework as Framework,
      oldValue: v.previousValue || undefined,
      newValue: v.rawValue || 0,
      updatedAt: v.updatedAt.toISOString(),
    }));

    return {
      nba,
      naac,
      nirf,
      overallHealth,
      pendingActions,
      recentUpdates,
    };
  }

  async compareYears(
    tenantId: string,
    framework: Framework,
    year1: string,
    year2: string,
  ): Promise<ComparisonDto> {
    const [summary1, summary2] = await Promise.all([
      this.getFrameworkSummary(tenantId, framework, year1),
      this.getFrameworkSummary(tenantId, framework, year2),
    ]);

    const categoryMap = new Map<string, { year1: number; year2: number }>();

    summary1.categories.forEach(c => {
      categoryMap.set(c.category, { year1: c.currentScore, year2: 0 });
    });

    summary2.categories.forEach(c => {
      const existing = categoryMap.get(c.category) || { year1: 0, year2: 0 };
      existing.year2 = c.currentScore;
      categoryMap.set(c.category, existing);
    });

    const categoryComparison = Array.from(categoryMap.entries()).map(([category, scores]) => ({
      category,
      year1Score: scores.year1,
      year2Score: scores.year2,
      change: scores.year2 - scores.year1,
    }));

    return {
      framework,
      academicYear1: year1,
      academicYear2: year2,
      year1Score: summary1.totalScore,
      year2Score: summary2.totalScore,
      change: summary2.totalScore - summary1.totalScore,
      changePercent: summary1.totalScore > 0
        ? ((summary2.totalScore - summary1.totalScore) / summary1.totalScore) * 100
        : 0,
      categoryComparison,
    };
  }

  async getDataCollectionStatus(
    tenantId: string,
    framework: Framework,
    academicYear: string,
  ): Promise<DataCollectionStatusDto> {
    const metrics = await this.prisma.accreditationMetric.findMany({
      where: { tenantId, framework, isActive: true },
      include: {
        values: {
          where: { academicYear },
          take: 1,
        },
      },
    });

    const categoryMap = new Map<string, {
      total: number;
      collected: number;
      verified: number;
      pending: string[];
    }>();

    metrics.forEach(m => {
      const existing = categoryMap.get(m.category) || {
        total: 0,
        collected: 0,
        verified: 0,
        pending: [],
      };

      existing.total++;

      if (m.values.length > 0 && m.values[0].rawValue !== null) {
        existing.collected++;
        if (m.values[0].verifiedAt) {
          existing.verified++;
        }
      } else {
        existing.pending.push(m.criterionName);
      }

      categoryMap.set(m.category, existing);
    });

    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalMetrics: data.total,
      collectedMetrics: data.collected,
      verifiedMetrics: data.verified,
      pendingMetrics: data.pending,
    }));

    const totalMetrics = metrics.length;
    const collectedMetrics = metrics.filter(m => m.values.length > 0 && m.values[0].rawValue !== null).length;

    const latestValue = await this.prisma.accreditationValue.findFirst({
      where: { tenantId, academicYear, metric: { framework } },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      framework,
      academicYear,
      categories,
      overallProgress: totalMetrics > 0 ? (collectedMetrics / totalMetrics) * 100 : 0,
      lastUpdated: latestValue?.updatedAt.toISOString(),
    };
  }

  // ============ HELPER METHODS ============

  private getPreviousAcademicYear(year: string): string {
    // Assumes format "2024-25" or "2024"
    const match = year.match(/^(\d{4})/);
    if (match) {
      const startYear = parseInt(match[1]) - 1;
      if (year.includes('-')) {
        return `${startYear}-${(startYear + 1).toString().slice(-2)}`;
      }
      return startYear.toString();
    }
    return year;
  }

  private calculateTrend(
    currentScore: number,
    prevValueMap: Map<string, { score?: number | null }>,
    metrics: { id: string }[],
  ): Trend {
    const prevTotal = metrics.reduce((sum, m) => {
      const prev = prevValueMap.get(m.id);
      return sum + (prev?.score || 0);
    }, 0);

    if (prevTotal === 0) return Trend.STABLE;

    const change = currentScore - prevTotal;
    if (change > prevTotal * 0.05) return Trend.IMPROVING;
    if (change < -prevTotal * 0.05) return Trend.DECLINING;
    return Trend.STABLE;
  }

  private calculateNaacGrade(percentage: number): string {
    if (percentage >= 90) return 'A++';
    if (percentage >= 75) return 'A+';
    if (percentage >= 60) return 'A';
    if (percentage >= 55) return 'B++';
    if (percentage >= 50) return 'B+';
    if (percentage >= 45) return 'B';
    if (percentage >= 40) return 'C';
    return 'D';
  }

  private getPendingActions(
    nba?: FrameworkSummaryDto,
    naac?: FrameworkSummaryDto,
    nirf?: FrameworkSummaryDto,
  ): { framework: Framework; category: string; metric: string; action: string }[] {
    const actions: { framework: Framework; category: string; metric: string; action: string }[] = [];

    const processFramework = (summary?: FrameworkSummaryDto) => {
      if (!summary) return;

      summary.categories.forEach(cat => {
        cat.metrics.forEach(m => {
          if (!m.currentValue) {
            actions.push({
              framework: summary.framework,
              category: cat.category,
              metric: m.criterionName,
              action: 'Data collection required',
            });
          } else if (m.currentValue.normalizedValue !== undefined &&
                     m.minThreshold !== undefined &&
                     m.currentValue.normalizedValue < m.minThreshold) {
            actions.push({
              framework: summary.framework,
              category: cat.category,
              metric: m.criterionName,
              action: 'Below minimum threshold - improvement needed',
            });
          }
        });
      });
    };

    processFramework(nba);
    processFramework(naac);
    processFramework(nirf);

    return actions.slice(0, 20); // Limit to top 20 actions
  }
}
