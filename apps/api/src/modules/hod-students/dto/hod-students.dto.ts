import { IsOptional, IsString } from 'class-validator';

export class QueryStudentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  section?: string;
}

export class StudentStatsDto {
  total: number;
  activeStudents: number;
  onLeave: number;
  detained: number;
  avgAttendance: number;
  avgCGPA: number;
  atRisk: number;
}

export class SemesterDataDto {
  semester: number;
  students: number;
  avgAttendance: number;
  avgCGPA: number | null;
  atRisk: number;
}

export class StudentDto {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  semester: number;
  section: string | null;
  batch: string;
  cgpa: number;
  attendance: number;
  status: string;
  atRisk: boolean;
  riskReasons: string[];
}

export class AtRiskStudentDto extends StudentDto {
  riskLevel: 'low' | 'medium' | 'high';
}

export class TopPerformerDto {
  id: string;
  rollNo: string;
  name: string;
  semester: number;
  cgpa: number;
  rank: number;
}

export class HodStudentsResponseDto {
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  stats: StudentStatsDto;
  semesterData: SemesterDataDto[];
  students: StudentDto[];
}

export class AtRiskResponseDto {
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  count: number;
  students: AtRiskStudentDto[];
}

export class TopPerformersResponseDto {
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  students: TopPerformerDto[];
}
