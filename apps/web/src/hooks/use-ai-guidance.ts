'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Enums
export enum GuidanceType {
  MONTHLY_PLAN = 'monthly_plan',
  ALERT = 'alert',
  RECOMMENDATION = 'recommendation',
  MILESTONE = 'milestone',
  TIP = 'tip',
}

export enum GuidanceCategory {
  ACADEMIC = 'academic',
  CAREER = 'career',
  ENGAGEMENT = 'engagement',
  BEHAVIORAL = 'behavioral',
  SKILL = 'skill',
}

export enum GuidancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum GuidanceStatus {
  ACTIVE = 'active',
  VIEWED = 'viewed',
  DISMISSED = 'dismissed',
  COMPLETED = 'completed',
}

export enum GoalCategory {
  ACADEMIC = 'academic',
  CAREER = 'career',
  SKILL = 'skill',
  EXTRACURRICULAR = 'extracurricular',
  PERSONAL = 'personal',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  OVERDUE = 'overdue',
}

export enum AlertType {
  ATTENDANCE_DROP = 'attendance_drop',
  GRADE_DECLINE = 'grade_decline',
  ACTIVITY_DROP = 'activity_drop',
  FEEDBACK_CONCERN = 'feedback_concern',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

// Types
export interface GuidanceQueryParams {
  studentId?: string;
  guidanceType?: GuidanceType;
  category?: GuidanceCategory;
  priority?: GuidancePriority;
  status?: GuidanceStatus;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface GoalQueryParams {
  studentId?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  isAiSuggested?: boolean;
  isMentorAssigned?: boolean;
  limit?: number;
  offset?: number;
}

export interface AlertQueryParams {
  studentId?: string;
  departmentId?: string;
  alertType?: AlertType;
  severity?: AlertSeverity;
  status?: AlertStatus;
  unresolvedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface ActionItem {
  action: string;
  deadline?: string;
  completed?: boolean;
}

export interface Resource {
  title: string;
  url?: string;
  type?: string;
}

export interface Milestone {
  title: string;
  targetDate?: string;
  completed?: boolean;
  completedAt?: string;
}

export interface SuggestedAction {
  action: string;
  priority?: string;
  assignedTo?: string;
}

// Input Types
export interface CreateGuidanceInput {
  studentId: string;
  guidanceType: GuidanceType;
  category: GuidanceCategory;
  priority?: GuidancePriority;
  title: string;
  description: string;
  actionItems?: ActionItem[];
  resources?: Resource[];
  triggerReason?: string;
  expiresAt?: string;
}

export interface UpdateGuidanceInput {
  status?: GuidanceStatus;
  wasHelpful?: boolean;
  feedback?: string;
}

export interface CreateGoalInput {
  studentId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  isAiSuggested?: boolean;
  isMentorAssigned?: boolean;
  milestones?: Milestone[];
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  targetDate?: string;
  targetValue?: number;
  currentValue?: number;
  progress?: number;
  status?: GoalStatus;
  milestones?: Milestone[];
}

export interface CreateAlertInput {
  studentId: string;
  alertType: AlertType;
  severity?: AlertSeverity;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  thresholdValue: number;
  changePercent?: number;
  timeframe?: string;
  description?: string;
  suggestedActions?: SuggestedAction[];
}

export interface UpdateAlertInput {
  status?: AlertStatus;
  resolution?: string;
}

export interface GenerateRecommendationsInput {
  studentId: string;
  includeCareer?: boolean;
  includeAcademic?: boolean;
  includeEngagement?: boolean;
  includeSkills?: boolean;
}

export interface GenerateMonthlyPlanInput {
  studentId: string;
  month: number;
  year: number;
}

export interface RunAlertDetectionInput {
  studentId?: string;
  departmentId?: string;
  alertTypes?: AlertType[];
}

// Response Types
export interface Guidance {
  id: string;
  studentId: string;
  studentName?: string;
  guidanceType: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  actionItems?: ActionItem[];
  resources?: Resource[];
  triggerReason?: string;
  triggerMetric?: string;
  triggerValue?: number;
  confidenceScore?: number;
  status: string;
  viewedAt?: string;
  wasHelpful?: boolean;
  feedback?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  isAiSuggested: boolean;
  isMentorAssigned: boolean;
  assignedBy?: string;
  status: string;
  progress: number;
  milestones?: Milestone[];
  completedAt?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  studentId: string;
  studentName?: string;
  departmentName?: string;
  alertType: string;
  severity: string;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  thresholdValue: number;
  changePercent?: number;
  timeframe?: string;
  description?: string;
  suggestedActions?: SuggestedAction[];
  status: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface GoalSuggestion {
  title: string;
  description: string;
  category: string;
  targetValue?: number;
  unit?: string;
  priority: string;
}

export interface GuidanceStats {
  totalGuidance: number;
  activeGuidance: number;
  completedGuidance: number;
  helpfulCount: number;
  helpfulRate: number;
  byCategory: { category: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export interface AlertStats {
  totalAlerts: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  byType: { type: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

export interface StudentGuidanceDashboard {
  studentId: string;
  activeGuidance: Guidance[];
  activeGoals: Goal[];
  alerts: Alert[];
  completedGoalsCount: number;
  guidanceCompletionRate: number;
  upcomingDeadlines: {
    type: 'goal' | 'action';
    title: string;
    deadline: string;
  }[];
}

// API Client
async function aiGuidanceApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/ai-guidance${endpoint}`, {
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
export const aiGuidanceKeys = {
  all: ['ai-guidance'] as const,
  guidance: () => [...aiGuidanceKeys.all, 'guidance'] as const,
  guidanceList: (tenantId: string, params?: GuidanceQueryParams) =>
    [...aiGuidanceKeys.guidance(), 'list', tenantId, params] as const,
  guidanceItem: (tenantId: string, id: string) =>
    [...aiGuidanceKeys.guidance(), tenantId, id] as const,
  myGuidance: (tenantId: string, params?: GuidanceQueryParams) =>
    [...aiGuidanceKeys.guidance(), 'my', tenantId, params] as const,
  goals: () => [...aiGuidanceKeys.all, 'goals'] as const,
  goalsList: (tenantId: string, params?: GoalQueryParams) =>
    [...aiGuidanceKeys.goals(), 'list', tenantId, params] as const,
  goalItem: (tenantId: string, id: string) =>
    [...aiGuidanceKeys.goals(), tenantId, id] as const,
  myGoals: (tenantId: string, params?: GoalQueryParams) =>
    [...aiGuidanceKeys.goals(), 'my', tenantId, params] as const,
  goalSuggestions: (tenantId: string, studentId: string) =>
    [...aiGuidanceKeys.goals(), 'suggestions', tenantId, studentId] as const,
  alerts: () => [...aiGuidanceKeys.all, 'alerts'] as const,
  alertsList: (tenantId: string, params?: AlertQueryParams) =>
    [...aiGuidanceKeys.alerts(), 'list', tenantId, params] as const,
  alertItem: (tenantId: string, id: string) =>
    [...aiGuidanceKeys.alerts(), tenantId, id] as const,
  dashboard: (tenantId: string, studentId: string) =>
    [...aiGuidanceKeys.all, 'dashboard', tenantId, studentId] as const,
  myDashboard: (tenantId: string) =>
    [...aiGuidanceKeys.all, 'dashboard', 'my', tenantId] as const,
  guidanceStats: (tenantId: string) =>
    [...aiGuidanceKeys.all, 'stats', 'guidance', tenantId] as const,
  alertStats: (tenantId: string) =>
    [...aiGuidanceKeys.all, 'stats', 'alerts', tenantId] as const,
};

// ============ Guidance Hooks ============

export function useGuidance(tenantId: string, params?: GuidanceQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.set('studentId', params.studentId);
  if (params?.guidanceType) queryParams.set('guidanceType', params.guidanceType);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.priority) queryParams.set('priority', params.priority);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.activeOnly) queryParams.set('activeOnly', params.activeOnly.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: aiGuidanceKeys.guidanceList(tenantId, params),
    queryFn: () =>
      aiGuidanceApi<{ data: Guidance[]; total: number; hasMore: boolean }>(
        `/guidance${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useMyGuidance(tenantId: string, params?: GuidanceQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.guidanceType) queryParams.set('guidanceType', params.guidanceType);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.activeOnly) queryParams.set('activeOnly', params.activeOnly?.toString() || 'true');
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: aiGuidanceKeys.myGuidance(tenantId, params),
    queryFn: () =>
      aiGuidanceApi<{ data: Guidance[]; total: number; hasMore: boolean }>(
        `/my-guidance${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useGuidanceById(tenantId: string, id: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.guidanceItem(tenantId, id),
    queryFn: () => aiGuidanceApi<Guidance>(`/guidance/${id}`, tenantId),
    enabled: !!tenantId && !!id,
  });
}

export function useCreateGuidance(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGuidanceInput) =>
      aiGuidanceApi<Guidance>('/guidance', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidance() });
    },
  });
}

export function useUpdateGuidance(tenantId: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGuidanceInput) =>
      aiGuidanceApi<Guidance>(`/guidance/${id}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidanceItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidance() });
    },
  });
}

export function useMarkGuidanceViewed(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      aiGuidanceApi<Guidance>(`/guidance/${id}/view`, tenantId, { method: 'PATCH' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidanceItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidance() });
    },
  });
}

