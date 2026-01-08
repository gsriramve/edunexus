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

// ============ Fee Overview DTOs ============

// Comprehensive fee stats
export class PrincipalFeeStatsDto {
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  pendingAmount: number;
  studentsPaid: number;
  studentsPending: number;
  studentsPartial: number;
  thisMonthCollection: number;
  lastMonthCollection: number;
  overdueCount: number;
}

// Department-wise fee collection
export class DepartmentFeeDto {
  departmentId: string;
  department: string;
  students: number;
  expected: number;
  collected: number;
  pending: number;
  collectionRate: number;
  defaulters: number;
}

// Fee category breakdown
export class FeeCategoryDto {
  category: string;
  collected: number;
  expected: number;
  percentage: number;
}

// Recent transaction
export class RecentTransactionDto {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  departmentId: string;
  amount: number;
  feeType: string;
  date: string;
  paymentMethod: string | null;
}

// Monthly collection trend
export class MonthlyCollectionDto {
  month: string;
  year: number;
  collected: number;
}

// Payment method distribution
export class PaymentMethodStatsDto {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

// Full fee overview response
export class PrincipalFeeOverviewDto {
  stats: PrincipalFeeStatsDto;
  departmentFees: DepartmentFeeDto[];
  feeCategories: FeeCategoryDto[];
  recentTransactions: RecentTransactionDto[];
  monthlyTrend: MonthlyCollectionDto[];
  paymentMethods: PaymentMethodStatsDto[];
}

// ============ Academics Overview DTOs ============

// Academic stats
export class PrincipalAcademicStatsDto {
  totalCourses: number;
  activeCourses: number;
  totalSubjects: number;
  totalCredits: number;
  averagePassRate: number;
  studentsEnrolled: number;
}

// Department curriculum status
export class DepartmentCurriculumDto {
  departmentId: string;
  department: string;
  courses: number;
  subjects: number;
  credits: number;
  syllabusStatus: 'completed' | 'in_progress' | 'pending';
  syllabusCompletionRate: number;
  passRate: number;
}

// Recent curriculum update
export class RecentCurriculumUpdateDto {
  id: string;
  courseName: string;
  subjectName: string;
  department: string;
  departmentId: string;
  action: string;
  date: string;
}

// Semester syllabus progress
export class SemesterProgressDto {
  semester: number;
  totalSubjects: number;
  withSyllabus: number;
  completionPercentage: number;
}

// Full academics overview response
export class PrincipalAcademicsOverviewDto {
  stats: PrincipalAcademicStatsDto;
  departmentCurriculum: DepartmentCurriculumDto[];
  recentUpdates: RecentCurriculumUpdateDto[];
  semesterProgress: SemesterProgressDto[];
}
