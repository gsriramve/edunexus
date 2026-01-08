import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SGI (Student Growth Index) Calculator
 *
 * Calculates holistic student growth based on 4 dimensions:
 * - Academic (40%): CGPA trends, exam improvements, assignment completion
 * - Engagement (30%): Club activity, events attended, attendance rate
 * - Skills (20%): Certifications, projects, internships
 * - Behavioral (10%): Feedback scores, punctuality, discipline
 *
 * Key principle: GROWTH over absolute values
 * A student improving from 6.5 to 7.5 CGPA scores higher than one maintaining 8.5
 */

export interface SgiInput {
  studentId: string;
  tenantId: string;
  month: number;
  year: number;
}

export interface SgiComponentScores {
  academicScore: number;
  engagementScore: number;
  skillsScore: number;
  behavioralScore: number;
}

export interface SgiBreakdown {
  academic: {
    cgpaTrend: number;
    examImprovement: number;
    assignments: number;
    details: Record<string, any>;
  };
  engagement: {
    clubActivity: number;
    eventsAttended: number;
    attendanceRate: number;
    details: Record<string, any>;
  };
  skills: {
    certifications: number;
    projects: number;
    internships: number;
    details: Record<string, any>;
  };
  behavioral: {
    feedbackScore: number;
    punctuality: number;
    discipline: number;
    details: Record<string, any>;
  };
}

export interface SgiResult {
  scores: SgiComponentScores;
  breakdown: SgiBreakdown;
  sgiScore: number;
  trend: 'improving' | 'stable' | 'declining';
  trendDelta: number;
  dataCompleteness: number;
  insights: string;
  recommendations: Array<{ category: string; action: string; priority: string }>;
}

