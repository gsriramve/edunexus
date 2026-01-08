import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsBoolean,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamType {
  INTERNAL_1 = 'internal_1',
  INTERNAL_2 = 'internal_2',
  MID_SEMESTER = 'mid_semester',
  END_SEMESTER = 'end_semester',
  PRACTICAL = 'practical',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
}

export enum ExamStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

export class QueryExamsDto {
  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsEnum(ExamType)
  type?: ExamType;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ScheduleExamDto {
  @IsString()
  @MinLength(1)
  subjectId: string;

  @IsEnum(ExamType)
  type: ExamType;

  @IsString()
  @MinLength(1)
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  @MinLength(1)
  startTime: string;

  @IsNumber()
  @Min(30)
  @Max(300)
  @Type(() => Number)
  durationMinutes: number;

  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  maxMarks: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  passingMarks: number;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  startTime?: string;

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(300)
  @Type(() => Number)
  durationMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  maxMarks?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  passingMarks?: number;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsEnum(ExamStatus)
  @IsOptional()
  status?: ExamStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;
}

export class UpdateExamStatusDto {
  @IsEnum(ExamStatus)
  status: ExamStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
