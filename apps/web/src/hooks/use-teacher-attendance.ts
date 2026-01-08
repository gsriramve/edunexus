'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentForAttendance {
  id: string;
  rollNo: string;
  name: string;
  photoUrl?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface ClassAttendanceResponse {
  classId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  department: string;
  date: string;
  students: StudentForAttendance[];
  attendance: Record<string, AttendanceStatus>;
  stats: AttendanceStats;
  isMarked: boolean;
}

export interface AttendanceHistoryEntry {
  date: string;
  stats: AttendanceStats;
}

export interface ClassAttendanceHistory {
  classId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  history: AttendanceHistoryEntry[];
  overallStats: AttendanceStats;
}

export interface StudentAttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
}

export interface MarkAttendanceInput {
  teacherSubjectId: string;
  date: string;
  attendance: StudentAttendanceEntry[];
}

export interface SaveAttendanceResponse {
  success: boolean;
  message: string;
  savedCount: number;
  date: string;
  teacherSubjectId: string;
}

export interface StudentAttendanceRecord {
  date: string;
  status: string;
}

export interface StudentAttendanceDetail {
  student: {
    id: string;
    rollNo: string;
    name: string;
  };
  records: StudentAttendanceRecord[];
  stats: AttendanceStats;
}

// ============ API Client ============

async function teacherAttendanceApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/teacher-attendance${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}

// ============ Query Keys ============

export const teacherAttendanceKeys = {
  all: ['teacher-attendance'] as const,
  class: (tenantId: string, classId: string, date: string) =>
    [...teacherAttendanceKeys.all, 'class', tenantId, classId, date] as const,
  history: (tenantId: string, classId: string) =>
    [...teacherAttendanceKeys.all, 'history', tenantId, classId] as const,
  student: (tenantId: string, classId: string, studentId: string) =>
    [...teacherAttendanceKeys.all, 'student', tenantId, classId, studentId] as const,
};

// ============ Query Hooks ============

/**
 * Get attendance data for a class on a specific date
 */
export function useClassAttendance(tenantId: string, classId: string, date: string) {
  return useQuery({
    queryKey: teacherAttendanceKeys.class(tenantId, classId, date),
    queryFn: () =>
      teacherAttendanceApi<ClassAttendanceResponse>(`/${classId}?date=${date}`, tenantId),
    enabled: !!tenantId && !!classId && !!date,
  });
}

/**
 * Get attendance history for a class
 */
export function useClassAttendanceHistory(
  tenantId: string,
  classId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherAttendanceKeys.history(tenantId, classId),
    queryFn: () =>
      teacherAttendanceApi<ClassAttendanceHistory>(
        `/${classId}/history${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!classId,
  });
}

/**
 * Get a specific student's attendance in a class
 */
export function useStudentAttendance(
  tenantId: string,
  classId: string,
  studentId: string,
  params?: { startDate?: string; endDate?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherAttendanceKeys.student(tenantId, classId, studentId),
    queryFn: () =>
      teacherAttendanceApi<StudentAttendanceDetail>(
        `/${classId}/student/${studentId}${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!classId && !!studentId,
  });
}

// ============ Mutation Hooks ============

/**
 * Mark attendance for a class
 */
export function useMarkAttendance(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkAttendanceInput) =>
      teacherAttendanceApi<SaveAttendanceResponse>('', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: (data) => {
      // Invalidate the specific class attendance query
      queryClient.invalidateQueries({
        queryKey: teacherAttendanceKeys.class(tenantId, data.teacherSubjectId, data.date),
      });
      // Also invalidate history
      queryClient.invalidateQueries({
        queryKey: teacherAttendanceKeys.history(tenantId, data.teacherSubjectId),
      });
    },
  });
}
