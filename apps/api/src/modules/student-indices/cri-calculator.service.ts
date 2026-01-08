import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CRI (Career Readiness Index) Calculator
 *
 * Predicts placement readiness and probability based on:
 * - Resume Score (25%): Resume quality, skills listed, experience
 * - Interview Score (25%): Mock interview performance, communication
 * - Skill-Role Fit (25%): How well skills match target job roles
 * - Industry Exposure (25%): Internships, projects, industry events
 *
 * Also predicts:
 * - Placement probability (0-100%)
 * - Expected salary band
 * - Skill gaps to address
 * - Matching companies
 */

export interface CriInput {
  studentId: string;
  tenantId: string;
}

export interface CriComponentScores {
  resumeScore: number;
  interviewScore: number;
  skillRoleFitScore: number;
  industryExposureScore: number;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'low' | 'medium' | 'high';
}

export interface TargetRole {
  role: string;
  fitScore: number;
  requirements: string[];
}

export interface MatchingCompany {
  company: string;
  fitScore: number;
  openings?: number;
}

export interface ActionPlanItem {
  action: string;
  deadline?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface CriResult {
  scores: CriComponentScores;
  criScore: number;
  placementProbability: number;
  salaryBand: string;
  skillGaps: SkillGap[];
  targetRoles: TargetRole[];
  topMatchingCompanies: MatchingCompany[];
  actionPlan: ActionPlanItem[];
  confidenceScore: number;
}

// Common skill sets for engineering students
const COMMON_SKILLS = [
  'Programming',
  'Data Structures',
  'Algorithms',
  'Database Management',
  'Web Development',
  'Communication',
  'Problem Solving',
  'Team Collaboration',
  'Project Management',
  'Technical Writing',
];

// Salary bands based on CRI score
const SALARY_BANDS = [
  { minCri: 90, band: 'LPA_12_PLUS', label: '12+ LPA' },
  { minCri: 80, band: 'LPA_8_12', label: '8-12 LPA' },
  { minCri: 70, band: 'LPA_5_8', label: '5-8 LPA' },
  { minCri: 50, band: 'LPA_3_5', label: '3-5 LPA' },
  { minCri: 0, band: 'LPA_BELOW_3', label: 'Below 3 LPA' },
];

// Common tech companies hiring from colleges
const TECH_COMPANIES = [
  { name: 'TCS', minCri: 50, avgPackage: 3.5 },
  { name: 'Infosys', minCri: 55, avgPackage: 4 },
  { name: 'Wipro', minCri: 50, avgPackage: 3.5 },
  { name: 'Cognizant', minCri: 55, avgPackage: 4 },
  { name: 'Accenture', minCri: 60, avgPackage: 4.5 },
  { name: 'Capgemini', minCri: 60, avgPackage: 4.5 },
  { name: 'Tech Mahindra', minCri: 55, avgPackage: 3.8 },
  { name: 'HCL', minCri: 55, avgPackage: 4 },
  { name: 'Deloitte', minCri: 70, avgPackage: 7 },
  { name: 'Amazon', minCri: 80, avgPackage: 12 },
  { name: 'Google', minCri: 85, avgPackage: 15 },
  { name: 'Microsoft', minCri: 80, avgPackage: 14 },
];

@Injectable()
export class CriCalculatorService {
  private readonly logger = new Logger(CriCalculatorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate CRI for a single student
   */
  async calculateCri(input: CriInput): Promise<CriResult> {
    const { studentId, tenantId } = input;

    // Get configuration weights
    const config = await this.getOrCreateConfig(tenantId);

    // Fetch student with all related data
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        department: true,
        achievements: true,
      },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    // Get career profile
    const careerProfile = await this.prisma.careerProfile.findFirst({
      where: { studentId },
    });

    // Calculate each component
    const resumeData = await this.calculateResumeScore(student, careerProfile);
    const interviewData = await this.calculateInterviewScore(student, tenantId);
    const skillFitData = await this.calculateSkillRoleFitScore(student, careerProfile);
    const exposureData = await this.calculateIndustryExposureScore(student, careerProfile, tenantId);

    // Calculate weighted CRI score
    const scores: CriComponentScores = {
      resumeScore: resumeData.score,
      interviewScore: interviewData.score,
      skillRoleFitScore: skillFitData.score,
      industryExposureScore: exposureData.score,
    };

    const criScore = this.calculateWeightedScore(scores, config);

    // Calculate placement probability using a logistic curve
    const placementProbability = this.calculatePlacementProbability(criScore);

    // Determine salary band
    const salaryBand = this.determineSalaryBand(criScore);

    // Identify skill gaps
    const skillGaps = this.identifySkillGaps(skillFitData.skillAssessment);

    // Generate target roles
    const targetRoles = this.generateTargetRoles(student, skillFitData);

    // Find matching companies
    const topMatchingCompanies = this.findMatchingCompanies(criScore);

    // Generate action plan
    const actionPlan = this.generateActionPlan(scores, skillGaps, exposureData);

    // Calculate confidence score based on data availability
    const confidenceScore = this.calculateConfidenceScore(resumeData, interviewData, skillFitData, exposureData);

    return {
      scores,
      criScore: Math.round(criScore * 10) / 10,
      placementProbability: Math.round(placementProbability * 100) / 100,
      salaryBand,
      skillGaps,
      targetRoles,
      topMatchingCompanies,
      actionPlan,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
    };
  }

