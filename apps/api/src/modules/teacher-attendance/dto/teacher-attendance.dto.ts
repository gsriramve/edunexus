import { IsString, IsDateString, IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

// ============ Request DTOs ============

export class StudentAttendanceEntryDto {
  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkAttendanceDto {
  @IsString()
  teacherSubjectId: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceEntryDto)
  attendance: StudentAttendanceEntryDto[];
}

export class QueryAttendanceDto {
  @IsOptional()
  @IsString()
  teacherSubjectId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// ============ Response DTOs ============

export class StudentForAttendanceDto {
  id: string;
  rollNo: string;
  name: string;
  photoUrl?: string;
}

export class AttendanceRecordDto {
  studentId: string;
  status: AttendanceStatus;
  markedAt?: string;
}

export class ClassAttendanceResponseDto {
  classId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  department: string;
  date: string;
  students: StudentForAttendanceDto[];
  attendance: Record<string, AttendanceStatus>;
  stats: AttendanceStatsDto;
  isMarked: boolean;
}

export class AttendanceStatsDto {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export class AttendanceHistoryEntryDto {
  date: string;
  stats: AttendanceStatsDto;
}

export class ClassAttendanceHistoryDto {
  classId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  history: AttendanceHistoryEntryDto[];
  overallStats: AttendanceStatsDto;
}

export class SaveAttendanceResponseDto {
  success: boolean;
  message: string;
  savedCount: number;
  date: string;
  teacherSubjectId: string;
}
