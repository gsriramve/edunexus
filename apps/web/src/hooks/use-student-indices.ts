'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface SgiQueryParams {
  month?: number;
  year?: number;
  limit?: number;
}

export interface CriQueryParams {
  latestOnly?: boolean;
  limit?: number;
}

export interface BulkCalculateSgiInput {
  departmentId?: string;
  batch?: string;
  month: number;
  year: number;
}

export interface BulkCalculateCriInput {
  departmentId?: string;
  batch?: string;
}

export interface UpdateIndexConfigInput {
  sgiAcademicWeight?: number;
  sgiEngagementWeight?: number;
  sgiSkillsWeight?: number;
  sgiBehavioralWeight?: number;
  criResumeWeight?: number;
  criInterviewWeight?: number;
  criSkillFitWeight?: number;
  criExposureWeight?: number;
  sgiAlertThreshold?: number;
  criAlertThreshold?: number;
}

export interface SgiData {
  id: string;
  studentId: string;
  month: number;
  year: number;
  sgiScore: number;
  sgiTrend: string;
  trendDelta: number;
  academicScore: number;
  engagementScore: number;
  skillsScore: number;
  behavioralScore: number;
  academicBreakdown: any;
  engagementBreakdown: any;
  skillsBreakdown: any;
  behavioralBreakdown: any;
  insightsSummary: string | null;
  recommendations: any;
  dataCompleteness: number;
  calculatedAt: string;
  student?: {
    user?: { name: string; email: string };
    department?: { name: string; code: string };
  };
}

export interface CriData {
  id: string;
  studentId: string;
  criScore: number;
  placementProbability: number;
  salaryBand: string;
  resumeScore: number;
  interviewScore: number;
  skillRoleFitScore: number;
  industryExposureScore: number;
  skillGaps: any[] | null;
  targetRoles: any[] | null;
  topMatchingCompanies: any[] | null;
  actionPlan: any[] | null;
  confidenceScore: number;
  assessmentDate: string;
  student?: {
    user?: { name: string; email: string };
    department?: { name: string; code: string };
  };
}

export interface IndexConfig {
  id: string;
  tenantId: string;
  sgiAcademicWeight: number;
  sgiEngagementWeight: number;
  sgiSkillsWeight: number;
  sgiBehavioralWeight: number;
  criResumeWeight: number;
  criInterviewWeight: number;
  criSkillFitWeight: number;
  criExposureWeight: number;
  sgiAlertThreshold: number;
  criAlertThreshold: number;
}

export interface SgiStats {
  tenantAverageSgi: number;
  totalStudents: number;
  improvingCount: number;
  decliningCount: number;
  stableCount: number;
  byDepartment: any[];
  topPerformers: SgiData[];
  atRiskStudents: SgiData[];
  month: number;
  year: number;
}

export interface CriStats {
  tenantAverageCri: number;
  totalStudents: number;
  placementReadyCount: number;
  needsImprovementCount: number;
  averagePlacementProbability: number;
  salaryBandDistribution: Record<string, number>;
  byDepartment: any[];
  topSkillGaps: any[];
}

export interface AlertData {
  studentId: string;
  studentName?: string;
  department?: string;
  sgiScore?: number;
  criScore?: number;
  trend?: string;
  placementProbability?: number;
  alertLevel: 'warning' | 'critical';
}

export interface StudentDashboardData {
  studentId: string;
  sgi: {
    current: SgiData | null;
    history: SgiData[];
    trend: string;
  };
  cri: {
    current: CriData | null;
    placementProbability: number;
    salaryBand: string;
  };
  insights: string[];
  lastUpdated: string;
}

