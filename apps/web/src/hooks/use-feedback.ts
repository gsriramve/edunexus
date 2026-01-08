'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Enums
export enum EvaluatorType {
  FACULTY = 'faculty',
  MENTOR = 'mentor',
  PEER = 'peer',
  SELF = 'self',
}

export enum FeedbackCycleStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  PROCESSED = 'processed',
}

// Types
export interface FeedbackCycleQueryParams {
  month?: number;
  year?: number;
  status?: FeedbackCycleStatus;
  limit?: number;
  offset?: number;
}

export interface FeedbackEntryQueryParams {
  cycleId?: string;
  targetStudentId?: string;
  evaluatorId?: string;
  evaluatorType?: EvaluatorType;
  submitted?: boolean;
  limit?: number;
  offset?: number;
}

export interface FeedbackSummaryQueryParams {
  studentId?: string;
  cycleId?: string;
  month?: number;
  year?: number;
  departmentId?: string;
}

export interface CreateFeedbackCycleInput {
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  description?: string;
  enablePeerFeedback?: boolean;
  enableSelfAssessment?: boolean;
  anonymousPeerFeedback?: boolean;
}

export interface UpdateFeedbackCycleInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  status?: FeedbackCycleStatus;
}

export interface SubmitFeedbackInput {
  targetStudentId: string;
  evaluatorType: EvaluatorType;
  evaluatorId?: string;
  isAnonymous?: boolean;
  academicRating?: number;
  participationRating?: number;
  teamworkRating?: number;
  communicationRating?: number;
  leadershipRating?: number;
  punctualityRating?: number;
  strengths?: string;
  improvements?: string;
  additionalComments?: string;
}

export interface EvaluatorAssignment {
  type: EvaluatorType;
  evaluatorIds?: string[];
  peerCount?: number;
  includeSelf?: boolean;
}

export interface AssignFeedbackInput {
  cycleId: string;
  targetStudentIds: string[];
  evaluators: EvaluatorAssignment[];
}

export interface ProcessCycleInput {
  generateSummaries?: boolean;
  calculateNormalization?: boolean;
}

// Response Types
export interface FeedbackCycle {
  id: string;
  tenantId: string;
  name: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  status: string;
  enablePeerFeedback: boolean;
  enableSelfAssessment: boolean;
  anonymousPeerFeedback: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    feedbackEntries: number;
    feedbackSummaries: number;
  };
}

export interface FeedbackEntry {
  id: string;
  cycleId: string;
  targetStudentId: string;
  targetStudentName?: string;
  evaluatorType: string;
  evaluatorId?: string;
  evaluatorName?: string;
  isAnonymous: boolean;
  academicRating?: number;
  participationRating?: number;
  teamworkRating?: number;
  communicationRating?: number;
  leadershipRating?: number;
  punctualityRating?: number;
  strengths?: string;
  improvements?: string;
  rawAverageScore?: number;
  normalizedScore?: number;
  submittedAt?: string;
}

export interface FeedbackSummary {
  id: string;
  studentId: string;
  studentName?: string;
  cycleId: string;
  month: number;
  year: number;
  facultyAvgScore?: number;
  mentorAvgScore?: number;
  peerAvgScore?: number;
  selfScore?: number;
  overallScore?: number;
  aiSummary?: string;
  topStrengths?: string[];
  topImprovements?: string[];
  responseCount?: {
    faculty: number;
    mentor: number;
    peer: number;
    self: number;
  };
}

export interface PendingFeedback {
  cycleId: string;
  cycleName: string;
  targetStudentId: string;
  targetStudentName: string;
  evaluatorType: string;
  dueDate: string;
  isOverdue: boolean;
}

export interface EvaluatorBias {
  evaluatorId: string;
  evaluatorName?: string;
  evaluatorType: string;
  totalEvaluations: number;
  averageScore: number;
  standardDeviation: number;
  biasFactor: number;
}

export interface FeedbackStats {
  activeCycles: number;
  totalFeedbackEntries: number;
  pendingFeedback: number;
  completedFeedback: number;
  averageResponseRate: number;
  byEvaluatorType: {
    type: string;
    count: number;
    averageScore: number;
  }[];
  recentActivity: {
    date: string;
    count: number;
  }[];
}

export interface FeedbackDashboard {
  stats: FeedbackStats;
  recentCycles: FeedbackCycle[];
  summaryCount: number;
  averageOverallScore: number | null;
}

