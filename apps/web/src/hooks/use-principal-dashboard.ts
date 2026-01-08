'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface InstitutionStatsDto {
  totalDepartments: number;
  departmentsWithHod: number;
  totalStaff: number;
  activeStaff: number;
  totalStudents: number;
  activeStudents: number;
  avgAttendance: number;
  totalFeeCollected: number;
  pendingFees: number;
  upcomingExams: number;
}

export interface DepartmentPerformanceDto {
  id: string;
  name: string;
  code: string;
  hodName: string | null;
  studentCount: number;
  staffCount: number;
  avgAttendance: number;
  atRiskStudents: number;
}

export interface AlertDto {
  id: string;
  type: 'attendance' | 'academic' | 'fee' | 'staff' | 'system';
  message: string;
  severity: 'high' | 'medium' | 'low';
  departmentId?: string;
  departmentCode?: string;
  count?: number;
  createdAt: string;
}

export interface ActivityDto {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}

export interface EventDto {
  id: string;
  title: string;
  type: 'exam' | 'meeting' | 'event' | 'deadline' | 'holiday';
  date: string;
  time?: string;
  departmentId?: string;
  departmentCode?: string;
  description?: string;
}

export interface SemesterDistributionDto {
  semester: number;
  studentCount: number;
  avgAttendance: number;
}

export interface FeeCollectionDto {
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  thisMonthCollected: number;
  overdueCount: number;
}

export interface PrincipalDashboardResponse {
  institutionStats: InstitutionStatsDto;
  departmentPerformance: DepartmentPerformanceDto[];
  semesterDistribution: SemesterDistributionDto[];
  feeCollection: FeeCollectionDto;
  recentAlerts: AlertDto[];
  recentActivities: ActivityDto[];
  upcomingEvents: EventDto[];
}

// ============ API Client ============

async function principalDashboardApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/principal-dashboard${endpoint}`, {
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

export const principalDashboardKeys = {
  all: ['principal-dashboard'] as const,
  dashboard: (tenantId: string) =>
    [...principalDashboardKeys.all, 'dashboard', tenantId] as const,
  stats: (tenantId: string) =>
    [...principalDashboardKeys.all, 'stats', tenantId] as const,
  departments: (tenantId: string) =>
    [...principalDashboardKeys.all, 'departments', tenantId] as const,
  alerts: (tenantId: string) =>
    [...principalDashboardKeys.all, 'alerts', tenantId] as const,
  fees: (tenantId: string) =>
    [...principalDashboardKeys.all, 'fees', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get complete principal dashboard data
 */
export function usePrincipalDashboard(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.dashboard(tenantId),
    queryFn: () => principalDashboardApi<PrincipalDashboardResponse>('', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get institution stats only (lightweight)
 */
export function usePrincipalStats(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.stats(tenantId),
    queryFn: () => principalDashboardApi<InstitutionStatsDto>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get department performance
 */
export function usePrincipalDepartments(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.departments(tenantId),
    queryFn: () => principalDashboardApi<DepartmentPerformanceDto[]>('/departments', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get alerts
 */
export function usePrincipalAlerts(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.alerts(tenantId),
    queryFn: () => principalDashboardApi<AlertDto[]>('/alerts', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get fee collection summary
 */
export function usePrincipalFeeCollection(tenantId: string) {
  return useQuery({
    queryKey: principalDashboardKeys.fees(tenantId),
    queryFn: () => principalDashboardApi<FeeCollectionDto>('/fees', tenantId),
    enabled: !!tenantId,
  });
}
