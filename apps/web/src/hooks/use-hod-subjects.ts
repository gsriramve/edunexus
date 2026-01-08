'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
}

export interface CourseDto {
  id: string;
  name: string;
  code: string;
}

export interface FacultyDto {
  teacherSubjectId: string;
  staffId: string;
  name: string;
  employeeId: string;
  section: string | null;
  academicYear: string;
}

export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  isLab: boolean;
  type: 'core' | 'elective' | 'lab';
  courseId: string;
  courseName: string;
  courseCode: string;
  facultyCount: number;
  sections: number;
  studentsEnrolled: number;
  examCount: number;
  lectureHours: number;
  tutorialHours: number;
  labHours: number;
  faculty: FacultyDto[];
}

export interface SubjectStatsDto {
  totalSubjects: number;
  coreSubjects: number;
  electiveSubjects: number;
  labSubjects: number;
  totalCredits: number;
  totalFacultyAssignments: number;
}

export interface HodSubjectsResponse {
  department: DepartmentDto;
  courses: CourseDto[];
  subjects: SubjectDto[];
  stats: SubjectStatsDto;
}

export interface SubjectDetailDto {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  isLab: boolean;
  syllabus: string | null;
  course: CourseDto;
  faculty: Array<FacultyDto & { email: string }>;
  recentExams: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    totalMarks: number;
  }>;
}

export interface AvailableFacultyDto {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  designation: string | null;
  subjectsAssigned: number;
}

export interface CreateSubjectInput {
  courseId: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  isLab?: boolean;
  lectureHours?: number;
  tutorialHours?: number;
  labHours?: number;
  subjectType?: string;
  syllabus?: string;
}

export interface UpdateSubjectInput {
  name?: string;
  semester?: number;
  credits?: number;
  isLab?: boolean;
  lectureHours?: number;
  tutorialHours?: number;
  labHours?: number;
  subjectType?: string;
  syllabus?: string;
}

export interface AssignFacultyInput {
  staffId: string;
  section?: string;
  academicYear?: string;
}

// ============ API Client ============

async function hodSubjectsApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/hod-subjects${endpoint}`, {
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

export const hodSubjectsKeys = {
  all: ['hod-subjects'] as const,
  subjects: (tenantId: string, params?: { search?: string; semester?: string; type?: string; courseId?: string }) =>
    [...hodSubjectsKeys.all, 'list', tenantId, params] as const,
  subject: (tenantId: string, subjectId: string) =>
    [...hodSubjectsKeys.all, 'detail', tenantId, subjectId] as const,
  faculty: (tenantId: string) =>
    [...hodSubjectsKeys.all, 'faculty', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get subjects for the HoD's department
 */
export function useHodSubjects(
  tenantId: string,
  params?: { search?: string; semester?: string; type?: string; courseId?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.semester) queryParams.set('semester', params.semester);
  if (params?.type) queryParams.set('type', params.type);
  if (params?.courseId) queryParams.set('courseId', params.courseId);
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodSubjectsKeys.subjects(tenantId, params),
    queryFn: () =>
      hodSubjectsApi<HodSubjectsResponse>(`${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get single subject details
 */
export function useHodSubjectDetail(tenantId: string, subjectId: string) {
  return useQuery({
    queryKey: hodSubjectsKeys.subject(tenantId, subjectId),
    queryFn: () =>
      hodSubjectsApi<SubjectDetailDto>(`/${subjectId}`, tenantId),
    enabled: !!tenantId && !!subjectId,
  });
}

/**
 * Get available faculty for assignment
 */
export function useAvailableFaculty(tenantId: string) {
  return useQuery({
    queryKey: hodSubjectsKeys.faculty(tenantId),
    queryFn: () =>
      hodSubjectsApi<AvailableFacultyDto[]>('/faculty', tenantId),
    enabled: !!tenantId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new subject
 */
export function useCreateSubject(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectInput) =>
      hodSubjectsApi<SubjectDto>('', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodSubjectsKeys.all });
    },
  });
}

/**
 * Update a subject
 */
export function useUpdateSubject(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, data }: { subjectId: string; data: UpdateSubjectInput }) =>
      hodSubjectsApi<SubjectDto>(`/${subjectId}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodSubjectsKeys.all });
    },
  });
}

/**
 * Delete a subject
 */
export function useDeleteSubject(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: string) =>
      hodSubjectsApi<void>(`/${subjectId}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodSubjectsKeys.all });
    },
  });
}

/**
 * Assign faculty to a subject
 */
export function useAssignFaculty(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, data }: { subjectId: string; data: AssignFacultyInput }) =>
      hodSubjectsApi<FacultyDto>(`/${subjectId}/faculty`, tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodSubjectsKeys.all });
    },
  });
}

/**
 * Remove faculty from a subject
 */
export function useRemoveFaculty(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherSubjectId: string) =>
      hodSubjectsApi<void>(`/faculty/${teacherSubjectId}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodSubjectsKeys.all });
    },
  });
}
