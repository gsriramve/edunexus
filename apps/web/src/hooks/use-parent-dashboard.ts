'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface ChildInfo {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  semester: number;
  batchYear: number;
  photo?: string;
}

export interface ChildStats {
  cgpa: number;
  sgpa: number;
  attendancePercentage: number;
  pendingFees: number;
  rank: number;
  totalStudents: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  status: string;
}

export interface ParentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  unread: boolean;
  createdAt: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string;
}

export interface SubjectPerformance {
  subject: string;
  code: string;
  marks: number;
  attendance: number;
  trend: string;
}

export interface ParentDashboardResponse {
  childInfo: ChildInfo;
  stats: ChildStats;
  recentActivity: RecentActivity[];
  notifications: ParentNotification[];
  upcomingEvents: UpcomingEvent[];
  subjectPerformance: SubjectPerformance[];
}

// Query params
export interface QueryActivityParams {
  limit?: number;
}

export interface QueryNotificationsParams {
  status?: 'all' | 'unread' | 'read';
  limit?: number;
}

export interface QueryEventsParams {
  limit?: number;
  type?: 'all' | 'exam' | 'meeting' | 'fee' | 'event';
}

export interface QueryPerformanceParams {
  semester?: number;
}

export interface TeacherInfo {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
}

export interface AcademicOverview {
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  rank: number;
  totalStudents: number;
  percentile: number;
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  credits: number;
  status: string;
}

export interface CurrentSubject {
  code: string;
  name: string;
  credits: number;
  internal1: number | null;
  internal2: number | null;
  midterm: number | null;
  assignment: number | null;
  attendance: number;
  teacher: string;
}

export interface TeacherRemark {
  subject: string;
  teacher: string;
  date: string;
  remark: string;
}

export interface AcademicsData {
  overview: AcademicOverview;
  semesterResults: SemesterResult[];
  currentSubjects: CurrentSubject[];
  teacherRemarks: TeacherRemark[];
}

// ============ API Client ============

async function parentDashboardApi<T>(
  endpoint: string,
  tenantId: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options;
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

  const response = await fetch(`${API_BASE_URL}/parent-dashboard${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// ============ Query Keys ============

export const parentDashboardKeys = {
  all: ['parent-dashboard'] as const,
  dashboard: (tenantId: string, studentId: string) =>
    [...parentDashboardKeys.all, 'dashboard', tenantId, studentId] as const,
  childInfo: (tenantId: string, studentId: string) =>
    [...parentDashboardKeys.all, 'childInfo', tenantId, studentId] as const,
  stats: (tenantId: string, studentId: string) =>
    [...parentDashboardKeys.all, 'stats', tenantId, studentId] as const,
  activity: (tenantId: string, studentId: string, params?: QueryActivityParams) =>
    [...parentDashboardKeys.all, 'activity', tenantId, studentId, params] as const,
  notifications: (tenantId: string, params?: QueryNotificationsParams) =>
    [...parentDashboardKeys.all, 'notifications', tenantId, params] as const,
  events: (tenantId: string, studentId: string, params?: QueryEventsParams) =>
    [...parentDashboardKeys.all, 'events', tenantId, studentId, params] as const,
  performance: (tenantId: string, studentId: string, params?: QueryPerformanceParams) =>
    [...parentDashboardKeys.all, 'performance', tenantId, studentId, params] as const,
  teachers: (tenantId: string, studentId: string) =>
    [...parentDashboardKeys.all, 'teachers', tenantId, studentId] as const,
  academics: (tenantId: string, studentId: string) =>
    [...parentDashboardKeys.all, 'academics', tenantId, studentId] as const,
};

// ============ Helper to build query string ============

function buildQueryString<T extends object>(params?: T): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all') {
      queryParams.set(key, String(value));
    }
  });
  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

// ============ Query Hooks ============

/**
 * Get complete parent dashboard data for a child
 */
export function useParentDashboard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: parentDashboardKeys.dashboard(tenantId, studentId),
    queryFn: () =>
      parentDashboardApi<ParentDashboardResponse>(`/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get child's basic info
 */
export function useChildInfo(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: parentDashboardKeys.childInfo(tenantId, studentId),
    queryFn: () =>
      parentDashboardApi<ChildInfo>(`/${studentId}/info`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get child's stats
 */
export function useChildStats(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: parentDashboardKeys.stats(tenantId, studentId),
    queryFn: () =>
      parentDashboardApi<ChildStats>(`/${studentId}/stats`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get recent activity for child
 */
export function useRecentActivity(tenantId: string, studentId: string, params?: QueryActivityParams) {
  return useQuery({
    queryKey: parentDashboardKeys.activity(tenantId, studentId, params),
    queryFn: () =>
      parentDashboardApi<RecentActivity[]>(
        `/${studentId}/activity${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get parent notifications
 */
export function useParentNotifications(tenantId: string, params?: QueryNotificationsParams) {
  return useQuery({
    queryKey: parentDashboardKeys.notifications(tenantId, params),
    queryFn: () =>
      parentDashboardApi<ParentNotification[]>(
        `/notifications${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get upcoming events for child
 */
export function useUpcomingEvents(tenantId: string, studentId: string, params?: QueryEventsParams) {
  return useQuery({
    queryKey: parentDashboardKeys.events(tenantId, studentId, params),
    queryFn: () =>
      parentDashboardApi<UpcomingEvent[]>(
        `/${studentId}/events${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get subject performance for child
 */
export function useSubjectPerformance(tenantId: string, studentId: string, params?: QueryPerformanceParams) {
  return useQuery({
    queryKey: parentDashboardKeys.performance(tenantId, studentId, params),
    queryFn: () =>
      parentDashboardApi<SubjectPerformance[]>(
        `/${studentId}/performance${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get teachers for a student's enrolled courses
 */
export function useStudentTeachers(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: parentDashboardKeys.teachers(tenantId, studentId),
    queryFn: () =>
      parentDashboardApi<TeacherInfo[]>(`/${studentId}/teachers`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get comprehensive academics overview for a student
 */
export function useStudentAcademicsOverview(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: parentDashboardKeys.academics(tenantId, studentId),
    queryFn: () =>
      parentDashboardApi<AcademicsData>(`/${studentId}/academics`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}