  /**
   * Calculate Resume Score (25% weight)
   */
  private async calculateResumeScore(student: any, careerProfile: any) {
    let score = 30; // Base score
    const factors: Record<string, number> = {};

    // Skills listed (up to 20 points)
    const skills = careerProfile?.skills || [];
    const skillsScore = Math.min(20, skills.length * 2);
    score += skillsScore;
    factors.skills = skillsScore;

    // Experience/Internships (up to 25 points)
    const internships = careerProfile?.internships ? JSON.parse(JSON.stringify(careerProfile.internships)) : [];
    const internshipScore = Math.min(25, internships.length * 12);
    score += internshipScore;
    factors.internships = internshipScore;

    // Projects (up to 15 points)
    const projects = careerProfile?.projects ? JSON.parse(JSON.stringify(careerProfile.projects)) : [];
    const projectScore = Math.min(15, projects.length * 5);
    score += projectScore;
    factors.projects = projectScore;

    // Certifications (up to 10 points)
    const achievements = student.achievements || [];
    const certifications = achievements.filter((a: any) => a.type === 'certification');
    const certScore = Math.min(10, certifications.length * 5);
    score += certScore;
    factors.certifications = certScore;

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      hasData: skills.length > 0 || internships.length > 0 || projects.length > 0,
    };
  }

