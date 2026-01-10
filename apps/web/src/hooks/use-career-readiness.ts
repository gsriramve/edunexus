'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

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
  industry?: string;
  avgPackage?: number;
}

export interface ActionPlanItem {
  action: string;
  deadline?: string;
  impact: 'low' | 'medium' | 'high';
  category?: string;
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
  student?: {
    user?: { name: string; email: string };
    department?: { name: string; code: string };
  };
}

export interface CriHistory {
  studentId: string;
  history: CriData[];
  latest: CriData | null;
}

// ============ Utility Functions ============

export type CriLevel = 'excellent' | 'good' | 'average' | 'needs-improvement' | 'critical';

export function getCriLevel(score: number): CriLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'needs-improvement';
  return 'critical';
}

export function getCriLevelLabel(level: CriLevel): string {
  const labels: Record<CriLevel, string> = {
    excellent: 'Placement Ready',
    good: 'On Track',
    average: 'Needs Improvement',
    'needs-improvement': 'At Risk',
    critical: 'Critical',
  };
  return labels[level];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getProbabilityColor(probability: number): string {
  if (probability >= 0.8) return 'text-green-600';
  if (probability >= 0.6) return 'text-blue-600';
  if (probability >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-green-600 bg-green-50';
  }
}

export function getImpactColor(impact: 'low' | 'medium' | 'high'): string {
  switch (impact) {
    case 'high':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Salary band utilities
export const SALARY_BANDS = {
  LPA_BELOW_3: { label: '< 3 LPA', min: 0, max: 3, color: 'bg-gray-100 text-gray-800' },
  LPA_3_5: { label: '3-5 LPA', min: 3, max: 5, color: 'bg-yellow-100 text-yellow-800' },
  LPA_5_8: { label: '5-8 LPA', min: 5, max: 8, color: 'bg-blue-100 text-blue-800' },
  LPA_8_12: { label: '8-12 LPA', min: 8, max: 12, color: 'bg-indigo-100 text-indigo-800' },
  LPA_12_PLUS: { label: '12+ LPA', min: 12, max: 100, color: 'bg-green-100 text-green-800' },
} as const;

export function getSalaryBandLabel(band: string): string {
  return SALARY_BANDS[band as keyof typeof SALARY_BANDS]?.label || band;
}

export function getSalaryBandColor(band: string): string {
  return SALARY_BANDS[band as keyof typeof SALARY_BANDS]?.color || 'bg-gray-100 text-gray-800';
}

// Component weights (default)
export const CRI_COMPONENT_WEIGHTS = {
  resume: 25,
  interview: 25,
  skillRoleFit: 25,
  industryExposure: 25,
} as const;

export function getComponentLabel(component: string): string {
  const labels: Record<string, string> = {
    resume: 'Resume',
    resumeScore: 'Resume',
    interview: 'Interview',
    interviewScore: 'Interview',
    skillRoleFit: 'Skill-Role Fit',
    skillRoleFitScore: 'Skill-Role Fit',
    industryExposure: 'Industry Exposure',
    industryExposureScore: 'Industry Exposure',
  };
  return labels[component] || component;
}

export function getComponentDescription(component: string): string {
  const descriptions: Record<string, string> = {
    resume: 'Resume quality, skills listed, experience',
    resumeScore: 'Resume quality, skills listed, experience',
    interview: 'Mock interview performance, communication',
    interviewScore: 'Mock interview performance, communication',
    skillRoleFit: 'How well your skills match target roles',
    skillRoleFitScore: 'How well your skills match target roles',
    industryExposure: 'Internships, projects, industry events',
    industryExposureScore: 'Internships, projects, industry events',
  };
  return descriptions[component] || '';
}

// Format date for display
export function formatAssessmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Calculate gap percentage for skill gaps
export function calculateGapPercentage(current: number, required: number): number {
  if (required <= 0) return 0;
  const gap = required - current;
  return Math.max(0, Math.round((gap / required) * 100));
}

// Get recommendation for a skill gap
export function getSkillGapRecommendation(gap: SkillGap): string {
  const gapSize = gap.requiredLevel - gap.currentLevel;

  if (gapSize >= 40) {
    return `Critical: Focus on ${gap.skill} through intensive courses and practice`;
  } else if (gapSize >= 20) {
    return `Important: Improve ${gap.skill} through online courses or projects`;
  } else {
    return `Minor: Continue practicing ${gap.skill} to maintain proficiency`;
  }
}

// Sort skill gaps by priority
export function sortSkillGapsByPriority(gaps: SkillGap[]): SkillGap[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...gaps].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Sort action items by impact
export function sortActionsByImpact(actions: ActionPlanItem[]): ActionPlanItem[] {
  const impactOrder = { high: 0, medium: 1, low: 2 };
  return [...actions].sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
}

// Get overall readiness status
export function getReadinessStatus(cri: CriData): {
  status: 'ready' | 'almost' | 'improving' | 'needs-work';
  message: string;
  color: string;
} {
  if (cri.placementProbability >= 0.8) {
    return {
      status: 'ready',
      message: 'You are placement ready!',
      color: 'text-green-600',
    };
  } else if (cri.placementProbability >= 0.6) {
    return {
      status: 'almost',
      message: 'Almost there! A few more improvements needed.',
      color: 'text-blue-600',
    };
  } else if (cri.placementProbability >= 0.4) {
    return {
      status: 'improving',
      message: 'Making progress. Focus on skill gaps.',
      color: 'text-yellow-600',
    };
  } else {
    return {
      status: 'needs-work',
      message: 'Needs significant improvement. Follow the action plan.',
      color: 'text-red-600',
    };
  }
}

// ============ API Client ============

async function careerReadinessApi<T>(
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

// ============ Query Keys ============

export const careerReadinessKeys = {
  all: ['career-readiness'] as const,
  cri: () => [...careerReadinessKeys.all, 'cri'] as const,
  criStudent: (tenantId: string, studentId: string) =>
    [...careerReadinessKeys.cri(), tenantId, studentId] as const,
  criHistory: (tenantId: string, studentId: string) =>
    [...careerReadinessKeys.cri(), 'history', tenantId, studentId] as const,
};

// ============ Hooks ============

export function useCareerReadiness(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: careerReadinessKeys.criStudent(tenantId, studentId),
    queryFn: () => careerReadinessApi<CriHistory | CriData>(`/cri/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

export function useCareerReadinessHistory(tenantId: string, studentId: string, limit = 10) {
  return useQuery({
    queryKey: careerReadinessKeys.criHistory(tenantId, studentId),
    queryFn: () =>
      careerReadinessApi<CriHistory>(
        `/cri/${studentId}?latestOnly=false&limit=${limit}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
  });
}
