'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export type MilestoneType =
  | 'admission'
  | 'semester_start'
  | 'semester_end'
  | 'exam_result'
  | 'backlog_cleared'
  | 'dean_list'
  | 'award'
  | 'certification'
  | 'internship_start'
  | 'internship_end'
  | 'project_completion'
  | 'club_leadership'
  | 'event_participation'
  | 'placement_offer'
  | 'placement_accepted'
  | 'graduation'
  | 'custom';

export type MilestoneCategory =
  | 'academic'
  | 'career'
  | 'extracurricular'
  | 'achievement'
  | 'administrative';

export interface MilestoneSnapshotData {
  cgpa?: number;
  sgpa?: number;
  sgiScore?: number;
  criScore?: number;
  attendance?: number;
  backlogs?: number;
  achievements?: number;
  activeClubs?: number;
}

export interface Milestone {
  id: string;
  tenantId: string;
  studentId: string;
  milestoneType: MilestoneType;
  title: string;
  description?: string;
  occurredAt: string;
  academicYear?: string;
  semester?: number;
  snapshotData?: MilestoneSnapshotData;
  category: MilestoneCategory;
  isPositive: boolean;
  linkedEntityType?: string;
  linkedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  student?: {
    user?: { name: string; email: string };
    department?: { name: string; code: string };
  };
}

export interface SemesterSnapshot {
  id: string;
  tenantId: string;
  studentId: string;
  academicYear: string;
  semester: number;
  sgpa?: number;
  cgpa?: number;
  backlogs: number;
  overallAttendance?: number;
  endSgiScore?: number;
  endCriScore?: number;
  clubsActive: number;
  eventsAttended: number;
  achievementsCount: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    user?: { name: string; email: string };
    department?: { name: string; code: string };
  };
}

export interface TimelineItem {
  id: string;
  type: 'milestone' | 'snapshot';
  date: string;
  title: string;
  description?: string;
  category?: MilestoneCategory;
  milestoneType?: MilestoneType;
  isPositive?: boolean;
  snapshotData?: MilestoneSnapshotData;
  academicYear?: string;
  semester?: number;
}

export interface JourneyStats {
  studentId: string;
  totalMilestones: number;
  milestonesByCategory: Record<string, number>;
  totalSnapshots: number;
  currentCgpa?: number;
  cgpaTrend: 'improving' | 'stable' | 'declining';
  totalBacklogsCleared: number;
  currentBacklogs: number;
  highestSgi?: number;
  highestCri?: number;
  totalAchievements: number;
  totalEventsAttended: number;
  totalClubsJoined: number;
}