export function useGenerateRecommendations(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateRecommendationsInput) =>
      aiGuidanceApi<Guidance[]>('/generate-recommendations', tenantId, { method: 'POST', body: data }),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidance() });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.dashboard(tenantId, studentId) });
    },
  });
}

export function useGenerateMonthlyPlan(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateMonthlyPlanInput) =>
      aiGuidanceApi<Guidance>('/generate-monthly-plan', tenantId, { method: 'POST', body: data }),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.guidance() });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.dashboard(tenantId, studentId) });
    },
  });
}

// ============ Goal Hooks ============

export function useGoals(tenantId: string, params?: GoalQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.set('studentId', params.studentId);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.isAiSuggested !== undefined) queryParams.set('isAiSuggested', params.isAiSuggested.toString());
  if (params?.isMentorAssigned !== undefined) queryParams.set('isMentorAssigned', params.isMentorAssigned.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: aiGuidanceKeys.goalsList(tenantId, params),
    queryFn: () =>
      aiGuidanceApi<{ data: Goal[]; total: number; hasMore: boolean }>(
        `/goals${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useMyGoals(tenantId: string, params?: GoalQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.set('category', params.category);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: aiGuidanceKeys.myGoals(tenantId, params),
    queryFn: () =>
      aiGuidanceApi<{ data: Goal[]; total: number; hasMore: boolean }>(
        `/my-goals${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useGoalById(tenantId: string, id: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.goalItem(tenantId, id),
    queryFn: () => aiGuidanceApi<Goal>(`/goals/${id}`, tenantId),
    enabled: !!tenantId && !!id,
  });
}

export function useCreateGoal(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalInput) =>
      aiGuidanceApi<Goal>('/goals', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.goals() });
    },
  });
}

