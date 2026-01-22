'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface PerformanceStats {
  performanceScore: number;
  attendanceHealth: number;
  studyHours: number;
  rankPrediction: number;
  totalStudents: number;
  cgpa: number;
  sgpa: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  attendance: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AIRecommendation {
  id: string;
  type: 'focus' | 'timing' | 'goal' | 'resource' | 'attendance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  subjectId?: string;
}

export interface LearningPattern {
  peakHours: string[];
  averageSessionDuration: number;
  consistencyScore: number;
  strongSubjects: string[];
  weakSubjects: string[];
  improvementAreas: string[];
}

export interface WeeklyProgress {
  week: string;
  studyHours: number;
  tasksCompleted: number;
  attendanceRate: number;
}

export interface StudentInsightsDashboard {
  stats: PerformanceStats;
  subjectPerformance: SubjectPerformance[];
  recommendations: AIRecommendation[];
  learningPatterns: LearningPattern;
  weeklyProgress: WeeklyProgress[];
}

// ============ API Client ============

async function studentInsightsApi<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options;
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authContext) {
    if (authContext.tenantId) headers['x-tenant-id'] = authContext.tenantId;
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/student-insights${endpoint}`, {
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

// Query keys
export const studentInsightsKeys = {
  all: ['student-insights'] as const,
  dashboard: (studentId: string) =>
    [...studentInsightsKeys.all, 'dashboard', studentId] as const,
  stats: (studentId: string) =>
    [...studentInsightsKeys.all, 'stats', studentId] as const,
  subjects: (studentId: string, params?: { semester?: number; limit?: number }) =>
    [...studentInsightsKeys.all, 'subjects', studentId, params] as const,
  recommendations: (studentId: string) =>
    [...studentInsightsKeys.all, 'recommendations', studentId] as const,
  patterns: (studentId: string) =>
    [...studentInsightsKeys.all, 'patterns', studentId] as const,
  progress: (studentId: string) =>
    [...studentInsightsKeys.all, 'progress', studentId] as const,
};

// Helper to build query string
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.set(key, String(value));
    }
  });
  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

// Hooks

/**
 * Get complete insights dashboard data
 */
export function useStudentInsightsDashboard(studentId: string) {
  return useQuery({
    queryKey: studentInsightsKeys.dashboard(studentId),
    queryFn: () => studentInsightsApi<StudentInsightsDashboard>(`/${studentId}`),
    enabled: !!studentId,
  });
}

/**
 * Get performance statistics
 */
export function usePerformanceStats(studentId: string) {
  return useQuery({
    queryKey: studentInsightsKeys.stats(studentId),
    queryFn: () => studentInsightsApi<PerformanceStats>(`/${studentId}/stats`),
    enabled: !!studentId,
  });
}

/**
 * Get subject-wise performance
 */
export function useSubjectPerformance(
  studentId: string,
  params?: { semester?: number; limit?: number }
) {
  return useQuery({
    queryKey: studentInsightsKeys.subjects(studentId, params),
    queryFn: () =>
      studentInsightsApi<SubjectPerformance[]>(
        `/${studentId}/subjects${buildQueryString(params)}`
      ),
    enabled: !!studentId,
  });
}

/**
 * Get AI recommendations
 */
export function useAIRecommendations(studentId: string) {
  return useQuery({
    queryKey: studentInsightsKeys.recommendations(studentId),
    queryFn: () => studentInsightsApi<AIRecommendation[]>(`/${studentId}/recommendations`),
    enabled: !!studentId,
  });
}

/**
 * Get learning patterns
 */
export function useLearningPatterns(studentId: string) {
  return useQuery({
    queryKey: studentInsightsKeys.patterns(studentId),
    queryFn: () => studentInsightsApi<LearningPattern>(`/${studentId}/patterns`),
    enabled: !!studentId,
  });
}

/**
 * Get weekly progress
 */
export function useWeeklyProgress(studentId: string) {
  return useQuery({
    queryKey: studentInsightsKeys.progress(studentId),
    queryFn: () => studentInsightsApi<WeeklyProgress[]>(`/${studentId}/progress`),
    enabled: !!studentId,
  });
}
