'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export type Framework = 'NBA' | 'NAAC' | 'NIRF';
export type ReportStatus = 'draft' | 'in_progress' | 'review' | 'submitted' | 'approved';
export type Trend = 'improving' | 'stable' | 'declining';
export type OverallHealth = 'excellent' | 'good' | 'needs_attention' | 'critical';

// NBA Categories
export type NbaCategory =
  | 'Vision, Mission and Program Educational Objectives'
  | 'Program Outcomes'
  | 'Program Curriculum'
  | 'Students'
  | 'Faculty'
  | 'Facilities and Technical Staff'
  | 'Continuous Improvement'
  | 'First Year Academics'
  | 'Student Support Systems'
  | 'Governance, Institutional Support and Financial Resources';

// NAAC Categories (Criteria)
export type NaacCategory =
  | 'Curricular Aspects'
  | 'Teaching-Learning and Evaluation'
  | 'Research, Innovations and Extension'
  | 'Infrastructure and Learning Resources'
  | 'Student Support and Progression'
  | 'Governance, Leadership and Management'
  | 'Institutional Values and Best Practices';

// NIRF Parameters
export type NirfCategory =
  | 'Teaching, Learning & Resources'
  | 'Research and Professional Practice'
  | 'Graduation Outcomes'
  | 'Outreach and Inclusivity'
  | 'Perception';

export interface AccreditationMetric {
  id: string;
  framework: Framework;
  criterionCode: string;
  criterionName: string;
  category: string;
  description?: string;
  maxScore: number;
  weightage: number;
  dataSource?: string;
  calculationFormula?: string;
  mappedEntities?: Record<string, unknown>;
  minThreshold?: number;
  maxThreshold?: number;
  isActive: boolean;
  values?: AccreditationValue[];
  createdAt: string;
  updatedAt: string;
}

export interface AccreditationValue {
  id: string;
  metricId: string;
  academicYear: string;
  rawValue?: number;
  normalizedValue?: number;
  score?: number;
  supportingData?: Record<string, unknown>;
  remarks?: string;
  previousValue?: number;
  trend?: Trend;
  isLatest: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  calculatedAt?: string;
  metric?: AccreditationMetric;
  createdAt: string;
  updatedAt: string;
}

