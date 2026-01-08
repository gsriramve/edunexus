import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ ENUMS ============

export enum MilestoneType {
  ADMISSION = 'admission',
  SEMESTER_START = 'semester_start',
  SEMESTER_END = 'semester_end',
  EXAM = 'exam',
  INTERNSHIP = 'internship',
  PLACEMENT = 'placement',
  ACHIEVEMENT = 'achievement',
  GRADUATION = 'graduation',
  PROJECT = 'project',
  CERTIFICATION = 'certification',
  CLUB_JOINED = 'club_joined',
  LEADERSHIP_ROLE = 'leadership_role',
  COMPETITION = 'competition',
  WORKSHOP = 'workshop',
  BACKLOG_CLEARED = 'backlog_cleared',
  DEAN_LIST = 'dean_list',
  SCHOLARSHIP = 'scholarship',
  CUSTOM = 'custom',
}

export enum MilestoneCategory {
  ACADEMIC = 'academic',
  CAREER = 'career',
  EXTRACURRICULAR = 'extracurricular',
  PERSONAL = 'personal',
  SKILL = 'skill',
}

export enum LinkedEntityType {
  EXAM = 'exam',
  EXAM_RESULT = 'exam_result',
  ACHIEVEMENT = 'achievement',
  INTERNSHIP = 'internship',
  PLACEMENT_OFFER = 'placement_offer',
  CLUB_MEMBERSHIP = 'club_membership',
  CERTIFICATE = 'certificate',
  PROJECT = 'project',
  SPORTS_ACHIEVEMENT = 'sports_achievement',
}

// ============ SNAPSHOT DATA ============

export class MilestoneSnapshotDataDto {
  @IsOptional()
  @IsNumber()
  cgpa?: number;

  @IsOptional()
  @IsNumber()
  sgpa?: number;

  @IsOptional()
  @IsNumber()
  sgiScore?: number;

  @IsOptional()
  @IsNumber()
  criScore?: number;

  @IsOptional()
  @IsNumber()
  attendance?: number;

  @IsOptional()
  @IsNumber()
  backlogs?: number;

  @IsOptional()
  @IsNumber()
  achievementsCount?: number;

  @IsOptional()
  @IsNumber()
  clubsActive?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============ MILESTONE DTOs ============

export class CreateMilestoneDto {
  @IsString()
  studentId: string;

  @IsEnum(MilestoneType)
  milestoneType: MilestoneType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredAt: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => MilestoneSnapshotDataDto)
  snapshotData?: MilestoneSnapshotDataDto;

  @IsOptional()
  @IsEnum(MilestoneCategory)
  category?: MilestoneCategory;

  @IsOptional()
  @IsBoolean()
  isPositive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(LinkedEntityType)
  linkedEntityType?: LinkedEntityType;

  @IsOptional()
  @IsString()
  linkedEntityId?: string;
}

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsEnum(MilestoneCategory)
  category?: MilestoneCategory;

  @IsOptional()
  @IsBoolean()
  isPositive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MilestoneSnapshotDataDto)
  snapshotData?: MilestoneSnapshotDataDto;
}

export class QueryMilestonesDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(MilestoneType)
  milestoneType?: MilestoneType;

  @IsOptional()
  @IsEnum(MilestoneCategory)
  category?: MilestoneCategory;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPositive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;
}

// ============ SEMESTER SNAPSHOT DTOs ============

export class CreateSemesterSnapshotDto {
  @IsString()
  studentId: string;

  @IsString()
  academicYear: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  semester: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  sgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  backlogs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallAttendance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  endSgiScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  endCriScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  clubsActive?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  eventsAttended?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  achievementsCount?: number;

  @IsOptional()
  @IsNumber()
  departmentAvgCgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  batchRank?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  batchSize?: number;
}

export class UpdateSemesterSnapshotDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  sgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  backlogs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallAttendance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  endSgiScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  endCriScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  clubsActive?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  eventsAttended?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  achievementsCount?: number;

  @IsOptional()
  @IsNumber()
  departmentAvgCgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  batchRank?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  batchSize?: number;
}

export class QuerySemesterSnapshotsDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number;
}

// ============ TIMELINE DTOs ============

export class TimelineItemDto {
  id: string;
  type: 'milestone' | 'snapshot';
  date: Date;
  title: string;
  description?: string;
  category: string;
  isPositive: boolean;
  academicYear?: string;
  semester?: number;
  snapshotData?: MilestoneSnapshotDataDto;
  linkedEntity?: {
    type: string;
    id: string;
  };
}

export class TimelineFilterDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(MilestoneCategory, { each: true })
  categories?: MilestoneCategory[];

  @IsOptional()
  @IsArray()
  @IsEnum(MilestoneType, { each: true })
  milestoneTypes?: MilestoneType[];

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSnapshots?: boolean;
}

export class JourneyStatsDto {
  totalMilestones: number;
  positiveMilestones: number;
  negativeMilestones: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  semestersCompleted: number;
  currentCgpa?: number;
  cgpaTrend: 'improving' | 'stable' | 'declining';
  highlights: Array<{
    title: string;
    date: Date;
    type: string;
  }>;
}

export class GenerateSnapshotDto {
  @IsString()
  studentId: string;

  @IsString()
  academicYear: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  semester: number;
}

export class BulkGenerateSnapshotsDto {
  @IsString()
  academicYear: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  semester: number;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  batch?: string;
}

// ============ AUTO-MILESTONE DTOs ============

export class AutoMilestoneConfigDto {
  @IsOptional()
  @IsBoolean()
  onExamResult?: boolean;

  @IsOptional()
  @IsBoolean()
  onAchievement?: boolean;

  @IsOptional()
  @IsBoolean()
  onPlacement?: boolean;

  @IsOptional()
  @IsBoolean()
  onInternship?: boolean;

  @IsOptional()
  @IsBoolean()
  onClubJoin?: boolean;

  @IsOptional()
  @IsBoolean()
  onCertification?: boolean;

  @IsOptional()
  @IsNumber()
  cgpaThresholdForDeanList?: number; // Auto-create dean's list milestone

  @IsOptional()
  @IsNumber()
  attendanceAlertThreshold?: number; // Create milestone if attendance drops
}

// ============ COMPARISON DTOs ============

export class SemesterComparisonDto {
  semester1: {
    academicYear: string;
    semester: number;
    snapshot?: CreateSemesterSnapshotDto;
  };
  semester2: {
    academicYear: string;
    semester: number;
    snapshot?: CreateSemesterSnapshotDto;
  };
  comparison: {
    cgpaChange: number;
    sgpaChange: number;
    attendanceChange: number;
    sgiChange: number;
    criChange: number;
    backlogsChange: number;
    clubsChange: number;
    achievementsChange: number;
  };
}

export class YearOverYearProgressDto {
  studentId: string;
  snapshots: Array<{
    academicYear: string;
    semester: number;
    cgpa: number;
    sgi: number;
    cri: number;
  }>;
  overallTrend: {
    cgpa: 'improving' | 'stable' | 'declining';
    sgi: 'improving' | 'stable' | 'declining';
    cri: 'improving' | 'stable' | 'declining';
  };
  projectedGraduationCgpa?: number;
}

// ============ EXPORT DTOs ============

export class ExportJourneyDto {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsEnum(['pdf', 'json', 'csv'])
  format?: 'pdf' | 'json' | 'csv';

  @IsOptional()
  @IsBoolean()
  includeSnapshots?: boolean;

  @IsOptional()
  @IsBoolean()
  includePrivateMilestones?: boolean;
}
