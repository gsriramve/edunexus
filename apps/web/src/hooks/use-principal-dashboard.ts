'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';

// ============ Types ============

export interface InstitutionStatsDto {
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

export interface DepartmentPerformanceDto {
  id: string;
  name: string;
  code: string;
  hodName: string | null;
  studentCount: number;
  staffCount: number;
  avgAttendance: number;
  atRiskStudents: number;
}

export interface AlertDto {
  id: string;
  type: 'attendance' | 'academic' | 'fee' | 'staff' | 'system';
  message: string;
  severity: 'high' | 'medium' | 'low';
  departmentId?: string;
  departmentCode?: string;
  count?: number;
  createdAt: string;
}

export interface ActivityDto {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}

export interface EventDto {
  id: string;
  title: string;
  type: 'exam' | 'meeting' | 'event' | 'deadline' | 'holiday';
  date: string;
  time?: string;
  departmentId?: string;
  departmentCode?: string;
  description?: string;
}

export interface SemesterDistributionDto {
  semester: number;
  studentCount: number;
  avgAttendance: number;
}

export interface FeeCollectionDto {
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  thisMonthCollected: number;
  overdueCount: number;
}

export interface PrincipalDashboardResponse {
  institutionStats: InstitutionStatsDto;
  departmentPerformance: DepartmentPerformanceDto[];
  semesterDistribution: SemesterDistributionDto[];
  feeCollection: FeeCollectionDto;
  recentAlerts: AlertDto[];
  recentActivities: ActivityDto[];
  upcomingEvents: EventDto[];
}

// ============ Exam Overview Types ============

export interface PrincipalExamStatsDto {
  totalExams: number;
  completed: number;
  ongoing: number;
  upcoming: number;
  totalStudentsAppeared: number;
  averagePassRate: number;
  resultsPublished: number;
  resultsPending: number;
}

export interface PrincipalUpcomingExamDto {
  id: string;
  name: string;
  type: string;
  department: string;
  departmentId: string;
  date: string;
  subjectName: string;
  totalMarks: number;
}

export interface DepartmentExamResultDto {
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

export interface RecentExamResultDto {
  examId: string;
  examName: string;
  department: string;
  departmentId: string;
  passRate: number;
  publishedDate: string;
  totalStudents: number;
}

export interface PrincipalExamOverviewResponse {
  stats: PrincipalExamStatsDto;
  upcomingExams: PrincipalUpcomingExamDto[];
  departmentResults: DepartmentExamResultDto[];
  recentResults: RecentExamResultDto[];
}

// ============ Fee Overview Types ============

export interface PrincipalFeeStatsDto {
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

export interface DepartmentFeeDto {
  departmentId: string;
  department: string;
  students: number;
  expected: number;
  collected: number;
  pending: number;
  collectionRate: number;
  defaulters: number;
}

export interface FeeCategoryDto {
  category: string;
  collected: number;
  expected: number;
  percentage: number;
}

export interface RecentTransactionDto {
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

export interface MonthlyCollectionDto {
  month: string;
  year: number;
  collected: number;
}

export interface PaymentMethodStatsDto {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PrincipalFeeOverviewResponse {
  stats: PrincipalFeeStatsDto;
  departmentFees: DepartmentFeeDto[];
  feeCategories: FeeCategoryDto[];
  recentTransactions: RecentTransactionDto[];
  monthlyTrend: MonthlyCollectionDto[];
  paymentMethods: PaymentMethodStatsDto[];
}

// ============ Academics Overview Types ============

export interface PrincipalAcademicStatsDto {
  totalCourses: number;
  activeCourses: number;
  totalSubjects: number;
  totalCredits: number;
  averagePassRate: number;
  studentsEnrolled: number;
}

export interface DepartmentCurriculumDto {
  departmentId: string;
  department: string;
  courses: number;
  subjects: number;
  credits: number;
  syllabusStatus: 'completed' | 'in_progress' | 'pending';
  syllabusCompletionRate: number;
  passRate: number;
}

export interface RecentCurriculumUpdateDto {
  id: string;
  courseName: string;
  subjectName: string;
  department: string;
  departmentId: string;
  action: string;
  date: string;
}

export interface SemesterProgressDto {
  semester: number;
  totalSubjects: number;
  withSyllabus: number;
  completionPercentage: number;
}

export interface PrincipalAcademicsOverviewResponse {
  stats: PrincipalAcademicStatsDto;
  departmentCurriculum: DepartmentCurriculumDto[];
  recentUpdates: RecentCurriculumUpdateDto[];
  semesterProgress: SemesterProgressDto[];
}

// ============ Reports Overview Types ============

export interface ReportStatsDto {
  totalTemplates: number;
  generatedThisMonth: number;
  scheduledReports: number;
  pendingJobs: number;
}

export interface ReportTemplateDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  reportType: string;
  format: string;
  lastGenerated: string | null;
}

export interface ReportCategoryDto {
  id: string;
  name: string;
  icon: string;
  reports: ReportTemplateDto[];
}

export interface RecentReportDto {
  id: string;
  name: string;
  generatedBy: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  size: string | null;
  outputUrl: string | null;
}

export interface ScheduledReportDto {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  recipients: string;
  isActive: boolean;
}

export interface PrincipalReportsOverviewResponse {
  stats: ReportStatsDto;
  categories: ReportCategoryDto[];
  recentReports: RecentReportDto[];
  scheduledReports: ScheduledReportDto[];
}

// ============ API Client ============

async function principalDashboardApi<T>(
  endpoint: string,
  tenantId: string
): Promise<T> {
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };

  if (authContext) {
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
    if (authContext.tenantId) headers['x-user-tenant-id'] = authContext.tenantId;
  }

  const response = await fetch(`${getApiBaseUrl()}/principal-dashboard${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}

// ============ Query Keys ============

export const principalDashboardKeys = {
  all: ['principal-dashboard'] as const,
  dashboard: (tenantId: string) =>
    [...principalDashboardKeys.all, 'dashboard', tenantId] as const,
  stats: (tenantId: string) =>
    [...principalDashboardKeys.all, 'stats', tenantId] as const,
  departments: (tenantId: string) =>
    [...principalDashboardKeys.all, 'departments', tenantId] as const,
  alerts: (tenantId: string) =>
    [...principalDashboardKeys.all, 'alerts', tenantId] as const,
  fees: (tenantId: string) =>
    [...principalDashboardKeys.all, 'fees', tenantId] as const,
  feeOverview: (tenantId: string) =>
    [...principalDashboardKeys.all, 'fee-overview', tenantId] as const,
  exams: (tenantId: string) =>
    [...principalDashboardKeys.all, 'exams', tenantId] as const,
  academics: (tenantId: string) =>
    [...principalDashboardKeys.all, 'academics', tenantId] as const,
  reports: (tenantId: string) =>
    [...principalDashboardKeys.all, 'reports', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get complete principal dashboard data
 */
export function usePrincipalDashboard(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.dashboard(tenantId),
    queryFn: () => principalDashboardApi<PrincipalDashboardResponse>('', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get institution stats only (lightweight)
 */
export function usePrincipalStats(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.stats(tenantId),
    queryFn: () => principalDashboardApi<InstitutionStatsDto>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get department performance
 */
export function usePrincipalDepartments(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.departments(tenantId),
    queryFn: () => principalDashboardApi<DepartmentPerformanceDto[]>('/departments', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get alerts
 */
export function usePrincipalAlerts(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.alerts(tenantId),
    queryFn: () => principalDashboardApi<AlertDto[]>('/alerts', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get fee collection summary
 */
export function usePrincipalFeeCollection(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.fees(tenantId),
    queryFn: () => principalDashboardApi<FeeCollectionDto>('/fees', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get comprehensive exam overview for principal
 */
export function usePrincipalExamOverview(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.exams(tenantId),
    queryFn: () => principalDashboardApi<PrincipalExamOverviewResponse>('/exams', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get comprehensive fee overview for principal
 */
export function usePrincipalFeeOverview(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.feeOverview(tenantId),
    queryFn: () => principalDashboardApi<PrincipalFeeOverviewResponse>('/fees/overview', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get comprehensive academics overview for principal
 */
export function usePrincipalAcademicsOverview(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.academics(tenantId),
    queryFn: () => principalDashboardApi<PrincipalAcademicsOverviewResponse>('/academics', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get comprehensive reports overview for principal
 */
export function usePrincipalReportsOverview(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.reports(tenantId),
    queryFn: () => principalDashboardApi<PrincipalReportsOverviewResponse>('/reports', tenantId),
    enabled: !!tenantId,
  });
}
