'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface SkillGap {
  skill: string;
  category: string;
  gap: number;
  students: number;
}

export interface SkillCategory {
  category: string;
  avgScore: number;
  studentCount: number;
}

export interface IndustryDemand {
  skill: string;
  demand: number;
  supply: number;
}

export interface PlacementReadiness {
  ready: number;
  almostReady: number;
  needsWork: number;
  atRisk: number;
}

export interface SkillGapsResponse {
  topGaps: SkillGap[];
  byCategory: SkillCategory[];
  industryDemand: IndustryDemand[];
  placementReadiness: PlacementReadiness;
}

export interface QuerySkillGapsParams {
  batch?: string;
  limit?: number;
}

// API Client
async function hodSkillGapsApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/hod-skill-gaps${endpoint}`, {
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
export const hodSkillGapsKeys = {
  all: ['hod-skill-gaps'] as const,
  gaps: (params?: QuerySkillGapsParams) =>
    [...hodSkillGapsKeys.all, 'gaps', params] as const,
};

// Helper to build query string
function buildQueryString(params?: QuerySkillGapsParams): string {
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

// Hooks

/**
 * Get skill gaps analysis for HOD's department
 */
export function useHodSkillGaps(params?: QuerySkillGapsParams) {
  return useQuery({
    queryKey: hodSkillGapsKeys.gaps(params),
    queryFn: () =>
      hodSkillGapsApi<SkillGapsResponse>(`${buildQueryString(params)}`),
  });
}
