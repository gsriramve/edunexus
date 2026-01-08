'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface SgiBreakdown {
  cgpaTrend: number;
  examImprovement: number;
  assignments: number;
}

export interface EngagementBreakdown {
  clubActivity: number;
  eventsAttended: number;
  attendanceRate: number;
}

export interface SkillsBreakdown {
  certifications: number;
  projects: number;
  internships: number;
}

export interface BehavioralBreakdown {
  feedbackScore: number;
  punctuality: number;
  discipline: number;
}

export interface SgiRecommendation {
  category: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SgiData {
  id: string;
  studentId: string;
  month: number;
  year: number;
  sgiScore: number;
  sgiTrend: 'improving' | 'stable' | 'declining';
  trendDelta: number;
  academicScore: number;
  engagementScore: number;
  skillsScore: number;
  behavioralScore: number;
  academicBreakdown: SgiBreakdown | null;
  engagementBreakdown: EngagementBreakdown | null;
  skillsBreakdown: SkillsBreakdown | null;
  behavioralBreakdown: BehavioralBreakdown | null;
  insightsSummary: string | null;
  recommendations: SgiRecommendation[] | null;
  dataCompleteness: number;
  calculatedAt: string;
}

export interface SgiResponse {
  latest: SgiData | null;
  history: SgiData[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'low' | 'medium' | 'high';
}

export interface TargetRole {
  role: string;
  fitScore: number;
  requirements: string[];
}

export interface MatchingCompany {
  company: string;
  fitScore: number;
  openings?: number;
}

export interface ActionPlanItem {
  action: string;
  deadline?: string;
  impact: 'low' | 'medium' | 'high';
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
  skillGaps: SkillGap[] | null;
  targetRoles: TargetRole[] | null;
  topMatchingCompanies: MatchingCompany[] | null;
  actionPlan: ActionPlanItem[] | null;
  confidenceScore: number;
  assessmentDate: string;
}

export interface StudentDashboardResponse {
  studentId: string;
  sgi: {
    current: SgiData | null;
    history: SgiData[];
    trend: 'improving' | 'stable' | 'declining';
  };
  cri: {
    current: CriData | null;
    placementProbability: number;
    salaryBand: string;
  };
  insights: string[];
  lastUpdated: string;
}

// ============ API Client ============

async function studentGrowthApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/student-indices${endpoint}`, {
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

export const studentGrowthKeys = {
  all: ['student-growth'] as const,
  sgi: (tenantId: string, studentId: string) =>
    [...studentGrowthKeys.all, 'sgi', tenantId, studentId] as const,
  cri: (tenantId: string, studentId: string) =>
    [...studentGrowthKeys.all, 'cri', tenantId, studentId] as const,
  dashboard: (tenantId: string, studentId: string) =>
    [...studentGrowthKeys.all, 'dashboard', tenantId, studentId] as const,
};

// ============ Query Hooks ============

/**
 * Get SGI data for a student
 */
export function useStudentSgi(tenantId: string, studentId: string, limit = 12) {
  return useQuery({
    queryKey: studentGrowthKeys.sgi(tenantId, studentId),
    queryFn: () => studentGrowthApi<SgiResponse>(`/sgi/${studentId}?limit=${limit}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get CRI data for a student
 */
export function useStudentCri(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: studentGrowthKeys.cri(tenantId, studentId),
    queryFn: () => studentGrowthApi<CriData>(`/cri/${studentId}?latestOnly=true`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get combined dashboard data (SGI + CRI + insights)
 */
export function useStudentGrowthDashboard(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: studentGrowthKeys.dashboard(tenantId, studentId),
    queryFn: () => studentGrowthApi<StudentDashboardResponse>(`/dashboard/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

// ============ Utility Functions ============

/**
 * Get score level based on value
 */
export function getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'needs-improvement' | 'critical' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'needs-improvement';
  return 'critical';
}

/**
 * Get color class for score level
 */
export function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'average': return 'text-yellow-600';
    case 'needs-improvement': return 'text-orange-600';
    case 'critical': return 'text-red-600';
  }
}

/**
 * Get background color class for score level
 */
export function getScoreBgColor(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case 'excellent': return 'bg-green-100';
    case 'good': return 'bg-blue-100';
    case 'average': return 'bg-yellow-100';
    case 'needs-improvement': return 'bg-orange-100';
    case 'critical': return 'bg-red-100';
  }
}

/**
 * Get trend icon
 */
export function getTrendIcon(trend: string): '↑' | '↓' | '→' {
  switch (trend) {
    case 'improving': return '↑';
    case 'declining': return '↓';
    default: return '→';
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: string): string {
  switch (trend) {
    case 'improving': return 'text-green-600';
    case 'declining': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

/**
 * Format month/year to readable string
 */
export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