@Injectable()
export class SgiCalculatorService {
  private readonly logger = new Logger(SgiCalculatorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate SGI for a single student
   */
  async calculateSgi(input: SgiInput): Promise<SgiResult> {
    const { studentId, tenantId, month, year } = input;

    // Get configuration weights
    const config = await this.getOrCreateConfig(tenantId);

    // Fetch student data
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    // Calculate each component
    const academicData = await this.calculateAcademicScore(tenantId, studentId, month, year);
    const engagementData = await this.calculateEngagementScore(tenantId, studentId, month, year);
    const skillsData = await this.calculateSkillsScore(tenantId, studentId, month, year);
    const behavioralData = await this.calculateBehavioralScore(tenantId, studentId, month, year);

    // Calculate weighted SGI score
    const scores: SgiComponentScores = {
      academicScore: academicData.score,
      engagementScore: engagementData.score,
      skillsScore: skillsData.score,
      behavioralScore: behavioralData.score,
    };

    const sgiScore = this.calculateWeightedScore(scores, config);

    // Get previous SGI to calculate trend
    const previousSgi = await this.getPreviousSgi(tenantId, studentId, month, year);
    const { trend, trendDelta } = this.calculateTrend(sgiScore, previousSgi);

    // Calculate data completeness
    const dataCompleteness = this.calculateDataCompleteness(academicData, engagementData, skillsData, behavioralData);

    // Generate insights and recommendations
    const insights = this.generateInsights(scores, trend, trendDelta, student.user?.name || 'Student');
    const recommendations = this.generateRecommendations(scores, academicData, engagementData, skillsData, behavioralData);

    const breakdown: SgiBreakdown = {
      academic: {
        cgpaTrend: academicData.breakdown.cgpaTrend,
        examImprovement: academicData.breakdown.examImprovement,
        assignments: academicData.breakdown.assignments,
        details: academicData.details,
      },
      engagement: {
        clubActivity: engagementData.breakdown.clubActivity,
        eventsAttended: engagementData.breakdown.eventsAttended,
        attendanceRate: engagementData.breakdown.attendanceRate,
        details: engagementData.details,
      },
      skills: {
        certifications: skillsData.breakdown.certifications,
        projects: skillsData.breakdown.projects,
        internships: skillsData.breakdown.internships,
        details: skillsData.details,
      },
      behavioral: {
        feedbackScore: behavioralData.breakdown.feedbackScore,
        punctuality: behavioralData.breakdown.punctuality,
        discipline: behavioralData.breakdown.discipline,
        details: behavioralData.details,
      },
    };

    return {
      scores,
      breakdown,
      sgiScore: Math.round(sgiScore * 10) / 10,
      trend,
      trendDelta: Math.round(trendDelta * 10) / 10,
      dataCompleteness,
      insights,
      recommendations,
    };
  }

  /**
   * Calculate Academic Score (40% weight)
   * Focuses on improvement over absolute values
   */
  private async calculateAcademicScore(
    tenantId: string,
    studentId: string,
    month: number,
    year: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get exam results for the period
    const examResults = await this.prisma.examResult.findMany({
      where: {
        studentId,
        exam: {
          tenantId,
          date: { gte: startDate, lte: endDate },
        },
      },
      include: {
        exam: true,
      },
    });

    // Get previous period results for comparison
    const prevStartDate = new Date(year, month - 2, 1);
    const prevEndDate = new Date(year, month - 1, 0);
    const prevExamResults = await this.prisma.examResult.findMany({
      where: {
        studentId,
        exam: {
          tenantId,
          date: { gte: prevStartDate, lte: prevEndDate },
        },
      },
      include: {
        exam: true,
      },
    });

    // Calculate average scores
    const currentAvg = examResults.length > 0
      ? examResults.reduce((sum, r) => sum + (Number(r.marks) / r.exam.totalMarks) * 100, 0) / examResults.length
      : 50;
    const prevAvg = prevExamResults.length > 0
      ? prevExamResults.reduce((sum, r) => sum + (Number(r.marks) / r.exam.totalMarks) * 100, 0) / prevExamResults.length
      : currentAvg;

    // CGPA Trend - emphasize improvement
    const improvement = currentAvg - prevAvg;
    const cgpaTrendScore = Math.min(100, Math.max(0, 50 + improvement * 5)); // Each 1% improvement = 5 points

    // Exam improvement score
    const examImprovementScore = Math.min(100, Math.max(0, 50 + improvement * 3));

    // Assignment completion (placeholder - would need assignment tracking)
    const assignmentScore = 70; // Default, would be calculated from actual data

    // Weighted academic score
    const academicScore = (cgpaTrendScore * 0.4) + (examImprovementScore * 0.4) + (assignmentScore * 0.2);

    return {
      score: Math.round(academicScore),
      breakdown: {
        cgpaTrend: Math.round(cgpaTrendScore),
        examImprovement: Math.round(examImprovementScore),
        assignments: assignmentScore,
      },
      details: {
        currentAverage: Math.round(currentAvg * 10) / 10,
        previousAverage: Math.round(prevAvg * 10) / 10,
        improvement: Math.round(improvement * 10) / 10,
        examsTaken: examResults.length,
      },
      hasData: examResults.length > 0,
    };
  }

  /**
   * Calculate Engagement Score (30% weight)
   */
  private async calculateEngagementScore(
    tenantId: string,
    studentId: string,
    month: number,
    year: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get club memberships
    const clubMemberships = await this.prisma.clubMember.count({
      where: {
        studentId,
        club: { tenantId },
        status: 'active',
      },
    });

    // Get event registrations for the month (sports and club events)
    const eventRegistrations = await this.prisma.eventRegistration.count({
      where: {
        studentId,
        tenantId,
        attended: true,
        OR: [
          {
            sportsEvent: {
              startDate: { gte: startDate, lte: endDate },
            },
          },
          {
            clubEvent: {
              startDate: { gte: startDate, lte: endDate },
            },
          },
        ],
      },
    });

    // Get attendance rate
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        studentId,
        tenantId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const totalClasses = attendanceRecords.length || 1;
    const presentClasses = attendanceRecords.filter(a => a.status === 'present').length;
    const attendanceRate = (presentClasses / totalClasses) * 100;

    // Club activity score (0-2 clubs = proportional, 3+ = 100)
    const clubActivityScore = Math.min(100, clubMemberships * 40);

    // Events score (each event = 20 points, max 100)
    const eventsScore = Math.min(100, eventRegistrations * 20);

    // Attendance score
    const attendanceScore = attendanceRate;

    // Weighted engagement score
    const engagementScore = (clubActivityScore * 0.3) + (eventsScore * 0.3) + (attendanceScore * 0.4);

    return {
      score: Math.round(engagementScore),
      breakdown: {
        clubActivity: Math.round(clubActivityScore),
        eventsAttended: Math.round(eventsScore),
        attendanceRate: Math.round(attendanceScore),
      },
      details: {
        activeClubs: clubMemberships,
        eventsThisMonth: eventRegistrations,
        attendancePercentage: Math.round(attendanceRate * 10) / 10,
        classesAttended: presentClasses,
        totalClasses,
      },
      hasData: attendanceRecords.length > 0 || clubMemberships > 0,
    };
  }

  /**
   * Calculate Skills Score (20% weight)
   */
  private async calculateSkillsScore(
    tenantId: string,
    studentId: string,
    month: number,
    year: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get achievements (certifications, awards)
    const achievements = await this.prisma.achievement.findMany({
      where: {
        studentId,
        tenantId,
        // achievedAt within the period or recent
      },
    });

    const certifications = achievements.filter(a => a.type === 'certification').length;
    const awards = achievements.filter(a => a.type === 'award').length;

    // Count internships and projects from achievements
    // Using achievement categories: 'technical' for projects, checking for 'internship' type
    const projectAchievements = achievements.filter(a => a.category === 'technical').length;

    // Check if student has any internship-related achievements or career profile
    const careerProfile = await this.prisma.careerProfile.findFirst({
      where: { studentId },
    });

    // Count internships from achievements (type containing 'internship')
    const internshipAchievements = achievements.filter(a =>
      a.type.toLowerCase().includes('internship') ||
      a.title.toLowerCase().includes('internship')
    ).length;

    const hasInternship = internshipAchievements > 0;
    const projectCount = projectAchievements;

    // Certification score (each = 25 points, max 100)
    const certificationScore = Math.min(100, certifications * 25);

    // Project score (each = 20 points, max 100)
    const projectScore = Math.min(100, projectCount * 20);

    // Internship score (binary but weighted)
    const internshipScore = hasInternship ? 100 : 0;

    // Weighted skills score
    const skillsScore = (certificationScore * 0.4) + (projectScore * 0.3) + (internshipScore * 0.3);

    return {
      score: Math.round(skillsScore),
      breakdown: {
        certifications: Math.round(certificationScore),
        projects: Math.round(projectScore),
        internships: Math.round(internshipScore),
      },
      details: {
        certificationsCount: certifications,
        projectsCount: projectCount,
        hasInternship,
        awardsCount: awards,
      },
      hasData: achievements.length > 0 || careerProfile !== null,
    };
  }

  /**
   * Calculate Behavioral Score (10% weight)
   */
  private async calculateBehavioralScore(
    tenantId: string,
    studentId: string,
    month: number,
    year: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get feedback summaries (will be populated once feedback system is active)
    const feedbackSummary = await this.prisma.feedbackSummary.findFirst({
      where: {
        studentId,
        tenantId,
        month,
        year,
      },
    });

    // Get attendance for punctuality (on-time vs late)
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        studentId,
        tenantId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const totalRecords = attendanceRecords.length || 1;
    const onTimeRecords = attendanceRecords.filter(a => a.status === 'present').length;
    const punctualityRate = (onTimeRecords / totalRecords) * 100;

    // Feedback score (from 360 feedback)
    const feedbackScore = feedbackSummary?.overallScore
      ? Number(feedbackSummary.overallScore) * 20 // Convert 1-5 to 0-100
      : 70; // Default if no feedback

    // Punctuality score
    const punctualityScore = punctualityRate;

    // Discipline score (placeholder - would track incidents)
    const disciplineScore = 80; // Default, would be calculated from discipline records

    // Weighted behavioral score
    const behavioralScore = (feedbackScore * 0.5) + (punctualityScore * 0.3) + (disciplineScore * 0.2);

    return {
      score: Math.round(behavioralScore),
      breakdown: {
        feedbackScore: Math.round(feedbackScore),
        punctuality: Math.round(punctualityScore),
        discipline: disciplineScore,
      },
      details: {
        feedbackRating: feedbackSummary?.overallScore || 'N/A',
        punctualityPercentage: Math.round(punctualityRate * 10) / 10,
        disciplineIncidents: 0,
      },
      hasData: feedbackSummary !== null || attendanceRecords.length > 0,
    };
  }

  /**
   * Calculate weighted SGI score
   */
  private calculateWeightedScore(
    scores: SgiComponentScores,
    config: { sgiAcademicWeight: number; sgiEngagementWeight: number; sgiSkillsWeight: number; sgiBehavioralWeight: number },
  ): number {
    return (
      (scores.academicScore * config.sgiAcademicWeight / 100) +
      (scores.engagementScore * config.sgiEngagementWeight / 100) +
      (scores.skillsScore * config.sgiSkillsWeight / 100) +
      (scores.behavioralScore * config.sgiBehavioralWeight / 100)
    );
  }

  /**
   * Get previous month's SGI for trend calculation
   */
  private async getPreviousSgi(
    tenantId: string,
    studentId: string,
    month: number,
    year: number,
  ): Promise<number | null> {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const previousSgi = await this.prisma.studentGrowthIndex.findFirst({
      where: {
        tenantId,
        studentId,
        month: prevMonth,
        year: prevYear,
      },
    });

    return previousSgi?.sgiScore ?? null;
  }

  /**
   * Calculate trend based on previous SGI
   */
  private calculateTrend(
    currentScore: number,
    previousScore: number | null,
  ): { trend: 'improving' | 'stable' | 'declining'; trendDelta: number } {
    if (previousScore === null) {
      return { trend: 'stable', trendDelta: 0 };
    }

    const delta = currentScore - previousScore;

    if (delta > 3) {
      return { trend: 'improving', trendDelta: delta };
    } else if (delta < -3) {
      return { trend: 'declining', trendDelta: delta };
    } else {
      return { trend: 'stable', trendDelta: delta };
    }
  }

  /**
   * Calculate data completeness score
   */
  private calculateDataCompleteness(...componentData: Array<{ hasData: boolean }>): number {
    const hasDataCount = componentData.filter(d => d.hasData).length;
    return hasDataCount / componentData.length;
  }

  /**
   * Generate natural language insights
   */
  private generateInsights(
    scores: SgiComponentScores,
    trend: string,
    trendDelta: number,
    studentName: string,
  ): string {
    const insights: string[] = [];

    // Trend insight
    if (trend === 'improving') {
      insights.push(`Great progress! Your SGI improved by ${Math.abs(trendDelta).toFixed(1)} points this month.`);
    } else if (trend === 'declining') {
      insights.push(`Your SGI dropped by ${Math.abs(trendDelta).toFixed(1)} points. Let's identify areas for improvement.`);
    }

    // Strongest area
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const strongest = sortedScores[0][0].replace('Score', '');
    insights.push(`Your strongest area is ${strongest} (${sortedScores[0][1]} points).`);

    // Area needing attention
    const weakest = sortedScores[sortedScores.length - 1][0].replace('Score', '');
    if (sortedScores[sortedScores.length - 1][1] < 50) {
      insights.push(`Focus on improving your ${weakest} to boost your overall growth.`);
    }

    return insights.join(' ');
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    scores: SgiComponentScores,
    academicData: any,
    engagementData: any,
    skillsData: any,
    behavioralData: any,
  ): Array<{ category: string; action: string; priority: string }> {
    const recommendations: Array<{ category: string; action: string; priority: string }> = [];

    // Academic recommendations
    if (scores.academicScore < 60) {
      recommendations.push({
        category: 'academic',
        action: 'Schedule extra study sessions or seek tutoring for challenging subjects',
        priority: 'high',
      });
    }

    // Engagement recommendations
    if (engagementData.details.activeClubs < 1) {
      recommendations.push({
        category: 'engagement',
        action: 'Join a club or extracurricular activity that aligns with your interests',
        priority: 'medium',
      });
    }

    if (engagementData.details.attendancePercentage < 85) {
      recommendations.push({
        category: 'engagement',
        action: 'Improve attendance - aim for at least 90% to maximize learning opportunities',
        priority: 'high',
      });
    }

    // Skills recommendations
    if (skillsData.details.certificationsCount < 1) {
      recommendations.push({
        category: 'skills',
        action: 'Complete an online certification in your field of study',
        priority: 'medium',
      });
    }

    if (!skillsData.details.hasInternship) {
      recommendations.push({
        category: 'career',
        action: 'Apply for internship opportunities to gain industry experience',
        priority: 'high',
      });
    }

    // Behavioral recommendations
    if (scores.behavioralScore < 60) {
      recommendations.push({
        category: 'behavioral',
        action: 'Focus on punctuality and active participation in class',
        priority: 'medium',
      });
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Get or create index configuration for tenant
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
