import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsObject,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

// ============ ENUMS ============

export enum Framework {
  NBA = 'NBA',
  NAAC = 'NAAC',
  NIRF = 'NIRF',
}

export enum ReportStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
}

export enum Trend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
}

// NBA Categories
export enum NbaCategory {
  VISION_MISSION = 'Vision, Mission and Program Educational Objectives',
  PROGRAM_OUTCOMES = 'Program Outcomes',
  PROGRAM_CURRICULUM = 'Program Curriculum',
  STUDENTS = 'Students',
  FACULTY = 'Faculty',
  FACILITIES = 'Facilities and Technical Staff',
  CONTINUOUS_IMPROVEMENT = 'Continuous Improvement',
  FIRST_YEAR = 'First Year Academics',
  STUDENT_SUPPORT = 'Student Support Systems',
  GOVERNANCE = 'Governance, Institutional Support and Financial Resources',
}

// NAAC Categories (Criteria)
export enum NaacCategory {
  CURRICULAR_ASPECTS = 'Curricular Aspects',
  TEACHING_LEARNING = 'Teaching-Learning and Evaluation',
  RESEARCH_INNOVATION = 'Research, Innovations and Extension',
  INFRASTRUCTURE = 'Infrastructure and Learning Resources',
  STUDENT_SUPPORT = 'Student Support and Progression',
  GOVERNANCE_LEADERSHIP = 'Governance, Leadership and Management',
  INSTITUTIONAL_VALUES = 'Institutional Values and Best Practices',
}

// NIRF Parameters
export enum NirfCategory {
  TLR = 'Teaching, Learning & Resources',
  RP = 'Research and Professional Practice',
  GO = 'Graduation Outcomes',
  OI = 'Outreach and Inclusivity',
  PERCEPTION = 'Perception',
}

// ============ METRIC DTOs ============

export class CreateMetricDto {
  @IsEnum(Framework)
  framework: Framework;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  criterionCode: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  criterionName: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @Min(0)
  maxScore: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weightage?: number;

  @IsOptional()
  @IsString()
  dataSource?: string;

  @IsOptional()
  @IsString()
  calculationFormula?: string;

  @IsOptional()
  @IsObject()
  mappedEntities?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  minThreshold?: number;

  @IsOptional()
  @IsNumber()
  maxThreshold?: number;
}

export class UpdateMetricDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  criterionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weightage?: number;

  @IsOptional()
  @IsString()
  dataSource?: string;

  @IsOptional()
  @IsString()
  calculationFormula?: string;

  @IsOptional()
  @IsObject()
  mappedEntities?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  minThreshold?: number;

  @IsOptional()
  @IsNumber()
  maxThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryMetricsDto {
  @IsOptional()
  @IsEnum(Framework)
  framework?: Framework;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ============ VALUE DTOs ============

export class CreateValueDto {
  @IsString()
  metricId: string;

  @IsString()
  academicYear: string;

  @IsOptional()
  @IsNumber()
  rawValue?: number;

  @IsOptional()
  @IsNumber()
  normalizedValue?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsObject()
  supportingData?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}

export class UpdateValueDto {
  @IsOptional()
  @IsNumber()
  rawValue?: number;

  @IsOptional()
  @IsNumber()
  normalizedValue?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsObject()
  supportingData?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}

export class BulkUpdateValuesDto {
  @IsString()
  academicYear: string;

  @IsArray()
  values: {
    metricId: string;
    rawValue?: number;
    supportingData?: Record<string, any>;
    remarks?: string;
  }[];
}

export class QueryValuesDto {
  @IsOptional()
  @IsEnum(Framework)
  framework?: Framework;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  latestOnly?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ============ REPORT DTOs ============

export class CreateReportDto {
  @IsEnum(Framework)
  framework: Framework;

  @IsString()
  academicYear: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  reportUrl?: string;
}

export class QueryReportsDto {
  @IsOptional()
  @IsEnum(Framework)
  framework?: Framework;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ============ CALCULATION DTOs ============

export class CalculateFrameworkDto {
  @IsEnum(Framework)
  framework: Framework;

  @IsString()
  academicYear: string;

  @IsOptional()
  @IsBoolean()
  recalculate?: boolean;
}

export class CalculateCategoryDto {
  @IsEnum(Framework)
  framework: Framework;

  @IsString()
  category: string;

  @IsString()
  academicYear: string;
}

// ============ RESPONSE DTOs ============

export class MetricWithValueDto {
  id: string;
  framework: Framework;
  criterionCode: string;
  criterionName: string;
  category: string;
  description?: string;
  maxScore: number;
  weightage: number;
  minThreshold?: number;
  maxThreshold?: number;
  currentValue?: {
    rawValue?: number;
    normalizedValue?: number;
    score?: number;
    trend?: Trend;
    previousValue?: number;
    academicYear: string;
  };
}

export class CategorySummaryDto {
  category: string;
  totalMetrics: number;
  completedMetrics: number;
  totalMaxScore: number;
  currentScore: number;
  percentage: number;
  trend: Trend;
  metrics: MetricWithValueDto[];
}

export class FrameworkSummaryDto {
  framework: Framework;
  academicYear: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade?: string; // For NAAC
  rank?: number; // For NIRF
  categories: CategorySummaryDto[];
  trend: Trend;
  previousYearScore?: number;
  completionPercentage: number;
}

export class DashboardSummaryDto {
  nba?: FrameworkSummaryDto;
  naac?: FrameworkSummaryDto;
  nirf?: FrameworkSummaryDto;
  overallHealth: 'excellent' | 'good' | 'needs_attention' | 'critical';
  pendingActions: {
    framework: Framework;
    category: string;
    metric: string;
    action: string;
  }[];
  recentUpdates: {
    metricName: string;
    framework: Framework;
    oldValue?: number;
    newValue: number;
    updatedAt: string;
  }[];
}

export class ComparisonDto {
  framework: Framework;
  academicYear1: string;
  academicYear2: string;
  year1Score: number;
  year2Score: number;
  change: number;
  changePercent: number;
  categoryComparison: {
    category: string;
    year1Score: number;
    year2Score: number;
    change: number;
  }[];
}

// ============ DATA COLLECTION DTOs ============

export class DataCollectionStatusDto {
  framework: Framework;
  academicYear: string;
  categories: {
    category: string;
    totalMetrics: number;
    collectedMetrics: number;
    verifiedMetrics: number;
    pendingMetrics: string[];
  }[];
  overallProgress: number;
  lastUpdated?: string;
}

export class MetricDataSourceDto {
  metricId: string;
  criterionCode: string;
  criterionName: string;
  dataSource: string;
  currentValue?: number;
  calculatedValue?: number;
  lastCalculated?: string;
  needsRecalculation: boolean;
}

// ============ SEEDING DTOs ============

export class SeedFrameworkDto {
  @IsEnum(Framework)
  framework: Framework;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}