// API Client
async function studentIndicesApi<T>(
  endpoint: string,
  tenantId: string,
  options: { method?: string; body?: any } = {}
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

  const response = await fetch(`${getApiBaseUrl()}/student-indices${endpoint}`, {
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

// Query Keys
export const studentIndicesKeys = {
  all: ['student-indices'] as const,
  sgi: () => [...studentIndicesKeys.all, 'sgi'] as const,
  sgiStudent: (tenantId: string, studentId: string) =>
    [...studentIndicesKeys.sgi(), tenantId, studentId] as const,
  sgiStats: (tenantId: string, departmentId?: string) =>
    [...studentIndicesKeys.sgi(), 'stats', tenantId, departmentId] as const,
  sgiAlerts: (tenantId: string, departmentId?: string) =>
    [...studentIndicesKeys.sgi(), 'alerts', tenantId, departmentId] as const,
  cri: () => [...studentIndicesKeys.all, 'cri'] as const,
  criStudent: (tenantId: string, studentId: string) =>
    [...studentIndicesKeys.cri(), tenantId, studentId] as const,
  criStats: (tenantId: string, departmentId?: string) =>
    [...studentIndicesKeys.cri(), 'stats', tenantId, departmentId] as const,
  criAlerts: (tenantId: string, departmentId?: string) =>
    [...studentIndicesKeys.cri(), 'alerts', tenantId, departmentId] as const,
  config: (tenantId: string) => [...studentIndicesKeys.all, 'config', tenantId] as const,
  dashboard: (tenantId: string, studentId: string) =>
    [...studentIndicesKeys.all, 'dashboard', tenantId, studentId] as const,
  departmentOverview: (tenantId: string, departmentId: string) =>
    [...studentIndicesKeys.all, 'department', tenantId, departmentId] as const,
};

// ============ SGI Hooks ============

export function useStudentSgi(tenantId: string, studentId: string, params?: SgiQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.set('month', params.month.toString());
  if (params?.year) queryParams.set('year', params.year.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentIndicesKeys.sgiStudent(tenantId, studentId),
    queryFn: () =>
      studentIndicesApi<{ studentId: string; history: SgiData[]; latest: SgiData | null } | SgiData>(
        `/sgi/${studentId}${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

export function useSgiStats(tenantId: string, departmentId?: string) {
  const queryParams = departmentId ? `?departmentId=${departmentId}` : '';

  return useQuery({
    queryKey: studentIndicesKeys.sgiStats(tenantId, departmentId),
    queryFn: () => studentIndicesApi<SgiStats>(`/sgi-stats${queryParams}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useSgiAlerts(tenantId: string, departmentId?: string, threshold?: number) {
  const queryParams = new URLSearchParams();
  if (departmentId) queryParams.set('departmentId', departmentId);
  if (threshold) queryParams.set('threshold', threshold.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentIndicesKeys.sgiAlerts(tenantId, departmentId),
    queryFn: () => studentIndicesApi<AlertData[]>(`/alerts/sgi${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useCalculateSgi(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, month, year }: { studentId: string; month: number; year: number }) =>
      studentIndicesApi<SgiData>(
        `/sgi/calculate/${studentId}?month=${month}&year=${year}`,
        tenantId,
        { method: 'POST' }
      ),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.sgiStudent(tenantId, studentId) });
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.sgiStats(tenantId) });
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.sgiAlerts(tenantId) });
    },
  });
}

export function useBulkCalculateSgi(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCalculateSgiInput) =>
      studentIndicesApi<{ total: number; successful: number; failed: number; errors: string[] }>(
        '/sgi/bulk-calculate',
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.sgi() });
    },
  });
}

// ============ CRI Hooks ============

export function useStudentCri(tenantId: string, studentId: string, params?: CriQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.latestOnly !== undefined) queryParams.set('latestOnly', params.latestOnly.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentIndicesKeys.criStudent(tenantId, studentId),
    queryFn: () =>
      studentIndicesApi<{ studentId: string; history: CriData[]; latest: CriData | null } | CriData>(
        `/cri/${studentId}${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

export function useCriStats(tenantId: string, departmentId?: string) {
  const queryParams = departmentId ? `?departmentId=${departmentId}` : '';

  return useQuery({
    queryKey: studentIndicesKeys.criStats(tenantId, departmentId),
    queryFn: () => studentIndicesApi<CriStats>(`/cri-stats${queryParams}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useCriAlerts(tenantId: string, departmentId?: string, threshold?: number) {
  const queryParams = new URLSearchParams();
  if (departmentId) queryParams.set('departmentId', departmentId);
  if (threshold) queryParams.set('threshold', threshold.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentIndicesKeys.criAlerts(tenantId, departmentId),
    queryFn: () => studentIndicesApi<AlertData[]>(`/alerts/cri${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useCalculateCri(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) =>
      studentIndicesApi<CriData>(`/cri/calculate/${studentId}`, tenantId, { method: 'POST' }),
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.criStudent(tenantId, studentId) });
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.criStats(tenantId) });
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.criAlerts(tenantId) });
    },
  });
}

export function useBulkCalculateCri(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCalculateCriInput) =>
      studentIndicesApi<{ total: number; successful: number; failed: number; errors: string[] }>(
        '/cri/bulk-calculate',
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.cri() });
    },
  });
}

// ============ Configuration Hooks ============

export function useIndexConfig(tenantId: string) {
  return useQuery({
    queryKey: studentIndicesKeys.config(tenantId),
    queryFn: () => studentIndicesApi<IndexConfig>('/config', tenantId),
    enabled: !!tenantId,
  });
}

export function useUpdateIndexConfig(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIndexConfigInput) =>
      studentIndicesApi<IndexConfig>('/config', tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentIndicesKeys.config(tenantId) });
    },
  });
}

// ============ Dashboard Hooks ============

export function useStudentIndicesDashboard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: studentIndicesKeys.dashboard(tenantId, studentId),
    queryFn: () => studentIndicesApi<StudentDashboardData>(`/dashboard/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useDepartmentOverview(tenantId: string, departmentId: string) {
  return useQuery({
    queryKey: studentIndicesKeys.departmentOverview(tenantId, departmentId),
    queryFn: () =>
      studentIndicesApi<{
        departmentId: string;
        sgi: SgiStats;
        cri: CriStats;
        alerts: { sgi: AlertData[]; cri: AlertData[] };
        lastUpdated: string;
      }>(`/department/${departmentId}`, tenantId),
    enabled: !!tenantId && !!departmentId,
  });
}
