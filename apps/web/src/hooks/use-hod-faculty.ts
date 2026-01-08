'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface DepartmentDto {
  id: string;
  name: string;
  code: string;
}

export interface FacultyStatsDto {
  totalFaculty: number;
  presentToday: number;
  onLeave: number;
  avgClassesPerWeek: number;
}

export interface WorkloadSummaryDto {
  avgClassesPerFaculty: number;
  avgLabsPerFaculty: number;
  underloaded: number;
  optimal: number;
  overloaded: number;
}

export interface FacultySubjectDto {
  id: string;
  code: string;
  name: string;
  section: string | null;
  academicYear: string;
}

export interface FacultyDto {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  designation: string;
  joiningDate: string;
  subjects: FacultySubjectDto[];
  subjectCount: number;
  totalClasses: number;
  classesTaken: number;
  attendancePercentage: number;
  isOnLeave: boolean;
}

export interface TimetableSlotDto {
  id: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subjectCode: string;
  subjectName: string;
  section: string | null;
}

export interface FacultyDetailDto extends FacultyDto {
  phone: string | null;
  qualification: string | null;
  specialization: string | null;
  department: DepartmentDto | null;
  timetable: TimetableSlotDto[];
}

export interface HodFacultyResponse {
  department: DepartmentDto | null;
  stats: FacultyStatsDto;
  workload: WorkloadSummaryDto;
  faculty: FacultyDto[];
}

export interface DepartmentTimetableSlot {
  time: string;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
}

export interface DepartmentTimetableResponse {
  department: DepartmentDto | null;
  timetable: DepartmentTimetableSlot[];
}

export interface WorkloadFacultyDto {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  subjectCount: number;
  theoryCount: number;
  labCount: number;
  totalClassesPerWeek: number;
  status: 'underloaded' | 'optimal' | 'overloaded';
  subjects: Array<{
    code: string;
    name: string;
    isLab: boolean;
  }>;
}

export interface WorkloadDetailsResponse {
  department: DepartmentDto | null;
  faculty: WorkloadFacultyDto[];
}

// ============ API Client ============

async function hodFacultyApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/hod-faculty${endpoint}`, {
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

export const hodFacultyKeys = {
  all: ['hod-faculty'] as const,
  list: (tenantId: string, params?: { search?: string; designation?: string }) =>
    [...hodFacultyKeys.all, 'list', tenantId, params] as const,
  detail: (tenantId: string, staffId: string) =>
    [...hodFacultyKeys.all, 'detail', tenantId, staffId] as const,
  timetable: (tenantId: string) =>
    [...hodFacultyKeys.all, 'timetable', tenantId] as const,
  workload: (tenantId: string) =>
    [...hodFacultyKeys.all, 'workload', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get all faculty in the HoD's department
 */
export function useHodFaculty(
  tenantId: string,
  params?: { search?: string; designation?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.designation && params.designation !== 'all') {
    queryParams.set('designation', params.designation);
  }
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodFacultyKeys.list(tenantId, params),
    queryFn: () =>
      hodFacultyApi<HodFacultyResponse>(`${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get single faculty details
 */
export function useHodFacultyDetail(tenantId: string, staffId: string) {
  return useQuery({
    queryKey: hodFacultyKeys.detail(tenantId, staffId),
    queryFn: () => hodFacultyApi<FacultyDetailDto>(`/${staffId}`, tenantId),
    enabled: !!tenantId && !!staffId,
  });
}

/**
 * Get department timetable
 */
export function useDepartmentTimetable(tenantId: string) {
  return useQuery({
    queryKey: hodFacultyKeys.timetable(tenantId),
    queryFn: () => hodFacultyApi<DepartmentTimetableResponse>('/timetable', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get workload details for all faculty
 */
export function useWorkloadDetails(tenantId: string) {
  return useQuery({
    queryKey: hodFacultyKeys.workload(tenantId),
    queryFn: () => hodFacultyApi<WorkloadDetailsResponse>('/workload', tenantId),
    enabled: !!tenantId,
  });
}
