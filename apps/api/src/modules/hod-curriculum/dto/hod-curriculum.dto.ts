import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ Query DTOs ============

export class QuerySubjectsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @IsIn(['theory', 'lab', 'all'])
  type?: 'theory' | 'lab' | 'all';

  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryFacultyAssignmentsDto {
  @IsOptional()
  @IsString()
  academicYear?: string;
}

// ============ Create/Update DTOs ============

export class CreateSyllabusUnitDto {
  @IsString()
  subjectId: string;

  @IsNumber()
  @Min(1)
  unitNumber: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];
}

export class UpdateSyllabusUnitDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed'])
  status?: 'pending' | 'in_progress' | 'completed';
}

export class BulkUpdateSyllabusStatusDto {
  @IsArray()
  @IsString({ each: true })
  unitIds: string[];

  @IsIn(['pending', 'in_progress', 'completed'])
  status: 'pending' | 'in_progress' | 'completed';
}

// ============ Response DTOs ============

export class CurriculumStatsDto {
  totalSubjects: number;
  theorySubjects: number;
  labSubjects: number;
  avgSyllabusCompletion: number;
  subjectsOnTrack: number;
  subjectsBehind: number;
  totalCredits: number;
  totalHoursPerWeek: number;
}

export class SyllabusUnitDto {
  id: string;
  unitNumber: number;
  title: string;
  topics: string[];
  status: string;
  completedAt: string | null;
}

export class SubjectDto {
  id: string;
  code: string;
  name: string;
  type: 'theory' | 'lab';
  semester: number;
  credits: number;
  hoursPerWeek: number;
  faculty: string | null;
  facultyId: string | null;
  section: string | null;
  syllabusCompletion: number;
  totalUnits: number;
  completedUnits: number;
  syllabusUnits?: SyllabusUnitDto[];
}

export class SubjectsResponseDto {
  subjects: SubjectDto[];
  total: number;
  bySemester: Record<number, number>;
}

export class FacultyAssignmentDto {
  facultyId: string;
  facultyName: string;
  designation: string;
  subjects: string[];
  subjectCodes: string[];
  totalHours: number;
  sections: number;
}

export class FacultyAssignmentsResponseDto {
  assignments: FacultyAssignmentDto[];
  total: number;
  totalHours: number;
}

export class SubjectDetailDto extends SubjectDto {
  courseName: string;
  courseCode: string;
  declare syllabusUnits: SyllabusUnitDto[];
}
