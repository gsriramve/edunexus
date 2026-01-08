import { IsOptional, IsString } from 'class-validator';

export class QueryFacultyDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  designation?: string;
}

export class FacultyStatsDto {
  totalFaculty: number;
  presentToday: number;
  onLeave: number;
  avgClassesPerWeek: number;
}

export class WorkloadSummaryDto {
  avgClassesPerFaculty: number;
  avgLabsPerFaculty: number;
  underloaded: number;
  optimal: number;
  overloaded: number;
}

export class FacultySubjectDto {
  id: string;
  code: string;
  name: string;
  section: string | null;
  academicYear: string;
}

export class FacultyDto {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  designation: string;
  joiningDate: string;
  subjects: FacultySubjectDto[];
  subjectCount: number;
  totalClasses: number;
  classesTaken: number;
  attendancePercentage: number;
  isOnLeave: boolean;
}

export class FacultyDetailDto extends FacultyDto {
  phone: string | null;
  qualification: string | null;
  specialization: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
  timetable: TimetableSlotDto[];
}

export class TimetableSlotDto {
  id: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subjectCode: string;
  subjectName: string;
  section: string | null;
}

export class DepartmentTimetableDto {
  time: string;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
}

export class HodFacultyResponseDto {
  department: {
    id: string;
    name: string;
    code: string;
  };
  stats: FacultyStatsDto;
  workload: WorkloadSummaryDto;
  faculty: FacultyDto[];
}