// API Client
async function feedbackApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/feedback${endpoint}`, {
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
export const feedbackKeys = {
  all: ['feedback'] as const,
  cycles: () => [...feedbackKeys.all, 'cycles'] as const,
  cycle: (tenantId: string, cycleId: string) =>
    [...feedbackKeys.cycles(), tenantId, cycleId] as const,
  cyclesList: (tenantId: string, params?: FeedbackCycleQueryParams) =>
    [...feedbackKeys.cycles(), 'list', tenantId, params] as const,
  entries: () => [...feedbackKeys.all, 'entries'] as const,
  entriesList: (tenantId: string, params?: FeedbackEntryQueryParams) =>
    [...feedbackKeys.entries(), 'list', tenantId, params] as const,
  cycleEntries: (tenantId: string, cycleId: string, params?: FeedbackEntryQueryParams) =>
    [...feedbackKeys.entries(), tenantId, cycleId, params] as const,
  pending: (tenantId: string) =>
    [...feedbackKeys.all, 'pending', tenantId] as const,
  summaries: () => [...feedbackKeys.all, 'summaries'] as const,
  summariesList: (tenantId: string, params?: FeedbackSummaryQueryParams) =>
    [...feedbackKeys.summaries(), 'list', tenantId, params] as const,
  studentSummary: (tenantId: string, studentId: string, cycleId?: string) =>
    [...feedbackKeys.summaries(), 'student', tenantId, studentId, cycleId] as const,
  mySummary: (tenantId: string, cycleId?: string) =>
    [...feedbackKeys.summaries(), 'my', tenantId, cycleId] as const,
  stats: (tenantId: string) =>
    [...feedbackKeys.all, 'stats', tenantId] as const,
  biasReport: (tenantId: string) =>
    [...feedbackKeys.all, 'bias-report', tenantId] as const,
  dashboard: (tenantId: string, departmentId?: string) =>
    [...feedbackKeys.all, 'dashboard', tenantId, departmentId] as const,
};

// ============ Cycle Hooks ============

export function useFeedbackCycles(tenantId: string, params?: FeedbackCycleQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.set('month', params.month.toString());
  if (params?.year) queryParams.set('year', params.year.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: feedbackKeys.cyclesList(tenantId, params),
    queryFn: () =>
      feedbackApi<{ data: FeedbackCycle[]; total: number; hasMore: boolean }>(
        `/cycles${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useFeedbackCycle(tenantId: string, cycleId: string) {
  return useQuery({
    queryKey: feedbackKeys.cycle(tenantId, cycleId),
    queryFn: () => feedbackApi<FeedbackCycle>(`/cycles/${cycleId}`, tenantId),
    enabled: !!tenantId && !!cycleId,
  });
}

export function useCreateFeedbackCycle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackCycleInput) =>
      feedbackApi<FeedbackCycle>('/cycles', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycles() });
    },
  });
}

