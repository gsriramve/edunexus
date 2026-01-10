'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';


// ============ Types ============

export interface ScheduleEntry {
  day: string;
  time: string;
}

export interface TeacherClass {
  id: string;
  teacherSubjectId: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  departmentId: string;
  semester: number;
  section: string | null;
  studentCount: number;
  schedule: ScheduleEntry[];
  averageAttendance: number;
  averageMarks: number;
}

export interface TodaysClass {
  id: string;
  teacherSubjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string | null;
  time: string;
  room: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface TeacherClassesStats {
  currentSemester: string;
  currentAcademicYear: string;
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  todaysClassCount: number;
}

export interface TeacherClassesResponse {
  stats: TeacherClassesStats;
  classes: TeacherClass[];
  todaysClasses: TodaysClass[];
}

export interface ClassDetailSchedule {
  id: string;
  day: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
}

export interface ClassDetails extends Omit<TeacherClass, 'schedule'> {
  students: {
    id: string;
    rollNo: string;
    user: { id: string; name: string; email: string };
  }[];
  schedule: ClassDetailSchedule[];
}

export interface StudentDetail {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  section: string;
  attendance: number;
  avgMarks: number;
  assignments: {
    submitted: number;
    pending: number;
  };
  status: 'excellent' | 'good' | 'warning' | 'at_risk';
}

export interface ClassStudentsResponse {
  classInfo: {
    id: string;
    subjectCode: string;
    subjectName: string;
    section: string | null;
    department: string;
    semester: number;
  };
  students: StudentDetail[];
  stats: {
    total: number;
    excellent: number;
    good: number;
    warning: number;
    atRisk: number;
  };
}

export interface CreateTimetableInput {
  teacherSubjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  periodNumber?: number;
}

export interface UpdateTimetableInput {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  room?: string;
  periodNumber?: number;
  isActive?: boolean;
}

export interface Timetable {
  id: string;
  tenantId: string;
  teacherSubjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  periodNumber: number | null;
  isActive: boolean;
}

// ============ API Client ============

async function teacherClassesApi<T>(
  endpoint: string,
  tenantId: string,
  options: { method?: string; body?: unknown } = {}
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

  const response = await fetch(`${getApiBaseUrl()}/teacher-classes${endpoint}`, {
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

export const teacherClassesKeys = {
  all: ['teacher-classes'] as const,
  list: (tenantId: string, params?: { academicYear?: string; semester?: string }) =>
    [...teacherClassesKeys.all, 'list', tenantId, params] as const,
  detail: (tenantId: string, classId: string) =>
    [...teacherClassesKeys.all, 'detail', tenantId, classId] as const,
  students: (tenantId: string, classId: string) =>
    [...teacherClassesKeys.all, 'students', tenantId, classId] as const,
  timetables: () => [...teacherClassesKeys.all, 'timetables'] as const,
};

// ============ Query Hooks ============

/**
 * Get all classes assigned to the current teacher
 */
export function useTeacherClasses(
  tenantId: string,
  params?: { academicYear?: string; semester?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.academicYear) queryParams.set('academicYear', params.academicYear);
  if (params?.semester) queryParams.set('semester', params.semester);
  const query = queryParams.toString();

  return useQuery({
    queryKey: teacherClassesKeys.list(tenantId, params),
    queryFn: () =>
      teacherClassesApi<TeacherClassesResponse>(
        query ? `?${query}` : '',
        tenantId
      ),
    enabled: !!tenantId,
  });
}

/**
 * Get details of a specific class
 */
export function useTeacherClassDetails(tenantId: string, classId: string) {
  return useQuery({
    queryKey: teacherClassesKeys.detail(tenantId, classId),
    queryFn: () => teacherClassesApi<ClassDetails>(`/${classId}`, tenantId),
    enabled: !!tenantId && !!classId,
  });
}

/**
 * Get detailed students list for a class with stats
 */
export function useClassStudents(tenantId: string, classId: string) {
  return useQuery({
    queryKey: teacherClassesKeys.students(tenantId, classId),
    queryFn: () => teacherClassesApi<ClassStudentsResponse>(`/${classId}/students`, tenantId),
    enabled: !!tenantId && !!classId,
  });
}

// ============ Mutation Hooks ============

/**
 * Create a timetable entry
 */
export function useCreateTimetable(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimetableInput) =>
      teacherClassesApi<Timetable>('/timetable', tenantId, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherClassesKeys.all });
    },
  });
}

/**
 * Update a timetable entry
 */
export function useUpdateTimetable(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimetableInput }) =>
      teacherClassesApi<Timetable>(`/timetable/${id}`, tenantId, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherClassesKeys.all });
    },
  });
}

/**
 * Delete a timetable entry
 */
export function useDeleteTimetable(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      teacherClassesApi<void>(`/timetable/${id}`, tenantId, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherClassesKeys.all });
    },
  });
}
