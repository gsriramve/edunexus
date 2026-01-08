'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface CurriculumStats {
  totalSubjects: number;
  theorySubjects: number;
  labSubjects: number;
  avgSyllabusCompletion: number;
  subjectsOnTrack: number;
  subjectsBehind: number;
  totalCredits: number;
  totalHoursPerWeek: number;
}

export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  topics: string[];
  status: string;
  completedAt: string | null;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  type: 'theory' | 'lab';
  semester: number;
  credits: number;
  hoursPerWeek: number;
  faculty: string | null;
  facultyId: string | null;
  section: string | null;
  syllabusCompletion: number;
  totalUnits: number;
  completedUnits: number;
  syllabusUnits?: SyllabusUnit[];
}

export interface SubjectDetail extends Subject {
  courseName: string;
  courseCode: string;
  syllabusUnits: SyllabusUnit[];
}

export interface SubjectsResponse {
  subjects: Subject[];
  total: number;
  bySemester: Record<number, number>;
}

export interface FacultyAssignment {
  facultyId: string;
  facultyName: string;
  designation: string;
  subjects: string[];
  subjectCodes: string[];
  totalHours: number;
  sections: number;
}

export interface FacultyAssignmentsResponse {
  assignments: FacultyAssignment[];
  total: number;
  totalHours: number;
}

export interface QuerySubjectsParams {
  semester?: number;
  type?: 'theory' | 'lab' | 'all';
  search?: string;
}

export interface QueryFacultyAssignmentsParams {
  academicYear?: string;
}

export interface CreateSyllabusUnitInput {
  subjectId: string;
  unitNumber: number;
  title: string;
  topics?: string[];
}

export interface UpdateSyllabusUnitInput {
  title?: string;
  topics?: string[];
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface BulkUpdateSyllabusStatusInput {
  unitIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

// ============ API Client ============

async function hodCurriculumApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/hod-curriculum${endpoint}`, {
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

export const hodCurriculumKeys = {
  all: ['hod-curriculum'] as const,
  stats: (tenantId: string) =>
    [...hodCurriculumKeys.all, 'stats', tenantId] as const,
  subjects: (tenantId: string, params?: QuerySubjectsParams) =>
    [...hodCurriculumKeys.all, 'subjects', tenantId, params] as const,
  subject: (tenantId: string, subjectId: string) =>
    [...hodCurriculumKeys.all, 'subject', tenantId, subjectId] as const,
  facultyAssignments: (tenantId: string, params?: QueryFacultyAssignmentsParams) =>
    [...hodCurriculumKeys.all, 'faculty-assignments', tenantId, params] as const,
};

// ============ Query Hooks ============

/**
 * Get curriculum stats for the department
 */
export function useCurriculumStats(tenantId: string) {
  return useQuery({
    queryKey: hodCurriculumKeys.stats(tenantId),
    queryFn: () => hodCurriculumApi<CurriculumStats>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get subjects for the department
 */
export function useCurriculumSubjects(
  tenantId: string,
  params?: QuerySubjectsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.semester) queryParams.set('semester', params.semester.toString());
  if (params?.type) queryParams.set('type', params.type);
  if (params?.search) queryParams.set('search', params.search);
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodCurriculumKeys.subjects(tenantId, params),
    queryFn: () =>
      hodCurriculumApi<SubjectsResponse>(
        `/subjects${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get subject detail with syllabus units
 */
export function useSubjectDetail(tenantId: string, subjectId: string) {
  return useQuery({
    queryKey: hodCurriculumKeys.subject(tenantId, subjectId),
    queryFn: () =>
      hodCurriculumApi<SubjectDetail>(`/subjects/${subjectId}`, tenantId),
    enabled: !!tenantId && !!subjectId,
  });
}

/**
 * Get faculty assignments for the department
 */
export function useFacultyAssignments(
  tenantId: string,
  params?: QueryFacultyAssignmentsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.academicYear) queryParams.set('academicYear', params.academicYear);
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodCurriculumKeys.facultyAssignments(tenantId, params),
    queryFn: () =>
      hodCurriculumApi<FacultyAssignmentsResponse>(
        `/faculty-assignments${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new syllabus unit
 */
export function useCreateSyllabusUnit(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSyllabusUnitInput) =>
      hodCurriculumApi<SyllabusUnit>('/syllabus-units', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodCurriculumKeys.all });
    },
  });
}

/**
 * Update a syllabus unit
 */
export function useUpdateSyllabusUnit(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSyllabusUnitInput }) =>
      hodCurriculumApi<SyllabusUnit>(`/syllabus-units/${id}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodCurriculumKeys.all });
    },
  });
}

/**
 * Bulk update syllabus unit statuses
 */
export function useBulkUpdateSyllabusStatus(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateSyllabusStatusInput) =>
      hodCurriculumApi<{ updated: number }>('/syllabus-units/bulk-status', tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodCurriculumKeys.all });
    },
  });
}

/**
 * Delete a syllabus unit
 */
export function useDeleteSyllabusUnit(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      hodCurriculumApi<void>(`/syllabus-units/${id}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodCurriculumKeys.all });
    },
  });
}