export interface AccreditationReport {
  id: string;
  framework: Framework;
  academicYear: string;
  title: string;
  description?: string;
  status: ReportStatus;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  grade?: string;
  reportUrl?: string;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricWithValue {
  id: string;
  framework: Framework;
  criterionCode: string;
  criterionName: string;
  category: string;
  description?: string;
  maxScore: number;
  weightage: number;
  minThreshold?: number;
  maxThreshold?: number;
  currentValue?: {
    rawValue?: number;
    normalizedValue?: number;
    score?: number;
    trend?: Trend;
    previousValue?: number;
    academicYear: string;
  };
}

export interface CategorySummary {
  category: string;
  totalMetrics: number;
  completedMetrics: number;
  totalMaxScore: number;
  currentScore: number;
  percentage: number;
  trend: Trend;
  metrics: MetricWithValue[];
}

export interface FrameworkSummary {
  framework: Framework;
  academicYear: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade?: string; // For NAAC
  rank?: number; // For NIRF
  categories: CategorySummary[];
  trend: Trend;
  previousYearScore?: number;
  completionPercentage: number;
}

export interface DashboardSummary {
  nba?: FrameworkSummary;
  naac?: FrameworkSummary;
  nirf?: FrameworkSummary;
  overallHealth: OverallHealth;
  pendingActions: PendingAction[];
  recentUpdates: RecentUpdate[];
}

export interface PendingAction {
  framework: Framework;
  category: string;
  metric: string;
  action: string;
}

export interface RecentUpdate {
  metricName: string;
  framework: Framework;
  oldValue?: number;
  newValue: number;
  updatedAt: string;
}

export interface DataCollectionStatus {
  framework: Framework;
  academicYear: string;
  categories: {
    category: string;
    totalMetrics: number;
    collectedMetrics: number;
    verifiedMetrics: number;
    pendingMetrics: string[];
  }[];
  overallProgress: number;
  lastUpdated?: string;
}

export interface YearComparison {
  framework: Framework;
  academicYear1: string;
  academicYear2: string;
  year1Score: number;
  year2Score: number;
  change: number;
  changePercent: number;
  categoryComparison: {
    category: string;
    year1Score: number;
    year2Score: number;
    change: number;
  }[];
}

// ============ Query DTOs ============

export interface QueryMetricsParams {
  framework?: Framework;
  category?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface QueryValuesParams {
  framework?: Framework;
  academicYear?: string;
  category?: string;
  latestOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface QueryReportsParams {
  framework?: Framework;
  academicYear?: string;
  status?: ReportStatus;
  limit?: number;
  offset?: number;
}

// ============ Create/Update DTOs ============

export interface CreateMetricInput {
  framework: Framework;
  criterionCode: string;
  criterionName: string;
  category: string;
  description?: string;
  maxScore: number;
  weightage?: number;
  dataSource?: string;
  calculationFormula?: string;
  mappedEntities?: Record<string, unknown>;
  minThreshold?: number;
  maxThreshold?: number;
}

export interface UpdateMetricInput {
  criterionName?: string;
  description?: string;
  maxScore?: number;
  weightage?: number;
  dataSource?: string;
  calculationFormula?: string;
  mappedEntities?: Record<string, unknown>;
  minThreshold?: number;
  maxThreshold?: number;
  isActive?: boolean;
}

export interface CreateValueInput {
  metricId: string;
  academicYear: string;
  rawValue?: number;
  normalizedValue?: number;
  score?: number;
  supportingData?: Record<string, unknown>;
  remarks?: string;
}

export interface UpdateValueInput {
  rawValue?: number;
  normalizedValue?: number;
  score?: number;
  supportingData?: Record<string, unknown>;
  remarks?: string;
}

export interface BulkUpdateValuesInput {
  academicYear: string;
  values: {
    metricId: string;
    rawValue?: number;
    supportingData?: Record<string, unknown>;
    remarks?: string;
  }[];
}

export interface CreateReportInput {
  framework: Framework;
  academicYear: string;
  title: string;
  description?: string;
}

export interface UpdateReportInput {
  title?: string;
  description?: string;
  status?: ReportStatus;
  totalScore?: number;
  maxScore?: number;
  grade?: string;
  reportUrl?: string;
}

export interface SeedFrameworkInput {
  framework: Framework;
  overwrite?: boolean;
}

export interface CalculateFrameworkInput {
  framework: Framework;
  academicYear: string;
  recalculate?: boolean;
}

// ============ API Helper ============

async function accreditationApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authContext) {
    if (authContext.tenantId) headers['x-tenant-id'] = authContext.tenantId;
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
  }

  const response = await fetch(`${getApiBaseUrl()}/accreditation${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  // Handle no content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============ Query Keys ============

export const accreditationKeys = {
  all: ['accreditation'] as const,
  metrics: () => [...accreditationKeys.all, 'metrics'] as const,
  metricsList: (params: QueryMetricsParams) => [...accreditationKeys.metrics(), params] as const,
  metric: (id: string) => [...accreditationKeys.metrics(), id] as const,
  values: () => [...accreditationKeys.all, 'values'] as const,
  valuesList: (params: QueryValuesParams) => [...accreditationKeys.values(), params] as const,
  reports: () => [...accreditationKeys.all, 'reports'] as const,
  reportsList: (params: QueryReportsParams) => [...accreditationKeys.reports(), params] as const,
  report: (id: string) => [...accreditationKeys.reports(), id] as const,
  dashboard: (academicYear: string) => [...accreditationKeys.all, 'dashboard', academicYear] as const,
  frameworkSummary: (framework: Framework, academicYear: string) =>
    [...accreditationKeys.all, 'framework', framework, academicYear] as const,
  dataStatus: (framework: Framework, academicYear: string) =>
    [...accreditationKeys.all, 'data-status', framework, academicYear] as const,
  comparison: (framework: Framework, year1: string, year2: string) =>
    [...accreditationKeys.all, 'compare', framework, year1, year2] as const,
};

// ============ Metric Hooks ============

export function useAccreditationMetrics(params: QueryMetricsParams = {}) {
  return useQuery({
    queryKey: accreditationKeys.metricsList(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.framework) searchParams.set('framework', params.framework);
      if (params.category) searchParams.set('category', params.category);
      if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.offset) searchParams.set('offset', String(params.offset));

      const query = searchParams.toString();
      return accreditationApi<{ data: AccreditationMetric[]; total: number }>(
        `/metrics${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useAccreditationMetric(id: string) {
  return useQuery({
    queryKey: accreditationKeys.metric(id),
    queryFn: () => accreditationApi<AccreditationMetric>(`/metrics/${id}`),
    enabled: !!id,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMetricInput) =>
      accreditationApi<AccreditationMetric>('/metrics', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.metrics() });
    },
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMetricInput }) =>
      accreditationApi<AccreditationMetric>(`/metrics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.metrics() });
      queryClient.invalidateQueries({ queryKey: accreditationKeys.metric(variables.id) });
    },
  });
}

export function useDeleteMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accreditationApi<void>(`/metrics/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.metrics() });
    },
  });
}

