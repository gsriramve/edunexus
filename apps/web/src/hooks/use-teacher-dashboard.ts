'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface TeacherInfoDto {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  departmentCode: string;
  designation: string;
  email: string;
  subjectsCount: number;
  totalStudents: number;
}

export interface ScheduleItemDto {
  id: string;
  time: string;
  subject: string;
  subjectCode: string;
  section: string | null;
  room: string | null;
  type: 'Lecture' | 'Lab';
  students: number;
}

export interface PendingTaskDto {
  id: string;
  task: string;
  type: 'attendance' | 'assignment' | 'material' | 'marks';
  due: string;
  urgent: boolean;
  relatedId?: string;
}

export interface SubjectStatsDto {
  id: string;
  subject: string;
  code: string;
  sections: number;
  students: number;
  avgAttendance: number;
  classesThisWeek: number;
}

export interface QuickStatsDto {
  totalStudents: number;
  classesToday: number;
  subjectsCount: number;
  pendingTasks: number;
  upcomingExams: number;
  lowAttendanceStudents: number;
}

export interface TeacherDashboardResponse {
  teacher: TeacherInfoDto;
  quickStats: QuickStatsDto;
  todaySchedule: ScheduleItemDto[];
  pendingTasks: PendingTaskDto[];
  subjectStats: SubjectStatsDto[];
}

// ============ API Client ============

async function teacherDashboardApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/teacher-dashboard${endpoint}`, {
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

export const teacherDashboardKeys = {
  all: ['teacher-dashboard'] as const,
  dashboard: (tenantId: string) =>
    [...teacherDashboardKeys.all, 'dashboard', tenantId] as const,
  schedule: (tenantId: string) =>
    [...teacherDashboardKeys.all, 'schedule', tenantId] as const,
  tasks: (tenantId: string) =>
    [...teacherDashboardKeys.all, 'tasks', tenantId] as const,
  subjects: (tenantId: string) =>
    [...teacherDashboardKeys.all, 'subjects', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get complete teacher dashboard data
 */
export function useTeacherDashboard(tenantId: string) {
  return useQuery({
    queryKey: teacherDashboardKeys.dashboard(tenantId),
    queryFn: () => teacherDashboardApi<TeacherDashboardResponse>('', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get today's schedule only
 */
export function useTeacherSchedule(tenantId: string) {
  return useQuery({
    queryKey: teacherDashboardKeys.schedule(tenantId),
    queryFn: () => teacherDashboardApi<ScheduleItemDto[]>('/schedule', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get pending tasks only
 */
export function useTeacherTasks(tenantId: string) {
  return useQuery({
    queryKey: teacherDashboardKeys.tasks(tenantId),
    queryFn: () => teacherDashboardApi<PendingTaskDto[]>('/tasks', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get subject stats only
 */
export function useTeacherSubjects(tenantId: string) {
  return useQuery({
    queryKey: teacherDashboardKeys.subjects(tenantId),
    queryFn: () => teacherDashboardApi<SubjectStatsDto[]>('/subjects', tenantId),
    enabled: !!tenantId,
  });
}
