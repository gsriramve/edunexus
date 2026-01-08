import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { MilestoneTrackerService, AutoMilestoneEvent } from './milestone-tracker.service';
import { SnapshotGeneratorService } from './snapshot-generator.service';
import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
  QueryMilestonesDto,
  CreateSemesterSnapshotDto,
  UpdateSemesterSnapshotDto,
  QuerySemesterSnapshotsDto,
  TimelineItemDto,
  TimelineFilterDto,
  JourneyStatsDto,
  MilestoneCategory,
  AutoMilestoneConfigDto,
  ExportJourneyDto,
  MilestoneSnapshotDataDto,
} from './dto/student-journey.dto';

@Injectable()
export class StudentJourneyService {
  private readonly logger = new Logger(StudentJourneyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly milestoneTracker: MilestoneTrackerService,
    private readonly snapshotGenerator: SnapshotGeneratorService,
  ) {}

  // ============ MILESTONE OPERATIONS ============

  /**
   * Create a new milestone
   */
  async createMilestone(tenantId: string, dto: CreateMilestoneDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${dto.studentId} not found`);
    }

    // Get snapshot data if not provided
    const snapshotData = dto.snapshotData ||
      await this.milestoneTracker.getCurrentSnapshotData(tenantId, dto.studentId);

    const milestone = await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        milestoneType: dto.milestoneType,
        title: dto.title,
        description: dto.description,
        occurredAt: new Date(dto.occurredAt),
        academicYear: dto.academicYear,
        semester: dto.semester,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
        category: dto.category || MilestoneCategory.ACADEMIC,
        isPositive: dto.isPositive ?? true,
        isPublic: dto.isPublic ?? false,
        linkedEntityType: dto.linkedEntityType,
        linkedEntityId: dto.linkedEntityId,
      },
    });

    this.logger.log(`Created milestone ${milestone.id} for student ${dto.studentId}`);
    return milestone;
  }

  /**
   * Update a milestone
   */
  async updateMilestone(tenantId: string, milestoneId: string, dto: UpdateMilestoneDto) {
    const milestone = await this.prisma.journeyMilestone.findFirst({
      where: { id: milestoneId, tenantId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    const updated = await this.prisma.journeyMilestone.update({
      where: { id: milestoneId },
      data: {
        title: dto.title,
        description: dto.description,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
        category: dto.category,
        isPositive: dto.isPositive,
        isPublic: dto.isPublic,
        snapshotData: dto.snapshotData as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Delete a milestone
   */
  async deleteMilestone(tenantId: string, milestoneId: string) {
    const milestone = await this.prisma.journeyMilestone.findFirst({
      where: { id: milestoneId, tenantId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    await this.prisma.journeyMilestone.delete({
      where: { id: milestoneId },
    });

    return { deleted: true };
  }

  /**
   * Get a single milestone
   */
  async getMilestone(tenantId: string, milestoneId: string) {
    const milestone = await this.prisma.journeyMilestone.findFirst({
      where: { id: milestoneId, tenantId },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    return milestone;
  }

  /**
   * Query milestones with filters
   */
  async queryMilestones(tenantId: string, query: QueryMilestonesDto) {
    const where: Prisma.JourneyMilestoneWhereInput = { tenantId };

    if (query.studentId) where.studentId = query.studentId;
    if (query.milestoneType) where.milestoneType = query.milestoneType;
    if (query.category) where.category = query.category;
    if (query.academicYear) where.academicYear = query.academicYear;
    if (query.semester) where.semester = query.semester;
    if (query.isPositive !== undefined) where.isPositive = query.isPositive;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;

    if (query.fromDate || query.toDate) {
      where.occurredAt = {
        ...(query.fromDate && { gte: new Date(query.fromDate) }),
        ...(query.toDate && { lte: new Date(query.toDate) }),
      };
    }

    const [milestones, total] = await Promise.all([
      this.prisma.journeyMilestone.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              rollNo: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.journeyMilestone.count({ where }),
    ]);

    return { milestones, total, limit: query.limit || 50, offset: query.offset || 0 };
  }

  // ============ SNAPSHOT OPERATIONS ============

  /**
   * Create or update semester snapshot
   */
  async saveSemesterSnapshot(tenantId: string, dto: CreateSemesterSnapshotDto) {
    return this.snapshotGenerator.saveSnapshot(tenantId, dto);
  }

  /**
   * Generate snapshot from student data
   */
  async generateSnapshot(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
  ) {
    return this.snapshotGenerator.generateAndSaveSnapshot(tenantId, studentId, academicYear, semester);
  }

  /**
   * Bulk generate snapshots
   */
  async bulkGenerateSnapshots(
    tenantId: string,
    academicYear: string,
    semester: number,
    options?: { departmentId?: string; batch?: string },
  ) {
    return this.snapshotGenerator.bulkGenerateSnapshots(tenantId, academicYear, semester, options);
  }

  /**
   * Get a semester snapshot
   */
  async getSemesterSnapshot(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
  ) {
    const snapshot = await this.prisma.semesterSnapshot.findFirst({
      where: { tenantId, studentId, academicYear, semester },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot not found for student ${studentId}, ${academicYear} Sem ${semester}`,
      );
    }

    return snapshot;
  }

  /**
   * Query snapshots
   */
  async querySnapshots(tenantId: string, query: QuerySemesterSnapshotsDto) {
    const where: Prisma.SemesterSnapshotWhereInput = { tenantId };

    if (query.studentId) where.studentId = query.studentId;
    if (query.academicYear) where.academicYear = query.academicYear;
    if (query.semester) where.semester = query.semester;

    return this.prisma.semesterSnapshot.findMany({
      where,
      orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }],
    });
  }

  /**
   * Update snapshot
   */
  async updateSnapshot(tenantId: string, snapshotId: string, dto: UpdateSemesterSnapshotDto) {
    const snapshot = await this.prisma.semesterSnapshot.findFirst({
      where: { id: snapshotId, tenantId },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot ${snapshotId} not found`);
    }

    return this.prisma.semesterSnapshot.update({
      where: { id: snapshotId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  // ============ TIMELINE & STATS ============

  /**
   * Get student timeline (milestones + snapshots combined)
   */
  async getStudentTimeline(tenantId: string, filter: TimelineFilterDto): Promise<TimelineItemDto[]> {
    const studentId = filter.studentId;
    if (!studentId) {
      throw new NotFoundException('Student ID is required');
    }

    // Build milestone query
    const milestoneWhere: Prisma.JourneyMilestoneWhereInput = { tenantId, studentId };

    if (filter.categories?.length) {
      milestoneWhere.category = { in: filter.categories };
    }
    if (filter.milestoneTypes?.length) {
      milestoneWhere.milestoneType = { in: filter.milestoneTypes };
    }
    if (filter.academicYear) {
      milestoneWhere.academicYear = filter.academicYear;
    }
    if (filter.semester) {
      milestoneWhere.semester = filter.semester;
    }
    if (filter.fromDate || filter.toDate) {
      milestoneWhere.occurredAt = {
        ...(filter.fromDate && { gte: new Date(filter.fromDate) }),
        ...(filter.toDate && { lte: new Date(filter.toDate) }),
      };
    }

    const milestones = await this.prisma.journeyMilestone.findMany({
      where: milestoneWhere,
      orderBy: { occurredAt: 'desc' },
    });

    const timelineItems: TimelineItemDto[] = milestones.map((m) => ({
      id: m.id,
      type: 'milestone' as const,
      date: m.occurredAt,
      title: m.title,
      description: m.description || undefined,
      category: m.category,
      isPositive: m.isPositive,
      academicYear: m.academicYear || undefined,
      semester: m.semester || undefined,
      snapshotData: m.snapshotData as unknown as MilestoneSnapshotDataDto || undefined,
      linkedEntity: m.linkedEntityType && m.linkedEntityId
        ? { type: m.linkedEntityType, id: m.linkedEntityId }
        : undefined,
    }));

    // Optionally include semester snapshots as timeline items
    if (filter.includeSnapshots !== false) {
      const snapshotWhere: Prisma.SemesterSnapshotWhereInput = { tenantId, studentId };
      if (filter.academicYear) snapshotWhere.academicYear = filter.academicYear;
      if (filter.semester) snapshotWhere.semester = filter.semester;

      const snapshots = await this.prisma.semesterSnapshot.findMany({
        where: snapshotWhere,
        orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }],
      });

      for (const s of snapshots) {
        // Estimate semester end date
        const [startYear] = s.academicYear.split('-').map(Number);
        const endMonth = s.semester % 2 === 1 ? 11 : 5; // December for odd, June for even
        const endYear = s.semester % 2 === 1 ? startYear : startYear + 1;

        timelineItems.push({
          id: s.id,
          type: 'snapshot',
          date: new Date(endYear, endMonth, 15),
          title: `Semester ${s.semester} Summary`,
          description: `CGPA: ${s.cgpa?.toFixed(2) || 'N/A'} | Attendance: ${s.overallAttendance?.toFixed(1) || 'N/A'}%`,
          category: 'academic',
          isPositive: true,
          academicYear: s.academicYear,
          semester: s.semester,
          snapshotData: {
            cgpa: s.cgpa ?? undefined,
            sgpa: s.sgpa ?? undefined,
            sgiScore: s.endSgiScore ?? undefined,
            criScore: s.endCriScore ?? undefined,
            attendance: s.overallAttendance ?? undefined,
            backlogs: s.backlogs,
            achievementsCount: s.achievementsCount,
            clubsActive: s.clubsActive,
          },
        });
      }
    }

    // Sort by date descending
    return timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get journey statistics for a student
   */
  async getJourneyStats(tenantId: string, studentId: string): Promise<JourneyStatsDto> {
    const milestones = await this.prisma.journeyMilestone.findMany({
      where: { tenantId, studentId },
    });

    const snapshots = await this.prisma.semesterSnapshot.findMany({
      where: { tenantId, studentId },
      orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }],
    });

    // Count by category
    const byCategory: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const m of milestones) {
      byCategory[m.category] = (byCategory[m.category] || 0) + 1;
      byType[m.milestoneType] = (byType[m.milestoneType] || 0) + 1;
    }

    // Get positive/negative counts
    const positiveMilestones = milestones.filter((m) => m.isPositive).length;
    const negativeMilestones = milestones.filter((m) => !m.isPositive).length;

    // Get current CGPA from latest snapshot
    const latestSnapshot = snapshots[snapshots.length - 1];
    const currentCgpa = latestSnapshot?.cgpa ?? undefined;

    const cgpaTrend = this.calculateCgpaTrend(snapshots.map((s) => s.cgpa).filter((c): c is number => c !== null));

    // Get highlights (top 5 positive milestones)
    const highlights = milestones
      .filter((m) => m.isPositive && m.isPublic)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 5)
      .map((m) => ({
        title: m.title,
        date: m.occurredAt,
        type: m.milestoneType,
      }));

    return {
      totalMilestones: milestones.length,
      positiveMilestones,
      negativeMilestones,
      byCategory,
      byType,
      semestersCompleted: snapshots.length,
      currentCgpa,
      cgpaTrend,
      highlights,
    };
  }

  /**
   * Compare two semesters
   */
  async compareSemesters(
    tenantId: string,
    studentId: string,
    semester1: { academicYear: string; semester: number },
    semester2: { academicYear: string; semester: number },
  ) {
    return this.snapshotGenerator.compareSemesters(tenantId, studentId, semester1, semester2);
  }

  /**
   * Get year-over-year progress
   */
  async getYearOverYearProgress(tenantId: string, studentId: string) {
    return this.snapshotGenerator.getYearOverYearProgress(tenantId, studentId);
  }

  // ============ AUTO-MILESTONE PROCESSING ============

  /**
   * Process auto-milestone event
   */
  async processAutoMilestone(event: AutoMilestoneEvent, config?: AutoMilestoneConfigDto) {
    return this.milestoneTracker.processAutoMilestone(event, config);
  }

  /**
   * Create admission milestone
   */
  async createAdmissionMilestone(
    tenantId: string,
    studentId: string,
    admissionDate: Date,
    studentName: string,
    departmentName?: string,
    batch?: string,
  ) {
    return this.milestoneTracker.createAdmissionMilestone(
      tenantId,
      studentId,
      admissionDate,
      studentName,
      departmentName,
      batch,
    );
  }

  /**
   * Create graduation milestone
   */
  async createGraduationMilestone(
    tenantId: string,
    studentId: string,
    finalCgpa: number,
    degree: string,
    departmentName: string,
  ) {
    return this.milestoneTracker.createGraduationMilestone(
      tenantId,
      studentId,
      finalCgpa,
      degree,
      departmentName,
    );
  }

  // ============ EXPORT ============

  /**
   * Export student journey data
   */
  async exportJourney(tenantId: string, dto: ExportJourneyDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        department: {
          select: { name: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student ${dto.studentId} not found`);
    }

    // Get all milestones
    const milestoneWhere: Prisma.JourneyMilestoneWhereInput = { tenantId, studentId: dto.studentId };
    if (!dto.includePrivateMilestones) {
      milestoneWhere.isPublic = true;
    }

    const milestones = await this.prisma.journeyMilestone.findMany({
      where: milestoneWhere,
      orderBy: { occurredAt: 'asc' },
    });

    // Get snapshots if requested
    let snapshots: unknown[] = [];
    if (dto.includeSnapshots !== false) {
      snapshots = await this.prisma.semesterSnapshot.findMany({
        where: { tenantId, studentId: dto.studentId },
        orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }],
      });
    }

    // Get stats
    const stats = await this.getJourneyStats(tenantId, dto.studentId);

    // Get latest snapshot for CGPA
    const latestSnapshot = await this.prisma.semesterSnapshot.findFirst({
      where: { tenantId, studentId: dto.studentId },
      orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }],
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      student: {
        id: student.id,
        rollNo: student.rollNo,
        name: student.user.name,
        email: student.user.email,
        department: student.department?.name,
        batch: student.batch,
        cgpa: latestSnapshot?.cgpa,
      },
      stats,
      milestones: milestones.map((m) => ({
        id: m.id,
        type: m.milestoneType,
        title: m.title,
        description: m.description,
        date: m.occurredAt.toISOString(),
        category: m.category,
        isPositive: m.isPositive,
        academicYear: m.academicYear,
        semester: m.semester,
      })),
      snapshots: dto.includeSnapshots !== false ? snapshots : undefined,
    };

    // Format based on requested format
    if (dto.format === 'csv') {
      return this.formatAsCsv(exportData);
    }

    // Default to JSON
    return exportData;
  }

  // ============ HELPERS ============

  private calculateCgpaTrend(cgpas: number[]): 'improving' | 'stable' | 'declining' {
    if (cgpas.length < 2) return 'stable';

    const recentCgpas = cgpas.slice(-3);
    if (recentCgpas.length < 2) return 'stable';

    const firstHalf = recentCgpas.slice(0, Math.ceil(recentCgpas.length / 2));
    const secondHalf = recentCgpas.slice(Math.ceil(recentCgpas.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  private formatAsCsv(data: Record<string, unknown>): string {
    const milestones = data.milestones as Array<Record<string, unknown>>;
    if (!milestones?.length) return '';

    const headers = ['Date', 'Type', 'Title', 'Description', 'Category', 'Positive', 'Academic Year', 'Semester'];
    const rows = milestones.map((m) => [
      m.date,
      m.type,
      `"${(m.title as string || '').replace(/"/g, '""')}"`,
      `"${(m.description as string || '').replace(/"/g, '""')}"`,
      m.category,
      m.isPositive ? 'Yes' : 'No',
      m.academicYear || '',
      m.semester || '',
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}