export interface SemesterComparison {
  semester1: {
    academicYear: string;
    semester: number;
    sgpa?: number;
    cgpa?: number;
    attendance?: number;
    sgiScore?: number;
    criScore?: number;
  };
  semester2: {
    academicYear: string;
    semester: number;
    sgpa?: number;
    cgpa?: number;
    attendance?: number;
    sgiScore?: number;
    criScore?: number;
  };
  changes: {
    sgpaChange?: number;
    cgpaChange?: number;
    attendanceChange?: number;
    sgiChange?: number;
    criChange?: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

export interface YearProgress {
  academicYear: string;
  startCgpa?: number;
  endCgpa?: number;
  startSgi?: number;
  endSgi?: number;
  startCri?: number;
  endCri?: number;
  milestonesCount: number;
  achievementsCount: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface YearOverYearProgress {
  studentId: string;
  years: YearProgress[];
  overallTrend: 'improving' | 'stable' | 'declining';
}

export interface JourneyDashboard {
  stats: JourneyStats;
  timeline: TimelineItem[];
  progress: YearOverYearProgress;
  snapshots: SemesterSnapshot[];
}

// Input types
export interface CreateMilestoneInput {
  studentId: string;
  milestoneType: MilestoneType;
  title: string;
  description?: string;
  occurredAt: string;
  academicYear?: string;
  semester?: number;
  category?: MilestoneCategory;
  isPositive?: boolean;
  linkedEntityType?: string;
  linkedEntityId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  occurredAt?: string;
  category?: MilestoneCategory;
  isPositive?: boolean;
  metadata?: Record<string, any>;
}

export interface QueryMilestonesParams {
  studentId?: string;
  milestoneType?: MilestoneType;
  category?: MilestoneCategory;
  academicYear?: string;
  semester?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface QuerySnapshotsParams {
  studentId?: string;
  academicYear?: string;
  semester?: number;
  limit?: number;
  offset?: number;
}

export interface TimelineFilterParams {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  categories?: MilestoneCategory[];
  includeSnapshots?: boolean;
  limit?: number;
}

export interface GenerateSnapshotInput {
  studentId: string;
  academicYear: string;
  semester: number;
}

export interface BulkGenerateSnapshotsInput {
  academicYear: string;
  semester: number;
  departmentId?: string;
  batch?: string;
}

export interface ExportJourneyInput {
  studentId: string;
  format: 'json' | 'csv';
  includeSnapshots?: boolean;
  includeMilestones?: boolean;
  startDate?: string;
  endDate?: string;
}

// ============ API Client ============

async function studentJourneyApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/student-journey${endpoint}`, {
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

export const studentJourneyKeys = {
  all: ['student-journey'] as const,
  milestones: () => [...studentJourneyKeys.all, 'milestones'] as const,
  milestoneList: (tenantId: string, params?: QueryMilestonesParams) =>
    [...studentJourneyKeys.milestones(), tenantId, params] as const,
  milestone: (tenantId: string, id: string) =>
    [...studentJourneyKeys.milestones(), tenantId, id] as const,
  myMilestones: (tenantId: string, params?: QueryMilestonesParams) =>
    [...studentJourneyKeys.milestones(), 'my', tenantId, params] as const,
  snapshots: () => [...studentJourneyKeys.all, 'snapshots'] as const,
  snapshotList: (tenantId: string, params?: QuerySnapshotsParams) =>
    [...studentJourneyKeys.snapshots(), tenantId, params] as const,
  snapshot: (tenantId: string, studentId: string, academicYear: string, semester: number) =>
    [...studentJourneyKeys.snapshots(), tenantId, studentId, academicYear, semester] as const,
  mySnapshots: (tenantId: string, params?: QuerySnapshotsParams) =>
    [...studentJourneyKeys.snapshots(), 'my', tenantId, params] as const,
  timeline: (tenantId: string, studentId: string, params?: TimelineFilterParams) =>
    [...studentJourneyKeys.all, 'timeline', tenantId, studentId, params] as const,
  myTimeline: (tenantId: string, params?: TimelineFilterParams) =>
    [...studentJourneyKeys.all, 'timeline', 'my', tenantId, params] as const,
  stats: (tenantId: string, studentId: string) =>
    [...studentJourneyKeys.all, 'stats', tenantId, studentId] as const,
  myStats: (tenantId: string) =>
    [...studentJourneyKeys.all, 'stats', 'my', tenantId] as const,
  compare: (tenantId: string, studentId: string) =>
    [...studentJourneyKeys.all, 'compare', tenantId, studentId] as const,
  progress: (tenantId: string, studentId: string) =>
    [...studentJourneyKeys.all, 'progress', tenantId, studentId] as const,
  myProgress: (tenantId: string) =>
    [...studentJourneyKeys.all, 'progress', 'my', tenantId] as const,
  dashboard: (tenantId: string, studentId: string) =>
    [...studentJourneyKeys.all, 'dashboard', tenantId, studentId] as const,
  myDashboard: (tenantId: string) =>
    [...studentJourneyKeys.all, 'dashboard', 'my', tenantId] as const,
};

// ============ Milestone Hooks ============

export function useMilestones(tenantId: string, params?: QueryMilestonesParams) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.set('studentId', params.studentId);
  if (params?.milestoneType) queryParams.set('milestoneType', params.milestoneType);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.academicYear) queryParams.set('academicYear', params.academicYear);
  if (params?.semester) queryParams.set('semester', params.semester.toString());
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentJourneyKeys.milestoneList(tenantId, params),
    queryFn: () =>
      studentJourneyApi<{ data: Milestone[]; total: number }>(
        `/milestones${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useMilestone(tenantId: string, id: string) {
  return useQuery({
    queryKey: studentJourneyKeys.milestone(tenantId, id),
    queryFn: () => studentJourneyApi<Milestone>(`/milestones/${id}`, tenantId),
    enabled: !!tenantId && !!id,
  });
}

export function useMyMilestones(tenantId: string, params?: QueryMilestonesParams) {
  const queryParams = new URLSearchParams();
  if (params?.milestoneType) queryParams.set('milestoneType', params.milestoneType);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.academicYear) queryParams.set('academicYear', params.academicYear);
  if (params?.semester) queryParams.set('semester', params.semester.toString());
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentJourneyKeys.myMilestones(tenantId, params),
    queryFn: () =>
      studentJourneyApi<{ data: Milestone[]; total: number }>(
        `/my-milestones${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useCreateMilestone(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMilestoneInput) =>
      studentJourneyApi<Milestone>('/milestones', tenantId, { method: 'POST', body: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.milestones() });
      queryClient.invalidateQueries({
        queryKey: studentJourneyKeys.timeline(tenantId, variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentJourneyKeys.stats(tenantId, variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentJourneyKeys.dashboard(tenantId, variables.studentId),
      });
    },
  });
}

export function useUpdateMilestone(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMilestoneInput }) =>
      studentJourneyApi<Milestone>(`/milestones/${id}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.milestones() });
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.all });
    },
  });
}

