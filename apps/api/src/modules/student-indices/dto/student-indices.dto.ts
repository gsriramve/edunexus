import { IsOptional, IsInt, IsNumber, Min, Max, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// SGI (Student Growth Index) DTOs
// ============================================

export class SgiQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 12; // Default to 12 months of history

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class SgiBreakdownDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  cgpaTrend: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  examImprovement: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  assignments: number;
}

export class EngagementBreakdownDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  clubActivity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  eventsAttended: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  attendanceRate: number;
}

export class SkillsBreakdownDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  certifications: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  projects: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  internships: number;
}

export class BehavioralBreakdownDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  feedbackScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  punctuality: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discipline: number;
}

export class SgiRecommendationDto {
  @IsString()
  category: string;

  @IsString()
  action: string;

  @IsString()
  priority: 'low' | 'medium' | 'high';
}

export class CreateSgiDto {
  @IsString()
  studentId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  academicScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  engagementScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  skillsScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  behavioralScore: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SgiBreakdownDto)
  academicBreakdown?: SgiBreakdownDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EngagementBreakdownDto)
  engagementBreakdown?: EngagementBreakdownDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsBreakdownDto)
  skillsBreakdown?: SkillsBreakdownDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BehavioralBreakdownDto)
  behavioralBreakdown?: BehavioralBreakdownDto;

  @IsOptional()
  @IsString()
  insightsSummary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SgiRecommendationDto)
  recommendations?: SgiRecommendationDto[];
}

export class SgiResponseDto {
  id: string;
  studentId: string;
  month: number;
  year: number;
  sgiScore: number;
  sgiTrend: string;
  trendDelta: number;
  academicScore: number;
  engagementScore: number;
  skillsScore: number;
  behavioralScore: number;
  academicBreakdown: any;
  engagementBreakdown: any;
  skillsBreakdown: any;
  behavioralBreakdown: any;
  insightsSummary: string | null;
  recommendations: any;
  dataCompleteness: number;
  calculatedAt: Date;
}

// ============================================
// CRI (Career Readiness Index) DTOs
// ============================================

export class CriQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  latestOnly?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class SkillGapDto {
  @IsString()
  skill: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  currentLevel: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  requiredLevel: number;

  @IsString()
  priority: 'low' | 'medium' | 'high';
}

export class TargetRoleDto {
  @IsString()
  role: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  fitScore: number;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];
}

export class MatchingCompanyDto {
  @IsString()
  company: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  fitScore: number;

  @IsOptional()
  @IsInt()
  openings?: number;
}

export class ActionPlanItemDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsString()
  impact: 'low' | 'medium' | 'high';
}

export class CreateCriDto {
  @IsString()
  studentId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  resumeScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  interviewScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  skillRoleFitScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  industryExposureScore: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillGapDto)
  skillGaps?: SkillGapDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetRoleDto)
  targetRoles?: TargetRoleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchingCompanyDto)
  topMatchingCompanies?: MatchingCompanyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionPlanItemDto)
  actionPlan?: ActionPlanItemDto[];
}

export class CriResponseDto {
  id: string;
  studentId: string;
  criScore: number;
  placementProbability: number;
  salaryBand: string;
  resumeScore: number;
  interviewScore: number;
  skillRoleFitScore: number;
  industryExposureScore: number;
  skillGaps: SkillGapDto[] | null;
  targetRoles: TargetRoleDto[] | null;
  topMatchingCompanies: MatchingCompanyDto[] | null;
  actionPlan: ActionPlanItemDto[] | null;
  confidenceScore: number;
  assessmentDate: Date;
}

// ============================================
// Index Configuration DTOs
// ============================================

export class UpdateIndexConfigDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  sgiAcademicWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  sgiEngagementWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  sgiSkillsWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  sgiBehavioralWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  criResumeWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  criInterviewWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  criSkillFitWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  criExposureWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sgiAlertThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  criAlertThreshold?: number;
}

// ============================================
// Dashboard/Stats DTOs
// ============================================

export class DepartmentSgiStatsDto {
  departmentId: string;
  departmentName: string;
  averageSgi: number;
  studentCount: number;
  improvingCount: number;
  decliningCount: number;
  stableCount: number;
}

export class BatchSgiStatsDto {
  batch: string;
  averageSgi: number;
  studentCount: number;
}

export class SgiStatsResponseDto {
  tenantAverageSgi: number;
  totalStudents: number;
  improvingCount: number;
  decliningCount: number;
  stableCount: number;
  byDepartment: DepartmentSgiStatsDto[];
  byBatch: BatchSgiStatsDto[];
  topPerformers: SgiResponseDto[];
  atRiskStudents: SgiResponseDto[];
}

export class CriStatsResponseDto {
  tenantAverageCri: number;
  totalStudents: number;
  placementReadyCount: number; // CRI >= 70
  needsImprovementCount: number; // CRI < 50
  averagePlacementProbability: number;
  salaryBandDistribution: Record<string, number>;
  byDepartment: {
    departmentId: string;
    departmentName: string;
    averageCri: number;
    studentCount: number;
  }[];
  topSkillGaps: {
    skill: string;
    studentsAffected: number;
  }[];
}

// ============================================
// Bulk Operations DTOs
// ============================================

export class BulkCalculateSgiDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;
}

export class BulkCalculateCriDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  batch?: string;
}
