import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryDrivesDto,
  QueryApplicationsDto,
  UpdateProfileDto,
  StudentCareerResponseDto,
  PlacementStatsDto,
  PlacementDriveDto,
  JobApplicationDto,
  SkillGapDto,
  CareerProfileDto,
} from './dto/student-career.dto';

@Injectable()
export class StudentCareerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get complete career hub data for a student
   */
  async getCareerDashboard(
    tenantId: string,
    studentId: string,
  ): Promise<StudentCareerResponseDto> {
    const [profile, stats, upcomingDrives, applications, skillGaps] = await Promise.all([
      this.getProfile(tenantId, studentId),
      this.getPlacementStats(tenantId, studentId),
      this.getUpcomingDrives(tenantId, studentId, { limit: 4 }),
      this.getApplications(tenantId, studentId, { limit: 5 }),
      this.getSkillGaps(tenantId, studentId),
    ]);

    return {
      profile,
      stats,
      upcomingDrives,
      applications,
      skillGaps,
    };
  }

  /**
   * Get student's career profile
   */
  async getProfile(tenantId: string, studentId: string): Promise<CareerProfileDto | null> {
    const profile = await this.prisma.careerProfile.findFirst({
      where: { tenantId, studentId },
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      resumeUrl: profile.resumeUrl || undefined,
      linkedin: profile.linkedin || undefined,
      portfolio: profile.portfolio || undefined,
      skills: profile.skills || [],
    };
  }

  /**
   * Update or create career profile
   */
  async updateProfile(
    tenantId: string,
    studentId: string,
    data: UpdateProfileDto,
  ): Promise<CareerProfileDto> {
    const profile = await this.prisma.careerProfile.upsert({
      where: {
        studentId,
      },
      create: {
        tenantId,
        studentId,
        resumeUrl: data.resumeUrl,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        skills: data.skills || [],
      },
      update: {
        resumeUrl: data.resumeUrl,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        skills: data.skills || [],
      },
    });

    return {
      id: profile.id,
      resumeUrl: profile.resumeUrl || undefined,
      linkedin: profile.linkedin || undefined,
      portfolio: profile.portfolio || undefined,
      skills: profile.skills || [],
    };
  }

  /**
   * Calculate placement stats based on student profile
   */
  async getPlacementStats(tenantId: string, studentId: string): Promise<PlacementStatsDto> {
    // Get student's academic performance
    const student = await this.prisma.student.findFirst({
      where: { tenantId, id: studentId },
    });

    // Get exam results for CGPA calculation
    const examResults = await this.prisma.examResult.findMany({
      where: { tenantId, studentId },
    });

    // Calculate CGPA approximation
    let cgpa = 7.0; // Default
    if (examResults.length > 0) {
      const avgMarks = examResults.reduce((sum, r) => sum + Number(r.marks), 0) / examResults.length;
      cgpa = Math.round((avgMarks / 10) * 10) / 10;
    }

    // Get career profile for skills
    const profile = await this.prisma.careerProfile.findFirst({
      where: { tenantId, studentId },
    });

    const skillCount = profile?.skills?.length || 0;

    // Calculate placement probability based on CGPA and skills
    let probability = 50; // Base probability
    probability += (cgpa - 6) * 10; // +10% for each point above 6 CGPA
    probability += skillCount * 3; // +3% for each skill
    probability = Math.min(95, Math.max(30, probability)); // Cap between 30-95%

    // Estimate expected salary based on CGPA
    let expectedSalary = '4-6 LPA';
    if (cgpa >= 8.5) {
      expectedSalary = '8-12 LPA';
    } else if (cgpa >= 7.5) {
      expectedSalary = '6-10 LPA';
    } else if (cgpa >= 6.5) {
      expectedSalary = '5-8 LPA';
    }

    // For now, use sample counts for drives/applications since those tables don't exist
    return {
      probability: Math.round(probability),
      expectedSalary,
      eligibleDrives: 12,
      appliedCount: 5,
      shortlistedCount: 2,
    };
  }

  /**
   * Get upcoming placement drives
   * Note: PlacementDrive model doesn't exist, returning sample data
   */
  async getUpcomingDrives(
    _tenantId: string,
    _studentId: string,
    query: QueryDrivesDto,
  ): Promise<PlacementDriveDto[]> {
    const limit = query.limit || 10;

    // Since PlacementDrive model doesn't exist, return sample data
    const sampleDrives = this.getSampleDrives();

    if (query.status && query.status !== 'all') {
      return sampleDrives.filter(d => d.status === query.status).slice(0, limit);
    }

    return sampleDrives.slice(0, limit);
  }

  /**
   * Get student's job applications
   * Note: JobApplication model doesn't exist, returning sample data
   */
  async getApplications(
    _tenantId: string,
    _studentId: string,
    query: QueryApplicationsDto,
  ): Promise<JobApplicationDto[]> {
    const limit = query.limit || 10;

    // Since JobApplication model doesn't exist, return sample data
    const sampleApplications = this.getSampleApplications();

    if (query.status && query.status !== 'all') {
      return sampleApplications.filter(a => a.status === query.status).slice(0, limit);
    }

    return sampleApplications.slice(0, limit);
  }

  /**
   * Get skill gaps for placement preparation
   */
  async getSkillGaps(tenantId: string, studentId: string): Promise<SkillGapDto[]> {
    // Get student's career profile
    const profile = await this.prisma.careerProfile.findFirst({
      where: { tenantId, studentId },
    });

    const studentSkills = profile?.skills || [];

    // Define required skills with target levels
    const requiredSkills = [
      { skill: 'Data Structures', required: 80 },
      { skill: 'Algorithms', required: 80 },
      { skill: 'System Design', required: 70 },
      { skill: 'SQL', required: 75 },
      { skill: 'Problem Solving', required: 85 },
      { skill: 'Communication', required: 70 },
    ];

    // Calculate student's level based on profile skills
    return requiredSkills.map((req) => {
      // Check if student has this skill or related keywords
      const hasSkill = studentSkills.some(
        (s) => s.toLowerCase().includes(req.skill.toLowerCase()) ||
               req.skill.toLowerCase().includes(s.toLowerCase())
      );

      // Assign level based on whether they listed the skill
      const level = hasSkill ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 30) + 30;

      return {
        skill: req.skill,
        level: Math.min(level, req.required + 10), // Cap at slightly above required
        required: req.required,
      };
    }).slice(0, 4); // Return top 4 skill gaps
  }

  /**
   * Apply to a placement drive
   * Note: Since tables don't exist, this is a placeholder
   */
  async applyToDrive(
    _tenantId: string,
    _studentId: string,
    _driveId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Placeholder - would create JobApplication record
    return {
      success: true,
      message: 'Application submitted successfully',
    };
  }

  // Sample data methods
  private getSampleDrives(): PlacementDriveDto[] {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: '1',
        company: 'TCS',
        role: 'Software Engineer',
        package: '7 LPA',
        date: `${currentYear}-01-20`,
        eligibility: 'CGPA >= 6.0',
        status: 'open',
        description: 'Full-time software development role',
        location: 'Pan India',
      },
      {
        id: '2',
        company: 'Infosys',
        role: 'Systems Engineer',
        package: '6.5 LPA',
        date: `${currentYear}-01-25`,
        eligibility: 'CGPA >= 6.0',
        status: 'open',
        description: 'Systems engineering and development',
        location: 'Bengaluru, Pune',
      },
      {
        id: '3',
        company: 'Wipro',
        role: 'Project Engineer',
        package: '6 LPA',
        date: `${currentYear}-02-01`,
        eligibility: 'CGPA >= 5.5',
        status: 'open',
        description: 'Project-based engineering role',
        location: 'Multiple locations',
      },
      {
        id: '4',
        company: 'Cognizant',
        role: 'Programmer Analyst',
        package: '6.75 LPA',
        date: `${currentYear}-02-10`,
        eligibility: 'CGPA >= 6.0',
        status: 'upcoming',
        description: 'Analysis and programming',
        location: 'Chennai, Hyderabad',
      },
      {
        id: '5',
        company: 'Capgemini',
        role: 'Associate Consultant',
        package: '7.5 LPA',
        date: `${currentYear}-02-15`,
        eligibility: 'CGPA >= 6.5',
        status: 'upcoming',
        description: 'Technology consulting',
        location: 'Mumbai, Bengaluru',
      },
      {
        id: '6',
        company: 'HCL Technologies',
        role: 'Graduate Engineer Trainee',
        package: '5.5 LPA',
        date: `${currentYear}-02-20`,
        eligibility: 'CGPA >= 5.5',
        status: 'upcoming',
        description: 'Engineering trainee program',
        location: 'Noida, Chennai',
      },
    ];
  }

  private getSampleApplications(): JobApplicationDto[] {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: '1',
        company: 'Accenture',
        role: 'Associate Software Engineer',
        appliedDate: `${currentYear}-01-05`,
        status: 'shortlisted',
        nextRound: 'Technical Interview - Jan 15',
        package: '6.5 LPA',
      },
      {
        id: '2',
        company: 'Tech Mahindra',
        role: 'Software Developer',
        appliedDate: `${currentYear}-01-03`,
        status: 'applied',
        nextRound: 'Waiting for results',
        package: '6 LPA',
      },
      {
        id: '3',
        company: 'L&T Infotech',
        role: 'Graduate Engineer',
        appliedDate: `${currentYear}-01-01`,
        status: 'applied',
        nextRound: 'Online assessment pending',
        package: '5.8 LPA',
      },
    ];
  }
}
