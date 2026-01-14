import { IsString, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export class QueryAttendanceDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  section?: string;
}

export class AttendanceRecordDto {
  id: string;
  date: string;
  status: AttendanceStatus;
  markedByType: string;
  subject?: {
    id: string;
    code: string;
    name: string;
  };
  time?: string;
}

export class AttendanceStatsDto {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export class SubjectAttendanceDto {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export class AttendanceEntryDto {
  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkAttendanceDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  attendance: AttendanceEntryDto[];
}

export class BulkMarkAttendanceDto {
  @IsDateString()
  date: string;

  @IsString()
  subjectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  records: AttendanceEntryDto[];
}

export class AttendanceListResponseDto {
  data: AttendanceRecordDto[];
  total: number;
  page: number;
  limit: number;
}

export class ByDateQueryDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}
