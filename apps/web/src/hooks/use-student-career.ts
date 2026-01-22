'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// Types
export interface PlacementStats {
  probability: number;
  expectedSalary: string;
  eligibleDrives: number;
  appliedCount: number;
  shortlistedCount: number;
}

export interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  package: string;
  date: string;
  eligibility: string;
  status: string;
  description?: string;
  location?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: string;
  nextRound: string;
  package?: string;
}

export interface SkillGap {
  skill: string;
  level: number;
  required: number;
}

export interface CareerProfile {
  id: string;
  resumeUrl?: string;
  linkedin?: string;
  portfolio?: string;
  skills: string[];
}

export interface StudentCareerDashboard {
  profile: CareerProfile | null;
  stats: PlacementStats;
  upcomingDrives: PlacementDrive[];
  applications: JobApplication[];
  skillGaps: SkillGap[];
}

export interface UpdateProfileData {
  resumeUrl?: string;
  linkedin?: string;
  portfolio?: string;
  skills?: string[];
}

// ============ API Client ============

async function studentCareerApi<T>(
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

  const response = await fetch(`${getApiBaseUrl()}/api/student-career${endpoint}`, {
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
export const studentCareerKeys = {
  all: ['student-career'] as const,
  dashboard: (studentId: string) => [...studentCareerKeys.all, 'dashboard', studentId] as const,
  profile: (studentId: string) => [...studentCareerKeys.all, 'profile', studentId] as const,
  stats: (studentId: string) => [...studentCareerKeys.all, 'stats', studentId] as const,
  drives: (studentId: string, filters?: { status?: string; limit?: number }) =>
    [...studentCareerKeys.all, 'drives', studentId, filters] as const,
  applications: (studentId: string, filters?: { status?: string; limit?: number }) =>
    [...studentCareerKeys.all, 'applications', studentId, filters] as const,
  skillGaps: (studentId: string) => [...studentCareerKeys.all, 'skill-gaps', studentId] as const,
};

// Helper to build query string
function buildQueryString(params?: Record<string, unknown>): string {
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
 * Get complete career dashboard data
 */
export function useStudentCareerDashboard(studentId: string) {
  return useQuery({
    queryKey: studentCareerKeys.dashboard(studentId),
    queryFn: () => studentCareerApi<StudentCareerDashboard>(`/${studentId}`),
    enabled: !!studentId,
  });
}

/**
 * Get career profile
 */
export function useCareerProfile(studentId: string) {
  return useQuery({
    queryKey: studentCareerKeys.profile(studentId),
    queryFn: () => studentCareerApi<CareerProfile | null>(`/${studentId}/profile`),
    enabled: !!studentId,
  });
}

/**
 * Get placement stats
 */
export function usePlacementStats(studentId: string) {
  return useQuery({
    queryKey: studentCareerKeys.stats(studentId),
    queryFn: () => studentCareerApi<PlacementStats>(`/${studentId}/stats`),
    enabled: !!studentId,
  });
}

/**
 * Get upcoming placement drives
 */
export function useUpcomingDrives(
  studentId: string,
  filters?: { status?: string; limit?: number }
) {
  return useQuery({
    queryKey: studentCareerKeys.drives(studentId, filters),
    queryFn: () =>
      studentCareerApi<PlacementDrive[]>(`/${studentId}/drives${buildQueryString(filters)}`),
    enabled: !!studentId,
  });
}

/**
 * Get job applications
 */
export function useJobApplications(
  studentId: string,
  filters?: { status?: string; limit?: number }
) {
  return useQuery({
    queryKey: studentCareerKeys.applications(studentId, filters),
    queryFn: () =>
      studentCareerApi<JobApplication[]>(`/${studentId}/applications${buildQueryString(filters)}`),
    enabled: !!studentId,
  });
}

/**
 * Get skill gaps
 */
export function useSkillGaps(studentId: string) {
  return useQuery({
    queryKey: studentCareerKeys.skillGaps(studentId),
    queryFn: () => studentCareerApi<SkillGap[]>(`/${studentId}/skill-gaps`),
    enabled: !!studentId,
  });
}

/**
 * Update career profile
 */
export function useUpdateCareerProfile(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      studentCareerApi<CareerProfile>(`/${studentId}/profile`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.profile(studentId) });
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.dashboard(studentId) });
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.stats(studentId) });
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.skillGaps(studentId) });
    },
  });
}

/**
 * Apply to a placement drive
 */
export function useApplyToDrive(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driveId: string) =>
      studentCareerApi<{ success: boolean; message: string }>(`/${studentId}/apply`, {
        method: 'POST',
        body: { driveId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.applications(studentId) });
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.dashboard(studentId) });
      queryClient.invalidateQueries({ queryKey: studentCareerKeys.stats(studentId) });
    },
  });
}
