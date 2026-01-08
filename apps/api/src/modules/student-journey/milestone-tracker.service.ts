import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  MilestoneType,
  MilestoneCategory,
  LinkedEntityType,
  MilestoneSnapshotDataDto,
  AutoMilestoneConfigDto,
} from './dto/student-journey.dto';

export interface AutoMilestoneEvent {
  type: 'exam_result' | 'achievement' | 'placement' | 'internship' | 'club_join' | 'certification';
  studentId: string;
  tenantId: string;
  entityId: string;
  data: Record<string, unknown>;
}

@Injectable()
export class MilestoneTrackerService {
  private readonly logger = new Logger(MilestoneTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current snapshot data for a student (for attaching to milestones)
   */
  async getCurrentSnapshotData(
    tenantId: string,
    studentId: string,
  ): Promise<MilestoneSnapshotDataDto> {
    // Get latest SGI
    const latestSgi = await this.prisma.studentGrowthIndex.findFirst({
      where: { tenantId, studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Get latest CRI
    const latestCri = await this.prisma.careerReadinessIndex.findFirst({
      where: { tenantId, studentId, isLatest: true },
    });

    // Get latest semester snapshot for CGPA/SGPA
    const latestSnapshot = await this.prisma.semesterSnapshot.findFirst({
      where: { tenantId, studentId },
      orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }],
    });

    // Get attendance for current academic period
    const currentYear = new Date().getFullYear();
    const academicYear = new Date().getMonth() >= 6
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

    // Calculate overall attendance
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        studentId,
        date: {
          gte: new Date(parseInt(academicYear.split('-')[0]), 6, 1), // July 1
        },
      },
    });

    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(
      (r) => r.status === 'present' || r.status === 'late',
    ).length;
    const attendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : undefined;

    // Get achievements count
    const achievementsCount = await this.prisma.achievement.count({
      where: { studentId },
    });

    // Get active clubs count
    const clubsActive = await this.prisma.clubMember.count({
      where: {
        studentId,
        status: 'active',
      },
    });

    // Get backlogs count from exam results
    const backlogs = await this.prisma.examResult.count({
      where: {
        studentId,
        OR: [
          { grade: 'F' },
          { grade: 'FAIL' },
        ],
      },
    });

