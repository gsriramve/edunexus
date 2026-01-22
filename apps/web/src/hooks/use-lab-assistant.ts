'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface LabAssistantInfo {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  assignedLabs: string[];
}

export interface LabStats {
  totalLabs: number;
  totalBatches: number;
  studentsToday: number;
  pendingMarks: number;
  equipmentIssues: number;
  attendanceMarked: number;
}

export interface Lab {
  id: string;
  name: string;
  code: string;
  room?: string;
  capacity?: number;
}

export interface LabSession {
  id: string;
  time: string;
  lab: string;
  labId: string;
  batch: string;
  batchId: string;
  students: number;
  faculty: string;
  facultyId: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

export interface WeekSession {
  lab: string;
  batch: string;
  time: string;
}

export interface WeekScheduleDay {
  day: string;
  sessions: WeekSession[];
}

export interface RecentAttendance {
  id: string;
  batch: string;
  batchId: string;
  lab: string;
  labId: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface PendingTask {
  id: string;
  type: 'marks' | 'equipment' | 'attendance' | 'other';
  title: string;
  lab: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EquipmentAlert {
  id: string;
  lab: string;
  labId: string;
  item: string;
  assetId: string;
  issue: string;
  reportedOn: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DashboardResponse {
  labAssistantInfo: LabAssistantInfo;
  stats: LabStats;
  todaySchedule: LabSession[];
  weekSchedule: WeekScheduleDay[];
  recentAttendance: RecentAttendance[];
  pendingTasks: PendingTask[];
  equipmentAlerts: EquipmentAlert[];
}

export interface Batch {
  id: string;
  name: string;
  semester: number;
  section: string;
  students: number;
}

export interface StudentAttendance {
  id: string;
  rollNo: string;
  name: string;
  status?: 'present' | 'absent' | 'late';
}

export interface AttendanceHistory {
  id: string;
  date: string;
  lab: string;
  labId: string;
  batch: string;
  batchId: string;
  labNo: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface LowAttendanceStudent {
  id: string;
  rollNo: string;
  name: string;
  batch: string;
  batchId: string;
  attendance: number;
  sessionsAttended: number;
  totalSessions: number;
}

export interface EquipmentStats {
  total: number;
  working: number;
  underRepair: number;
  faulty: number;
}

export interface Equipment {
  id: string;
  name: string;
  assetId: string;
  lab: string;
  labId: string;
  location: string;
  status: 'working' | 'under_repair' | 'faulty';
  lastMaintenance: string | null;
  specs: string | null;
  issue?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  equipment: string;
  equipmentId: string;
  lab: string;
  labId: string;
  issue: string;
  reportedDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string | null;
  estimatedCompletion: string | null;
  completedDate: string | null;
}

export interface IssueReport {
  id: string;
  assetId: string;
  equipment: string;
  equipmentId: string;
  lab: string;
  labId: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  reportedOn: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// Marks-related types
export interface PracticalExam {
  id: string;
  name: string;
  lab: string;
  labId: string;
  date: string;
  totalMarks: number;
  batch: string;
  batchId: string;
  marksEntered: number;
  totalStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface StudentForMarks {
  id: string;
  rollNo: string;
  name: string;
  section: string;
  marks: number | null;
  percentage: number | null;
  grade: string | null;
}

export interface MarksStats {
  totalStudents: number;
  marksEntered: number;
  pending: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

export interface ExamMarksDetail {
  exam: PracticalExam;
  stats: MarksStats;
  students: StudentForMarks[];
}

// Query params
export interface QueryBatchesParams {
  labId?: string;
  semester?: number;
}

export interface QueryStudentsParams {
  batchId?: string;
  labId?: string;
  search?: string;
}

export interface QueryAttendanceHistoryParams {
  labId?: string;
  batchId?: string;
  limit?: number;
}

export interface QueryEquipmentParams {
  labId?: string;
  status?: 'all' | 'working' | 'under_repair' | 'faulty';
  search?: string;
}

export interface QueryIssuesParams {
  labId?: string;
  status?: 'all' | 'pending' | 'in_progress' | 'completed';
  priority?: 'all' | 'high' | 'medium' | 'low';
}

export interface QueryPracticalExamsParams {
  labId?: string;
  status?: 'all' | 'upcoming' | 'ongoing' | 'completed';
}

export interface QueryStudentsForMarksParams {
  examId: string;
  section?: string;
  search?: string;
}

// Mutation inputs
export interface CreateAttendanceInput {
  labId: string;
  batchId: string;
  date: string;
  labNumber: number;
  timeSlot: string;
  attendance: Array<{ studentId: string; status: 'present' | 'absent' | 'late' }>;
}

export interface CreateEquipmentIssueInput {
  equipmentId: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UpdateEquipmentStatusInput {
  status: 'working' | 'under_repair' | 'faulty';
  issue?: string;
}

export interface SaveMarksInput {
  examId: string;
  marks: Array<{ studentId: string; marks: number }>;
}

// ============ API Client ============

async function labAssistantApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/lab-assistant${endpoint}`, {
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

export const labAssistantKeys = {
  all: ['lab-assistant'] as const,
  dashboard: (tenantId: string) =>
    [...labAssistantKeys.all, 'dashboard', tenantId] as const,
  labs: (tenantId: string) =>
    [...labAssistantKeys.all, 'labs', tenantId] as const,
  batches: (tenantId: string, params?: QueryBatchesParams) =>
    [...labAssistantKeys.all, 'batches', tenantId, params] as const,
  students: (tenantId: string, params?: QueryStudentsParams) =>
    [...labAssistantKeys.all, 'students', tenantId, params] as const,
  attendanceHistory: (tenantId: string, params?: QueryAttendanceHistoryParams) =>
    [...labAssistantKeys.all, 'attendance-history', tenantId, params] as const,
  lowAttendance: (tenantId: string) =>
    [...labAssistantKeys.all, 'low-attendance', tenantId] as const,
  equipment: (tenantId: string, params?: QueryEquipmentParams) =>
    [...labAssistantKeys.all, 'equipment', tenantId, params] as const,
  issues: (tenantId: string, params?: QueryIssuesParams) =>
    [...labAssistantKeys.all, 'issues', tenantId, params] as const,
  maintenance: (tenantId: string) =>
    [...labAssistantKeys.all, 'maintenance', tenantId] as const,
  practicalExams: (tenantId: string, params?: QueryPracticalExamsParams) =>
    [...labAssistantKeys.all, 'practical-exams', tenantId, params] as const,
  examMarks: (tenantId: string, examId: string, params?: { section?: string; search?: string }) =>
    [...labAssistantKeys.all, 'exam-marks', tenantId, examId, params] as const,
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
 * Get dashboard data for lab assistant
 */
export function useLabAssistantDashboard(tenantId: string) {
  return useQuery({
    queryKey: labAssistantKeys.dashboard(tenantId),
    queryFn: () =>
      labAssistantApi<DashboardResponse>('/dashboard', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get labs assigned to lab assistant
 */
export function useLabAssistantLabs(tenantId: string) {
  return useQuery({
    queryKey: labAssistantKeys.labs(tenantId),
    queryFn: () =>
      labAssistantApi<{ labs: Lab[]; total: number }>('/labs', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get batches for lab sessions
 */
export function useLabAssistantBatches(tenantId: string, params?: QueryBatchesParams) {
  return useQuery({
    queryKey: labAssistantKeys.batches(tenantId, params),
    queryFn: () =>
      labAssistantApi<{ batches: Batch[]; total: number }>(
        `/batches${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get students for attendance marking
 */
export function useLabAssistantStudents(tenantId: string, params?: QueryStudentsParams) {
  return useQuery({
    queryKey: labAssistantKeys.students(tenantId, params),
    queryFn: () =>
      labAssistantApi<{ students: StudentAttendance[]; total: number }>(
        `/students${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get attendance history
 */
export function useAttendanceHistory(tenantId: string, params?: QueryAttendanceHistoryParams) {
  return useQuery({
    queryKey: labAssistantKeys.attendanceHistory(tenantId, params),
    queryFn: () =>
      labAssistantApi<{ records: AttendanceHistory[]; total: number }>(
        `/attendance/history${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get students with low attendance
 */
export function useLowAttendanceStudents(tenantId: string) {
  return useQuery({
    queryKey: labAssistantKeys.lowAttendance(tenantId),
    queryFn: () =>
      labAssistantApi<{ students: LowAttendanceStudent[]; total: number }>(
        '/attendance/low',
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get equipment inventory
 */
export function useLabEquipment(tenantId: string, params?: QueryEquipmentParams) {
  return useQuery({
    queryKey: labAssistantKeys.equipment(tenantId, params),
    queryFn: () =>
      labAssistantApi<{ stats: EquipmentStats; equipment: Equipment[]; total: number }>(
        `/equipment${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get reported equipment issues
 */
export function useEquipmentIssues(tenantId: string, params?: QueryIssuesParams) {
  return useQuery({
    queryKey: labAssistantKeys.issues(tenantId, params),
    queryFn: () =>
      labAssistantApi<{ issues: IssueReport[]; total: number }>(
        `/equipment/issues${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get maintenance history
 */
export function useMaintenanceHistory(tenantId: string) {
  return useQuery({
    queryKey: labAssistantKeys.maintenance(tenantId),
    queryFn: () =>
      labAssistantApi<{ records: MaintenanceRecord[]; total: number }>(
        '/equipment/maintenance',
        tenantId
      ),
    enabled: !!tenantId,
  });
}

// ============ Mutation Hooks ============

/**
 * Submit attendance for a lab session
 */
export function useSubmitAttendance(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceInput) =>
      labAssistantApi<{ success: boolean; recorded: number }>('/attendance', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labAssistantKeys.all });
    },
  });
}

/**
 * Report an equipment issue
 */
export function useReportEquipmentIssue(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEquipmentIssueInput) =>
      labAssistantApi<{ success: boolean; issueId: string }>('/equipment/issues', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labAssistantKeys.all });
    },
  });
}

/**
 * Update equipment status
 */
export function useUpdateEquipmentStatus(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentStatusInput }) =>
      labAssistantApi<{ success: boolean }>(`/equipment/${id}/status`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labAssistantKeys.all });
    },
  });
}

// ============ Marks Query Hooks ============

/**
 * Get practical exams for lab assistant
 */
export function usePracticalExams(tenantId: string, params?: QueryPracticalExamsParams) {
  return useQuery({
    queryKey: labAssistantKeys.practicalExams(tenantId, params),
    queryFn: () =>
      labAssistantApi<{ exams: PracticalExam[]; total: number }>(
        `/marks/exams${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get students and their marks for a specific exam
 */
export function useExamMarks(
  tenantId: string,
  examId: string,
  params?: { section?: string; search?: string }
) {
  return useQuery({
    queryKey: labAssistantKeys.examMarks(tenantId, examId, params),
    queryFn: () =>
      labAssistantApi<ExamMarksDetail>(
        `/marks/exams/${examId}${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId && !!examId,
  });
}

/**
 * Save marks for a practical exam
 */
export function useSaveMarks(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveMarksInput) =>
      labAssistantApi<{ success: boolean; saved: number; failed: number }>(
        '/marks',
        tenantId,
        {
          method: 'POST',
          body: data,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labAssistantKeys.all });
    },
  });
}
