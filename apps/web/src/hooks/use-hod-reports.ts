'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface QuickStats {
  avgAttendance: number;
  attendanceTrend: 'up' | 'down' | 'stable';
  attendanceChange: number;
  avgCGPA: number;
  cgpaTrend: 'up' | 'down' | 'stable';
  cgpaChange: number;
  placementRate: number;
  passRate: number;
}

export interface SemesterAttendance {
  semester: number;
  attendance: number;
  students: number;
  belowThreshold: number;
}

export interface MonthlyTrend {
  month: string;
  attendance: number;
}

export interface AttendanceReport {
  overall: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  semesterWise: SemesterAttendance[];
  monthlyTrend: MonthlyTrend[];
  totalStudents: number;
  belowThresholdTotal: number;
}

export interface SemesterResult {
  semester: number;
  avgCGPA: number;
  pass: number;
  distinction: number;
  fail: number;
  totalStudents: number;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectCode: string;
  subject: string;
  avgMarks: number;
  passRate: number;
  topScore: number;
  totalStudents: number;
}

export interface AcademicReport {
  avgCGPA: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  passPercentage: number;
  distinctionPercentage: number;
  semesterResults: SemesterResult[];
  subjectPerformance: SubjectPerformance[];
}

export interface YearPlacement {
  year: string;
  placed: number;
  total: number;
  rate: number;
  avgPackage: number;
}

export interface TopRecruiter {
  company: string;
  offers: number;
  avgPackage: number;
}

export interface PlacementReport {
  placementRate: number;
  avgPackage: number;
  highestPackage: number;
  totalOffers: number;
  companiesVisited: number;
  ongoingDrives: number;
  yearWise: YearPlacement[];
  topRecruiters: TopRecruiter[];
}

export interface AvailableReport {
  id: string;
  name: string;
  type: 'attendance' | 'academic' | 'placement' | 'faculty';
  format: string;
  description?: string;
}

export interface AvailableReportsResponse {
  reports: AvailableReport[];
  total: number;
}

export interface DepartmentReportsResponse {
  quickStats: QuickStats;
  attendance: AttendanceReport;
  academic: AcademicReport;
  placement: PlacementReport;
  availableReports: AvailableReport[];
}

export interface QueryReportsParams {
  period?: 'current' | 'previous' | 'year' | 'all';
  academicYear?: string;
}

export interface QueryAvailableReportsParams {
  type?: 'all' | 'attendance' | 'academic' | 'placement' | 'faculty';
}

// ============ API Client ============

async function hodReportsApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/hod-reports${endpoint}`, {
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

export const hodReportsKeys = {
  all: ['hod-reports'] as const,
  quickStats: (tenantId: string, params?: QueryReportsParams) =>
    [...hodReportsKeys.all, 'quick-stats', tenantId, params] as const,
  attendance: (tenantId: string, params?: QueryReportsParams) =>
    [...hodReportsKeys.all, 'attendance', tenantId, params] as const,
  academic: (tenantId: string, params?: QueryReportsParams) =>
    [...hodReportsKeys.all, 'academic', tenantId, params] as const,
  placement: (tenantId: string, params?: QueryReportsParams) =>
    [...hodReportsKeys.all, 'placement', tenantId, params] as const,
  available: (tenantId: string, params?: QueryAvailableReportsParams) =>
    [...hodReportsKeys.all, 'available', tenantId, params] as const,
  departmentReports: (tenantId: string, params?: QueryReportsParams) =>
    [...hodReportsKeys.all, 'department', tenantId, params] as const,
};

// ============ Helper to build query string ============

function buildQueryString(params?: QueryReportsParams | QueryAvailableReportsParams): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.set(key, String(value));
  });
  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

// ============ Query Hooks ============

/**
 * Get quick stats for the department
 */
export function useQuickStats(tenantId: string, params?: QueryReportsParams) {
  return useQuery({
    queryKey: hodReportsKeys.quickStats(tenantId, params),
    queryFn: () =>
      hodReportsApi<QuickStats>(`/quick-stats${buildQueryString(params)}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get attendance report for the department
 */
export function useAttendanceReport(tenantId: string, params?: QueryReportsParams) {
  return useQuery({
    queryKey: hodReportsKeys.attendance(tenantId, params),
    queryFn: () =>
      hodReportsApi<AttendanceReport>(`/attendance${buildQueryString(params)}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get academic report for the department
 */
export function useAcademicReport(tenantId: string, params?: QueryReportsParams) {
  return useQuery({
    queryKey: hodReportsKeys.academic(tenantId, params),
    queryFn: () =>
      hodReportsApi<AcademicReport>(`/academic${buildQueryString(params)}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get placement report for the department
 */
export function usePlacementReport(tenantId: string, params?: QueryReportsParams) {
  return useQuery({
    queryKey: hodReportsKeys.placement(tenantId, params),
    queryFn: () =>
      hodReportsApi<PlacementReport>(`/placement${buildQueryString(params)}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get available reports for download
 */
export function useAvailableReports(tenantId: string, params?: QueryAvailableReportsParams) {
  return useQuery({
    queryKey: hodReportsKeys.available(tenantId, params),
    queryFn: () =>
      hodReportsApi<AvailableReportsResponse>(`/available${buildQueryString(params)}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get all department reports (combined endpoint)
 */
export function useDepartmentReports(tenantId: string, params?: QueryReportsParams) {
  return useQuery({
    queryKey: hodReportsKeys.departmentReports(tenantId, params),
    queryFn: () =>
      hodReportsApi<DepartmentReportsResponse>(`${buildQueryString(params)}`, tenantId),
    enabled: !!tenantId,
  });
}
