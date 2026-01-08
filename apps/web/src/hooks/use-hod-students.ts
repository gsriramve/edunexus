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

export interface StudentStatsDto {
  total: number;
  activeStudents: number;
  onLeave: number;
  detained: number;
  avgAttendance: number;
  avgCGPA: number;
  atRisk: number;
}

export interface SemesterDataDto {
  semester: number;
  students: number;
  avgAttendance: number;
  avgCGPA: number | null;
  atRisk: number;
}

export interface StudentDto {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  semester: number;
  section: string | null;
  batch: string;
  cgpa: number;
  attendance: number;
  status: string;
  atRisk: boolean;
  riskReasons: string[];
}

export interface AtRiskStudentDto extends StudentDto {
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TopPerformerDto {
  id: string;
  rollNo: string;
  name: string;
  semester: number;
  cgpa: number;
  rank: number;
}

export interface HodStudentsResponse {
  department: DepartmentDto | null;
  stats: StudentStatsDto;
  semesterData: SemesterDataDto[];
  students: StudentDto[];
}

export interface AtRiskResponse {
  department: DepartmentDto | null;
  count: number;
  students: AtRiskStudentDto[];
}

export interface TopPerformersResponse {
  department: DepartmentDto | null;
  students: TopPerformerDto[];
}

export interface SemesterOverviewResponse {
  department: DepartmentDto | null;
  semesterData: SemesterDataDto[];
}

export interface ContactDto {
  id: string;
  type: string;
  value: string;
}

export interface AddressDto {
  id: string;
  type: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface ProfileDto {
  id: string;
  contacts: ContactDto[];
  addresses: AddressDto[];
}

export interface ParentDto {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

export interface RecentAttendanceDto {
  date: string;
  status: string;
}

export interface RecentExamDto {
  id: string;
  examName: string;
  subjectName: string;
  marks: number | null;
  totalMarks: number;
  date: string;
}

export interface StudentDetailDto {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  semester: number;
  section: string | null;
  batch: string;
  status: string;
  admissionDate: string | null;
  cgpa: number;
  attendance: number;
  atRisk: boolean;
  riskReasons: string[];
  profile: ProfileDto | null;
  parents: ParentDto[];
  recentAttendance: RecentAttendanceDto[];
  recentExams: RecentExamDto[];
}

// ============ API Client ============

async function hodStudentsApi<T>(
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

  const response = await fetch(`${API_BASE_URL}/hod-students${endpoint}`, {
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

export const hodStudentsKeys = {
  all: ['hod-students'] as const,
  list: (tenantId: string, params?: { search?: string; semester?: string; section?: string }) =>
    [...hodStudentsKeys.all, 'list', tenantId, params] as const,
  detail: (tenantId: string, studentId: string) =>
    [...hodStudentsKeys.all, 'detail', tenantId, studentId] as const,
  atRisk: (tenantId: string) =>
    [...hodStudentsKeys.all, 'at-risk', tenantId] as const,
  topPerformers: (tenantId: string, limit?: number) =>
    [...hodStudentsKeys.all, 'top-performers', tenantId, limit] as const,
  semesterOverview: (tenantId: string) =>
    [...hodStudentsKeys.all, 'semester-overview', tenantId] as const,
};

// ============ Query Hooks ============

/**
 * Get all students in the HoD's department
 */
export function useHodStudents(
  tenantId: string,
  params?: { search?: string; semester?: string; section?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.semester && params.semester !== 'all') {
    queryParams.set('semester', params.semester);
  }
  if (params?.section && params.section !== 'all') {
    queryParams.set('section', params.section);
  }
  const query = queryParams.toString();

  return useQuery({
    queryKey: hodStudentsKeys.list(tenantId, params),
    queryFn: () =>
      hodStudentsApi<HodStudentsResponse>(`${query ? `?${query}` : ''}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get single student details
 */
export function useHodStudentDetail(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: hodStudentsKeys.detail(tenantId, studentId),
    queryFn: () => hodStudentsApi<StudentDetailDto>(`/${studentId}`, tenantId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get at-risk students
 */
export function useAtRiskStudents(tenantId: string) {
  return useQuery({
    queryKey: hodStudentsKeys.atRisk(tenantId),
    queryFn: () => hodStudentsApi<AtRiskResponse>('/at-risk', tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get top performing students
 */
export function useTopPerformers(tenantId: string, limit: number = 10) {
  return useQuery({
    queryKey: hodStudentsKeys.topPerformers(tenantId, limit),
    queryFn: () =>
      hodStudentsApi<TopPerformersResponse>(`/top-performers?limit=${limit}`, tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get semester-wise overview
 */
export function useSemesterOverview(tenantId: string) {
  return useQuery({
    queryKey: hodStudentsKeys.semesterOverview(tenantId),
    queryFn: () => hodStudentsApi<SemesterOverviewResponse>('/semester-overview', tenantId),
    enabled: !!tenantId,
  });
}