// ============ Value Hooks ============

export function useAccreditationValues(params: QueryValuesParams = {}) {
  return useQuery({
    queryKey: accreditationKeys.valuesList(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.framework) searchParams.set('framework', params.framework);
      if (params.academicYear) searchParams.set('academicYear', params.academicYear);
      if (params.category) searchParams.set('category', params.category);
      if (params.latestOnly !== undefined) searchParams.set('latestOnly', String(params.latestOnly));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.offset) searchParams.set('offset', String(params.offset));

      const query = searchParams.toString();
      return accreditationApi<{ data: AccreditationValue[]; total: number }>(
        `/values${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useCreateValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateValueInput) =>
      accreditationApi<AccreditationValue>('/values', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.values() });
      queryClient.invalidateQueries({ queryKey: accreditationKeys.all });
    },
  });
}

export function useUpdateValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateValueInput }) =>
      accreditationApi<AccreditationValue>(`/values/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.values() });
      queryClient.invalidateQueries({ queryKey: accreditationKeys.all });
    },
  });
}

export function useBulkUpdateValues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateValuesInput) =>
      accreditationApi<{ updated: number; created: number; errors: string[] }>('/values/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.all });
    },
  });
}

export function useVerifyValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accreditationApi<AccreditationValue>(`/values/${id}/verify`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.values() });
    },
  });
}

// ============ Report Hooks ============

export function useAccreditationReports(params: QueryReportsParams = {}) {
  return useQuery({
    queryKey: accreditationKeys.reportsList(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.framework) searchParams.set('framework', params.framework);
      if (params.academicYear) searchParams.set('academicYear', params.academicYear);
      if (params.status) searchParams.set('status', params.status);
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.offset) searchParams.set('offset', String(params.offset));

      const query = searchParams.toString();
      return accreditationApi<{ data: AccreditationReport[]; total: number }>(
        `/reports${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useAccreditationReport(id: string) {
  return useQuery({
    queryKey: accreditationKeys.report(id),
    queryFn: () => accreditationApi<AccreditationReport>(`/reports/${id}`),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportInput) =>
      accreditationApi<AccreditationReport>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.reports() });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportInput }) =>
      accreditationApi<AccreditationReport>(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.reports() });
      queryClient.invalidateQueries({ queryKey: accreditationKeys.report(variables.id) });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accreditationApi<AccreditationReport>(`/reports/${id}/submit`, { method: 'POST' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.reports() });
      queryClient.invalidateQueries({ queryKey: accreditationKeys.report(id) });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      accreditationApi<void>(`/reports/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.reports() });
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ id, format = 'pdf' }: { id: string; format?: 'pdf' | 'excel' }) =>
      accreditationApi<{
        report: AccreditationReport;
        summary: FrameworkSummary;
        format: string;
        exportedAt: string;
      }>(`/reports/${id}/export?format=${format}`),
  });
}

// ============ Dashboard & Analytics Hooks ============

export function useAccreditationDashboard(academicYear: string) {
  return useQuery({
    queryKey: accreditationKeys.dashboard(academicYear),
    queryFn: () =>
      accreditationApi<DashboardSummary>(`/dashboard?academicYear=${academicYear}`),
    enabled: !!academicYear,
  });
}

export function useFrameworkSummary(framework: Framework, academicYear: string) {
  return useQuery({
    queryKey: accreditationKeys.frameworkSummary(framework, academicYear),
    queryFn: () =>
      accreditationApi<FrameworkSummary>(
        `/framework/${framework}/summary?academicYear=${academicYear}`
      ),
    enabled: !!framework && !!academicYear,
  });
}

export function useNbaSummary(academicYear: string) {
  return useQuery({
    queryKey: accreditationKeys.frameworkSummary('NBA', academicYear),
    queryFn: () =>
      accreditationApi<FrameworkSummary>(`/nba/summary?academicYear=${academicYear}`),
    enabled: !!academicYear,
  });
}

