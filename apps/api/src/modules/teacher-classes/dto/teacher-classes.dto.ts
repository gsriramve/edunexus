import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

// ============ Query DTOs ============

export class QueryTeacherClassesDto {
  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  semester?: string;
}

export class CreateTimetableDto {
  @IsString()
  teacherSubjectId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0=Sunday, 6=Saturday

  @IsString()
  startTime: string; // HH:mm format

  @IsString()
  endTime: string; // HH:mm format

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsInt()
  periodNumber?: number;
}

export class UpdateTimetableDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsInt()
  periodNumber?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============ Response DTOs ============

export interface ScheduleEntry {
  day: string;
  time: string;
}

export interface TeacherClassDto {
  id: string;
  teacherSubjectId: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  departmentId: string;
  semester: number;
  section: string | null;
  studentCount: number;
  schedule: ScheduleEntry[];
  averageAttendance: number;
  averageMarks: number;
}

export interface TodaysClassDto {
  id: string;
  teacherSubjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  time: string;
  room: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface TeacherClassesStatsDto {
  currentSemester: string;
  currentAcademicYear: string;
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  todaysClassCount: number;
}

export interface TeacherClassesResponseDto {
  stats: TeacherClassesStatsDto;
  classes: TeacherClassDto[];
  todaysClasses: TodaysClassDto[];
}