export function useUpdateFeedbackCycle(tenantId: string, cycleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFeedbackCycleInput) =>
      feedbackApi<FeedbackCycle>(`/cycles/${cycleId}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycle(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycles() });
    },
  });
}

export function useActivateFeedbackCycle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId: string) =>
      feedbackApi<FeedbackCycle>(`/cycles/${cycleId}/activate`, tenantId, { method: 'PATCH' }),
    onSuccess: (_, cycleId) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycle(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycles() });
    },
  });
}

export function useCloseFeedbackCycle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId: string) =>
      feedbackApi<FeedbackCycle>(`/cycles/${cycleId}/close`, tenantId, { method: 'PATCH' }),
    onSuccess: (_, cycleId) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycle(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycles() });
    },
  });
}

export function useProcessFeedbackCycle(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cycleId, ...data }: { cycleId: string } & ProcessCycleInput) =>
      feedbackApi<{ processed: number; summaries: number }>(
        `/cycles/${cycleId}/process`,
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: (_, { cycleId }) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycle(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycles() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.summaries() });
    },
  });
}

// ============ Entry Hooks ============

export function useFeedbackEntries(tenantId: string, params?: FeedbackEntryQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.cycleId) queryParams.set('cycleId', params.cycleId);
  if (params?.targetStudentId) queryParams.set('targetStudentId', params.targetStudentId);
  if (params?.evaluatorId) queryParams.set('evaluatorId', params.evaluatorId);
  if (params?.evaluatorType) queryParams.set('evaluatorType', params.evaluatorType);
  if (params?.submitted !== undefined) queryParams.set('submitted', params.submitted.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: feedbackKeys.entriesList(tenantId, params),
    queryFn: () =>
      feedbackApi<{ data: FeedbackEntry[]; total: number; hasMore: boolean }>(
        `/entries${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useCycleEntries(tenantId: string, cycleId: string, params?: FeedbackEntryQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.targetStudentId) queryParams.set('targetStudentId', params.targetStudentId);
  if (params?.evaluatorId) queryParams.set('evaluatorId', params.evaluatorId);
  if (params?.evaluatorType) queryParams.set('evaluatorType', params.evaluatorType);
  if (params?.submitted !== undefined) queryParams.set('submitted', params.submitted.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: feedbackKeys.cycleEntries(tenantId, cycleId, params),
    queryFn: () =>
      feedbackApi<{ data: FeedbackEntry[]; total: number; hasMore: boolean }>(
        `/cycles/${cycleId}/entries${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId && !!cycleId,
  });
}

export function usePendingFeedback(tenantId: string) {
  return useQuery({
    queryKey: feedbackKeys.pending(tenantId),
    queryFn: () => feedbackApi<PendingFeedback[]>('/pending', tenantId),
    enabled: !!tenantId,
  });
}

export function useAssignFeedback(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignFeedbackInput) =>
      feedbackApi<{ created: number; skipped: number }>(
        '/assign',
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: (_, { cycleId }) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycle(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.entries() });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.pending(tenantId) });
    },
  });
}

export function useSubmitFeedback(tenantId: string, cycleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitFeedbackInput) =>
      feedbackApi<FeedbackEntry>(
        `/cycles/${cycleId}/submit`,
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycle(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.cycleEntries(tenantId, cycleId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.pending(tenantId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.stats(tenantId) });
    },
  });
}

// ============ Summary Hooks ============

export function useFeedbackSummaries(tenantId: string, params?: FeedbackSummaryQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.set('studentId', params.studentId);
  if (params?.cycleId) queryParams.set('cycleId', params.cycleId);
  if (params?.month) queryParams.set('month', params.month.toString());
  if (params?.year) queryParams.set('year', params.year.toString());
  if (params?.departmentId) queryParams.set('departmentId', params.departmentId);
  const query = queryParams.toString();

  return useQuery({
    queryKey: feedbackKeys.summariesList(tenantId, params),
    queryFn: () =>
      feedbackApi<FeedbackSummary[]>(`/summaries${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

export function useStudentFeedbackSummary(tenantId: string, studentId: string, cycleId?: string) {
  const queryParams = cycleId ? `?cycleId=${cycleId}` : '';

  return useQuery({
    queryKey: feedbackKeys.studentSummary(tenantId, studentId, cycleId),
    queryFn: () =>
      feedbackApi<FeedbackSummary | FeedbackSummary[]>(
        `/summaries/student/${studentId}${queryParams}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}

export function useMyFeedbackSummary(tenantId: string, cycleId?: string) {
  const queryParams = cycleId ? `?cycleId=${cycleId}` : '';

  return useQuery({
    queryKey: feedbackKeys.mySummary(tenantId, cycleId),
    queryFn: () =>
      feedbackApi<FeedbackSummary | FeedbackSummary[]>(`/my-summary${queryParams}`, tenantId),
    enabled: !!tenantId,
  });
}

// ============ Stats Hooks ============

export function useFeedbackStats(tenantId: string) {
  return useQuery({
    queryKey: feedbackKeys.stats(tenantId),
    queryFn: () => feedbackApi<FeedbackStats>('/stats', tenantId),
    enabled: !!tenantId,
  });
}

export function useBiasReport(tenantId: string) {
  return useQuery({
    queryKey: feedbackKeys.biasReport(tenantId),
    queryFn: () => feedbackApi<EvaluatorBias[]>('/bias-report', tenantId),
    enabled: !!tenantId,
  });
}

export function useFeedbackDashboard(tenantId: string, departmentId?: string) {
  const queryParams = departmentId ? `?departmentId=${departmentId}` : '';

  return useQuery({
    queryKey: feedbackKeys.dashboard(tenantId, departmentId),
    queryFn: () => feedbackApi<FeedbackDashboard>(`/dashboard${queryParams}`, tenantId),
    enabled: !!tenantId,
  });
}