  /**
   * Calculate Interview Score (25% weight)
   * Based on mock interview records and communication skills
   */
  private async calculateInterviewScore(student: any, tenantId: string) {
    let score = 50; // Base score (neutral)
    const factors: Record<string, number> = {};

    // Get feedback summaries for communication assessment
    const feedbackSummaries = await this.prisma.feedbackSummary.findMany({
      where: {
        studentId: student.id,
        tenantId,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Communication score from feedback (if available)
    if (feedbackSummaries.length > 0) {
      // Average the feedback scores
      const avgScore = feedbackSummaries.reduce((sum, f) => sum + (Number(f.overallScore) || 0), 0) / feedbackSummaries.length;
      const communicationBonus = (avgScore - 3) * 10; // +/- 10 points per point above/below 3
      score += communicationBonus;
      factors.communication = Math.round(communicationBonus);
    }

    // Academic performance correlation (higher CGPA often correlates with interview success)
    // This would ideally come from actual mock interview data
    const cgpaBonus = 10; // Placeholder
    score += cgpaBonus;
    factors.academicCorrelation = cgpaBonus;

    // Extracurricular activities (leadership positions, etc.)
    const clubMemberships = await this.prisma.clubMember.findMany({
      where: {
        studentId: student.id,
        status: 'active',
      },
    });

    const leadershipRoles = clubMemberships.filter((m: any) => m.role !== 'member').length;
    const leadershipBonus = Math.min(15, leadershipRoles * 5);
    score += leadershipBonus;
    factors.leadership = leadershipBonus;

    return {
      score: Math.min(100, Math.max(0, Math.round(score))),
      factors,
      hasData: feedbackSummaries.length > 0 || clubMemberships.length > 0,
    };
  }

  /**
   * Calculate Skill-Role Fit Score (25% weight)
   */
  private async calculateSkillRoleFitScore(student: any, careerProfile: any) {
    const skills = careerProfile?.skills || [];
    const targetRoles = careerProfile?.targetRoles || [];

    // Create skill assessment
    const skillAssessment: Record<string, { current: number; required: number }> = {};

    // Assess common skills
    for (const skill of COMMON_SKILLS) {
      const hasSkill = skills.some((s: string) =>
        s.toLowerCase().includes(skill.toLowerCase())
      );
      skillAssessment[skill] = {
        current: hasSkill ? 70 : 30,
        required: 70, // Industry standard
      };
    }

    // Calculate fit score
    const totalSkills = Object.keys(skillAssessment).length;
    const skillScores = Object.values(skillAssessment).map(s => Math.min(100, (s.current / s.required) * 100));
    const avgFitScore = skillScores.reduce((sum, s) => sum + s, 0) / totalSkills;

    // Bonus for having target roles defined
    const targetRoleBonus = targetRoles.length > 0 ? 10 : 0;

    const score = Math.min(100, avgFitScore + targetRoleBonus);

    return {
      score: Math.round(score),
      skillAssessment,
      targetRoles,
      hasData: skills.length > 0,
    };
  }

  /**
   * Calculate Industry Exposure Score (25% weight)
   */
  private async calculateIndustryExposureScore(
    student: any,
    careerProfile: any,
    tenantId: string,
  ) {
    let score = 20; // Base score
    const factors: Record<string, number> = {};

    // Get achievements for internships and projects
    const achievements = await this.prisma.achievement.findMany({
      where: { studentId: student.id, tenantId },
    });

    // Internships (major factor - up to 40 points)
    const internshipAchievements = achievements.filter(a =>
      a.type.toLowerCase().includes('internship') ||
      a.title.toLowerCase().includes('internship')
    );
    const internshipScore = Math.min(40, internshipAchievements.length * 20);
    score += internshipScore;
    factors.internships = internshipScore;

    // Industry projects (up to 20 points) - technical achievements
    const projectAchievements = achievements.filter(a => a.category === 'technical');
    const projectScore = Math.min(20, projectAchievements.length * 10);
    score += projectScore;
    factors.industryProjects = projectScore;

    // Industry events/workshops attended (from club events with relevant types)
    const eventCount = await this.prisma.eventRegistration.count({
      where: {
        studentId: student.id,
        attended: true,
        clubEvent: {
          tenantId,
          type: { in: ['workshop', 'seminar', 'guest_lecture'] },
        },
      },
    });
    const eventScore = Math.min(10, eventCount * 2);
    score += eventScore;
    factors.industryEvents = eventScore;

    // Placement drives participated
    const placementDrives = 0; // Placeholder - would need placement tracking
    const placementScore = Math.min(10, placementDrives * 2);
    score += placementScore;
    factors.placementDrives = placementScore;

    return {
      score: Math.min(100, Math.round(score)),
      factors,
      hasData: internshipAchievements.length > 0 || projectAchievements.length > 0 || eventCount > 0,
    };
  }

  /**
   * Calculate weighted CRI score
   */
  private calculateWeightedScore(
    scores: CriComponentScores,
    config: any,
  ): number {
    return (
      (scores.resumeScore * config.criResumeWeight / 100) +
      (scores.interviewScore * config.criInterviewWeight / 100) +
      (scores.skillRoleFitScore * config.criSkillFitWeight / 100) +
      (scores.industryExposureScore * config.criExposureWeight / 100)
    );
  }

  /**
   * Calculate placement probability using logistic curve
   */
  private calculatePlacementProbability(criScore: number): number {
    // Logistic function: P = 1 / (1 + e^(-k*(x-x0)))
    // where x0 = 50 (midpoint), k = 0.1 (steepness)
    const k = 0.08;
    const x0 = 55;
    const probability = 1 / (1 + Math.exp(-k * (criScore - x0)));
    return probability;
  }

  /**
   * Determine salary band based on CRI score
   */
  private determineSalaryBand(criScore: number): string {
    for (const band of SALARY_BANDS) {
      if (criScore >= band.minCri) {
        return band.band;
      }
    }
    return 'LPA_BELOW_3';
  }

  /**
   * Identify skill gaps
   */
  private identifySkillGaps(skillAssessment: Record<string, { current: number; required: number }>): SkillGap[] {
    const gaps: SkillGap[] = [];

    for (const [skill, assessment] of Object.entries(skillAssessment)) {
      if (assessment.current < assessment.required) {
        const gap = assessment.required - assessment.current;
        gaps.push({
          skill,
          currentLevel: assessment.current,
          requiredLevel: assessment.required,
          priority: gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low',
        });
      }
    }

    // Sort by priority and gap size
    return gaps
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5);
  }

  /**
   * Generate target roles based on skills
   */
  private generateTargetRoles(student: any, skillFitData: any): TargetRole[] {
    const roles: TargetRole[] = [
      {
        role: 'Software Developer',
        fitScore: skillFitData.score,
        requirements: ['Programming', 'Data Structures', 'Problem Solving'],
      },
      {
        role: 'Full Stack Developer',
        fitScore: Math.max(50, skillFitData.score - 5),
        requirements: ['Web Development', 'Database Management', 'Programming'],
      },
      {
        role: 'Data Analyst',
        fitScore: Math.max(50, skillFitData.score - 10),
        requirements: ['Database Management', 'Problem Solving', 'Technical Writing'],
      },
    ];

    return roles.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
  }

  /**
   * Find matching companies based on CRI score
   */
  private findMatchingCompanies(criScore: number): MatchingCompany[] {
    return TECH_COMPANIES
      .filter(c => criScore >= c.minCri)
      .map(c => ({
        company: c.name,
        fitScore: Math.min(100, Math.round(((criScore - c.minCri) / (100 - c.minCri)) * 100)),
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 5);
  }

  /**
   * Generate action plan
   */
  private generateActionPlan(
    scores: CriComponentScores,
    skillGaps: SkillGap[],
    exposureData: any,
  ): ActionPlanItem[] {
    const actions: ActionPlanItem[] = [];

    // Resume improvements
    if (scores.resumeScore < 70) {
      actions.push({
        action: 'Update resume with recent projects and skills',
        deadline: 'Within 1 week',
        impact: 'high',
      });
    }

    // Skill gaps
    for (const gap of skillGaps.slice(0, 2)) {
      if (gap.priority === 'high') {
        actions.push({
          action: `Improve ${gap.skill} through online courses or practice`,
          deadline: 'Within 1 month',
          impact: 'high',
        });
      }
    }

    // Industry exposure
    if (scores.industryExposureScore < 50) {
      if (exposureData.factors.internships < 20) {
        actions.push({
          action: 'Apply for internship opportunities in your field',
          impact: 'high',
        });
      }

      actions.push({
        action: 'Attend industry workshops and networking events',
        impact: 'medium',
      });
    }

    // Interview preparation
    if (scores.interviewScore < 60) {
      actions.push({
        action: 'Practice mock interviews and improve communication skills',
        impact: 'high',
      });
    }

    return actions.slice(0, 5);
  }

  /**
   * Calculate confidence score based on data availability
   */
  private calculateConfidenceScore(...componentData: Array<{ hasData: boolean }>): number {
    const hasDataCount = componentData.filter(d => d.hasData).length;
    return 0.5 + (hasDataCount / componentData.length) * 0.5; // 50-100%
  }

  /**
   * Get or create index configuration
   */
  private async getOrCreateConfig(tenantId: string) {
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
}
