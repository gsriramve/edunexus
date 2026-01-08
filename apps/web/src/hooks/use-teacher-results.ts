'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  section: string | null;
  teacherSubjectId: string;
}

export interface ExamDto {
  id: string;
  name: string;
  type: string;
  date: string;
  totalMarks: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  resultsCount: number;
}

export interface StudentResultDto {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  marks: number;
  maxMarks: number;
  grade: string;
  status: 'pass' | 'fail';
  remarks?: string;
}

export interface ResultStatsDto {
  totalStudents: number;
  appeared: number;
  passed: number;
  failed: number;
  average: number;
  highest: number;
  lowest: number;
  gradeDistribution: Record<string, number>;
}

export interface ExamResultsResponse {
  exam: ExamDto;
  results: StudentResultDto[];
  stats: ResultStatsDto;
}

export interface TeacherExamsResponse {
  subjects: SubjectDto[];
  examTypes: string[];
  exams: ExamDto[];
}

export interface CreateExamInput {
  teacherSubjectId: string;
  name: string;
  type: string;
  date: string;
  totalMarks: number;
}

export interface StudentResultEntry {
  studentId: string;
  marks: number;
  remarks?: string;
}

export interface SaveResultsInput {
  examId: string;
  results: StudentResultEntry[];
}

export interface SaveResultsResponse {
  success: boolean;
  message: string;
  savedCount: number;
  examId: string;
}

export interface UpdateResultInput {
  marks: number;
  grade?: string;
  remarks?: string;
}

// ============ API Client ============

async function teacherResultsApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/teacher-results${endpoint}`, {
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

export const teacherResultsKeys = {
  all: ['teacher-results'] as const,
  exams: (tenantId: string, params?: { teacherSubjectId?: string; type?: string }) =>
    [...teacherResultsKeys.all, 'exams', tenantId, params] as const,
  examResults: (tenantId: string, examId: string) =>
    [...teacherResultsKeys.all, 'exam-results', tenantId, examId] as const,
};

// ============ Query Hooks ============

/**
 * Get exams and subjects for the teacher
 */
export function useTeacherExams(
  tenantId: string,
  params?: { teacherSubjectId?: string; type?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.teacherSubjectId) queryParams.set('teacherSubjectId', params.teacherSubjectId);
  if (params?.type) queryParams.set('type', params.type);
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherResultsKeys.exams(tenantId, params),
    queryFn: () =>
      teacherResultsApi<TeacherExamsResponse>(`/exams${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get results for a specific exam
 */
export function useExamResults(tenantId: string, examId: string) {
  return useQuery({
    queryKey: teacherResultsKeys.examResults(tenantId, examId),
    queryFn: () =>
      teacherResultsApi<ExamResultsResponse>(`/exams/${examId}/results`, tenantId),
    enabled: !!tenantId && !!examId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new exam
 */
export function useCreateExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) =>
      teacherResultsApi<ExamDto>('/exams', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherResultsKeys.all });
    },
  });
}

/**
 * Save results for an exam
 */
export function useSaveResults(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveResultsInput) =>
      teacherResultsApi<SaveResultsResponse>('/results', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: teacherResultsKeys.examResults(tenantId, data.examId),
      });
    },
  });
}

/**
 * Update a single result
 */
export function useUpdateResult(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resultId, data }: { resultId: string; data: UpdateResultInput }) =>
      teacherResultsApi<unknown>(`/results/${resultId}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherResultsKeys.all });
    },
  });
}

/**
 * Delete an exam
 */
export function useDeleteExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) =>
      teacherResultsApi<void>(`/exams/${examId}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherResultsKeys.all });
    },
  });
}
