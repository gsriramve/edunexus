'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
}

export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  semester: number;
}

export interface ExamDto {
  id: string;
  code: string;
  name: string;
  examName: string;
  type: string;
  typeValue: string;
  semester: number;
  date: string;
  time: string;
  duration: string;
  durationMinutes: number;
  venue: string | null;
  maxMarks: number;
  passingMarks: number;
  students: number;
  status: string;
  avgMarks: number;
  passPercentage: number;
  instructions: string | null;
  isPublished: boolean;
}

export interface ExamStatsDto {
  totalExams: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
}

export interface ExamsOverviewDto {
  department: DepartmentDto | null;
  stats: ExamStatsDto;
  upcomingExams: ExamDto[];
  completedExams: ExamDto[];
  examTypes: string[];
  subjects: SubjectDto[];
}

export interface ExamResultDto {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  marksObtained: number;
  grade: string;
  isPassed: boolean;
}

export interface GradeDistributionDto {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
}

export interface ExamDetailDto extends ExamDto {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  gradeDistribution: GradeDistributionDto;
  results: ExamResultDto[];
}

export interface SemesterStatDto {
  semester: number;
  students: number;
  avgPassRate: number;
}

export interface TypeStatDto {
  type: string;
  typeValue: string;
  exams: number;
  avgPassRate: number;
}

export interface ExamAnalyticsDto {
  department: DepartmentDto | null;
  totalExams: number;
  bySemester: SemesterStatDto[];
  byType: TypeStatDto[];
}

export interface QueryExamsParams {
  semester?: string;
  type?: string;
  status?: string;
  search?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ScheduleExamInput {
  subjectId: string;
  type: string;
  name: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  maxMarks: number;
  passingMarks: number;
  venue?: string;
  instructions?: string;
  isPublished?: boolean;
}

export interface UpdateExamInput {
  name?: string;
  date?: string;
  startTime?: string;
  durationMinutes?: number;
  maxMarks?: number;
  passingMarks?: number;
  venue?: string;
  instructions?: string;
  status?: string;
  isPublished?: boolean;
}

export interface UpdateExamStatusInput {
  status: string;
  reason?: string;
}

// ============ API Helper ============

async function hodExamsApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/hod/exams${endpoint}`, {
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

// ============ API Functions ============

async function fetchExamsOverview(tenantId: string, params: QueryExamsParams = {}): Promise<ExamsOverviewDto> {
  const queryParams = new URLSearchParams();

  if (params.semester) queryParams.append('semester', params.semester);
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.subjectId) queryParams.append('subjectId', params.subjectId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  return hodExamsApi<ExamsOverviewDto>(queryString ? `?${queryString}` : '', tenantId);
}

async function fetchExamById(tenantId: string, examId: string): Promise<ExamDetailDto> {
  return hodExamsApi<ExamDetailDto>(`/${examId}`, tenantId);
}

async function fetchExamStats(tenantId: string): Promise<ExamAnalyticsDto> {
  return hodExamsApi<ExamAnalyticsDto>('/stats', tenantId);
}

async function scheduleExam(tenantId: string, data: ScheduleExamInput): Promise<{ message: string; exam: ExamDto }> {
  return hodExamsApi<{ message: string; exam: ExamDto }>('', tenantId, { method: 'POST', body: data });
}

async function updateExam(tenantId: string, examId: string, data: UpdateExamInput): Promise<{ message: string; exam: ExamDto }> {
  return hodExamsApi<{ message: string; exam: ExamDto }>(`/${examId}`, tenantId, { method: 'PATCH', body: data });
}

async function updateExamStatus(tenantId: string, examId: string, data: UpdateExamStatusInput): Promise<{ message: string; exam: ExamDto }> {
  return hodExamsApi<{ message: string; exam: ExamDto }>(`/${examId}/status`, tenantId, { method: 'PATCH', body: data });
}

async function deleteExam(tenantId: string, examId: string): Promise<{ message: string }> {
  return hodExamsApi<{ message: string }>(`/${examId}`, tenantId, { method: 'DELETE' });
}

// ============ Hooks ============

export function useHodExams(tenantId: string, params: QueryExamsParams = {}) {
  return useQuery({
    queryKey: ['hod-exams', tenantId, params],
    queryFn: () => fetchExamsOverview(tenantId, params),
    enabled: !!tenantId,
    staleTime: 30 * 1000,
  });
}

export function useHodExamById(tenantId: string, examId: string | null) {
  return useQuery({
    queryKey: ['hod-exams', 'detail', tenantId, examId],
    queryFn: () => fetchExamById(tenantId, examId!),
    enabled: !!tenantId && !!examId,
  });
}

export function useHodExamStats(tenantId: string) {
  return useQuery({
    queryKey: ['hod-exams', 'stats', tenantId],
    queryFn: () => fetchExamStats(tenantId),
    enabled: !!tenantId,
    staleTime: 60 * 1000,
  });
}

export function useScheduleExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleExamInput) => scheduleExam(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-exams'] });
    },
  });
}

export function useUpdateExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: UpdateExamInput }) =>
      updateExam(tenantId, examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-exams'] });
    },
  });
}

export function useUpdateExamStatus(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: UpdateExamStatusInput }) =>
      updateExamStatus(tenantId, examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-exams'] });
    },
  });
}

export function useDeleteExam(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => deleteExam(tenantId, examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-exams'] });
    },
  });
}
