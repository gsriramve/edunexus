import {
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// Enums
// ============================================

export enum EvaluatorType {
  FACULTY = 'faculty',
  MENTOR = 'mentor',
  PEER = 'peer',
  SELF = 'self',
}

export enum FeedbackCycleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  PROCESSED = 'processed',
}

// ============================================
// Feedback Cycle DTOs
// ============================================

export class CreateFeedbackCycleDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enablePeerFeedback?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableSelfAssessment?: boolean = true;

  @IsOptional()
  @IsBoolean()
  anonymousPeerFeedback?: boolean = true;
}

export class UpdateFeedbackCycleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FeedbackCycleStatus)
  status?: FeedbackCycleStatus;
}

export class FeedbackCycleQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsEnum(FeedbackCycleStatus)
  status?: FeedbackCycleStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export class FeedbackCycleResponseDto {
  id: string;
  tenantId: string;
  name: string;
  month: number;
  year: number;
  startDate: Date;
  endDate: Date;
  status: string;
  description?: string;
  totalEntries: number;
  submittedEntries: number;
  completionRate: number;
  createdAt: Date;
}

// ============================================
// Feedback Entry DTOs
// ============================================

export class FeedbackRatingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  academicRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  participationRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  teamworkRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  leadershipRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  punctualityRating?: number;
}

export class SubmitFeedbackDto extends FeedbackRatingsDto {
  @IsString()
  targetStudentId: string;

  @IsEnum(EvaluatorType)
  evaluatorType: EvaluatorType;

  @IsOptional()
  @IsString()
  evaluatorId?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvements?: string;

  @IsOptional()
  @IsString()
  additionalComments?: string;
}

export class UpdateFeedbackDto extends FeedbackRatingsDto {
  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvements?: string;

  @IsOptional()
  @IsString()
  additionalComments?: string;
}

export class FeedbackEntryQueryDto {
  @IsOptional()
  @IsString()
  cycleId?: string;

  @IsOptional()
  @IsString()
  targetStudentId?: string;

  @IsOptional()
  @IsString()
  evaluatorId?: string;

  @IsOptional()
  @IsEnum(EvaluatorType)
  evaluatorType?: EvaluatorType;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  submitted?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export class FeedbackEntryResponseDto {
  id: string;
  cycleId: string;
  targetStudentId: string;
  targetStudentName?: string;
  evaluatorType: string;
  evaluatorId?: string;
  evaluatorName?: string;
  isAnonymous: boolean;
  academicRating?: number;
  participationRating?: number;
  teamworkRating?: number;
  communicationRating?: number;
  leadershipRating?: number;
  punctualityRating?: number;
  strengths?: string;
  improvements?: string;
  rawAverageScore?: number;
  normalizedScore?: number;
  submittedAt?: Date;
}

// ============================================
// Feedback Summary DTOs
// ============================================

export class FeedbackSummaryQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  cycleId?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  month?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class FeedbackSummaryResponseDto {
  id: string;
  studentId: string;
  studentName?: string;
  cycleId: string;
  month: number;
  year: number;
  facultyAvgScore?: number;
  mentorAvgScore?: number;
  peerAvgScore?: number;
  selfScore?: number;
  overallScore?: number;
  aiSummary?: string;
  topStrengths?: string[];
  topImprovements?: string[];
  responseCount: {
    faculty: number;
    mentor: number;
    peer: number;
    self: number;
  };
}

// ============================================
// Bulk Operations DTOs
// ============================================

export class AssignFeedbackDto {
  @IsString()
  cycleId: string;

  @IsArray()
  @IsString({ each: true })
  targetStudentIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluatorAssignmentDto)
  evaluators: EvaluatorAssignmentDto[];
}

export class EvaluatorAssignmentDto {
  @IsEnum(EvaluatorType)
  type: EvaluatorType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evaluatorIds?: string[]; // For faculty/mentor - specific IDs

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  peerCount?: number; // For peer feedback - how many peers

  @IsOptional()
  @IsBoolean()
  includeSelf?: boolean; // For self assessment
}

export class ProcessCycleDto {
  @IsString()
  cycleId: string;

  @IsOptional()
  @IsBoolean()
  generateSummaries?: boolean = true;

  @IsOptional()
  @IsBoolean()
  calculateNormalization?: boolean = true;
}

// ============================================
// Stats DTOs
// ============================================

export class FeedbackStatsResponseDto {
  activeCycles: number;
  totalFeedbackEntries: number;
  pendingFeedback: number;
  completedFeedback: number;
  averageResponseRate: number;
  byEvaluatorType: {
    type: string;
    count: number;
    averageScore: number;
  }[];
  recentActivity: {
    date: string;
    count: number;
  }[];
}

// ============================================
// Pending Feedback DTOs
// ============================================

export class PendingFeedbackResponseDto {
  cycleId: string;
  cycleName: string;
  targetStudentId: string;
  targetStudentName: string;
  evaluatorType: string;
  dueDate: Date;
  isOverdue: boolean;
}

// ============================================
// Evaluator Bias DTOs
// ============================================

export class EvaluatorBiasDto {
  evaluatorId: string;
  evaluatorName?: string;
  evaluatorType: string;
  totalEvaluations: number;
  averageScore: number;
  standardDeviation: number;
  biasFactor: number; // >1 = lenient, <1 = strict, ~1 = neutral
  lastUpdated: Date;
}
