'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface DepartmentInfoDto {
  id: string;
  name: string;
  code: string;
}

export interface DepartmentStatsDto {
  totalFaculty: number;
  totalStudents: number;
  activeSubjects: number;
  avgAttendance: number;
  avgCGPA: number;
  atRiskStudents: number;
  presentToday: number;
  onLeaveToday: number;
}

export interface FacultyOverviewDto {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  subjectCount: number;
  attendancePercentage: number;
  classesToday: number;
  isOnLeave: boolean;
}

export interface SemesterOverviewDto {
  semester: number;
  students: number;
  avgAttendance: number;
  avgCGPA: number | null;
  atRisk: number;
}

export interface AlertDto {
  id: string;
  type: 'attendance' | 'academic' | 'faculty' | 'system';
  message: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
  relatedId?: string;
}

export interface EventDto {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'exam' | 'event' | 'deadline';
  description?: string;
}

export interface PendingApprovalDto {
  id: string;
  type: string;
  from: string;
  fromId: string;
  submitted: string;
  details: string;
}

export interface HodDashboardResponse {
  department: DepartmentInfoDto | null;
  hodInfo: {
    name: string;
    designation: string;
  };
  stats: DepartmentStatsDto;
  facultyOverview: FacultyOverviewDto[];
  semesterOverview: SemesterOverviewDto[];
  recentAlerts: AlertDto[];
  upcomingEvents: EventDto[];
  pendingApprovals: PendingApprovalDto[];
}

// ============ API Client ============

async function hodDashboardApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/hod-dashboard${endpoint}`, {
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

export const hodDashboardKeys = {
  all: ['hod-dashboard'] as const,
  dashboard: (tenantId: string) =>
    [...hodDashboardKeys.all, 'dashboard', tenantId] as const,
  stats: (tenantId: string) =>
    [...hodDashboardKeys.all, 'stats', tenantId] as const,
  facultyOverview: (tenantId: string) =>
    [...hodDashboardKeys.all, 'faculty-overview', tenantId] as const,
  alerts: (tenantId: string) =>
    [...hodDashboardKeys.all, 'alerts', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get complete HoD dashboard data
 */
export function useHodDashboard(tenantId: string) {
  return useQuery({
    queryKey: hodDashboardKeys.dashboard(tenantId),
    queryFn: () => hodDashboardApi<HodDashboardResponse>('', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get department stats only (lightweight)
 */
export function useHodDashboardStats(tenantId: string) {
  return useQuery({
    queryKey: hodDashboardKeys.stats(tenantId),
    queryFn: () => hodDashboardApi<DepartmentStatsDto>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get faculty overview
 */
export function useHodFacultyOverview(tenantId: string) {
  return useQuery({
    queryKey: hodDashboardKeys.facultyOverview(tenantId),
    queryFn: () => hodDashboardApi<FacultyOverviewDto[]>('/faculty-overview', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get alerts
 */
export function useHodAlerts(tenantId: string) {
  return useQuery({
    queryKey: hodDashboardKeys.alerts(tenantId),
    queryFn: () => hodDashboardApi<AlertDto[]>('/alerts', tenantId),
    enabled: !!tenantId,
  });
}
