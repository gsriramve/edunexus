import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamType {
  INTERNAL_1 = 'internal_1',
  INTERNAL_2 = 'internal_2',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  MID_SEMESTER = 'mid_semester',
  END_SEMESTER = 'end_semester',
  PRACTICAL = 'practical',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
}

export class QueryExamsDto {
  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

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

  @IsString()
  type: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(300)
  @Type(() => Number)
  durationMinutes?: number;

  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  maxMarks: number;

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

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;
}

export class UpdateExamStatusDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