export function useUpdateGoal(tenantId: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGoalInput) =>
      aiGuidanceApi<Goal>(`/goals/${id}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.goalItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.goals() });
    },
  });
}

export function useDeleteGoal(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      aiGuidanceApi<{ success: boolean }>(`/goals/${id}`, tenantId, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.goals() });
    },
  });
}

export function useGoalSuggestions(tenantId: string, studentId: string, count?: number) {
  const queryParams = count ? `?count=${count}` : '';

  return useQuery({
    queryKey: aiGuidanceKeys.goalSuggestions(tenantId, studentId),
    queryFn: () =>
      aiGuidanceApi<GoalSuggestion[]>(`/suggest-goals/${studentId}${queryParams}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

// ============ Alert Hooks ============

export function useAlerts(tenantId: string, params?: AlertQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.set('studentId', params.studentId);
  if (params?.departmentId) queryParams.set('departmentId', params.departmentId);
  if (params?.alertType) queryParams.set('alertType', params.alertType);
  if (params?.severity) queryParams.set('severity', params.severity);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.unresolvedOnly) queryParams.set('unresolvedOnly', params.unresolvedOnly.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  const query = queryParams.toString();

  return useQuery({
    queryKey: aiGuidanceKeys.alertsList(tenantId, params),
    queryFn: () =>
      aiGuidanceApi<{ data: Alert[]; total: number; hasMore: boolean }>(
        `/alerts${query ? `?${query}` : ''}`,
        tenantId
      ),
    enabled: !!tenantId,
  });
}

export function useAlertById(tenantId: string, id: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.alertItem(tenantId, id),
    queryFn: () => aiGuidanceApi<Alert>(`/alerts/${id}`, tenantId),
    enabled: !!tenantId && !!id,
  });
}

export function useCreateAlert(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlertInput) =>
      aiGuidanceApi<Alert>('/alerts', tenantId, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alerts() });
    },
  });
}

export function useUpdateAlert(tenantId: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAlertInput) =>
      aiGuidanceApi<Alert>(`/alerts/${id}`, tenantId, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alertItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alerts() });
    },
  });
}

export function useAcknowledgeAlert(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      aiGuidanceApi<Alert>(`/alerts/${id}/acknowledge`, tenantId, { method: 'PATCH' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alertItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alerts() });
    },
  });
}

export function useResolveAlert(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      aiGuidanceApi<Alert>(`/alerts/${id}/resolve`, tenantId, {
        method: 'PATCH',
        body: { resolution },
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alertItem(tenantId, id) });
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alerts() });
    },
  });
}

export function useRunAlertDetection(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RunAlertDetectionInput) =>
      aiGuidanceApi<{ detected: number; saved: number; alerts: Alert[] }>(
        '/run-detection',
        tenantId,
        { method: 'POST', body: data }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiGuidanceKeys.alerts() });
    },
  });
}

// ============ Dashboard & Stats Hooks ============

export function useStudentGuidanceDashboard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.dashboard(tenantId, studentId),
    queryFn: () =>
      aiGuidanceApi<StudentGuidanceDashboard>(`/dashboard/student/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useMyGuidanceDashboard(tenantId: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.myDashboard(tenantId),
    queryFn: () => aiGuidanceApi<StudentGuidanceDashboard>('/my-dashboard', tenantId),
    enabled: !!tenantId,
  });
}

export function useGuidanceStats(tenantId: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.guidanceStats(tenantId),
    queryFn: () => aiGuidanceApi<GuidanceStats>('/stats/guidance', tenantId),
    enabled: !!tenantId,
  });
}

export function useAlertStats(tenantId: string) {
  return useQuery({
    queryKey: aiGuidanceKeys.alertStats(tenantId),
    queryFn: () => aiGuidanceApi<AlertStats>('/stats/alerts', tenantId),
    enabled: !!tenantId,
  });
}
