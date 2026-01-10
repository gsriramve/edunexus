'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface AcademicSubject {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'Theory' | 'Lab';
  teacher: string;
  attendance: number;
  progress: number;
  examsCompleted: number;
  avgScore: number;
}

export interface AcademicProgress {
  totalCredits: number;
  totalSubjects: number;
  avgProgress: number;
  avgAttendance: number;
}

export interface StudentAcademicsResponse {
  student: {
    id: string;
    name: string;
    rollNo: string;
    semester: number;
    department: { id: string; name: string } | null;
    course: { id: string; name: string; code: string } | null;
  };
  currentSemester: number;
  subjects: AcademicSubject[];
  progress: AcademicProgress;
}

export interface AcademicSummaryResponse {
  studentId: string;
  currentSemester: number;
  cgpa: number;
  totalCredits: number;
  semesterResults: Array<{
    semester: number;
    sgpa: number;
    credits: number;
  }>;
}

// API Client
async function studentAcademicsApi<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options;
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authContext) {
    if (authContext.tenantId) headers['x-tenant-id'] = authContext.tenantId;
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
  }

  const response = await fetch(`${getApiBaseUrl()}/student-academics${endpoint}`, {
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

// Query keys
export const studentAcademicsKeys = {
  all: ['student-academics'] as const,
  subjects: (studentId: string, semester?: number) =>
    [...studentAcademicsKeys.all, 'subjects', studentId, semester] as const,
  summary: (studentId: string) =>
    [...studentAcademicsKeys.all, 'summary', studentId] as const,
};

// Helper to build query string
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, String(value));
    }
  });
  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

// Hooks

/**
 * Get student's enrolled subjects for a semester
 */
export function useStudentSubjects(studentId: string, semester?: number) {
  return useQuery({
    queryKey: studentAcademicsKeys.subjects(studentId, semester),
    queryFn: () => {
      const query = buildQueryString({ studentId, semester });
      return studentAcademicsApi<StudentAcademicsResponse>(`/subjects${query}`);
    },
    enabled: !!studentId,
  });
}

/**
 * Get student's academic summary including CGPA and semester-wise SGPA
 */
export function useStudentAcademicSummary(studentId: string) {
  return useQuery({
    queryKey: studentAcademicsKeys.summary(studentId),
    queryFn: () => {
      const query = buildQueryString({ studentId });
      return studentAcademicsApi<AcademicSummaryResponse>(`/summary${query}`);
    },
    enabled: !!studentId,
  });
}
