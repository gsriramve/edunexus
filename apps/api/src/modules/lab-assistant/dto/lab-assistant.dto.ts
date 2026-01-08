import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ Query DTOs ============

export class QueryLabsDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryScheduleDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsIn(['today', 'week'])
  period?: 'today' | 'week';
}

export class QueryBatchesDto {
  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semester?: number;
}

export class QueryStudentsDto {
  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryAttendanceHistoryDto {
  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class QueryEquipmentDto {
  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @IsIn(['all', 'working', 'under_repair', 'faulty'])
  status?: 'all' | 'working' | 'under_repair' | 'faulty';

  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryIssuesDto {
  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @IsIn(['all', 'pending', 'in_progress', 'completed'])
  status?: 'all' | 'pending' | 'in_progress' | 'completed';

  @IsOptional()
  @IsIn(['all', 'high', 'medium', 'low'])
  priority?: 'all' | 'high' | 'medium' | 'low';
}

export class QueryPracticalExamsDto {
  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @IsIn(['all', 'upcoming', 'ongoing', 'completed'])
  status?: 'all' | 'upcoming' | 'ongoing' | 'completed';
}

export class QueryExamMarksDto {
  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

// ============ Create/Update DTOs ============

export class CreateAttendanceDto {
  @IsString()
  labId: string;

  @IsString()
  batchId: string;

  @IsString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  labNumber: number;

  @IsString()
  timeSlot: string;

  @IsArray()
  attendance: Array<{ studentId: string; status: 'present' | 'absent' | 'late' }>;
}

export class CreateEquipmentIssueDto {
  @IsString()
  equipmentId: string;

  @IsString()
  issue: string;

  @IsIn(['high', 'medium', 'low'])
  priority: 'high' | 'medium' | 'low';
}

export class UpdateEquipmentStatusDto {
  @IsIn(['working', 'under_repair', 'faulty'])
  status: 'working' | 'under_repair' | 'faulty';

  @IsOptional()
  @IsString()
  issue?: string;
}

export class SaveMarksDto {
  @IsString()
  examId: string;

  @IsArray()
  marks: Array<{ studentId: string; marks: number }>;
}

// ============ Response DTOs ============

// Lab Assistant Info
export class LabAssistantInfoDto {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  assignedLabs: string[];
}

// Dashboard Stats
export class LabStatsDto {
  totalLabs: number;
  totalBatches: number;
  studentsToday: number;
  pendingMarks: number;
  equipmentIssues: number;
  attendanceMarked: number;
}

// Lab
export class LabDto {
  id: string;
  name: string;
  code: string;
  room?: string;
  capacity?: number;
}

// Lab Session
export class LabSessionDto {
  id: string;
  time: string;
  lab: string;
  labId: string;
  batch: string;
  batchId: string;
  students: number;
  faculty: string;
  facultyId: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

// Week Schedule Session
export class WeekSessionDto {
  lab: string;
  batch: string;
  time: string;
}

// Week Schedule Day
export class WeekScheduleDayDto {
  day: string;
  sessions: WeekSessionDto[];
}

// Recent Attendance
export class RecentAttendanceDto {
  id: string;
  batch: string;
  batchId: string;
  lab: string;
  labId: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

// Pending Task
export class PendingTaskDto {
  id: string;
  type: 'marks' | 'equipment' | 'attendance' | 'other';
  title: string;
  lab: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

// Equipment Alert
export class EquipmentAlertDto {
  id: string;
  lab: string;
  labId: string;
  item: string;
  assetId: string;
  issue: string;
  reportedOn: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// Batch
export class BatchDto {
  id: string;
  name: string;
  semester: number;
  section: string;
  students: number;
}

// Student for attendance
export class StudentAttendanceDto {
  id: string;
  rollNo: string;
  name: string;
  status?: 'present' | 'absent' | 'late';
}

// Attendance History Record
export class AttendanceHistoryDto {
  id: string;
  date: string;
  lab: string;
  labId: string;
  batch: string;
  batchId: string;
  labNo: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

// Low Attendance Student
export class LowAttendanceStudentDto {
  id: string;
  rollNo: string;
  name: string;
  batch: string;
  batchId: string;
  attendance: number;
  sessionsAttended: number;
  totalSessions: number;
}

// Equipment Stats
export class EquipmentStatsDto {
  total: number;
  working: number;
  underRepair: number;
  faulty: number;
}

// Equipment
export class EquipmentDto {
  id: string;
  name: string;
  assetId: string;
  lab: string;
  labId: string;
  location: string;
  status: 'working' | 'under_repair' | 'faulty';
  lastMaintenance: string | null;
  specs: string | null;
  issue?: string;
}

// Maintenance Record
export class MaintenanceRecordDto {
  id: string;
  assetId: string;
  equipment: string;
  equipmentId: string;
  lab: string;
  labId: string;
  issue: string;
  reportedDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string | null;
  estimatedCompletion: string | null;
  completedDate: string | null;
}

// Issue Report
export class IssueReportDto {
  id: string;
  assetId: string;
  equipment: string;
  equipmentId: string;
  lab: string;
  labId: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  reportedOn: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// ============ Combined Response DTOs ============

export class DashboardResponseDto {
  labAssistantInfo: LabAssistantInfoDto;
  stats: LabStatsDto;
  todaySchedule: LabSessionDto[];
  weekSchedule: WeekScheduleDayDto[];
  recentAttendance: RecentAttendanceDto[];
  pendingTasks: PendingTaskDto[];
  equipmentAlerts: EquipmentAlertDto[];
}

export class LabsResponseDto {
  labs: LabDto[];
  total: number;
}

export class BatchesResponseDto {
  batches: BatchDto[];
  total: number;
}

export class StudentsResponseDto {
  students: StudentAttendanceDto[];
  total: number;
}

export class AttendanceHistoryResponseDto {
  records: AttendanceHistoryDto[];
  total: number;
}

export class LowAttendanceResponseDto {
  students: LowAttendanceStudentDto[];
  total: number;
}

export class EquipmentResponseDto {
  stats: EquipmentStatsDto;
  equipment: EquipmentDto[];
  total: number;
}

export class IssuesResponseDto {
  issues: IssueReportDto[];
  total: number;
}

export class MaintenanceResponseDto {
  records: MaintenanceRecordDto[];
  total: number;
}

// ============ Marks DTOs ============

export class PracticalExamDto {
  id: string;
  name: string;
  lab: string;
  labId: string;
  date: string;
  totalMarks: number;
  batch: string;
  batchId: string;
  marksEntered: number;
  totalStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export class StudentForMarksDto {
  id: string;
  rollNo: string;
  name: string;
  section: string;
  marks: number | null;
  percentage: number | null;
  grade: string | null;
}

export class MarksStatsDto {
  totalStudents: number;
  marksEntered: number;
  pending: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

export class PracticalExamsResponseDto {
  exams: PracticalExamDto[];
  total: number;
}

export class ExamMarksDetailResponseDto {
  exam: PracticalExamDto;
  stats: MarksStatsDto;
  students: StudentForMarksDto[];
}
