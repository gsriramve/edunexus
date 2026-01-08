// Teacher info
export class TeacherInfoDto {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  departmentCode: string;
  designation: string;
  email: string;
  subjectsCount: number;
  totalStudents: number;
}

// Today's schedule item
export class ScheduleItemDto {
  id: string;
  time: string;
  subject: string;
  subjectCode: string;
  section: string | null;
  room: string | null;
  type: 'Lecture' | 'Lab';
  students: number;
}

// Pending task item
export class PendingTaskDto {
  id: string;
  task: string;
  type: 'attendance' | 'assignment' | 'material' | 'marks';
  due: string;
  urgent: boolean;
  relatedId?: string;
}

// Subject stats
export class SubjectStatsDto {
  id: string;
  subject: string;
  code: string;
  sections: number;
  students: number;
  avgAttendance: number;
  classesThisWeek: number;
}

// Quick stats
export class QuickStatsDto {
  totalStudents: number;
  classesToday: number;
  subjectsCount: number;
  pendingTasks: number;
  upcomingExams: number;
  lowAttendanceStudents: number;
}

// Main dashboard response
export class TeacherDashboardResponseDto {
  teacher: TeacherInfoDto;
  quickStats: QuickStatsDto;
  todaySchedule: ScheduleItemDto[];
  pendingTasks: PendingTaskDto[];
  subjectStats: SubjectStatsDto[];
}
