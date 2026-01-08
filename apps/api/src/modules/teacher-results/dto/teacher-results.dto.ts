import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ============ Request DTOs ============

export class QueryExamsDto {
  @IsOptional()
  @IsString()
  teacherSubjectId?: string;

  @IsOptional()
  @IsString()
  type?: string; // internal, external, practical, assignment
}

export class CreateExamDto {
  @IsString()
  teacherSubjectId: string;

  @IsString()
  name: string;

  @IsString()
  type: string; // internal, external, practical, assignment

  @IsString()
  date: string; // ISO date string

  @IsNumber()
  @Min(1)
  totalMarks: number;
}

export class StudentResultEntryDto {
  @IsString()
  studentId: string;

  @IsNumber()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class SaveResultsDto {
  @IsString()
  examId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentResultEntryDto)
  results: StudentResultEntryDto[];
}

export class UpdateResultDto {
  @IsNumber()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

// ============ Response DTOs ============

export class SubjectDto {
  id: string;
  code: string;
  name: string;
  section: string | null;
  teacherSubjectId: string;
}

export class ExamDto {
  id: string;
  name: string;
  type: string;
  date: string;
  totalMarks: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  resultsCount: number;
}

export class StudentResultDto {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  marks: number;
  maxMarks: number;
  grade: string;
  status: 'pass' | 'fail';
  remarks?: string;
}

export class ResultStatsDto {
  totalStudents: number;
  appeared: number;
  passed: number;
  failed: number;
  average: number;
  highest: number;
  lowest: number;
  gradeDistribution: Record<string, number>;
}

export class ExamResultsResponseDto {
  exam: ExamDto;
  results: StudentResultDto[];
  stats: ResultStatsDto;
}

export class TeacherExamsResponseDto {
  subjects: SubjectDto[];
  examTypes: string[];
  exams: ExamDto[];
}

export class SaveResultsResponseDto {
  success: boolean;
  message: string;
  savedCount: number;
  examId: string;
}
