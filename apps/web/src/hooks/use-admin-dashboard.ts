'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface AdminInfo {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
}

export interface DashboardStats {
  totalStudents: number;
  newAdmissions: number;
  pendingApplications: number;
  todayCollections: number;
  monthlyTarget: number;
  monthlyCollected: number;
  pendingFees: number;
  certificatesRequested: number;
  pendingVerifications: number;
}

export interface RecentCollection {
  id: string;
  studentName: string;
  rollNo: string;
  amount: number;
  type: string;
  time: string;
  mode: string;
}

export interface PendingApplication {
  id: string;
  name: string;
  type: string;
  branch?: string;
  from?: string;
  to?: string;
  submitted: string;
  status: string;
  priority: string;
}

export interface CertificateRequest {
  id: string;
  studentName: string;
  rollNo: string;
  type: string;
  requestDate: string;
  status: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  audience: string;
  status: string;
}

export interface AdminDashboardResponse {
  adminInfo: AdminInfo;
  stats: DashboardStats;
  recentCollections: RecentCollection[];
  pendingApplications: PendingApplication[];
  certificateRequests: CertificateRequest[];
  upcomingTasks: UpcomingTask[];
  recentAnnouncements: Announcement[];
}

// Query params
export interface QueryCollectionsParams {
  limit?: number;
  date?: string;
}

export interface QueryApplicationsParams {
  status?: 'all' | 'pending' | 'document_review' | 'verification' | 'approved' | 'rejected';
  limit?: number;
}

export interface QueryCertificatesParams {
  status?: 'all' | 'pending' | 'processing' | 'ready' | 'issued';
  limit?: number;
}

export interface QueryTasksParams {
  priority?: 'all' | 'high' | 'medium' | 'low';
  limit?: number;
}

export interface QueryAnnouncementsParams {
  status?: 'all' | 'active' | 'scheduled' | 'draft' | 'expired';
  limit?: number;
}

// ============ API Client ============

async function adminDashboardApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/admin-dashboard${endpoint}`, {
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

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  dashboard: (tenantId: string) =>
    [...adminDashboardKeys.all, 'dashboard', tenantId] as const,
  collections: (tenantId: string, params?: QueryCollectionsParams) =>
    [...adminDashboardKeys.all, 'collections', tenantId, params] as const,
  applications: (tenantId: string, params?: QueryApplicationsParams) =>
    [...adminDashboardKeys.all, 'applications', tenantId, params] as const,
  certificates: (tenantId: string, params?: QueryCertificatesParams) =>
    [...adminDashboardKeys.all, 'certificates', tenantId, params] as const,
  tasks: (tenantId: string, params?: QueryTasksParams) =>
    [...adminDashboardKeys.all, 'tasks', tenantId, params] as const,
  announcements: (tenantId: string, params?: QueryAnnouncementsParams) =>
    [...adminDashboardKeys.all, 'announcements', tenantId, params] as const,
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
 * Get complete admin dashboard data
 */
export function useAdminDashboard(tenantId: string) {
  return useQuery({
    queryKey: adminDashboardKeys.dashboard(tenantId),
    queryFn: () =>
      adminDashboardApi<AdminDashboardResponse>('', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get recent fee collections
 */
export function useAdminCollections(tenantId: string, params?: QueryCollectionsParams) {
  return useQuery({
    queryKey: adminDashboardKeys.collections(tenantId, params),
    queryFn: () =>
      adminDashboardApi<{ collections: RecentCollection[]; total: number; todayTotal: number }>(
        `/collections${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get pending admission applications
 */
export function useAdminApplications(tenantId: string, params?: QueryApplicationsParams) {
  return useQuery({
    queryKey: adminDashboardKeys.applications(tenantId, params),
    queryFn: () =>
      adminDashboardApi<{ applications: PendingApplication[]; total: number }>(
        `/applications${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get certificate requests
 */
export function useAdminCertificates(tenantId: string, params?: QueryCertificatesParams) {
  return useQuery({
    queryKey: adminDashboardKeys.certificates(tenantId, params),
    queryFn: () =>
      adminDashboardApi<{ certificates: CertificateRequest[]; total: number }>(
        `/certificates${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get upcoming tasks
 */
export function useAdminTasks(tenantId: string, params?: QueryTasksParams) {
  return useQuery({
    queryKey: adminDashboardKeys.tasks(tenantId, params),
    queryFn: () =>
      adminDashboardApi<{ tasks: UpcomingTask[]; total: number }>(
        `/tasks${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get recent announcements
 */
export function useAdminAnnouncements(tenantId: string, params?: QueryAnnouncementsParams) {
  return useQuery({
    queryKey: adminDashboardKeys.announcements(tenantId, params),
    queryFn: () =>
      adminDashboardApi<{ announcements: Announcement[]; total: number }>(
        `/announcements${buildQueryString(params)}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}
