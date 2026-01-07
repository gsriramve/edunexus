import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  attendanceApi,
  type StudentAttendance,
  type AttendanceStats,
  type AttendanceListParams,
  type AttendanceListResponse,
  type MarkAttendanceInput,
  type BulkMarkAttendanceInput,
  type SubjectAttendance,
  type AttendanceStatus,
} from '@/lib/api';

// Query Keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (tenantId: string, params?: AttendanceListParams) =>
    [...attendanceKeys.lists(), tenantId, params] as const,
  studentAttendance: (tenantId: string, studentId: string, params?: { fromDate?: string; toDate?: string }) =>
    [...attendanceKeys.all, 'student', tenantId, studentId, params] as const,
  studentStats: (tenantId: string, studentId: string, params?: { fromDate?: string; toDate?: string }) =>
    [...attendanceKeys.all, 'student', tenantId, studentId, 'stats', params] as const,
  studentSubjects: (tenantId: string, studentId: string) =>
    [...attendanceKeys.all, 'student', tenantId, studentId, 'subjects'] as const,
  byDate: (tenantId: string, date: string, params?: { departmentId?: string; section?: string; subjectId?: string }) =>
    [...attendanceKeys.all, 'by-date', tenantId, date, params] as const,
  overallStats: (tenantId: string, params?: { date?: string; departmentId?: string }) =>
    [...attendanceKeys.all, 'overall-stats', tenantId, params] as const,
};

// ==================== Query Hooks ====================

/**
 * List attendance records with optional filters
 */
export function useAttendanceList(tenantId: string, params?: AttendanceListParams) {
  return useQuery({
    queryKey: attendanceKeys.list(tenantId, params),
    queryFn: () => attendanceApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

/**
 * Get attendance records for a specific student
 */
export function useStudentAttendance(
  tenantId: string,
  studentId: string,
  params?: { fromDate?: string; toDate?: string }
) {
  return useQuery({
    queryKey: attendanceKeys.studentAttendance(tenantId, studentId, params),
    queryFn: () => attendanceApi.getStudentAttendance(tenantId, studentId, params),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get attendance statistics for a student (total days, present, absent, percentage)
 */
export function useStudentAttendanceStats(
  tenantId: string,
  studentId: string,
  params?: { fromDate?: string; toDate?: string }
) {
  return useQuery({
    queryKey: attendanceKeys.studentStats(tenantId, studentId, params),
    queryFn: () => attendanceApi.getStudentStats(tenantId, studentId, params),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get subject-wise attendance breakdown for a student
 */
export function useStudentSubjectAttendance(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: attendanceKeys.studentSubjects(tenantId, studentId),
    queryFn: () => attendanceApi.getStudentSubjectAttendance(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get attendance records for a specific date (for teacher marking attendance)
 */
export function useAttendanceByDate(
  tenantId: string,
  date: string,
  params?: { departmentId?: string; section?: string; subjectId?: string }
) {
  return useQuery({
    queryKey: attendanceKeys.byDate(tenantId, date, params),
    queryFn: () => attendanceApi.getByDate(tenantId, date, params),
    enabled: !!tenantId && !!date,
  });
}

/**
 * Get overall attendance statistics (for admin dashboard)
 */
export function useOverallAttendanceStats(
  tenantId: string,
  params?: { date?: string; departmentId?: string }
) {
  return useQuery({
    queryKey: attendanceKeys.overallStats(tenantId, params),
    queryFn: () => attendanceApi.getOverallStats(tenantId, params),
    enabled: !!tenantId,
  });
}

// ==================== Mutation Hooks ====================

/**
 * Mark attendance for a single student
 */
export function useMarkAttendance(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkAttendanceInput) => attendanceApi.mark(tenantId, data),
    onSuccess: (_, variables) => {
      // Invalidate all attendance queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.studentAttendance(tenantId, variables.studentId)
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.studentStats(tenantId, variables.studentId)
      });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.overallStats(tenantId) });
    },
  });
}

/**
 * Bulk mark attendance for multiple students
 */
export function useBulkMarkAttendance(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkMarkAttendanceInput) => attendanceApi.bulkMark(tenantId, data),
    onSuccess: () => {
      // Invalidate all attendance-related queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

/**
 * Update an existing attendance record
 */
export function useUpdateAttendance(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: AttendanceStatus; remarks?: string } }) =>
      attendanceApi.update(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

/**
 * Delete an attendance record
 */
export function useDeleteAttendance(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceApi.delete(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

// Re-export types for convenience
export type {
  StudentAttendance,
  AttendanceStats,
  AttendanceListParams,
  AttendanceListResponse,
  MarkAttendanceInput,
  BulkMarkAttendanceInput,
  SubjectAttendance,
  AttendanceStatus,
};