export function useDeleteMilestone(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      studentJourneyApi<void>(`/milestones/${id}`, tenantId, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.milestones() });
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.all });
    },
  });
}

// ============ Snapshot Hooks ============

export function useSnapshots(tenantId: string, params?: QuerySnapshotsParams) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.set('studentId', params.studentId);
  if (params?.academicYear) queryParams.set('academicYear', params.academicYear);
  if (params?.semester) queryParams.set('semester', params.semester.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentJourneyKeys.snapshotList(tenantId, params),
    queryFn: () =>
      studentJourneyApi<{ data: SemesterSnapshot[]; total: number }>(
        `/snapshots${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useSemesterSnapshot(
  tenantId: string,
  studentId: string,
  academicYear: string,
  semester: number
) {
  return useQuery({
    queryKey: studentJourneyKeys.snapshot(tenantId, studentId, academicYear, semester),
    queryFn: () =>
      studentJourneyApi<SemesterSnapshot>(
        `/snapshots/${studentId}/${academicYear}/${semester}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId && !!academicYear && semester > 0,
  });
}

export function useMySnapshots(tenantId: string, params?: QuerySnapshotsParams) {
  const queryParams = new URLSearchParams();
  if (params?.academicYear) queryParams.set('academicYear', params.academicYear);
  if (params?.semester) queryParams.set('semester', params.semester.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentJourneyKeys.mySnapshots(tenantId, params),
    queryFn: () =>
      studentJourneyApi<{ data: SemesterSnapshot[]; total: number }>(
        `/my-snapshots${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useGenerateSnapshot(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateSnapshotInput) =>
      studentJourneyApi<SemesterSnapshot>('/snapshots/generate', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.snapshots() });
      queryClient.invalidateQueries({
        queryKey: studentJourneyKeys.timeline(tenantId, variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentJourneyKeys.progress(tenantId, variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentJourneyKeys.dashboard(tenantId, variables.studentId),
      });
    },
  });
}

export function useBulkGenerateSnapshots(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkGenerateSnapshotsInput) =>
      studentJourneyApi<{ total: number; successful: number; failed: number; errors: string[] }>(
        '/snapshots/bulk-generate',
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.snapshots() });
      queryClient.invalidateQueries({ queryKey: studentJourneyKeys.all });
    },
  });
}

// ============ Timeline Hooks ============

export function useStudentTimeline(
  tenantId: string,
  studentId: string,
  params?: TimelineFilterParams
) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  if (params?.categories?.length) queryParams.set('categories', params.categories.join(','));
  if (params?.includeSnapshots !== undefined)
    queryParams.set('includeSnapshots', params.includeSnapshots.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentJourneyKeys.timeline(tenantId, studentId, params),
    queryFn: () =>
      studentJourneyApi<TimelineItem[]>(
        `/timeline/${studentId}${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

export function useMyTimeline(tenantId: string, params?: TimelineFilterParams) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);
  if (params?.categories?.length) queryParams.set('categories', params.categories.join(','));
  if (params?.includeSnapshots !== undefined)
    queryParams.set('includeSnapshots', params.includeSnapshots.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: studentJourneyKeys.myTimeline(tenantId, params),
    queryFn: () =>
      studentJourneyApi<TimelineItem[]>(`/my-timeline${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

// ============ Stats & Progress Hooks ============

export function useJourneyStats(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: studentJourneyKeys.stats(tenantId, studentId),
    queryFn: () => studentJourneyApi<JourneyStats>(`/stats/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useMyJourneyStats(tenantId: string) {
  return useQuery({
    queryKey: studentJourneyKeys.myStats(tenantId),
    queryFn: () => studentJourneyApi<JourneyStats>('/my-stats', tenantId),
    enabled: !!tenantId,
  });
}

export function useCompareSemesters(
  tenantId: string,
  studentId: string,
  year1: string,
  sem1: number,
  year2: string,
  sem2: number
) {
  return useQuery({
    queryKey: studentJourneyKeys.compare(tenantId, studentId),
    queryFn: () =>
      studentJourneyApi<SemesterComparison>(
        `/compare/${studentId}?year1=${year1}&sem1=${sem1}&year2=${year2}&sem2=${sem2}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId && !!year1 && sem1 > 0 && !!year2 && sem2 > 0,
  });
}

export function useYearOverYearProgress(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: studentJourneyKeys.progress(tenantId, studentId),
    queryFn: () =>
      studentJourneyApi<YearOverYearProgress>(`/progress/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useMyYearOverYearProgress(tenantId: string) {
  return useQuery({
    queryKey: studentJourneyKeys.myProgress(tenantId),
    queryFn: () => studentJourneyApi<YearOverYearProgress>('/my-progress', tenantId),
    enabled: !!tenantId,
  });
}

// ============ Dashboard Hooks ============

export function useJourneyDashboard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: studentJourneyKeys.dashboard(tenantId, studentId),
    queryFn: () => studentJourneyApi<JourneyDashboard>(`/dashboard/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useMyJourneyDashboard(tenantId: string) {
  return useQuery({
    queryKey: studentJourneyKeys.myDashboard(tenantId),
    queryFn: () => studentJourneyApi<JourneyDashboard>('/my-dashboard', tenantId),
    enabled: !!tenantId,
  });
}

// ============ Export Hook ============

export function useExportJourney(tenantId: string) {
  return useMutation({
    mutationFn: async (data: ExportJourneyInput) => {
      const result = await studentJourneyApi<{ data: any; format: string; filename: string }>(
        '/export',
        tenantId,
        { method: 'POST', body: data }
      );

      // Create download
      const blob = new Blob(
        [data.format === 'json' ? JSON.stringify(result.data, null, 2) : result.data],
        { type: data.format === 'json' ? 'application/json' : 'text/csv' }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename || `journey-${data.studentId}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return result;
    },
  });
}
