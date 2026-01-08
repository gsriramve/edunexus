import { IsString, IsOptional, IsIn } from 'class-validator';

// ============ Query DTOs ============

export class QueryReportsDto {
  @IsOptional()
  @IsIn(['current', 'previous', 'year', 'all'])
  period?: 'current' | 'previous' | 'year' | 'all';

  @IsOptional()
  @IsString()
  academicYear?: string;
}

export class QueryAvailableReportsDto {
  @IsOptional()
  @IsIn(['all', 'attendance', 'academic', 'placement', 'faculty'])
  type?: 'all' | 'attendance' | 'academic' | 'placement' | 'faculty';
}

// ============ Response DTOs ============

export class QuickStatsDto {
  avgAttendance: number;
  attendanceTrend: 'up' | 'down' | 'stable';
  attendanceChange: number;
  avgCGPA: number;
  cgpaTrend: 'up' | 'down' | 'stable';
  cgpaChange: number;
  placementRate: number;
  passRate: number;
}

export class SemesterAttendanceDto {
  semester: number;
  attendance: number;
  students: number;
  belowThreshold: number;
}

export class MonthlyTrendDto {
  month: string;
  attendance: number;
}

export class AttendanceReportDto {
  overall: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  semesterWise: SemesterAttendanceDto[];
  monthlyTrend: MonthlyTrendDto[];
  totalStudents: number;
  belowThresholdTotal: number;
}

export class SemesterResultDto {
  semester: number;
  avgCGPA: number;
  pass: number;
  distinction: number;
  fail: number;
  totalStudents: number;
}

export class SubjectPerformanceDto {
  subjectId: string;
  subjectCode: string;
  subject: string;
  avgMarks: number;
  passRate: number;
  topScore: number;
  totalStudents: number;
}

export class AcademicReportDto {
  avgCGPA: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  passPercentage: number;
  distinctionPercentage: number;
  semesterResults: SemesterResultDto[];
  subjectPerformance: SubjectPerformanceDto[];
}

export class YearPlacementDto {
  year: string;
  placed: number;
  total: number;
  rate: number;
  avgPackage: number;
}

export class TopRecruiterDto {
  company: string;
  offers: number;
  avgPackage: number;
}

export class PlacementReportDto {
  placementRate: number;
  avgPackage: number;
  highestPackage: number;
  totalOffers: number;
  companiesVisited: number;
  ongoingDrives: number;
  yearWise: YearPlacementDto[];
  topRecruiters: TopRecruiterDto[];
}

export class AvailableReportDto {
  id: string;
  name: string;
  type: 'attendance' | 'academic' | 'placement' | 'faculty';
  format: string;
  description?: string;
}

export class AvailableReportsResponseDto {
  reports: AvailableReportDto[];
  total: number;
}

export class DepartmentReportsResponseDto {
  quickStats: QuickStatsDto;
  attendance: AttendanceReportDto;
  academic: AcademicReportDto;
  placement: PlacementReportDto;
  availableReports: AvailableReportDto[];
}
