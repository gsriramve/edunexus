import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSemesterSnapshotDto,
  SemesterComparisonDto,
  YearOverYearProgressDto,
} from './dto/student-journey.dto';
import { MilestoneTrackerService } from './milestone-tracker.service';

@Injectable()
export class SnapshotGeneratorService {
  private readonly logger = new Logger(SnapshotGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly milestoneTracker: MilestoneTrackerService,
  ) {}

  /**
   * Generate semester snapshot by aggregating student data
   */
  async generateSnapshot(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
  ): Promise<CreateSemesterSnapshotDto> {
    // Get student data with department
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: true,
      },
    });

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    // Get exam results for this student
    const examResults = await this.prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Calculate SGPA from exam results (simplified - based on all recent results)
    let totalCredits = 0;
    let totalGradePoints = 0;

    for (const result of examResults) {
      const credits = result.exam.subject?.credits || 3;
      const gradePoint = this.getGradePoint(result.grade || '');
      totalCredits += credits;
      totalGradePoints += gradePoint * credits;
    }

    const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : undefined;
    const cgpa = sgpa; // For now, use same as SGPA

    // Count backlogs
    const backlogs = examResults.filter(
      (r) => ['F', 'FAIL'].includes(r.grade?.toUpperCase() || ''),
    ).length;

    // Get overall attendance
    const [startYear] = academicYear.split('-').map(Number);
    const semesterStartMonth = semester % 2 === 1 ? 6 : 0; // July for odd, Jan for even
    const semesterStartYear = semester % 2 === 1 ? startYear : startYear + 1;

    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        studentId,
        date: {
          gte: new Date(semesterStartYear, semesterStartMonth, 1),
          lt: new Date(semesterStartYear, semesterStartMonth + 5, 30),
        },
      },
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === 'present' || r.status === 'late',
    ).length;
    const overallAttendance = totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 10000) / 100
      : undefined;

    // Get latest SGI score
    const latestSgi = await this.prisma.studentGrowthIndex.findFirst({
      where: { tenantId, studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Get latest CRI score
    const latestCri = await this.prisma.careerReadinessIndex.findFirst({
      where: { tenantId, studentId, isLatest: true },
    });

    // Get clubs active
    const clubsActive = await this.prisma.clubMember.count({
      where: {
        studentId,
        status: 'active',
      },
    });

    // Get events attended this semester
    const eventsAttended = await this.prisma.eventRegistration.count({
      where: {
        studentId,
        status: 'attended',
      },
    });

    // Get achievements count
    const achievementsCount = await this.prisma.achievement.count({
      where: { studentId },
    });

    // Calculate department average CGPA from semester snapshots
    const departmentSnapshots = await this.prisma.semesterSnapshot.findMany({
      where: {
        tenantId,
        academicYear,
        semester,
        student: {
          departmentId: student.departmentId,
          batch: student.batch,
        },
      },
    });

    const validCgpas = departmentSnapshots
      .map((s) => s.cgpa)
      .filter((c): c is number => c !== null);
    const departmentAvgCgpa = validCgpas.length > 0
      ? validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length
      : undefined;

    // Calculate batch rank (from snapshots)
    const allSnapshots = await this.prisma.semesterSnapshot.findMany({
      where: {
        tenantId,
        academicYear,
        semester,
        student: {
          batch: student.batch,
        },
      },
      orderBy: { cgpa: 'desc' },
    });

    const batchRank = sgpa
      ? allSnapshots.filter((s) => (s.cgpa || 0) > (sgpa || 0)).length + 1
      : undefined;
    const batchSize = allSnapshots.length || undefined;

    return {
      studentId,
      academicYear,
      semester,
      sgpa: sgpa ? Math.round(sgpa * 100) / 100 : undefined,
      cgpa: cgpa ? Math.round(cgpa * 100) / 100 : undefined,
      backlogs,
      overallAttendance,
      endSgiScore: latestSgi?.sgiScore ?? undefined,
      endCriScore: latestCri?.criScore ?? undefined,
      clubsActive,
      eventsAttended,
      achievementsCount,
      departmentAvgCgpa: departmentAvgCgpa ? Math.round(departmentAvgCgpa * 100) / 100 : undefined,
      batchRank,
      batchSize,
    };
  }

  /**
   * Save or update semester snapshot
   */
  async saveSnapshot(
    tenantId: string,
    snapshotData: CreateSemesterSnapshotDto,
  ): Promise<{ id: string }> {
    const existing = await this.prisma.semesterSnapshot.findFirst({
      where: {
        tenantId,
        studentId: snapshotData.studentId,
        academicYear: snapshotData.academicYear,
        semester: snapshotData.semester,
      },
    });

    if (existing) {
      await this.prisma.semesterSnapshot.update({
        where: { id: existing.id },
        data: {
          sgpa: snapshotData.sgpa,
          cgpa: snapshotData.cgpa,
          backlogs: snapshotData.backlogs,
          overallAttendance: snapshotData.overallAttendance,
          endSgiScore: snapshotData.endSgiScore,
          endCriScore: snapshotData.endCriScore,
          clubsActive: snapshotData.clubsActive,
          eventsAttended: snapshotData.eventsAttended,
          achievementsCount: snapshotData.achievementsCount,
          departmentAvgCgpa: snapshotData.departmentAvgCgpa,
          batchRank: snapshotData.batchRank,
          batchSize: snapshotData.batchSize,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated snapshot ${existing.id} for student ${snapshotData.studentId}`);
      return { id: existing.id };
    }

    const snapshot = await this.prisma.semesterSnapshot.create({
      data: {
        tenantId,
        ...snapshotData,
      },
    });

    // Also create semester end milestone
    await this.milestoneTracker.createSemesterEndMilestone(
      tenantId,
      snapshotData.studentId,
      snapshotData.academicYear,
      snapshotData.semester,
      {
        cgpa: snapshotData.cgpa,
        sgpa: snapshotData.sgpa,
        sgiScore: snapshotData.endSgiScore,
        criScore: snapshotData.endCriScore,
        attendance: snapshotData.overallAttendance,
        backlogs: snapshotData.backlogs,
        achievementsCount: snapshotData.achievementsCount,
        clubsActive: snapshotData.clubsActive,
      },
    );

    // Check for dean's list
    if (snapshotData.cgpa && snapshotData.cgpa >= 9.0) {
      await this.milestoneTracker.checkAndCreateDeanListMilestone(
        tenantId,
        snapshotData.studentId,
        snapshotData.academicYear,
        snapshotData.semester,
        snapshotData.cgpa,
      );
    }

    this.logger.log(`Created snapshot ${snapshot.id} for student ${snapshotData.studentId}`);
    return { id: snapshot.id };
  }

  /**
   * Generate and save snapshot in one step
   */
  async generateAndSaveSnapshot(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
  ): Promise<{ id: string; snapshot: CreateSemesterSnapshotDto }> {
    const snapshotData = await this.generateSnapshot(tenantId, studentId, academicYear, semester);
    const result = await this.saveSnapshot(tenantId, snapshotData);
    return { id: result.id, snapshot: snapshotData };
  }

  /**
   * Bulk generate snapshots for multiple students
   */
  async bulkGenerateSnapshots(
    tenantId: string,
    academicYear: string,
    semester: number,
    options?: {
      departmentId?: string;
      batch?: string;
    },
  ): Promise<{ generated: number; failed: number; errors: string[] }> {
    const where: Record<string, unknown> = {
      tenantId,
      status: 'active',
    };

    if (options?.departmentId) {
      where.departmentId = options.departmentId;
    }
    if (options?.batch) {
      where.batch = options.batch;
    }

    const students = await this.prisma.student.findMany({
      where,
      select: { id: true },
    });

    let generated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const student of students) {
      try {
        await this.generateAndSaveSnapshot(tenantId, student.id, academicYear, semester);
        generated++;
      } catch (error) {
        failed++;
        errors.push(`Student ${student.id}: ${(error as Error).message}`);
      }
    }

    this.logger.log(`Bulk snapshot generation: ${generated} success, ${failed} failed`);
    return { generated, failed, errors };
  }

  /**
   * Compare two semesters for a student
   */
  async compareSemesters(
    tenantId: string,
    studentId: string,
    semester1: { academicYear: string; semester: number },
    semester2: { academicYear: string; semester: number },
  ): Promise<SemesterComparisonDto> {
    const snapshot1 = await this.prisma.semesterSnapshot.findFirst({
      where: {
        tenantId,
        studentId,
        academicYear: semester1.academicYear,
        semester: semester1.semester,
      },
    });

    const snapshot2 = await this.prisma.semesterSnapshot.findFirst({
      where: {
        tenantId,
        studentId,
        academicYear: semester2.academicYear,
        semester: semester2.semester,
      },
    });

    const s1 = snapshot1 || { cgpa: 0, sgpa: 0, overallAttendance: 0, endSgiScore: 0, endCriScore: 0, backlogs: 0, clubsActive: 0, achievementsCount: 0 };
    const s2 = snapshot2 || { cgpa: 0, sgpa: 0, overallAttendance: 0, endSgiScore: 0, endCriScore: 0, backlogs: 0, clubsActive: 0, achievementsCount: 0 };

    return {
      semester1: {
        academicYear: semester1.academicYear,
        semester: semester1.semester,
        snapshot: snapshot1 ? {
          studentId,
          academicYear: semester1.academicYear,
          semester: semester1.semester,
          sgpa: snapshot1.sgpa ?? undefined,
          cgpa: snapshot1.cgpa ?? undefined,
          backlogs: snapshot1.backlogs,
          overallAttendance: snapshot1.overallAttendance ?? undefined,
          endSgiScore: snapshot1.endSgiScore ?? undefined,
          endCriScore: snapshot1.endCriScore ?? undefined,
          clubsActive: snapshot1.clubsActive,
          eventsAttended: snapshot1.eventsAttended,
          achievementsCount: snapshot1.achievementsCount,
        } : undefined,
      },
      semester2: {
        academicYear: semester2.academicYear,
        semester: semester2.semester,
        snapshot: snapshot2 ? {
          studentId,
          academicYear: semester2.academicYear,
          semester: semester2.semester,
          sgpa: snapshot2.sgpa ?? undefined,
          cgpa: snapshot2.cgpa ?? undefined,
          backlogs: snapshot2.backlogs,
          overallAttendance: snapshot2.overallAttendance ?? undefined,
          endSgiScore: snapshot2.endSgiScore ?? undefined,
          endCriScore: snapshot2.endCriScore ?? undefined,
          clubsActive: snapshot2.clubsActive,
          eventsAttended: snapshot2.eventsAttended,
          achievementsCount: snapshot2.achievementsCount,
        } : undefined,
      },
      comparison: {
        cgpaChange: (s2.cgpa || 0) - (s1.cgpa || 0),
        sgpaChange: (s2.sgpa || 0) - (s1.sgpa || 0),
        attendanceChange: (s2.overallAttendance || 0) - (s1.overallAttendance || 0),
        sgiChange: (s2.endSgiScore || 0) - (s1.endSgiScore || 0),
        criChange: (s2.endCriScore || 0) - (s1.endCriScore || 0),
        backlogsChange: (s2.backlogs || 0) - (s1.backlogs || 0),
        clubsChange: (s2.clubsActive || 0) - (s1.clubsActive || 0),
        achievementsChange: (s2.achievementsCount || 0) - (s1.achievementsCount || 0),
      },
    };
  }

  /**
   * Get year-over-year progress for a student
   */
  async getYearOverYearProgress(
    tenantId: string,
    studentId: string,
  ): Promise<YearOverYearProgressDto> {
    const snapshots = await this.prisma.semesterSnapshot.findMany({
      where: { tenantId, studentId },
      orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }],
    });

    const snapshotData = snapshots.map((s) => ({
      academicYear: s.academicYear,
      semester: s.semester,
      cgpa: s.cgpa || 0,
      sgi: s.endSgiScore || 0,
      cri: s.endCriScore || 0,
    }));

    // Calculate trends
    const cgpaTrend = this.calculateTrend(snapshotData.map((s) => s.cgpa));
    const sgiTrend = this.calculateTrend(snapshotData.map((s) => s.sgi));
    const criTrend = this.calculateTrend(snapshotData.map((s) => s.cri));

    // Project graduation CGPA (simple linear projection)
    let projectedGraduationCgpa: number | undefined;
    if (snapshotData.length >= 2) {
      const cgpas = snapshotData.map((s) => s.cgpa).filter((c) => c > 0);
      if (cgpas.length >= 2) {
        const recentTrend = cgpas[cgpas.length - 1] - cgpas[cgpas.length - 2];
        const remainingSemesters = 8 - snapshotData.length;
        projectedGraduationCgpa = Math.max(0, Math.min(10,
          cgpas[cgpas.length - 1] + (recentTrend * remainingSemesters * 0.5) // Conservative projection
        ));
        projectedGraduationCgpa = Math.round(projectedGraduationCgpa * 100) / 100;
      }
    }

    return {
      studentId,
      snapshots: snapshotData,
      overallTrend: {
        cgpa: cgpaTrend,
        sgi: sgiTrend,
        cri: criTrend,
      },
      projectedGraduationCgpa,
    };
  }

  /**
   * Calculate trend from array of values
   */
  private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
    const validValues = values.filter((v) => v > 0);
    if (validValues.length < 2) return 'stable';

    const recentValues = validValues.slice(-3); // Last 3 values
    if (recentValues.length < 2) return 'stable';

    const firstHalf = recentValues.slice(0, Math.ceil(recentValues.length / 2));
    const secondHalf = recentValues.slice(Math.ceil(recentValues.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const threshold = 0.1; // 0.1 change to be considered significant

    if (diff > threshold) return 'improving';
    if (diff < -threshold) return 'declining';
    return 'stable';
  }

  /**
   * Convert grade to grade point (10-point scale)
   */
  private getGradePoint(grade: string): number {
    const gradeMap: Record<string, number> = {
      'O': 10,
      'A+': 9,
      'A': 8,
      'B+': 7,
      'B': 6,
      'C': 5,
      'P': 4,
      'F': 0,
      'FAIL': 0,
      'AB': 0, // Absent
    };
    return gradeMap[grade.toUpperCase()] ?? 0;
  }
}
