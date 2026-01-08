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

export enum GuidanceType {
  MONTHLY_PLAN = 'monthly_plan',
  ALERT = 'alert',
  RECOMMENDATION = 'recommendation',
  MILESTONE = 'milestone',
  TIP = 'tip',
}

export enum GuidanceCategory {
  ACADEMIC = 'academic',
  CAREER = 'career',
  ENGAGEMENT = 'engagement',
  BEHAVIORAL = 'behavioral',
  SKILL = 'skill',
}

export enum GuidancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum GuidanceStatus {
  ACTIVE = 'active',
  VIEWED = 'viewed',
  DISMISSED = 'dismissed',
  COMPLETED = 'completed',
}

export enum GoalCategory {
  ACADEMIC = 'academic',
  CAREER = 'career',
  SKILL = 'skill',
  EXTRACURRICULAR = 'extracurricular',
  PERSONAL = 'personal',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  OVERDUE = 'overdue',
}

export enum AlertType {
  ATTENDANCE_DROP = 'attendance_drop',
  GRADE_DECLINE = 'grade_decline',
  ACTIVITY_DROP = 'activity_drop',
  FEEDBACK_CONCERN = 'feedback_concern',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

// ============================================
// Action Item & Resource Types
// ============================================

export class ActionItemDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class ResourceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  type?: string; // video, article, course, book
}

export class MilestoneDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class SuggestedActionDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string; // role or userId
}

// ============================================
// AI Guidance DTOs
// ============================================

export class CreateGuidanceDto {
  @IsString()
  studentId: string;

  @IsEnum(GuidanceType)
  guidanceType: GuidanceType;

  @IsEnum(GuidanceCategory)
  category: GuidanceCategory;

  @IsOptional()
  @IsEnum(GuidancePriority)
  priority?: GuidancePriority = GuidancePriority.MEDIUM;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionItemDto)
  actionItems?: ActionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  resources?: ResourceDto[];

  @IsOptional()
  @IsString()
  triggerReason?: string;

  @IsOptional()
  @IsString()
  triggerMetric?: string;

  @IsOptional()
  @IsNumber()
  triggerValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateGuidanceDto {
  @IsOptional()
  @IsEnum(GuidanceStatus)
  status?: GuidanceStatus;

  @IsOptional()
  @IsBoolean()
  wasHelpful?: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class GuidanceQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(GuidanceType)
  guidanceType?: GuidanceType;

  @IsOptional()
  @IsEnum(GuidanceCategory)
  category?: GuidanceCategory;

  @IsOptional()
  @IsEnum(GuidancePriority)
  priority?: GuidancePriority;

  @IsOptional()
  @IsEnum(GuidanceStatus)
  status?: GuidanceStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activeOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

// ============================================
// Student Goal DTOs
// ============================================

export class CreateGoalDto {
  @IsString()
  studentId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(GoalCategory)
  category: GoalCategory;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isAiSuggested?: boolean;

  @IsOptional()
  @IsBoolean()
  isMentorAssigned?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];
}

export class GoalQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(GoalCategory)
  category?: GoalCategory;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAiSuggested?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isMentorAssigned?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

// ============================================
// Disengagement Alert DTOs
// ============================================

export class CreateAlertDto {
  @IsString()
  studentId: string;

  @IsEnum(AlertType)
  alertType: AlertType;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity = AlertSeverity.WARNING;

  @IsString()
  metricName: string;

  @IsNumber()
  currentValue: number;

  @IsOptional()
  @IsNumber()
  previousValue?: number;

  @IsNumber()
  thresholdValue: number;

  @IsOptional()
  @IsNumber()
  changePercent?: number;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestedActionDto)
  suggestedActions?: SuggestedActionDto[];
}

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class AlertQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(AlertType)
  alertType?: AlertType;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  unresolvedOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

// ============================================
// Generation DTOs
// ============================================

export class GenerateRecommendationsDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsBoolean()
  includeCareer?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeAcademic?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeEngagement?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeSkills?: boolean = true;
}

export class GenerateMonthlyPlanDto {
  @IsString()
  studentId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;
}

export class RunAlertDetectionDto {
  @IsOptional()
  @IsString()
  studentId?: string; // If not provided, run for all students

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(AlertType, { each: true })
  alertTypes?: AlertType[];
}

// ============================================
// Response DTOs
// ============================================

export class GuidanceResponseDto {
  id: string;
  studentId: string;
  studentName?: string;
  guidanceType: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  actionItems?: ActionItemDto[];
  resources?: ResourceDto[];
  triggerReason?: string;
  triggerMetric?: string;
  triggerValue?: number;
  confidenceScore?: number;
  status: string;
  viewedAt?: Date;
  wasHelpful?: boolean;
  feedback?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export class GoalResponseDto {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: Date;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  isAiSuggested: boolean;
  isMentorAssigned: boolean;
  assignedBy?: string;
  status: string;
  progress: number;
  milestones?: MilestoneDto[];
  completedAt?: Date;
  createdAt: Date;
}

export class AlertResponseDto {
  id: string;
  studentId: string;
  studentName?: string;
  departmentName?: string;
  alertType: string;
  severity: string;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  thresholdValue: number;
  changePercent?: number;
  timeframe?: string;
  description?: string;
  suggestedActions?: SuggestedActionDto[];
  status: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
}

export class GuidanceStatsDto {
  totalGuidance: number;
  activeGuidance: number;
  completedGuidance: number;
  helpfulCount: number;
  helpfulRate: number;
  byCategory: { category: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export class AlertStatsDto {
  totalAlerts: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  resolvedThisMonth: number;
  averageResolutionTime: number; // in hours
  byType: { type: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
  byDepartment: { departmentId: string; departmentName: string; count: number }[];
}

export class StudentGuidanceDashboardDto {
  studentId: string;
  activeGuidance: GuidanceResponseDto[];
  activeGoals: GoalResponseDto[];
  alerts: AlertResponseDto[];
  completedGoalsCount: number;
  guidanceCompletionRate: number;
  upcomingDeadlines: {
    type: 'goal' | 'action';
    title: string;
    deadline: Date;
  }[];
}
