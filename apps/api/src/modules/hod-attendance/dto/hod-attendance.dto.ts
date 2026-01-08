import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryAttendanceDto {
  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AttendanceStatsDto {
  departmentAverage: number;
  todaysAttendance: number;
  totalStudents: number;
  belowThreshold: number;
  perfectAttendance: number;
}

export class SubjectAttendanceDto {
  code: string;
  name: string;
  avg: number;
  belowThreshold: number;
}

export class SemesterAttendanceDto {
  semester: number;
  avg: number;
  students: number;
}

export class LowAttendanceStudentDto {
  id: string;
  name: string;
  rollNo: string;
  semester: number;
  attendance: number;
  classes: number;
}

export class WeeklyTrendDto {
  week: string;
  attendance: number;
}

export class HodAttendanceResponseDto {
  stats: AttendanceStatsDto;
  bySubject: SubjectAttendanceDto[];
  bySemester: SemesterAttendanceDto[];
  lowAttendance: LowAttendanceStudentDto[];
  weeklyTrend: WeeklyTrendDto[];
}
