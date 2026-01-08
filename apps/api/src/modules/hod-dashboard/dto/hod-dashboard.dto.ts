// Department stats
export class DepartmentStatsDto {
  totalFaculty: number;
  totalStudents: number;
  activeSubjects: number;
  avgAttendance: number;
  avgCGPA: number;
  atRiskStudents: number;
  presentToday: number;
  onLeaveToday: number;
}

// Department info
export class DepartmentInfoDto {
  id: string;
  name: string;
  code: string;
}

// Faculty overview item
export class FacultyOverviewDto {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  subjectCount: number;
  attendancePercentage: number;
  classesToday: number;
  isOnLeave: boolean;
}

// Semester-wise data
export class SemesterOverviewDto {
  semester: number;
  students: number;
  avgAttendance: number;
  avgCGPA: number | null;
  atRisk: number;
}

// Alert item
export class AlertDto {
  id: string;
  type: 'attendance' | 'academic' | 'faculty' | 'system';
  message: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
  relatedId?: string;
}

// Event item
export class EventDto {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'exam' | 'event' | 'deadline';
  description?: string;
}

// Pending approval item
export class PendingApprovalDto {
  id: string;
  type: string;
  from: string;
  fromId: string;
  submitted: string;
  details: string;
}

// Main dashboard response
export class HodDashboardResponseDto {
  department: DepartmentInfoDto | null;
  hodInfo: {
    name: string;
    designation: string;
  };
  stats: DepartmentStatsDto;
  facultyOverview: FacultyOverviewDto[];
  semesterOverview: SemesterOverviewDto[];
  recentAlerts: AlertDto[];
  upcomingEvents: EventDto[];
  pendingApprovals: PendingApprovalDto[];
}