export function useNaacSummary(academicYear: string) {
  return useQuery({
    queryKey: accreditationKeys.frameworkSummary('NAAC', academicYear),
    queryFn: () =>
      accreditationApi<FrameworkSummary>(`/naac/summary?academicYear=${academicYear}`),
    enabled: !!academicYear,
  });
}

export function useNirfSummary(academicYear: string) {
  return useQuery({
    queryKey: accreditationKeys.frameworkSummary('NIRF', academicYear),
    queryFn: () =>
      accreditationApi<FrameworkSummary>(`/nirf/summary?academicYear=${academicYear}`),
    enabled: !!academicYear,
  });
}

export function useDataCollectionStatus(framework: Framework, academicYear: string) {
  return useQuery({
    queryKey: accreditationKeys.dataStatus(framework, academicYear),
    queryFn: () =>
      accreditationApi<DataCollectionStatus>(
        `/framework/${framework}/data-status?academicYear=${academicYear}`
      ),
    enabled: !!framework && !!academicYear,
  });
}

export function useYearComparison(framework: Framework, year1: string, year2: string) {
  return useQuery({
    queryKey: accreditationKeys.comparison(framework, year1, year2),
    queryFn: () =>
      accreditationApi<YearComparison>(
        `/compare?framework=${framework}&year1=${year1}&year2=${year2}`
      ),
    enabled: !!framework && !!year1 && !!year2,
  });
}

// ============ Seeding & Calculation Hooks ============

export function useSeedFramework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SeedFrameworkInput) =>
      accreditationApi<{ created: number; updated: number; skipped: number; total: number }>(
        '/seed',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.metrics() });
    },
  });
}

export function useSeedAllFrameworks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overwrite: boolean = false) =>
      accreditationApi<{
        seeded: { nba: number; naac: number; nirf: number; total: number };
      }>(`/seed/all?overwrite=${overwrite}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.metrics() });
    },
  });
}

export function useCalculateFramework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CalculateFrameworkInput) =>
      accreditationApi<{
        calculatedMetrics: number;
        failedMetrics: number;
        errors: string[];
        summary: FrameworkSummary;
      }>('/calculate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accreditationKeys.all });
    },
  });
}

// ============ Utility Hooks ============

/**
 * Get all framework summaries for comparison
 */
export function useAllFrameworkSummaries(academicYear: string) {
  const nba = useNbaSummary(academicYear);
  const naac = useNaacSummary(academicYear);
  const nirf = useNirfSummary(academicYear);

  return {
    nba: nba.data,
    naac: naac.data,
    nirf: nirf.data,
    isLoading: nba.isLoading || naac.isLoading || nirf.isLoading,
    isError: nba.isError || naac.isError || nirf.isError,
  };
}

/**
 * Get metrics for a specific framework
 */
export function useFrameworkMetrics(framework: Framework) {
  return useAccreditationMetrics({ framework, isActive: true });
}

/**
 * Get NAAC grade from percentage
 */
export function getNaacGrade(percentage: number): string {
  if (percentage >= 90) return 'A++';
  if (percentage >= 75) return 'A+';
  if (percentage >= 60) return 'A';
  if (percentage >= 55) return 'B++';
  if (percentage >= 50) return 'B+';
  if (percentage >= 45) return 'B';
  if (percentage >= 40) return 'C';
  return 'D';
}

/**
 * Get NAAC grade color for styling
 */
export function getNaacGradeColor(grade: string): string {
  switch (grade) {
    case 'A++':
    case 'A+':
      return 'text-green-600';
    case 'A':
    case 'B++':
      return 'text-blue-600';
    case 'B+':
    case 'B':
      return 'text-yellow-600';
    case 'C':
      return 'text-orange-600';
    default:
      return 'text-red-600';
  }
}

/**
 * Get trend icon name based on trend value
 */
export function getTrendIcon(trend: Trend): 'TrendingUp' | 'Minus' | 'TrendingDown' {
  switch (trend) {
    case 'improving':
      return 'TrendingUp';
    case 'declining':
      return 'TrendingDown';
    default:
      return 'Minus';
  }
}

/**
 * Get health status color
 */
export function getHealthColor(health: OverallHealth): string {
  switch (health) {
    case 'excellent':
      return 'text-green-600 bg-green-50';
    case 'good':
      return 'text-blue-600 bg-blue-50';
    case 'needs_attention':
      return 'text-yellow-600 bg-yellow-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
  }
}
