import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BiasNormalizerService } from './bias-normalizer.service';
import {
  CreateFeedbackCycleDto,
  UpdateFeedbackCycleDto,
  FeedbackCycleQueryDto,
  SubmitFeedbackDto,
  UpdateFeedbackDto,
  FeedbackEntryQueryDto,
  FeedbackSummaryQueryDto,
  AssignFeedbackDto,
  ProcessCycleDto,
  EvaluatorType,
  FeedbackCycleStatus,
} from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private prisma: PrismaService,
    private biasNormalizer: BiasNormalizerService,
  ) {}

  // ============================================
  // Feedback Cycle Operations
  // ============================================

  /**
   * Create a new feedback cycle
   */
  async createCycle(tenantId: string, dto: CreateFeedbackCycleDto) {
    // Check for existing cycle in same month/year
    const existing = await this.prisma.feedbackCycle.findFirst({
      where: {
        tenantId,
        month: dto.month,
        year: dto.year,
      },
    });

    if (existing) {
      throw new ConflictException(`Feedback cycle already exists for ${dto.month}/${dto.year}`);
    }

    const cycle = await this.prisma.feedbackCycle.create({
      data: {
        tenantId,
        name: dto.name,
        month: dto.month,
        year: dto.year,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: FeedbackCycleStatus.DRAFT,
        enablePeerFeedback: dto.enablePeerFeedback ?? true,
        enableSelfAssessment: dto.enableSelfAssessment ?? true,
        anonymousPeerFeedback: dto.anonymousPeerFeedback ?? true,
      },
    });

    this.logger.log(`Created feedback cycle: ${cycle.name} (${cycle.id})`);
    return cycle;
  }

  /**
   * Get feedback cycles
   */
  async getCycles(tenantId: string, query: FeedbackCycleQueryDto) {
    const { month, year, status, limit, offset } = query;

    const where: any = { tenantId };
    if (month) where.month = month;
    if (year) where.year = year;
    if (status) where.status = status;

    const [cycles, total] = await Promise.all([
      this.prisma.feedbackCycle.findMany({
        where,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { feedbackEntries: true },
          },
        },
      }),
      this.prisma.feedbackCycle.count({ where }),
    ]);

    // Calculate completion rates
    const cyclesWithStats = await Promise.all(
      cycles.map(async (cycle) => {
        const submittedCount = await this.prisma.feedbackEntry.count({
          where: {
            cycleId: cycle.id,
            submittedAt: { not: null },
          },
        });

        return {
          ...cycle,
          totalEntries: cycle._count.feedbackEntries,
          submittedEntries: submittedCount,
          completionRate: cycle._count.feedbackEntries > 0
            ? Math.round((submittedCount / cycle._count.feedbackEntries) * 100)
            : 0,
        };
      })
    );

    return {
      data: cyclesWithStats,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get a single feedback cycle
   */
  async getCycle(tenantId: string, cycleId: string) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: cycleId, tenantId },
      include: {
        _count: {
          select: { feedbackEntries: true },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    const [submittedCount, byType] = await Promise.all([
      this.prisma.feedbackEntry.count({
        where: { cycleId, submittedAt: { not: null } },
      }),
      this.prisma.feedbackEntry.groupBy({
        by: ['evaluatorType'],
        where: { cycleId },
        _count: true,
      }),
    ]);

    return {
      ...cycle,
      totalEntries: cycle._count.feedbackEntries,
      submittedEntries: submittedCount,
      completionRate: cycle._count.feedbackEntries > 0
        ? Math.round((submittedCount / cycle._count.feedbackEntries) * 100)
        : 0,
      entriesByType: byType.reduce((acc, item) => {
        acc[item.evaluatorType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Update a feedback cycle
   */
  async updateCycle(tenantId: string, cycleId: string, dto: UpdateFeedbackCycleDto) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: cycleId, tenantId },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    // Can't update processed cycles
    if (cycle.status === FeedbackCycleStatus.PROCESSED) {
      throw new BadRequestException('Cannot update a processed feedback cycle');
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status) updateData.status = dto.status;

    return this.prisma.feedbackCycle.update({
      where: { id: cycleId },
      data: updateData,
    });
  }

  /**
   * Activate a feedback cycle (make it available for responses)
   */
  async activateCycle(tenantId: string, cycleId: string) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: cycleId, tenantId },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    if (cycle.status !== FeedbackCycleStatus.DRAFT) {
      throw new BadRequestException('Only draft cycles can be activated');
    }

    // Check if there are any feedback entries assigned
    const entryCount = await this.prisma.feedbackEntry.count({
      where: { cycleId },
    });

    if (entryCount === 0) {
      throw new BadRequestException('Cannot activate cycle with no feedback assignments');
    }

    return this.prisma.feedbackCycle.update({
      where: { id: cycleId },
      data: { status: FeedbackCycleStatus.ACTIVE },
    });
  }

  /**
   * Close a feedback cycle (no more responses accepted)
   */
  async closeCycle(tenantId: string, cycleId: string) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: cycleId, tenantId },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    if (cycle.status !== FeedbackCycleStatus.ACTIVE) {
      throw new BadRequestException('Only active cycles can be closed');
    }

    return this.prisma.feedbackCycle.update({
      where: { id: cycleId },
      data: { status: FeedbackCycleStatus.CLOSED },
    });
  }

  // ============================================
  // Feedback Entry Operations
  // ============================================

  /**
   * Assign feedback entries (create pending feedback requests)
   */
  async assignFeedback(tenantId: string, dto: AssignFeedbackDto) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: dto.cycleId, tenantId },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    if (cycle.status !== FeedbackCycleStatus.DRAFT) {
      throw new BadRequestException('Can only assign feedback to draft cycles');
    }

    const createdEntries: any[] = [];

    for (const studentId of dto.targetStudentIds) {
      // Verify student exists
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, tenantId },
      });

      if (!student) {
        this.logger.warn(`Student not found: ${studentId}, skipping`);
        continue;
      }

      for (const evaluator of dto.evaluators) {
        if (evaluator.type === EvaluatorType.FACULTY || evaluator.type === EvaluatorType.MENTOR) {
          // Assign specific faculty/mentors
          for (const evaluatorId of evaluator.evaluatorIds || []) {
            const entry = await this.prisma.feedbackEntry.create({
              data: {
                tenantId,
                cycleId: dto.cycleId,
                targetStudentId: studentId,
                evaluatorType: evaluator.type,
                evaluatorId,
                isAnonymous: false,
              },
            });
            createdEntries.push(entry);
          }
        } else if (evaluator.type === EvaluatorType.PEER && evaluator.peerCount) {
          // Assign random peers from same department
          const peers = await this.prisma.student.findMany({
            where: {
              tenantId,
              departmentId: student.departmentId,
              id: { not: studentId },
              status: 'active',
            },
            take: evaluator.peerCount,
            orderBy: { createdAt: 'asc' }, // Could randomize in production
          });

          for (const peer of peers) {
            const entry = await this.prisma.feedbackEntry.create({
              data: {
                tenantId,
                cycleId: dto.cycleId,
                targetStudentId: studentId,
                evaluatorType: EvaluatorType.PEER,
                evaluatorId: peer.id,
                isAnonymous: true, // Peer feedback is anonymous by default
              },
            });
            createdEntries.push(entry);
          }
        } else if (evaluator.type === EvaluatorType.SELF && evaluator.includeSelf) {
          // Self assessment
          const entry = await this.prisma.feedbackEntry.create({
            data: {
              tenantId,
              cycleId: dto.cycleId,
              targetStudentId: studentId,
              evaluatorType: EvaluatorType.SELF,
              evaluatorId: studentId,
              isAnonymous: false,
            },
          });
          createdEntries.push(entry);
        }
      }
    }

    this.logger.log(`Created ${createdEntries.length} feedback entries for cycle ${dto.cycleId}`);

    return {
      created: createdEntries.length,
      cycleId: dto.cycleId,
    };
  }

  /**
   * Submit feedback
   */
  async submitFeedback(tenantId: string, cycleId: string, dto: SubmitFeedbackDto, submitterId: string) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: cycleId, tenantId },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    if (cycle.status !== FeedbackCycleStatus.ACTIVE) {
      throw new BadRequestException('Feedback cycle is not active');
    }

    // Check if past end date
    if (new Date() > cycle.endDate) {
      throw new BadRequestException('Feedback cycle has ended');
    }

    // Find the feedback entry (must be assigned)
    const existingEntry = await this.prisma.feedbackEntry.findFirst({
      where: {
        cycleId,
        targetStudentId: dto.targetStudentId,
        evaluatorType: dto.evaluatorType,
        evaluatorId: dto.evaluatorId || submitterId,
      },
    });

    if (!existingEntry) {
      throw new NotFoundException('Feedback assignment not found. You may not be assigned to provide this feedback.');
    }

    if (existingEntry.submittedAt) {
      throw new ConflictException('Feedback has already been submitted');
    }

    // Calculate raw average score
    const rawAverageScore = this.biasNormalizer.calculateRawAverageScore({
      academicRating: dto.academicRating,
      participationRating: dto.participationRating,
      teamworkRating: dto.teamworkRating,
      communicationRating: dto.communicationRating,
      leadershipRating: dto.leadershipRating,
      punctualityRating: dto.punctualityRating,
    });

    // Get normalized score
    const normalization = rawAverageScore
      ? await this.biasNormalizer.normalizeScore(
          tenantId,
          rawAverageScore,
          dto.evaluatorId || submitterId,
          dto.evaluatorType,
        )
      : null;

    // Update the entry with feedback
    const entry = await this.prisma.feedbackEntry.update({
      where: { id: existingEntry.id },
      data: {
        academicRating: dto.academicRating,
        participationRating: dto.participationRating,
        teamworkRating: dto.teamworkRating,
        communicationRating: dto.communicationRating,
        leadershipRating: dto.leadershipRating,
        punctualityRating: dto.punctualityRating,
        strengths: dto.strengths,
        improvements: dto.improvements,
        rawAverageScore,
        normalizedScore: normalization?.normalizedScore,
        evaluatorBiasFactor: normalization?.biasFactor,
        submittedAt: new Date(),
      },
    });

    this.logger.log(`Feedback submitted for student ${dto.targetStudentId} by ${submitterId}`);

    return entry;
  }

  /**
   * Get feedback entries
   */
  async getEntries(tenantId: string, query: FeedbackEntryQueryDto) {
    const { cycleId, targetStudentId, evaluatorId, evaluatorType, submitted, limit, offset } = query;

    const where: any = { tenantId };
    if (cycleId) where.cycleId = cycleId;
    if (targetStudentId) where.targetStudentId = targetStudentId;
    if (evaluatorId) where.evaluatorId = evaluatorId;
    if (evaluatorType) where.evaluatorType = evaluatorType;
    if (submitted !== undefined) {
      where.submittedAt = submitted ? { not: null } : null;
    }

    const [entries, total] = await Promise.all([
      this.prisma.feedbackEntry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          targetStudent: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.feedbackEntry.count({ where }),
    ]);

    return {
      data: entries.map(e => ({
        ...e,
        targetStudentName: e.targetStudent?.user?.name,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get pending feedback for an evaluator
   */
  async getPendingFeedback(tenantId: string, evaluatorId: string) {
    const entries = await this.prisma.feedbackEntry.findMany({
      where: {
        tenantId,
        evaluatorId,
        submittedAt: null,
        cycle: {
          status: FeedbackCycleStatus.ACTIVE,
        },
      },
      include: {
        targetStudent: {
          include: {
            user: { select: { name: true } },
          },
        },
        cycle: {
          select: { id: true, name: true, endDate: true },
        },
      },
    });

    return entries.map(e => ({
      cycleId: e.cycleId,
      cycleName: e.cycle.name,
      targetStudentId: e.targetStudentId,
      targetStudentName: e.targetStudent?.user?.name,
      evaluatorType: e.evaluatorType,
      dueDate: e.cycle.endDate,
      isOverdue: new Date() > e.cycle.endDate,
    }));
  }

  // ============================================
  // Feedback Summary Operations
  // ============================================

  /**
   * Process a cycle and generate summaries
   */
  async processCycle(tenantId: string, dto: ProcessCycleDto) {
    const cycle = await this.prisma.feedbackCycle.findFirst({
      where: { id: dto.cycleId, tenantId },
    });

    if (!cycle) {
      throw new NotFoundException('Feedback cycle not found');
    }

    if (cycle.status !== FeedbackCycleStatus.CLOSED) {
      throw new BadRequestException('Only closed cycles can be processed');
    }

    // Recalculate normalization if requested
    if (dto.calculateNormalization) {
      await this.biasNormalizer.recalculateCycleNormalization(tenantId, dto.cycleId);
    }

    // Generate summaries if requested
    if (dto.generateSummaries) {
      await this.generateCycleSummaries(tenantId, dto.cycleId, cycle.month, cycle.year);
    }

    // Mark cycle as processed
    await this.prisma.feedbackCycle.update({
      where: { id: dto.cycleId },
      data: { status: FeedbackCycleStatus.PROCESSED },
    });

    this.logger.log(`Processed feedback cycle: ${dto.cycleId}`);

    return { status: 'processed', cycleId: dto.cycleId };
  }

  /**
   * Generate feedback summaries for all students in a cycle
   */
  private async generateCycleSummaries(
    tenantId: string,
    cycleId: string,
    month: number,
    year: number,
  ) {
    // Get all unique students in this cycle
    const studentIds = await this.prisma.feedbackEntry.findMany({
      where: { cycleId, tenantId },
      select: { targetStudentId: true },
      distinct: ['targetStudentId'],
    });

    for (const { targetStudentId } of studentIds) {
      await this.generateStudentSummary(tenantId, cycleId, targetStudentId, month, year);
    }

    this.logger.log(`Generated summaries for ${studentIds.length} students in cycle ${cycleId}`);
  }

  /**
   * Generate summary for a single student
   */
  private async generateStudentSummary(
    tenantId: string,
    cycleId: string,
    studentId: string,
    month: number,
    year: number,
  ) {
    // Get all submitted feedback for this student
    const entries = await this.prisma.feedbackEntry.findMany({
      where: {
        cycleId,
        targetStudentId: studentId,
        submittedAt: { not: null },
      },
    });

    if (entries.length === 0) return null;

    // Calculate averages by type
    const byType = {
      faculty: entries.filter(e => e.evaluatorType === EvaluatorType.FACULTY),
      mentor: entries.filter(e => e.evaluatorType === EvaluatorType.MENTOR),
      peer: entries.filter(e => e.evaluatorType === EvaluatorType.PEER),
      self: entries.filter(e => e.evaluatorType === EvaluatorType.SELF),
    };

    const calculateAvg = (items: typeof entries) => {
      const scores = items
        .map(e => e.normalizedScore ?? e.rawAverageScore)
        .filter((s): s is number => s !== null);
      return scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null;
    };

    const facultyAvg = calculateAvg(byType.faculty);
    const mentorAvg = calculateAvg(byType.mentor);
    const peerAvg = calculateAvg(byType.peer);
    const selfScore = byType.self[0]?.normalizedScore ?? byType.self[0]?.rawAverageScore ?? null;

    // Calculate overall (weighted average)
    const weights = { faculty: 0.4, mentor: 0.3, peer: 0.2, self: 0.1 };
    let overallScoreCalc = 0;
    let totalWeight = 0;

    if (facultyAvg !== null) { overallScoreCalc += facultyAvg * weights.faculty; totalWeight += weights.faculty; }
    if (mentorAvg !== null) { overallScoreCalc += mentorAvg * weights.mentor; totalWeight += weights.mentor; }
    if (peerAvg !== null) { overallScoreCalc += peerAvg * weights.peer; totalWeight += weights.peer; }
    if (selfScore !== null) { overallScoreCalc += selfScore * weights.self; totalWeight += weights.self; }

    const overallScore: number | null = totalWeight > 0 ? Math.round((overallScoreCalc / totalWeight) * 100) / 100 : null;

    // Aggregate strengths and improvements
    const allStrengths = entries
      .map(e => e.strengths)
      .filter((s): s is string => !!s);
    const allImprovements = entries
      .map(e => e.improvements)
      .filter((s): s is string => !!s);

    // Simple AI summary (could be enhanced with actual LLM)
    const aiSummary = this.generateAiSummary(overallScore, facultyAvg, peerAvg, entries.length);

    // Upsert summary
    const summary = await this.prisma.feedbackSummary.upsert({
      where: {
        tenantId_studentId_cycleId: {
          tenantId,
          studentId,
          cycleId,
        },
      },
      create: {
        tenantId,
        studentId,
        cycleId,
        month,
        year,
        facultyAvgScore: facultyAvg,
        mentorAvgScore: mentorAvg,
        peerAvgScore: peerAvg,
        selfScore,
        overallScore,
        aiSummary,
        topStrengths: allStrengths.slice(0, 5),
        topImprovements: allImprovements.slice(0, 5),
      },
      update: {
        facultyAvgScore: facultyAvg,
        mentorAvgScore: mentorAvg,
        peerAvgScore: peerAvg,
        selfScore,
        overallScore,
        aiSummary,
        topStrengths: allStrengths.slice(0, 5),
        topImprovements: allImprovements.slice(0, 5),
      },
    });

    return summary;
  }

  /**
   * Generate simple AI summary (placeholder for LLM integration)
   */
  private generateAiSummary(
    overallScore: number | null,
    facultyScore: number | null,
    peerScore: number | null,
    responseCount: number,
  ): string {
    if (overallScore === null) {
      return 'Insufficient feedback data to generate summary.';
    }

    const parts: string[] = [];

    // Overall assessment
    if (overallScore >= 4.5) {
      parts.push('Exceptional performance across all evaluated dimensions.');
    } else if (overallScore >= 4.0) {
      parts.push('Strong performance with consistent positive feedback from evaluators.');
    } else if (overallScore >= 3.5) {
      parts.push('Good overall performance with room for improvement in some areas.');
    } else if (overallScore >= 3.0) {
      parts.push('Satisfactory performance with several areas requiring attention.');
    } else {
      parts.push('Performance needs significant improvement across multiple dimensions.');
    }

    // Faculty vs peer perception
    if (facultyScore && peerScore) {
      const diff = facultyScore - peerScore;
      if (Math.abs(diff) > 0.5) {
        if (diff > 0) {
          parts.push('Faculty perceive stronger performance than peers, suggesting potential for improved team collaboration.');
        } else {
          parts.push('Peers rate performance higher than faculty, indicating strong interpersonal skills with room for academic improvement.');
        }
      }
    }

    // Response count
    parts.push(`Based on ${responseCount} feedback responses.`);

    return parts.join(' ');
  }

  /**
   * Get feedback summaries
   */
  async getSummaries(tenantId: string, query: FeedbackSummaryQueryDto) {
    const { studentId, cycleId, month, year, departmentId } = query;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (cycleId) where.cycleId = cycleId;
    if (month) where.month = month;
    if (year) where.year = year;

    let summaries = await this.prisma.feedbackSummary.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Filter by department if specified
    if (departmentId) {
      summaries = summaries.filter(s => s.student?.department?.id === departmentId);
    }

    return summaries.map(s => ({
      ...s,
      studentName: s.student?.user?.name,
      departmentName: s.student?.department?.name,
    }));
  }

  /**
   * Get student's feedback summary
   */
  async getStudentSummary(tenantId: string, studentId: string, cycleId?: string) {
    const where: any = { tenantId, studentId };
    if (cycleId) where.cycleId = cycleId;

    const summary = await this.prisma.feedbackSummary.findFirst({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (!summary) {
      return null;
    }

    // Get response counts
    const responseCounts = await this.prisma.feedbackEntry.groupBy({
      by: ['evaluatorType'],
      where: {
        cycleId: summary.cycleId,
        targetStudentId: studentId,
        submittedAt: { not: null },
      },
      _count: true,
    });

    return {
      ...summary,
      responseCount: responseCounts.reduce((acc, item) => {
        acc[item.evaluatorType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ============================================
  // Statistics Operations
  // ============================================

  /**
   * Get feedback statistics
   */
  async getStats(tenantId: string) {
    const [
      activeCycles,
      totalEntries,
      pendingEntries,
      submittedEntries,
      byType,
    ] = await Promise.all([
      this.prisma.feedbackCycle.count({
        where: { tenantId, status: FeedbackCycleStatus.ACTIVE },
      }),
      this.prisma.feedbackEntry.count({ where: { tenantId } }),
      this.prisma.feedbackEntry.count({
        where: { tenantId, submittedAt: null },
      }),
      this.prisma.feedbackEntry.count({
        where: { tenantId, submittedAt: { not: null } },
      }),
      this.prisma.feedbackEntry.groupBy({
        by: ['evaluatorType'],
        where: { tenantId, submittedAt: { not: null } },
        _count: true,
        _avg: { normalizedScore: true },
      }),
    ]);

    const responseRate = totalEntries > 0
      ? Math.round((submittedEntries / totalEntries) * 100)
      : 0;

    return {
      activeCycles,
      totalFeedbackEntries: totalEntries,
      pendingFeedback: pendingEntries,
      completedFeedback: submittedEntries,
      averageResponseRate: responseRate,
      byEvaluatorType: byType.map(t => ({
        type: t.evaluatorType,
        count: t._count,
        averageScore: t._avg.normalizedScore
          ? Math.round(t._avg.normalizedScore * 100) / 100
          : null,
      })),
    };
  }

  /**
   * Get evaluator bias report
   */
  async getBiasReport(tenantId: string) {
    const [allBiases, anomalies] = await Promise.all([
      this.biasNormalizer.calculateAllEvaluatorBiases(tenantId),
      this.biasNormalizer.detectBiasAnomalies(tenantId),
    ]);

    // Get evaluator names
    const evaluatorIds = allBiases
      .map(b => b.evaluatorId)
      .filter((id): id is string => !!id);

    const users = await this.prisma.user.findMany({
      where: { id: { in: evaluatorIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map(u => [u.id, u.name]));

    return {
      evaluators: allBiases.map(b => ({
        ...b,
        evaluatorName: userMap.get(b.evaluatorId) || 'Unknown',
      })),
      anomalies: anomalies.map(a => ({
        ...a,
        evaluatorName: userMap.get(a.evaluatorId) || 'Unknown',
      })),
    };
  }
}
