import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationEngineService, RecommendationInput } from './recommendation-engine.service';
import { AlertDetectionService } from './alert-detection.service';
import {
  GuidanceQueryDto,
  GoalQueryDto,
  AlertQueryDto,
  CreateGuidanceDto,
  UpdateGuidanceDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateAlertDto,
  UpdateAlertDto,
  GenerateRecommendationsDto,
  GenerateMonthlyPlanDto,
  RunAlertDetectionDto,
  GuidanceStatus,
  GoalStatus,
  AlertStatus,
  GuidanceResponseDto,
  GoalResponseDto,
  AlertResponseDto,
} from './dto/ai-guidance.dto';

@Injectable()
export class AiGuidanceService {
  private readonly logger = new Logger(AiGuidanceService.name);

  constructor(
    private prisma: PrismaService,
    private recommendationEngine: RecommendationEngineService,
    private alertDetection: AlertDetectionService,
  ) {}

  // ============================================
  // AI Guidance CRUD
  // ============================================

  async createGuidance(tenantId: string, dto: CreateGuidanceDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${dto.studentId} not found`);
    }

    return this.prisma.aiGuidance.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        guidanceType: dto.guidanceType,
        category: dto.category,
        priority: dto.priority || 'medium',
        title: dto.title,
        description: dto.description,
        actionItems: dto.actionItems as any,
        resources: dto.resources as any,
        triggerReason: dto.triggerReason,
        triggerMetric: dto.triggerMetric,
        triggerValue: dto.triggerValue,
        confidenceScore: dto.confidenceScore,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async getGuidance(tenantId: string, query: GuidanceQueryDto) {
    const { studentId, guidanceType, category, priority, status, activeOnly, limit, offset } = query;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (guidanceType) where.guidanceType = guidanceType;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (activeOnly) {
      where.status = GuidanceStatus.ACTIVE;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.aiGuidance.findMany({
        where,
        orderBy: [
          { priority: 'asc' }, // urgent first
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.aiGuidance.count({ where }),
    ]);

    return {
      data: data.map((g) => ({
        ...g,
        studentName: g.student?.user?.name,
      })),
      total,
      hasMore: (offset || 0) + data.length < total,
    };
  }

  async getGuidanceById(tenantId: string, id: string) {
    const guidance = await this.prisma.aiGuidance.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!guidance) {
      throw new NotFoundException(`Guidance ${id} not found`);
    }

    return guidance;
  }

  async updateGuidance(tenantId: string, id: string, dto: UpdateGuidanceDto, userId?: string) {
    const guidance = await this.prisma.aiGuidance.findFirst({
      where: { id, tenantId },
    });

    if (!guidance) {
      throw new NotFoundException(`Guidance ${id} not found`);
    }

    const updateData: any = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.wasHelpful !== undefined) updateData.wasHelpful = dto.wasHelpful;
    if (dto.feedback) updateData.feedback = dto.feedback;

    // Mark as viewed if status is changing from active
    if (dto.status && dto.status !== GuidanceStatus.ACTIVE && !guidance.viewedAt) {
      updateData.viewedAt = new Date();
    }

    return this.prisma.aiGuidance.update({
      where: { id },
      data: updateData,
    });
  }

  async markGuidanceViewed(tenantId: string, id: string) {
    const guidance = await this.prisma.aiGuidance.findFirst({
      where: { id, tenantId },
    });

    if (!guidance) {
      throw new NotFoundException(`Guidance ${id} not found`);
    }

    if (!guidance.viewedAt) {
      return this.prisma.aiGuidance.update({
        where: { id },
        data: {
          viewedAt: new Date(),
          status: GuidanceStatus.VIEWED,
        },
      });
    }

    return guidance;
  }

  // ============================================
  // Student Goals CRUD
  // ============================================

  async createGoal(tenantId: string, dto: CreateGoalDto, assignedBy?: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${dto.studentId} not found`);
    }

    return this.prisma.studentGoal.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue,
        unit: dto.unit,
        isAiSuggested: dto.isAiSuggested || false,
        isMentorAssigned: dto.isMentorAssigned || false,
        assignedBy,
        milestones: dto.milestones as any,
      },
    });
  }

  async getGoals(tenantId: string, query: GoalQueryDto) {
    const { studentId, category, status, isAiSuggested, isMentorAssigned, limit, offset } = query;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (isAiSuggested !== undefined) where.isAiSuggested = isAiSuggested;
    if (isMentorAssigned !== undefined) where.isMentorAssigned = isMentorAssigned;

    const [data, total] = await Promise.all([
      this.prisma.studentGoal.findMany({
        where,
        orderBy: [{ status: 'asc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.studentGoal.count({ where }),
    ]);

    return {
      data: data.map((g) => ({
        ...g,
        studentName: g.student?.user?.name,
      })),
      total,
      hasMore: (offset || 0) + data.length < total,
    };
  }

  async getGoalById(tenantId: string, id: string) {
    const goal = await this.prisma.studentGoal.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    return goal;
  }

  async updateGoal(tenantId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.studentGoal.findFirst({
      where: { id, tenantId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.targetDate) updateData.targetDate = new Date(dto.targetDate);
    if (dto.targetValue !== undefined) updateData.targetValue = dto.targetValue;
    if (dto.currentValue !== undefined) updateData.currentValue = dto.currentValue;
    if (dto.progress !== undefined) updateData.progress = dto.progress;
    if (dto.status) updateData.status = dto.status;
    if (dto.milestones) updateData.milestones = dto.milestones;

    // Mark completed if status is completed
    if (dto.status === GoalStatus.COMPLETED && !goal.completedAt) {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    return this.prisma.studentGoal.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteGoal(tenantId: string, id: string) {
    const goal = await this.prisma.studentGoal.findFirst({
      where: { id, tenantId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal ${id} not found`);
    }

    await this.prisma.studentGoal.delete({ where: { id } });
    return { success: true };
  }

  // ============================================
  // Disengagement Alerts CRUD
  // ============================================

  async createAlert(tenantId: string, dto: CreateAlertDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${dto.studentId} not found`);
    }

    return this.prisma.disengagementAlert.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        alertType: dto.alertType,
        severity: dto.severity || 'warning',
        metricName: dto.metricName,
        currentValue: dto.currentValue,
        previousValue: dto.previousValue,
        thresholdValue: dto.thresholdValue,
        changePercent: dto.changePercent,
        timeframe: dto.timeframe,
        description: dto.description,
        suggestedActions: dto.suggestedActions as any,
      },
    });
  }

  async getAlerts(tenantId: string, query: AlertQueryDto) {
    const { studentId, departmentId, alertType, severity, status, unresolvedOnly, limit, offset } = query;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (alertType) where.alertType = alertType;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (unresolvedOnly) {
      where.status = { in: ['new', 'acknowledged', 'in_progress'] };
    }

    // Filter by department
    if (departmentId) {
      where.student = { departmentId };
    }

    const [data, total] = await Promise.all([
      this.prisma.disengagementAlert.findMany({
        where,
        orderBy: [
          { severity: 'desc' }, // critical first
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              department: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.disengagementAlert.count({ where }),
    ]);

    return {
      data: data.map((a) => ({
        ...a,
        studentName: a.student?.user?.name,
        departmentName: a.student?.department?.name,
      })),
      total,
      hasMore: (offset || 0) + data.length < total,
    };
  }

  async getAlertById(tenantId: string, id: string) {
    const alert = await this.prisma.disengagementAlert.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    return alert;
  }

  async updateAlert(tenantId: string, id: string, dto: UpdateAlertDto, userId?: string) {
    const alert = await this.prisma.disengagementAlert.findFirst({
      where: { id, tenantId },
    });

    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    const updateData: any = {};

    if (dto.status) {
      updateData.status = dto.status;

      // Track acknowledgment
      if (dto.status === AlertStatus.ACKNOWLEDGED && !alert.acknowledgedAt) {
        updateData.acknowledgedAt = new Date();
        updateData.acknowledgedBy = userId;
      }

      // Track resolution
      if ((dto.status === AlertStatus.RESOLVED || dto.status === AlertStatus.FALSE_POSITIVE) && !alert.resolvedAt) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId;
      }
    }

    if (dto.resolution) updateData.resolution = dto.resolution;

    return this.prisma.disengagementAlert.update({
      where: { id },
      data: updateData,
    });
  }

  async acknowledgeAlert(tenantId: string, id: string, userId: string) {
    return this.updateAlert(tenantId, id, { status: AlertStatus.ACKNOWLEDGED }, userId);
  }

  async resolveAlert(tenantId: string, id: string, resolution: string, userId: string) {
    return this.updateAlert(tenantId, id, { status: AlertStatus.RESOLVED, resolution }, userId);
  }

  // ============================================
  // Generation Methods
  // ============================================

  async generateRecommendations(tenantId: string, dto: GenerateRecommendationsDto) {
    const { studentId, includeCareer, includeAcademic, includeEngagement, includeSkills } = dto;

    // Fetch student data for recommendation engine
    const [sgiData, criData, feedbackData, student] = await Promise.all([
      this.prisma.studentGrowthIndex.findFirst({
        where: { tenantId, studentId },
        orderBy: { calculatedAt: 'desc' },
      }),
      this.prisma.careerReadinessIndex.findFirst({
        where: { tenantId, studentId, isLatest: true },
      }),
      this.prisma.feedbackSummary.findFirst({
        where: { tenantId, studentId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.findFirst({
        where: { id: studentId, tenantId },
        include: {
          semesterSnapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    // Build input for recommendation engine
    const input: RecommendationInput = {
      studentId,
      tenantId,
    };

    if (sgiData) {
      input.sgi = {
        score: sgiData.sgiScore,
        trend: sgiData.sgiTrend,
        academicScore: sgiData.academicScore,
        engagementScore: sgiData.engagementScore,
        skillsScore: sgiData.skillsScore,
        behavioralScore: sgiData.behavioralScore,
      };
    }

    if (criData) {
      input.cri = {
        score: criData.criScore,
        placementProbability: criData.placementProbability,
        skillGaps: (criData.skillGaps as string[]) || [],
        targetRoles: (criData.targetRoles as string[]) || [],
      };
    }

    if (feedbackData) {
      input.feedback = {
        overallScore: feedbackData.overallScore || 0,
        topStrengths: (feedbackData.topStrengths as string[]) || [],
        topImprovements: (feedbackData.topImprovements as string[]) || [],
      };
    }

    const snapshot = student.semesterSnapshots[0];
    if (snapshot) {
      input.academic = {
        cgpa: snapshot.cgpa || 0,
        attendance: snapshot.overallAttendance || 0,
        backlogs: snapshot.backlogs,
      };
    }

    // Generate recommendations
    const recommendations = await this.recommendationEngine.generateRecommendations(input, {
      includeCareer,
      includeAcademic,
      includeEngagement,
      includeSkills,
    });

    // Save to database
    const created = await Promise.all(
      recommendations.map((rec) =>
        this.prisma.aiGuidance.create({
          data: {
            tenantId,
            studentId,
            guidanceType: rec.guidanceType,
            category: rec.category,
            priority: rec.priority,
            title: rec.title,
            description: rec.description,
            actionItems: rec.actionItems as any,
            resources: rec.resources as any,
            triggerReason: rec.triggerReason,
            triggerMetric: rec.triggerMetric,
            triggerValue: rec.triggerValue,
            confidenceScore: rec.confidenceScore,
            expiresAt: rec.expiresAt,
          },
        })
      )
    );

    this.logger.log(`Generated ${created.length} recommendations for student ${studentId}`);
    return created;
  }

  async generateMonthlyPlan(tenantId: string, dto: GenerateMonthlyPlanDto) {
    const { studentId, month, year } = dto;

    // Check for existing plan
    const existing = await this.prisma.aiGuidance.findFirst({
      where: {
        tenantId,
        studentId,
        guidanceType: 'monthly_plan',
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Monthly plan already exists for ${month}/${year}`);
    }

    // Generate plan
    const plan = await this.recommendationEngine.generateMonthlyPlan(tenantId, studentId, month, year);

    // Save to database
    const created = await this.prisma.aiGuidance.create({
      data: {
        tenantId,
        studentId,
        guidanceType: plan.guidanceType,
        category: plan.category,
        priority: plan.priority,
        title: plan.title,
        description: plan.description,
        actionItems: plan.actionItems as any,
        resources: plan.resources as any,
        triggerReason: plan.triggerReason,
        confidenceScore: plan.confidenceScore,
        expiresAt: plan.expiresAt,
      },
    });

    return created;
  }

  async runAlertDetection(tenantId: string, dto: RunAlertDetectionDto) {
    const { studentId, departmentId, alertTypes } = dto;

    // Run detection
    const detected = await this.alertDetection.runDetection(tenantId, {
      studentId,
      departmentId,
      alertTypes,
    });

    // Save alerts
    const savedCount = await this.alertDetection.saveAlerts(tenantId, detected);

    return {
      detected: detected.length,
      saved: savedCount,
      alerts: detected,
    };
  }

  async suggestGoals(tenantId: string, studentId: string, count: number = 5) {
    return this.recommendationEngine.generateGoalSuggestions(tenantId, studentId, count);
  }

  // ============================================
  // Dashboard Methods
  // ============================================

  async getStudentDashboard(tenantId: string, studentId: string) {
    const [guidance, goals, alerts, completedGoals] = await Promise.all([
      this.prisma.aiGuidance.findMany({
        where: {
          tenantId,
          studentId,
          status: GuidanceStatus.ACTIVE,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        take: 10,
      }),
      this.prisma.studentGoal.findMany({
        where: {
          tenantId,
          studentId,
          status: GoalStatus.ACTIVE,
        },
        orderBy: [{ targetDate: 'asc' }, { createdAt: 'desc' }],
        take: 10,
      }),
      this.prisma.disengagementAlert.findMany({
        where: {
          tenantId,
          studentId,
          status: { in: ['new', 'acknowledged', 'in_progress'] },
        },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
      this.prisma.studentGoal.count({
        where: {
          tenantId,
          studentId,
          status: GoalStatus.COMPLETED,
        },
      }),
    ]);

    // Calculate guidance completion rate
    const allGuidance = await this.prisma.aiGuidance.count({
      where: { tenantId, studentId },
    });
    const completedGuidance = await this.prisma.aiGuidance.count({
      where: { tenantId, studentId, status: GuidanceStatus.COMPLETED },
    });
    const guidanceCompletionRate = allGuidance > 0 ? (completedGuidance / allGuidance) * 100 : 0;

    // Get upcoming deadlines
    const upcomingDeadlines: { type: 'goal' | 'action'; title: string; deadline: Date }[] = [];

    // From goals
    goals.forEach((goal) => {
      if (goal.targetDate && goal.targetDate > new Date()) {
        upcomingDeadlines.push({
          type: 'goal',
          title: goal.title,
          deadline: goal.targetDate,
        });
      }
    });

    // From action items
    guidance.forEach((g) => {
      const actionItems = g.actionItems as any[];
      if (actionItems) {
        actionItems.forEach((item) => {
          if (item.deadline && !item.completed && new Date(item.deadline) > new Date()) {
            upcomingDeadlines.push({
              type: 'action',
              title: item.action,
              deadline: new Date(item.deadline),
            });
          }
        });
      }
    });

    // Sort by deadline
    upcomingDeadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    return {
      studentId,
      activeGuidance: guidance,
      activeGoals: goals,
      alerts,
      completedGoalsCount: completedGoals,
      guidanceCompletionRate: Math.round(guidanceCompletionRate * 100) / 100,
      upcomingDeadlines: upcomingDeadlines.slice(0, 10),
    };
  }

  async getGuidanceStats(tenantId: string) {
    const [total, active, completed, helpful, byCategory, byType] = await Promise.all([
      this.prisma.aiGuidance.count({ where: { tenantId } }),
      this.prisma.aiGuidance.count({ where: { tenantId, status: GuidanceStatus.ACTIVE } }),
      this.prisma.aiGuidance.count({ where: { tenantId, status: GuidanceStatus.COMPLETED } }),
      this.prisma.aiGuidance.count({ where: { tenantId, wasHelpful: true } }),
      this.prisma.aiGuidance.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.aiGuidance.groupBy({
        by: ['guidanceType'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    const totalWithFeedback = await this.prisma.aiGuidance.count({
      where: { tenantId, wasHelpful: { not: null } },
    });

    return {
      totalGuidance: total,
      activeGuidance: active,
      completedGuidance: completed,
      helpfulCount: helpful,
      helpfulRate: totalWithFeedback > 0 ? (helpful / totalWithFeedback) * 100 : 0,
      byCategory: byCategory.map((c) => ({ category: c.category, count: c._count })),
      byType: byType.map((t) => ({ type: t.guidanceType, count: t._count })),
      recentActivity: [], // Could be implemented with date grouping
    };
  }

  async getAlertStats(tenantId: string) {
    return this.alertDetection.getAlertStats(tenantId);
  }
}
