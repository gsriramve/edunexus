'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface AssignmentStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  pendingGrading: number;
  avgSubmissionRate: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  totalStudents: number;
  graded: number;
  status: string;
  allowLateSubmission: boolean;
  latePenaltyPercent: number | null;
  createdAt: string;
}

export interface AssignmentDetail extends Assignment {
  instructions: string | null;
  attachments: Array<{ name: string; url: string; type: string; size: number }>;
  teacherSubjectId: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
  marks: number | null;
  totalMarks: number;
  feedback: string | null;
  files: Array<{ name: string; url: string; type: string; size: number }>;
}

export interface AssignmentsResponse {
  stats: AssignmentStats;
  assignments: Assignment[];
  total: number;
}

export interface SubmissionsResponse {
  submissions: Submission[];
  total: number;
  graded: number;
  pending: number;
}

export interface RecentSubmissionsResponse {
  submissions: Submission[];
  total: number;
}

export interface TeacherSubject {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  semester: number;
}

export interface CreateAssignmentInput {
  teacherSubjectId: string;
  title: string;
  description?: string;
  instructions?: string;
  totalMarks: number;
  dueDate: string;
  status?: 'draft' | 'active';
  attachments?: Array<{ name: string; url: string; type: string; size: number }>;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  instructions?: string;
  totalMarks?: number;
  dueDate?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  attachments?: Array<{ name: string; url: string; type: string; size: number }>;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number;
}

export interface GradeSubmissionInput {
  marks: number;
  feedback?: string;
}

export interface QueryAssignmentsParams {
  subjectCode?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuerySubmissionsParams {
  status?: 'submitted' | 'late' | 'graded' | 'returned';
  search?: string;
  limit?: number;
  offset?: number;
}

// ============ API Client ============

async function teacherAssignmentsApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/teacher-assignments${endpoint}`, {
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

export const teacherAssignmentsKeys = {
  all: ['teacher-assignments'] as const,
  list: (tenantId: string, params?: QueryAssignmentsParams) =>
    [...teacherAssignmentsKeys.all, 'list', tenantId, params] as const,
  detail: (tenantId: string, assignmentId: string) =>
    [...teacherAssignmentsKeys.all, 'detail', tenantId, assignmentId] as const,
  submissions: (tenantId: string, assignmentId: string, params?: QuerySubmissionsParams) =>
    [...teacherAssignmentsKeys.all, 'submissions', tenantId, assignmentId, params] as const,
  recentSubmissions: (tenantId: string, params?: QuerySubmissionsParams) =>
    [...teacherAssignmentsKeys.all, 'recent-submissions', tenantId, params] as const,
  subjects: (tenantId: string) =>
    [...teacherAssignmentsKeys.all, 'subjects', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get all assignments for the current teacher with stats
 */
export function useTeacherAssignments(
  tenantId: string,
  params?: QueryAssignmentsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.subjectCode) queryParams.set('subjectCode', params.subjectCode);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherAssignmentsKeys.list(tenantId, params),
    queryFn: () =>
      teacherAssignmentsApi<AssignmentsResponse>(
        query ? `?${query}` : '',
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get a single assignment with full details
 */
export function useAssignmentDetail(tenantId: string, assignmentId: string) {
  return useQuery({
    queryKey: teacherAssignmentsKeys.detail(tenantId, assignmentId),
    queryFn: () => teacherAssignmentsApi<AssignmentDetail>(`/${assignmentId}`, tenantId),
    enabled: !!tenantId && !!assignmentId,
  });
}

/**
 * Get submissions for a specific assignment
 */
export function useAssignmentSubmissions(
  tenantId: string,
  assignmentId: string,
  params?: QuerySubmissionsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherAssignmentsKeys.submissions(tenantId, assignmentId, params),
    queryFn: () =>
      teacherAssignmentsApi<SubmissionsResponse>(
        `/${assignmentId}/submissions${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!assignmentId,
  });
}

/**
 * Get recent submissions across all assignments
 */
export function useRecentSubmissions(
  tenantId: string,
  params?: QuerySubmissionsParams
) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherAssignmentsKeys.recentSubmissions(tenantId, params),
    queryFn: () =>
      teacherAssignmentsApi<RecentSubmissionsResponse>(
        `/submissions/recent${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get teacher's subjects for assignment creation dropdown
 */
export function useTeacherSubjectsForAssignments(tenantId: string) {
  return useQuery({
    queryKey: teacherAssignmentsKeys.subjects(tenantId),
    queryFn: () => teacherAssignmentsApi<TeacherSubject[]>('/subjects', tenantId),
    enabled: !!tenantId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a new assignment
 */
export function useCreateAssignment(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentInput) =>
      teacherAssignmentsApi<Assignment>('', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}

/**
 * Update an assignment
 */
export function useUpdateAssignment(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentInput }) =>
      teacherAssignmentsApi<Assignment>(`/${id}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}

/**
 * Delete an assignment
 */
export function useDeleteAssignment(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      teacherAssignmentsApi<void>(`/${id}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}

/**
 * Grade a submission
 */
export function useGradeSubmission(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: GradeSubmissionInput }) =>
      teacherAssignmentsApi<Submission>(`/submissions/${submissionId}/grade`, tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAssignmentsKeys.all });
    },
  });
}
