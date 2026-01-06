import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamType {
  INTERNAL = 'internal',
  MIDTERM = 'midterm',
  ENDSEM = 'endsem',
  PRACTICAL = 'practical',
  ASSIGNMENT = 'assignment',
  LAB = 'lab',
  VIVA = 'viva',
}

export class CreateExamDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  subjectId: string;

  @IsEnum(ExamType)
  type: ExamType;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(1)
  @Max(200)
  totalMarks: number;

  @IsNumber()
  @IsOptional()
  @Min(15)
  @Max(300)
  duration?: number; // Duration in minutes

  @IsString()
  @IsOptional()
  @MaxLength(100)
  venue?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  instructions?: string;
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsEnum(ExamType)
  @IsOptional()
  type?: ExamType;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  totalMarks?: number;

  @IsNumber()
  @IsOptional()
  @Min(15)
  @Max(300)
  duration?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  venue?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  instructions?: string;
}

export class ExamQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsEnum(ExamType)
  @IsOptional()
  type?: ExamType;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  semester?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class ExamStatsDto {
  total: number;
  upcoming: number;
  completed: number;
  byType: Record<string, number>;
}
