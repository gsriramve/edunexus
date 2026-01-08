import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

// ============ Query DTOs ============

export class QuerySubjectsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  type?: string; // core | elective

  @IsOptional()
  @IsString()
  courseId?: string;
}

// ============ Create/Update DTOs ============

export class CreateSubjectDto {
  @IsString()
  courseId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  semester: number;

  @IsNumber()
  @Min(1)
  @Max(6)
  credits: number;

  @IsOptional()
  @IsBoolean()
  isLab?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  lectureHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  tutorialHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  labHours?: number;

  @IsOptional()
  @IsString()
  subjectType?: string; // core | elective

  @IsOptional()
  @IsString()
  syllabus?: string;
}

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  credits?: number;

  @IsOptional()
  @IsBoolean()
  isLab?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  lectureHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  tutorialHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  labHours?: number;

  @IsOptional()
  @IsString()
  subjectType?: string;

  @IsOptional()
  @IsString()
  syllabus?: string;
}

// ============ Faculty Assignment DTOs ============

export class AssignFacultyDto {
  @IsString()
  staffId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}

export class RemoveFacultyDto {
  @IsString()
  teacherSubjectId: string;
}