    return {
      cgpa: latestSnapshot?.cgpa ?? undefined,
      sgpa: latestSnapshot?.sgpa ?? undefined,
      sgiScore: latestSgi?.sgiScore ?? undefined,
      criScore: latestCri?.criScore ?? undefined,
      attendance: attendance ? Math.round(attendance * 100) / 100 : undefined,
      achievementsCount,
      clubsActive,
      backlogs,
    };
  }

  /**
   * Create admission milestone when student is created
   */
  async createAdmissionMilestone(
    tenantId: string,
    studentId: string,
    admissionDate: Date,
    studentName: string,
    departmentName?: string,
    batch?: string,
  ): Promise<void> {
    const academicYear = this.getAcademicYear(admissionDate);

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.ADMISSION,
        title: 'Admission to College',
        description: `${studentName} joined ${departmentName || 'the institution'}${batch ? ` (Batch ${batch})` : ''}.`,
        occurredAt: admissionDate,
        academicYear,
        semester: 1,
        category: MilestoneCategory.ACADEMIC,
        isPositive: true,
        isPublic: true,
      },
    });

    this.logger.log(`Created admission milestone for student ${studentId}`);
  }

  /**
   * Create semester start milestone
   */
  async createSemesterStartMilestone(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
  ): Promise<void> {
    const existingMilestone = await this.prisma.journeyMilestone.findFirst({
      where: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.SEMESTER_START,
        academicYear,
        semester,
      },
    });

    if (existingMilestone) {
      return; // Already exists
    }

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.SEMESTER_START,
        title: `Semester ${semester} Started`,
        description: `Academic year ${academicYear}, Semester ${semester} begins.`,
        occurredAt: new Date(),
        academicYear,
        semester,
        category: MilestoneCategory.ACADEMIC,
        isPositive: true,
        isPublic: false,
      },
    });
  }

  /**
   * Create semester end milestone with snapshot
   */
  async createSemesterEndMilestone(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const existingMilestone = await this.prisma.journeyMilestone.findFirst({
      where: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.SEMESTER_END,
        academicYear,
        semester,
      },
    });

    if (existingMilestone) {
      // Update existing
      await this.prisma.journeyMilestone.update({
        where: { id: existingMilestone.id },
        data: { snapshotData: snapshotData as unknown as Prisma.InputJsonValue },
      });
      return;
    }

    const cgpaStr = snapshotData.cgpa ? ` CGPA: ${snapshotData.cgpa.toFixed(2)}` : '';

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.SEMESTER_END,
        title: `Semester ${semester} Completed`,
        description: `Completed Semester ${semester} of ${academicYear}.${cgpaStr}`,
        occurredAt: new Date(),
        academicYear,
        semester,
        category: MilestoneCategory.ACADEMIC,
        isPositive: true,
        isPublic: false,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Auto-create milestone based on events
   */
  async processAutoMilestone(
    event: AutoMilestoneEvent,
    config?: AutoMilestoneConfigDto,
  ): Promise<void> {
    const { type, studentId, tenantId, entityId, data } = event;

    // Check if auto-milestone is enabled for this type
    if (config) {
      if (type === 'exam_result' && config.onExamResult === false) return;
      if (type === 'achievement' && config.onAchievement === false) return;
      if (type === 'placement' && config.onPlacement === false) return;
      if (type === 'internship' && config.onInternship === false) return;
      if (type === 'club_join' && config.onClubJoin === false) return;
      if (type === 'certification' && config.onCertification === false) return;
    }

    const snapshotData = await this.getCurrentSnapshotData(tenantId, studentId);

    switch (type) {
      case 'exam_result':
        await this.createExamResultMilestone(tenantId, studentId, entityId, data, snapshotData);
        break;
      case 'achievement':
        await this.createAchievementMilestone(tenantId, studentId, entityId, data, snapshotData);
        break;
      case 'placement':
        await this.createPlacementMilestone(tenantId, studentId, entityId, data, snapshotData);
        break;
      case 'internship':
        await this.createInternshipMilestone(tenantId, studentId, entityId, data, snapshotData);
        break;
      case 'club_join':
        await this.createClubJoinMilestone(tenantId, studentId, entityId, data, snapshotData);
        break;
      case 'certification':
        await this.createCertificationMilestone(tenantId, studentId, entityId, data, snapshotData);
        break;
    }
  }

  /**
   * Create exam result milestone (for significant results)
   */
  private async createExamResultMilestone(
    tenantId: string,
    studentId: string,
    examResultId: string,
    data: Record<string, unknown>,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const examName = (data.examName as string) || 'Exam';
    const grade = data.grade as string;
    const percentage = data.percentage as number;
    const isPass = !['F', 'FAIL'].includes(grade?.toUpperCase() || '');

    // Only create milestone for significant results
    if (percentage && percentage < 60 && isPass) {
      return; // Skip average results
    }

    let title: string;
    let isPositive = true;
    const milestoneType = MilestoneType.EXAM;

    if (!isPass) {
      title = `Backlog in ${examName}`;
      isPositive = false;
    } else if (percentage && percentage >= 90) {
      title = `Outstanding Performance in ${examName}`;
    } else if (percentage && percentage >= 75) {
      title = `Excellent Performance in ${examName}`;
    } else {
      title = `Cleared ${examName}`;
    }

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType,
        title,
        description: `Scored ${percentage ? percentage.toFixed(1) + '%' : grade} in ${examName}`,
        occurredAt: new Date(),
        category: MilestoneCategory.ACADEMIC,
        isPositive,
        isPublic: isPositive && percentage !== undefined && percentage >= 75,
        linkedEntityType: LinkedEntityType.EXAM_RESULT,
        linkedEntityId: examResultId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create achievement milestone
   */
  private async createAchievementMilestone(
    tenantId: string,
    studentId: string,
    achievementId: string,
    data: Record<string, unknown>,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const title = (data.title as string) || 'Achievement Unlocked';
    const achievementType = (data.type as string) || 'general';
    const level = data.level as string; // gold, silver, bronze, etc.

    let category = MilestoneCategory.EXTRACURRICULAR;
    if (achievementType === 'academic') category = MilestoneCategory.ACADEMIC;
    if (achievementType === 'sports') category = MilestoneCategory.EXTRACURRICULAR;
    if (achievementType === 'technical') category = MilestoneCategory.SKILL;

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.ACHIEVEMENT,
        title,
        description: level ? `Achieved ${level} level recognition.` : 'Recognition for outstanding performance.',
        occurredAt: new Date(),
        category,
        isPositive: true,
        isPublic: true,
        linkedEntityType: LinkedEntityType.ACHIEVEMENT,
        linkedEntityId: achievementId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create placement milestone
   */
  private async createPlacementMilestone(
    tenantId: string,
    studentId: string,
    offerId: string,
    data: Record<string, unknown>,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const companyName = (data.companyName as string) || 'Company';
    const role = (data.role as string) || 'Position';
    const packageLpa = data.packageLpa as number;

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.PLACEMENT,
        title: `Placed at ${companyName}`,
        description: `Secured ${role} position${packageLpa ? ` with ${packageLpa} LPA package` : ''}.`,
        occurredAt: new Date(),
        category: MilestoneCategory.CAREER,
        isPositive: true,
        isPublic: true,
        linkedEntityType: LinkedEntityType.PLACEMENT_OFFER,
        linkedEntityId: offerId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create internship milestone
   */
  private async createInternshipMilestone(
    tenantId: string,
    studentId: string,
    internshipId: string,
    data: Record<string, unknown>,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const companyName = (data.companyName as string) || 'Company';
    const role = (data.role as string) || 'Intern';
    const duration = data.duration as string;

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.INTERNSHIP,
        title: `Internship at ${companyName}`,
        description: `Started ${role} internship${duration ? ` (${duration})` : ''}.`,
        occurredAt: new Date(),
        category: MilestoneCategory.CAREER,
        isPositive: true,
        isPublic: true,
        linkedEntityType: LinkedEntityType.INTERNSHIP,
        linkedEntityId: internshipId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create club join milestone
   */
  private async createClubJoinMilestone(
    tenantId: string,
    studentId: string,
    membershipId: string,
    data: Record<string, unknown>,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const clubName = (data.clubName as string) || 'Club';
    const role = data.role as string; // member, secretary, president, etc.

    const title = role && role !== 'member'
      ? `Became ${role} of ${clubName}`
      : `Joined ${clubName}`;

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: role && role !== 'member' ? MilestoneType.LEADERSHIP_ROLE : MilestoneType.CLUB_JOINED,
        title,
        description: `Active member of ${clubName} club.`,
        occurredAt: new Date(),
        category: MilestoneCategory.EXTRACURRICULAR,
        isPositive: true,
        isPublic: true,
        linkedEntityType: LinkedEntityType.CLUB_MEMBERSHIP,
        linkedEntityId: membershipId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create certification milestone
   */
  private async createCertificationMilestone(
    tenantId: string,
    studentId: string,
    certificationId: string,
    data: Record<string, unknown>,
    snapshotData: MilestoneSnapshotDataDto,
  ): Promise<void> {
    const certName = (data.name as string) || 'Certification';
    const provider = (data.provider as string) || '';

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.CERTIFICATION,
        title: `Earned ${certName}`,
        description: provider ? `Certified by ${provider}.` : 'Professional certification completed.',
        occurredAt: new Date(),
        category: MilestoneCategory.SKILL,
        isPositive: true,
        isPublic: true,
        linkedEntityType: LinkedEntityType.CERTIFICATE,
        linkedEntityId: certificationId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create dean's list milestone (if CGPA threshold met)
   */
  async checkAndCreateDeanListMilestone(
    tenantId: string,
    studentId: string,
    academicYear: string,
    semester: number,
    cgpa: number,
    threshold: number = 9.0,
  ): Promise<void> {
    if (cgpa < threshold) return;

    const existingMilestone = await this.prisma.journeyMilestone.findFirst({
      where: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.DEAN_LIST,
        academicYear,
        semester,
      },
    });

    if (existingMilestone) return;

    const snapshotData = await this.getCurrentSnapshotData(tenantId, studentId);

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.DEAN_LIST,
        title: "Dean's List Achievement",
        description: `Achieved CGPA of ${cgpa.toFixed(2)} and made it to the Dean's List for ${academicYear} Semester ${semester}.`,
        occurredAt: new Date(),
        academicYear,
        semester,
        category: MilestoneCategory.ACADEMIC,
        isPositive: true,
        isPublic: true,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create backlog cleared milestone
   */
  async createBacklogClearedMilestone(
    tenantId: string,
    studentId: string,
    subjectName: string,
    examResultId: string,
  ): Promise<void> {
    const snapshotData = await this.getCurrentSnapshotData(tenantId, studentId);

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.BACKLOG_CLEARED,
        title: `Cleared Backlog: ${subjectName}`,
        description: `Successfully cleared the backlog in ${subjectName}.`,
        occurredAt: new Date(),
        category: MilestoneCategory.ACADEMIC,
        isPositive: true,
        isPublic: false,
        linkedEntityType: LinkedEntityType.EXAM_RESULT,
        linkedEntityId: examResultId,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
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
  ): Promise<void> {
    const snapshotData = await this.getCurrentSnapshotData(tenantId, studentId);

    await this.prisma.journeyMilestone.create({
      data: {
        tenantId,
        studentId,
        milestoneType: MilestoneType.GRADUATION,
        title: 'Graduation',
        description: `Graduated with ${degree} in ${departmentName}. Final CGPA: ${finalCgpa.toFixed(2)}`,
        occurredAt: new Date(),
        category: MilestoneCategory.ACADEMIC,
        isPositive: true,
        isPublic: true,
        snapshotData: snapshotData as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Helper: Get academic year from date
   */
  private getAcademicYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Academic year starts in July (month 6)
    if (month >= 6) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  }
}
