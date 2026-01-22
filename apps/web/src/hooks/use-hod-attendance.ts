'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
}

export interface AttendanceStatsDto {
  departmentAverage: number;
  todaysAttendance: number;
  totalStudents: number;
  belowThreshold: number;
  perfectAttendance: number;
}

export interface SubjectAttendanceDto {
  code: string;
  name: string;
  avg: number;
  belowThreshold: number;
}

export interface SemesterAttendanceDto {
  semester: number;
  avg: number;
  students: number;
}

export interface LowAttendanceStudentDto {
  id: string;
  name: string;
  rollNo: string;
  semester: number;
  attendance: number;
  classes: number;
}

export interface WeeklyTrendDto {
  week: string;
  attendance: number;
}

export interface HodAttendanceResponse {
  department: DepartmentDto;
  stats: AttendanceStatsDto;
  bySubject: SubjectAttendanceDto[];
  bySemester: SemesterAttendanceDto[];
  lowAttendance: LowAttendanceStudentDto[];
  weeklyTrend: WeeklyTrendDto[];
}

export interface StudentAttendanceDetailDto {
  id: string;
  name: string;
  rollNo: string;
  semester: number;
  attendancePercentage: number;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  recentAttendance: Array<{
    date: string;
    status: string;
    markedByType: string;
  }>;
}

export interface LowAttendanceListResponse {
  threshold: number;
  count: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    rollNo: string;
    semester: number;
    attendance: number;
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
  }>;
}

// ============ API Client ============

async function hodAttendanceApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/hod-attendance${endpoint}`, {
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

export const hodAttendanceKeys = {
  all: ['hod-attendance'] as const,
  overview: (tenantId: string, params?: { semester?: string; startDate?: string; endDate?: string }) =>
    [...hodAttendanceKeys.all, 'overview', tenantId, params] as const,
  student: (tenantId: string, studentId: string) =>
    [...hodAttendanceKeys.all, 'student', tenantId, studentId] as const,
  lowAttendance: (tenantId: string, threshold?: number) =>
    [...hodAttendanceKeys.all, 'low-attendance', tenantId, threshold] as const,
};

// ============ Query Hooks ============

/**
 * Get attendance overview for the HoD's department
 */
export function useHodAttendance(
  tenantId: string,
  params?: { semester?: string; startDate?: string; endDate?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.semester && params.semester !== 'all') {
    queryParams.set('semester', params.semester);
  }
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodAttendanceKeys.overview(tenantId, params),
    queryFn: () =>
      hodAttendanceApi<HodAttendanceResponse>(`${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get detailed attendance for a specific student
 */
export function useStudentAttendanceDetail(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: hodAttendanceKeys.student(tenantId, studentId),
    queryFn: () =>
      hodAttendanceApi<StudentAttendanceDetailDto>(`/students/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get students with low attendance
 */
export function useLowAttendanceStudents(tenantId: string, threshold?: number) {
  const queryParams = new URLSearchParams();
  if (threshold) queryParams.set('threshold', threshold.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodAttendanceKeys.lowAttendance(tenantId, threshold),
    queryFn: () =>
      hodAttendanceApi<LowAttendanceListResponse>(
        `/low-attendance${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}
