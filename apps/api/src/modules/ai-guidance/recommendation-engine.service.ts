import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GuidanceType,
  GuidanceCategory,
  GuidancePriority,
  ActionItemDto,
  ResourceDto,
} from './dto/ai-guidance.dto';

/**
 * Recommendation Engine Service
 *
 * Generates personalized recommendations based on student data:
 * - SGI scores and trends
 * - CRI scores and skill gaps
 * - Feedback summaries
 * - Academic performance
 * - Engagement metrics
 *
 * This service acts as a rule-based recommendation engine.
 * In production, this could be enhanced with LLM integration for more
 * personalized and natural language recommendations.
 */

export interface RecommendationInput {
  studentId: string;
  tenantId: string;
  sgi?: {
    score: number;
    trend: string;
    academicScore: number;
    engagementScore: number;
    skillsScore: number;
    behavioralScore: number;
  };
  cri?: {
    score: number;
    placementProbability: number;
    skillGaps: string[];
    targetRoles: string[];
  };
  feedback?: {
    overallScore: number;
    topStrengths: string[];
    topImprovements: string[];
  };
  academic?: {
    cgpa: number;
    attendance: number;
    backlogs: number;
  };
}

export interface GeneratedRecommendation {
  guidanceType: GuidanceType;
  category: GuidanceCategory;
  priority: GuidancePriority;
  title: string;
  description: string;
  actionItems: { action: string; deadline?: string; completed?: boolean }[];
  resources: { title: string; url?: string; type?: string }[];
  triggerReason: string;
  triggerMetric?: string;
  triggerValue?: number;
  confidenceScore: number;
  expiresAt?: Date;
}

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate all recommendations for a student
   */
  async generateRecommendations(
    input: RecommendationInput,
    options: {
      includeCareer?: boolean;
      includeAcademic?: boolean;
      includeEngagement?: boolean;
      includeSkills?: boolean;
    } = {}
  ): Promise<GeneratedRecommendation[]> {
    const {
      includeCareer = true,
      includeAcademic = true,
      includeEngagement = true,
      includeSkills = true,
    } = options;

    const recommendations: GeneratedRecommendation[] = [];

    // Academic recommendations
    if (includeAcademic) {
      recommendations.push(...this.generateAcademicRecommendations(input));
    }

    // Career recommendations
    if (includeCareer) {
      recommendations.push(...this.generateCareerRecommendations(input));
    }

    // Engagement recommendations
    if (includeEngagement) {
      recommendations.push(...this.generateEngagementRecommendations(input));
    }

    // Skills recommendations
    if (includeSkills) {
      recommendations.push(...this.generateSkillsRecommendations(input));
    }

    // Sort by priority
    const priorityOrder = {
      [GuidancePriority.URGENT]: 0,
      [GuidancePriority.HIGH]: 1,
      [GuidancePriority.MEDIUM]: 2,
      [GuidancePriority.LOW]: 3,
    };

    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    this.logger.log(`Generated ${recommendations.length} recommendations for student ${input.studentId}`);
    return recommendations;
  }

  /**
   * Generate academic recommendations based on SGI and academic data
   */
  private generateAcademicRecommendations(input: RecommendationInput): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];
    const { sgi, academic } = input;

    // Low academic score recommendation
    if (sgi && sgi.academicScore < 50) {
      recommendations.push({
        guidanceType: GuidanceType.RECOMMENDATION,
        category: GuidanceCategory.ACADEMIC,
        priority: sgi.academicScore < 30 ? GuidancePriority.URGENT : GuidancePriority.HIGH,
        title: 'Improve Academic Performance',
        description: `Your academic score is ${sgi.academicScore}/100. Focus on improving your grades and study habits to boost your overall growth index.`,
        actionItems: [
          { action: 'Review and revise course materials for weak subjects', deadline: this.addDaysIso(7) },
          { action: 'Attend all lectures and take detailed notes', deadline: this.addDaysIso(30) },
          { action: 'Form or join a study group for collaborative learning', deadline: this.addDaysIso(14) },
          { action: 'Meet with professors during office hours for guidance', deadline: this.addDaysIso(10) },
        ],
        resources: [
          { title: 'Effective Study Techniques', type: 'article' },
          { title: 'Time Management for Students', type: 'video' },
        ],
        triggerReason: 'Low academic score detected',
        triggerMetric: 'academicScore',
        triggerValue: sgi.academicScore,
        confidenceScore: 0.9,
        expiresAt: this.addDays(30),
      });
    }

    // Declining trend recommendation
    if (sgi && sgi.trend === 'declining') {
      recommendations.push({
        guidanceType: GuidanceType.ALERT,
        category: GuidanceCategory.ACADEMIC,
        priority: GuidancePriority.HIGH,
        title: 'Address Declining Performance Trend',
        description: 'Your growth index shows a declining trend. Take immediate action to reverse this pattern.',
        actionItems: [
          { action: 'Identify the specific areas where you\'re struggling', deadline: this.addDaysIso(3) },
          { action: 'Schedule a meeting with your academic mentor', deadline: this.addDaysIso(7) },
          { action: 'Create a recovery plan with clear milestones', deadline: this.addDaysIso(10) },
        ],
        resources: [
          { title: 'Getting Back on Track Academically', type: 'article' },
        ],
        triggerReason: 'Declining SGI trend detected',
        triggerMetric: 'sgiTrend',
        confidenceScore: 0.85,
        expiresAt: this.addDays(14),
      });
    }

    // Backlog recommendation
    if (academic && academic.backlogs > 0) {
      recommendations.push({
        guidanceType: GuidanceType.RECOMMENDATION,
        category: GuidanceCategory.ACADEMIC,
        priority: academic.backlogs >= 3 ? GuidancePriority.URGENT : GuidancePriority.HIGH,
        title: `Clear ${academic.backlogs} Backlog${academic.backlogs > 1 ? 's' : ''}`,
        description: `You have ${academic.backlogs} pending backlog${academic.backlogs > 1 ? 's' : ''}. Clearing these should be your top priority for career readiness.`,
        actionItems: [
          { action: 'Create a subject-wise study plan for backlog exams', deadline: this.addDaysIso(7) },
          { action: 'Dedicate 2 hours daily for backlog preparation', deadline: this.addDaysIso(30) },
          { action: 'Take mock tests to assess your preparation', deadline: this.addDaysIso(21) },
        ],
        resources: [
          { title: 'Backlog Clearing Strategies', type: 'article' },
        ],
        triggerReason: 'Active backlogs detected',
        triggerMetric: 'backlogs',
        triggerValue: academic.backlogs,
        confidenceScore: 0.95,
        expiresAt: this.addDays(60),
      });
    }

    // Low attendance recommendation
    if (academic && academic.attendance < 75) {
      recommendations.push({
        guidanceType: GuidanceType.ALERT,
        category: GuidanceCategory.BEHAVIORAL,
        priority: academic.attendance < 60 ? GuidancePriority.URGENT : GuidancePriority.HIGH,
        title: 'Improve Attendance',
        description: `Your attendance is at ${academic.attendance}%, which is below the required minimum. This may affect your exam eligibility.`,
        actionItems: [
          { action: 'Attend all classes for the next 2 weeks without exception', deadline: this.addDaysIso(14) },
          { action: 'If facing genuine issues, speak with your department head', deadline: this.addDaysIso(5) },
        ],
        resources: [],
        triggerReason: 'Low attendance detected',
        triggerMetric: 'attendance',
        triggerValue: academic.attendance,
        confidenceScore: 0.95,
        expiresAt: this.addDays(14),
      });
    }

    return recommendations;
  }

  /**
   * Generate career recommendations based on CRI data
   */
  private generateCareerRecommendations(input: RecommendationInput): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];
    const { cri } = input;

    if (!cri) return recommendations;

    // Low placement probability
    if (cri.placementProbability < 50) {
      recommendations.push({
        guidanceType: GuidanceType.RECOMMENDATION,
        category: GuidanceCategory.CAREER,
        priority: cri.placementProbability < 30 ? GuidancePriority.URGENT : GuidancePriority.HIGH,
        title: 'Boost Your Placement Readiness',
        description: `Your current placement probability is ${cri.placementProbability}%. Take focused action to improve your career readiness.`,
        actionItems: [
          { action: 'Update your resume with recent projects and skills', deadline: this.addDaysIso(7) },
          { action: 'Complete at least 2 mock interviews this month', deadline: this.addDaysIso(30) },
          { action: 'Apply for internships to gain industry experience', deadline: this.addDaysIso(14) },
        ],
        resources: [
          { title: 'Resume Building Workshop', type: 'video' },
          { title: 'Interview Preparation Guide', type: 'article' },
        ],
        triggerReason: 'Low placement probability',
        triggerMetric: 'placementProbability',
        triggerValue: cri.placementProbability,
        confidenceScore: 0.85,
        expiresAt: this.addDays(30),
      });
    }

    // Skill gaps
    if (cri.skillGaps && cri.skillGaps.length > 0) {
      const topSkillGaps = cri.skillGaps.slice(0, 3);
      recommendations.push({
        guidanceType: GuidanceType.RECOMMENDATION,
        category: GuidanceCategory.SKILL,
        priority: GuidancePriority.MEDIUM,
        title: 'Address Key Skill Gaps',
        description: `Based on your target roles, you should focus on developing: ${topSkillGaps.join(', ')}`,
        actionItems: topSkillGaps.map((skill, index) => ({
          action: `Complete a course or project in ${skill}`,
          deadline: this.addDaysIso(30 * (index + 1)),
        })),
        resources: [
          { title: 'Free Online Learning Platforms', type: 'article' },
          { title: 'Skill Development Roadmaps', type: 'article' },
        ],
        triggerReason: 'Skill gaps identified for target roles',
        triggerMetric: 'skillGaps',
        confidenceScore: 0.8,
        expiresAt: this.addDays(90),
      });
    }

    // Low CRI overall
    if (cri.score < 40) {
      recommendations.push({
        guidanceType: GuidanceType.MONTHLY_PLAN,
        category: GuidanceCategory.CAREER,
        priority: GuidancePriority.HIGH,
        title: 'Career Development Focus Month',
        description: 'Your Career Readiness Index needs significant improvement. Follow this month-long plan to boost your employability.',
        actionItems: [
          { action: 'Week 1: Complete resume review and update', deadline: this.addDaysIso(7) },
          { action: 'Week 2: Practice aptitude and coding tests', deadline: this.addDaysIso(14) },
          { action: 'Week 3: Participate in group discussions', deadline: this.addDaysIso(21) },
          { action: 'Week 4: Complete 2 mock technical interviews', deadline: this.addDaysIso(28) },
        ],
        resources: [
          { title: 'Placement Preparation Checklist', type: 'article' },
          { title: 'Company-wise Interview Experiences', type: 'article' },
        ],
        triggerReason: 'Low CRI score requires focused intervention',
        triggerMetric: 'criScore',
        triggerValue: cri.score,
        confidenceScore: 0.85,
        expiresAt: this.addDays(30),
      });
    }

    return recommendations;
  }

  /**
   * Generate engagement recommendations
   */
  private generateEngagementRecommendations(input: RecommendationInput): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];
    const { sgi } = input;

    if (!sgi) return recommendations;

    // Low engagement score
    if (sgi.engagementScore < 40) {
      recommendations.push({
        guidanceType: GuidanceType.TIP,
        category: GuidanceCategory.ENGAGEMENT,
        priority: GuidancePriority.MEDIUM,
        title: 'Increase Campus Engagement',
        description: 'Your engagement score is low. Participating in campus activities improves your overall development and networking.',
        actionItems: [
          { action: 'Join at least one club or committee', deadline: this.addDaysIso(14) },
          { action: 'Attend 2 department events this month', deadline: this.addDaysIso(30) },
          { action: 'Volunteer for an upcoming college event', deadline: this.addDaysIso(21) },
        ],
        resources: [
          { title: 'Benefits of Extracurricular Activities', type: 'article' },
        ],
        triggerReason: 'Low engagement score',
        triggerMetric: 'engagementScore',
        triggerValue: sgi.engagementScore,
        confidenceScore: 0.75,
        expiresAt: this.addDays(30),
      });
    }

    return recommendations;
  }

  /**
   * Generate skills recommendations
   */
  private generateSkillsRecommendations(input: RecommendationInput): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];
    const { sgi } = input;

    if (!sgi) return recommendations;

    // Low skills score
    if (sgi.skillsScore < 40) {
      recommendations.push({
        guidanceType: GuidanceType.RECOMMENDATION,
        category: GuidanceCategory.SKILL,
        priority: GuidancePriority.MEDIUM,
        title: 'Build Technical Skills Portfolio',
        description: 'Your skills score indicates you need to work on certifications, projects, and practical skills.',
        actionItems: [
          { action: 'Complete at least one online certification', deadline: this.addDaysIso(30) },
          { action: 'Start a personal or team project', deadline: this.addDaysIso(21) },
          { action: 'Contribute to an open-source project', deadline: this.addDaysIso(45) },
        ],
        resources: [
          { title: 'Top Certifications for Engineering Students', type: 'article' },
          { title: 'Project Ideas by Domain', type: 'article' },
        ],
        triggerReason: 'Low skills score',
        triggerMetric: 'skillsScore',
        triggerValue: sgi.skillsScore,
        confidenceScore: 0.8,
        expiresAt: this.addDays(45),
      });
    }

    return recommendations;
  }

  /**
   * Generate monthly plan for a student
   */
  async generateMonthlyPlan(
    tenantId: string,
    studentId: string,
    month: number,
    year: number
  ): Promise<GeneratedRecommendation> {
    // Fetch student data
    const [sgiData, criData, feedbackData] = await Promise.all([
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
    ]);

    // Build action items based on data
    const actionItems: ActionItemDto[] = [];

    // Academic focus
    if (sgiData && sgiData.academicScore < 60) {
      actionItems.push({
        action: 'Dedicate 2 hours daily for core subject revision',
        deadline: this.addDaysIso(30),
      });
    }

    // Career focus
    if (criData && criData.criScore < 50) {
      actionItems.push({
        action: 'Complete resume update and LinkedIn optimization',
        deadline: this.addDaysIso(14),
      });
      actionItems.push({
        action: 'Participate in at least 2 mock interviews',
        deadline: this.addDaysIso(30),
      });
    }

    // Engagement focus
    if (sgiData && sgiData.engagementScore < 50) {
      actionItems.push({
        action: 'Attend at least 3 campus events this month',
        deadline: this.addDaysIso(30),
      });
    }

    // Skills focus
    if (sgiData && sgiData.skillsScore < 50) {
      actionItems.push({
        action: 'Start or progress on a practical project',
        deadline: this.addDaysIso(21),
      });
    }

    // Default actions if nothing specific
    if (actionItems.length === 0) {
      actionItems.push(
        { action: 'Maintain consistent attendance above 85%', deadline: this.addDaysIso(30) },
        { action: 'Complete all assignments on time', deadline: this.addDaysIso(30) },
        { action: 'Participate actively in class discussions', deadline: this.addDaysIso(30) }
      );
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      guidanceType: GuidanceType.MONTHLY_PLAN,
      category: GuidanceCategory.ACADEMIC,
      priority: GuidancePriority.MEDIUM,
      title: `${monthNames[month - 1]} ${year} - Your Monthly Plan`,
      description: `Here's your personalized action plan for ${monthNames[month - 1]}. Focus on these key areas to maximize your growth.`,
      actionItems,
      resources: [
        { title: 'Monthly Planning Template', type: 'article' },
        { title: 'Goal Setting Best Practices', type: 'video' },
      ],
      triggerReason: 'Monthly plan generation',
      confidenceScore: 0.8,
      expiresAt: new Date(year, month, 0), // Last day of the month
    };
  }

  /**
   * Generate goal suggestions for a student
   */
  async generateGoalSuggestions(
    tenantId: string,
    studentId: string,
    count: number = 5
  ): Promise<{
    title: string;
    description: string;
    category: string;
    targetValue?: number;
    unit?: string;
    priority: string;
  }[]> {
    // Fetch student data
    const [sgiData, criData, student] = await Promise.all([
      this.prisma.studentGrowthIndex.findFirst({
        where: { tenantId, studentId },
        orderBy: { calculatedAt: 'desc' },
      }),
      this.prisma.careerReadinessIndex.findFirst({
        where: { tenantId, studentId, isLatest: true },
      }),
      this.prisma.student.findUnique({
        where: { id: studentId },
        select: { semester: true },
      }),
    ]);

    const suggestions: {
      title: string;
      description: string;
      category: string;
      targetValue?: number;
      unit?: string;
      priority: string;
    }[] = [];

    // Academic goals
    if (sgiData && sgiData.academicScore < 70) {
      suggestions.push({
        title: 'Improve CGPA by 0.5',
        description: 'Focus on consistent performance across all subjects',
        category: 'academic',
        targetValue: 0.5,
        unit: 'CGPA points',
        priority: 'high',
      });
    }

    // Career goals
    if (criData && criData.criScore < 60) {
      suggestions.push({
        title: 'Complete 2 Industry Certifications',
        description: 'Earn certifications relevant to your target roles',
        category: 'career',
        targetValue: 2,
        unit: 'certifications',
        priority: 'medium',
      });
    }

    // Skill goals
    suggestions.push({
      title: 'Build a Portfolio Project',
      description: 'Create a complete project to showcase your skills',
      category: 'skill',
      priority: 'medium',
    });

    // Engagement goals
    if (sgiData && sgiData.engagementScore < 50) {
      suggestions.push({
        title: 'Take Leadership Role in a Club',
        description: 'Develop leadership skills through active participation',
        category: 'extracurricular',
        priority: 'low',
      });
    }

    // Personal development
    suggestions.push({
      title: 'Read 2 Books This Semester',
      description: 'Expand your knowledge beyond academics',
      category: 'personal',
      targetValue: 2,
      unit: 'books',
      priority: 'low',
    });

    return suggestions.slice(0, count);
  }

  // Helper methods
  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  private addDaysIso(days: number): string {
    return this.addDays(days).toISOString();
  }
}
