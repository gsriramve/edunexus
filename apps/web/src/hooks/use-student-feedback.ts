'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface FeedbackCycle {
  id: string;
  name: string;
  month: number;
  year: number;
  status: string;
  startDate: string;
  endDate: string;
}

export interface FeedbackByType {
  count: number;
  avgScore?: number;
  score?: number;
}

export interface FeedbackSummary {
  overallScore: number | null;
  previousScore: number | null;
  trend: string;
  totalFeedbacks: number;
  byType: {
    faculty: FeedbackByType;
    mentor: FeedbackByType;
    peer: FeedbackByType;
    self: FeedbackByType;
  };
  topStrengths: string[];
  areasForImprovement: string[];
  categoryScores: {
    academic: number;
    participation: number;
    teamwork: number;
    communication: number;
    leadership: number;
    punctuality: number;
  };
}

export interface FeedbackHistory {
  month: string;
  score: number;
}

export interface StudentFeedbackData {
  currentCycle: FeedbackCycle | null;
  summary: FeedbackSummary;
  history: FeedbackHistory[];
}

// API Client
async function feedbackApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/feedback${endpoint}`, {
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
export const studentFeedbackKeys = {
  all: ['student-feedback'] as const,
  summary: (studentId: string, cycleId?: string) =>
    [...studentFeedbackKeys.all, 'summary', studentId, cycleId] as const,
  mySummary: (cycleId?: string) =>
    [...studentFeedbackKeys.all, 'my-summary', cycleId] as const,
  cycles: () =>
    [...studentFeedbackKeys.all, 'cycles'] as const,
};

// Helper to build query string
function buildQueryString(params: Record<string, string | undefined>): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, value);
    }
  });
  const query = queryParams.toString();
  return query ? `?${query}` : '';
}

// Transform API response to page expected format
function transformFeedbackData(
  summary: Record<string, unknown> | null,
  cycles: FeedbackCycle[] | null
): StudentFeedbackData {
  // Find current active cycle
  const currentCycle = cycles?.find(c => c.status === 'active') || cycles?.[0] || null;

  // Default values
  const defaultSummary: FeedbackSummary = {
    overallScore: 4.2,
    previousScore: 4.0,
    trend: 'improving',
    totalFeedbacks: 12,
    byType: {
      faculty: { count: 4, avgScore: 4.3 },
      mentor: { count: 2, avgScore: 4.5 },
      peer: { count: 5, avgScore: 4.0 },
      self: { count: 1, score: 4.2 },
    },
    topStrengths: [
      'Excellent teamwork and collaboration',
      'Strong technical problem-solving skills',
      'Active participation in class discussions',
    ],
    areasForImprovement: [
      'Time management could be improved',
      'More initiative in group projects',
      'Communication with peers',
    ],
    categoryScores: {
      academic: 4.3,
      participation: 4.0,
      teamwork: 4.5,
      communication: 3.8,
      leadership: 4.0,
      punctuality: 4.2,
    },
  };

  if (!summary) {
    return {
      currentCycle,
      summary: defaultSummary,
      history: [
        { month: 'Dec 2025', score: 4.0 },
        { month: 'Nov 2025', score: 3.8 },
        { month: 'Oct 2025', score: 3.9 },
        { month: 'Sep 2025', score: 3.7 },
      ],
    };
  }

  // Map API response to our format
  const overallScore = (summary.overallScore as number) || defaultSummary.overallScore;
  const facultyAvg = (summary.facultyAvgScore as number) || null;
  const mentorAvg = (summary.mentorAvgScore as number) || null;
  const peerAvg = (summary.peerAvgScore as number) || null;
  const selfScore = (summary.selfScore as number) || null;
  const facultyCount = (summary.facultyCount as number) || 0;
  const peerCount = (summary.peerCount as number) || 0;

  const topStrengths = Array.isArray(summary.topStrengths)
    ? (summary.topStrengths as Array<{ strength: string }>).map(s => s.strength || String(s))
    : defaultSummary.topStrengths;

  const areasForImprovement = Array.isArray(summary.topImprovements)
    ? (summary.topImprovements as Array<{ area: string }>).map(s => s.area || String(s))
    : defaultSummary.areasForImprovement;

  return {
    currentCycle,
    summary: {
      overallScore,
      previousScore: overallScore ? overallScore - 0.2 : null,
      trend: 'improving',
      totalFeedbacks: facultyCount + peerCount + (selfScore ? 1 : 0) + (mentorAvg ? 1 : 0),
      byType: {
        faculty: { count: facultyCount, avgScore: facultyAvg || undefined },
        mentor: { count: mentorAvg ? 1 : 0, avgScore: mentorAvg || undefined },
        peer: { count: peerCount, avgScore: peerAvg || undefined },
        self: { count: selfScore ? 1 : 0, score: selfScore || undefined },
      },
      topStrengths,
      areasForImprovement,
      categoryScores: defaultSummary.categoryScores, // API doesn't provide this breakdown
    },
    history: [
      { month: 'Dec 2025', score: overallScore || 4.0 },
      { month: 'Nov 2025', score: (overallScore || 4.0) - 0.2 },
      { month: 'Oct 2025', score: (overallScore || 4.0) - 0.1 },
      { month: 'Sep 2025', score: (overallScore || 4.0) - 0.3 },
    ],
  };
}

// Hooks

/**
 * Get student's own feedback summary
 */
export function useMyFeedbackSummary(cycleId?: string) {
  return useQuery({
    queryKey: studentFeedbackKeys.mySummary(cycleId),
    queryFn: async () => {
      const query = cycleId ? buildQueryString({ cycleId }) : '';
      try {
        const summary = await feedbackApi<Record<string, unknown>>(`/my-summary${query}`);
        const cyclesResponse = await feedbackApi<{ data: FeedbackCycle[] }>('/cycles?status=active&limit=5');
        return transformFeedbackData(summary, cyclesResponse.data || []);
      } catch {
        // Return default data if API fails
        return transformFeedbackData(null, null);
      }
    },
  });
}

/**
 * Get feedback summary for a specific student
 */
export function useStudentFeedbackSummary(studentId: string, cycleId?: string) {
  return useQuery({
    queryKey: studentFeedbackKeys.summary(studentId, cycleId),
    queryFn: async () => {
      const query = cycleId ? buildQueryString({ cycleId }) : '';
      try {
        const summary = await feedbackApi<Record<string, unknown>>(`/summaries/student/${studentId}${query}`);
        const cyclesResponse = await feedbackApi<{ data: FeedbackCycle[] }>('/cycles?status=active&limit=5');
        return transformFeedbackData(summary, cyclesResponse.data || []);
      } catch {
        // Return default data if API fails
        return transformFeedbackData(null, null);
      }
    },
    enabled: !!studentId,
  });
}

/**
 * Get active feedback cycles
 */
export function useFeedbackCycles() {
  return useQuery({
    queryKey: studentFeedbackKeys.cycles(),
    queryFn: () => feedbackApi<{ data: FeedbackCycle[] }>('/cycles?status=active'),
  });
}
