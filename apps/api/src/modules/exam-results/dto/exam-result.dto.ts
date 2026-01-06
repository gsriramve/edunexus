import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamResultDto {
  @IsString()
  examId: string;

  @IsString()
  studentId: string;

  @IsNumber()
  @Min(0)
  marks: number;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  grade?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class SingleResultDto {
  @IsString()
  studentId: string;

  @IsNumber()
  @Min(0)
  marks: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class BulkCreateExamResultDto {
  @IsString()
  examId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleResultDto)
  results: SingleResultDto[];
}

export class UpdateExamResultDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  marks?: number;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  grade?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}

export class ExamResultQueryDto {
  @IsString()
  @IsOptional()
  examId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

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

export class SemesterResultDto {
  semester: number;
  sgpa: number;
  credits: number;
  subjects: SubjectResultDto[];
}

export class SubjectResultDto {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  exams: ExamResultDetailDto[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
}

export class ExamResultDetailDto {
  examId: string;
  examName: string;
  examType: string;
  date: Date;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
}
