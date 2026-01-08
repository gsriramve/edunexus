import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ============ Query DTOs ============

export class QueryAssignmentsDto {
  @IsOptional()
  @IsString()
  subjectCode?: string;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'completed' | 'archived';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class QuerySubmissionsDto {
  @IsOptional()
  @IsString()
  status?: 'submitted' | 'late' | 'graded' | 'returned';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

// ============ Create/Update DTOs ============

export class CreateAssignmentDto {
  @IsString()
  teacherSubjectId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  totalMarks: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active';

  @IsOptional()
  @IsArray()
  attachments?: Array<{ name: string; url: string; type: string; size: number }>;

  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  latePenaltyPercent?: number;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  totalMarks?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'completed' | 'archived';

  @IsOptional()
  @IsArray()
  attachments?: Array<{ name: string; url: string; type: string; size: number }>;

  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  latePenaltyPercent?: number;
}

export class GradeSubmissionDto {
  @IsInt()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

// ============ Response DTOs ============

export interface AssignmentStatsDto {
  total: number;
  active: number;
  completed: number;
  draft: number;
  pendingGrading: number;
  avgSubmissionRate: number;
}

export interface AssignmentDto {
  id: string;
  title: string;
  description: string | null;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  totalStudents: number;
  graded: number;
  status: string;
  allowLateSubmission: boolean;
  latePenaltyPercent: number | null;
  createdAt: string;
}

export interface AssignmentDetailDto extends AssignmentDto {
  instructions: string | null;
  attachments: Array<{ name: string; url: string; type: string; size: number }>;
  teacherSubjectId: string;
}

export interface SubmissionDto {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
  marks: number | null;
  totalMarks: number;
  feedback: string | null;
  files: Array<{ name: string; url: string; type: string; size: number }>;
}

export interface AssignmentsResponseDto {
  stats: AssignmentStatsDto;
  assignments: AssignmentDto[];
  total: number;
}

export interface SubmissionsResponseDto {
  submissions: SubmissionDto[];
  total: number;
  graded: number;
  pending: number;
}

export interface RecentSubmissionsResponseDto {
  submissions: SubmissionDto[];
  total: number;
}
