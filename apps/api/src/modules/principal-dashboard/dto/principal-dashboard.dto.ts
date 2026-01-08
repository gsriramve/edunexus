// Institution-wide stats
export class InstitutionStatsDto {
  totalDepartments: number;
  departmentsWithHod: number;
  totalStaff: number;
  activeStaff: number;
  totalStudents: number;
  activeStudents: number;
  avgAttendance: number;
  totalFeeCollected: number;
  pendingFees: number;
  upcomingExams: number;
}

// Department performance
export class DepartmentPerformanceDto {
  id: string;
  name: string;
  code: string;
  hodName: string | null;
  studentCount: number;
  staffCount: number;
  avgAttendance: number;
  atRiskStudents: number;
}

// Alert item
export class AlertDto {
  id: string;
  type: 'attendance' | 'academic' | 'fee' | 'staff' | 'system';
  message: string;
  severity: 'high' | 'medium' | 'low';
  departmentId?: string;
  departmentCode?: string;
  count?: number;
  createdAt: string;
}

// Recent activity
export class ActivityDto {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}

// Upcoming event
export class EventDto {
  id: string;
  title: string;
  type: 'exam' | 'meeting' | 'event' | 'deadline' | 'holiday';
  date: string;
  time?: string;
  departmentId?: string;
  departmentCode?: string;
  description?: string;
}

// Semester-wise distribution
export class SemesterDistributionDto {
  semester: number;
  studentCount: number;
  avgAttendance: number;
}

// Fee collection summary
export class FeeCollectionDto {
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  thisMonthCollected: number;
  overdueCount: number;
}

// Main dashboard response
export class PrincipalDashboardResponseDto {
  institutionStats: InstitutionStatsDto;
  departmentPerformance: DepartmentPerformanceDto[];
  semesterDistribution: SemesterDistributionDto[];
  feeCollection: FeeCollectionDto;
  recentAlerts: AlertDto[];
  recentActivities: ActivityDto[];
  upcomingEvents: EventDto[];
}

// Exam stats for principal overview
export class PrincipalExamStatsDto {
  totalExams: number;
  completed: number;
  ongoing: number;
  upcoming: number;
  totalStudentsAppeared: number;
  averagePassRate: number;
  resultsPublished: number;
  resultsPending: number;
}

// Upcoming exam for principal view
export class PrincipalUpcomingExamDto {
  id: string;
  name: string;
  type: string;
  department: string;
  departmentId: string;
  date: string;
  subjectName: string;
  totalMarks: number;
}

// Department-wise exam results
export class DepartmentExamResultDto {
  departmentId: string;
  department: string;
  appeared: number;
  passed: number;
  passRate: number;
  distinction: number;
  firstClass: number;
  secondClass: number;
  failed: number;
}

// Recently published result
export class RecentExamResultDto {
  examId: string;
  examName: string;
  department: string;
  departmentId: string;
  passRate: number;
  publishedDate: string;
  totalStudents: number;
}

// Full exam overview response
export class PrincipalExamOverviewDto {
  stats: PrincipalExamStatsDto;
  upcomingExams: PrincipalUpcomingExamDto[];
  departmentResults: DepartmentExamResultDto[];
  recentResults: RecentExamResultDto[];
}
