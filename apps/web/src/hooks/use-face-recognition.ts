import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  faceRecognitionApi,
  type FaceEnrollment,
  type EnrollStudentInput,
  type BulkEnrollInput,
  type EnrollmentResult,
  type BulkEnrollResult,
  type EnrollmentStats,
  type QueryEnrollmentsParams,
  type SessionResult,
  type CreateSessionInput,
  type ConfirmSessionInput,
  type QuerySessionsParams,
  type AttendanceSessionStats,
  type UpdateDetectedFaceInput,
  type BulkUpdateFacesInput,
  type FaceRecognitionConfig,
  type DetectFacesInput,
  type SearchFaceInput,
  type FaceMatch,
  type SectionStudent,
  type FaceEnrollmentStatus,
  type FaceSessionStatus,
  type DetectedFaceStatus,
  type FaceAttendanceStatus,
  type BoundingBox,
  type MatchedStudent,
  type DetectedFaceResult,
} from '@/lib/api';

// Query Keys
export const faceRecognitionKeys = {
  all: ['face-recognition'] as const,
  enrollments: () => [...faceRecognitionKeys.all, 'enrollments'] as const,
  enrollmentsList: (tenantId: string, params?: QueryEnrollmentsParams) =>
    [...faceRecognitionKeys.enrollments(), 'list', tenantId, params] as const,
  enrollment: (tenantId: string, studentId: string) =>
    [...faceRecognitionKeys.enrollments(), 'detail', tenantId, studentId] as const,
  enrollmentStatus: (tenantId: string, studentId: string) =>
    [...faceRecognitionKeys.enrollments(), 'status', tenantId, studentId] as const,
  enrollmentStats: (tenantId: string) =>
    [...faceRecognitionKeys.enrollments(), 'stats', tenantId] as const,
  unenrolledStudents: (tenantId: string, params?: { departmentId?: string; limit?: number }) =>
    [...faceRecognitionKeys.enrollments(), 'unenrolled', tenantId, params] as const,
  sessions: () => [...faceRecognitionKeys.all, 'sessions'] as const,
  sessionsList: (tenantId: string, params?: QuerySessionsParams) =>
    [...faceRecognitionKeys.sessions(), 'list', tenantId, params] as const,
  session: (tenantId: string, sessionId: string) =>
    [...faceRecognitionKeys.sessions(), 'detail', tenantId, sessionId] as const,
  sessionStats: (tenantId: string) =>
    [...faceRecognitionKeys.sessions(), 'stats', tenantId] as const,
  sectionStudents: (tenantId: string, params?: { departmentId?: string; section?: string }) =>
    [...faceRecognitionKeys.all, 'section-students', tenantId, params] as const,
  config: (tenantId: string) =>
    [...faceRecognitionKeys.all, 'config', tenantId] as const,
};

// ==================== Enrollment Query Hooks ====================

/**
 * Query enrollments with optional filters
 */
export function useFaceEnrollments(tenantId: string, params?: QueryEnrollmentsParams) {
  return useQuery({
    queryKey: faceRecognitionKeys.enrollmentsList(tenantId, params),
    queryFn: () => faceRecognitionApi.queryEnrollments(tenantId, params),
    enabled: !!tenantId,
  });
}

/**
 * Get enrollment for a specific student
 */
export function useFaceEnrollment(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: faceRecognitionKeys.enrollment(tenantId, studentId),
    queryFn: () => faceRecognitionApi.getEnrollment(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Check enrollment status for a student
 */
export function useFaceEnrollmentStatus(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: faceRecognitionKeys.enrollmentStatus(tenantId, studentId),
    queryFn: () => faceRecognitionApi.checkEnrollmentStatus(tenantId, studentId),
    enabled: !!tenantId && !!studentId,
  });
}

/**
 * Get enrollment statistics
 */
export function useFaceEnrollmentStats(tenantId: string) {
  return useQuery({
    queryKey: faceRecognitionKeys.enrollmentStats(tenantId),
    queryFn: () => faceRecognitionApi.getEnrollmentStats(tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Get unenrolled students
 */
export function useUnenrolledStudents(
  tenantId: string,
  params?: { departmentId?: string; limit?: number }
) {
  return useQuery({
    queryKey: faceRecognitionKeys.unenrolledStudents(tenantId, params),
    queryFn: () => faceRecognitionApi.getUnenrolledStudents(tenantId, params),
    enabled: !!tenantId,
  });
}

// ==================== Session Query Hooks ====================

/**
 * Query attendance sessions
 */
export function useFaceSessions(tenantId: string, params?: QuerySessionsParams) {
  return useQuery({
    queryKey: faceRecognitionKeys.sessionsList(tenantId, params),
    queryFn: () => faceRecognitionApi.querySessions(tenantId, params),
    enabled: !!tenantId,
  });
}

/**
 * Get a specific session
 */
export function useFaceSession(tenantId: string, sessionId: string) {
  return useQuery({
    queryKey: faceRecognitionKeys.session(tenantId, sessionId),
    queryFn: () => faceRecognitionApi.getSession(tenantId, sessionId),
    enabled: !!tenantId && !!sessionId,
  });
}

/**
 * Get attendance session statistics
 */
export function useFaceSessionStats(tenantId: string) {
  return useQuery({
    queryKey: faceRecognitionKeys.sessionStats(tenantId),
    queryFn: () => faceRecognitionApi.getAttendanceStats(tenantId),
    enabled: !!tenantId,
  });
}

// ==================== Utility Query Hooks ====================

/**
 * Get students in a section
 */
export function useSectionStudents(
  tenantId: string,
  params?: { departmentId?: string; section?: string }
) {
  return useQuery({
    queryKey: faceRecognitionKeys.sectionStudents(tenantId, params),
    queryFn: () => faceRecognitionApi.getSectionStudents(tenantId, params),
    enabled: !!tenantId,
  });
}

/**
 * Get face recognition configuration
 */
export function useFaceRecognitionConfig(tenantId: string) {
  return useQuery({
    queryKey: faceRecognitionKeys.config(tenantId),
    queryFn: () => faceRecognitionApi.getConfig(tenantId),
    enabled: !!tenantId,
  });
}

// ==================== Enrollment Mutation Hooks ====================

/**
 * Enroll a student's face
 */
export function useEnrollFace(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnrollStudentInput) => faceRecognitionApi.enroll(tenantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.enrollments() });
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.enrollment(tenantId, variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.enrollmentStatus(tenantId, variables.studentId),
      });
    },
  });
}

/**
 * Bulk enroll multiple students
 */
export function useBulkEnrollFaces(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkEnrollInput) => faceRecognitionApi.bulkEnroll(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.enrollments() });
    },
  });
}

/**
 * Re-enroll a student (update face)
 */
export function useReEnrollFace(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, imageUrl }: { studentId: string; imageUrl: string }) =>
      faceRecognitionApi.reEnroll(tenantId, studentId, imageUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.enrollment(tenantId, variables.studentId),
      });
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.enrollments() });
    },
  });
}

/**
 * Unenroll a student
 */
export function useUnenrollFace(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => faceRecognitionApi.unenroll(tenantId, studentId),
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.enrollment(tenantId, studentId),
      });
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.enrollmentStatus(tenantId, studentId),
      });
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.enrollments() });
    },
  });
}

// ==================== Session Mutation Hooks ====================

/**
 * Create a new attendance session
 */
export function useCreateFaceSession(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSessionInput) => faceRecognitionApi.createSession(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessions() });
    },
  });
}

/**
 * Process a session (detect and match faces)
 */
export function useProcessFaceSession(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, matchThreshold }: { sessionId: string; matchThreshold?: number }) =>
      faceRecognitionApi.processSession(tenantId, sessionId, matchThreshold),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.session(tenantId, result.id),
      });
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessions() });
    },
  });
}

/**
 * Confirm a session
 */
export function useConfirmFaceSession(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      overrides,
    }: {
      sessionId: string;
      overrides?: ConfirmSessionInput['overrides'];
    }) => faceRecognitionApi.confirmSession(tenantId, sessionId, overrides),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.session(tenantId, result.id),
      });
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessionStats(tenantId) });
    },
  });
}

/**
 * Cancel a session
 */
export function useCancelFaceSession(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => faceRecognitionApi.cancelSession(tenantId, sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: faceRecognitionKeys.session(tenantId, sessionId),
      });
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessions() });
    },
  });
}

// ==================== Detected Face Mutation Hooks ====================

/**
 * Update a detected face
 */
export function useUpdateDetectedFace(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ faceId, data }: { faceId: string; data: UpdateDetectedFaceInput }) =>
      faceRecognitionApi.updateDetectedFace(tenantId, faceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessions() });
    },
  });
}

/**
 * Bulk update detected faces
 */
export function useBulkUpdateDetectedFaces(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateFacesInput) =>
      faceRecognitionApi.bulkUpdateFaces(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.sessions() });
    },
  });
}

// ==================== Utility Mutation Hooks ====================

/**
 * Detect faces in an image
 */
export function useDetectFaces(tenantId: string) {
  return useMutation({
    mutationFn: (data: DetectFacesInput) => faceRecognitionApi.detectFaces(tenantId, data),
  });
}

/**
 * Search for a face in enrolled students
 */
export function useSearchFace(tenantId: string) {
  return useMutation({
    mutationFn: (data: SearchFaceInput) => faceRecognitionApi.searchFace(tenantId, data),
  });
}

/**
 * Initialize face recognition collection
 */
export function useInitializeCollection(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => faceRecognitionApi.initializeCollection(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faceRecognitionKeys.config(tenantId) });
    },
  });
}

// Re-export types for convenience
export type {
  FaceEnrollment,
  EnrollStudentInput,
  BulkEnrollInput,
  EnrollmentResult,
  BulkEnrollResult,
  EnrollmentStats,
  QueryEnrollmentsParams,
  SessionResult,
  CreateSessionInput,
  ConfirmSessionInput,
  QuerySessionsParams,
  AttendanceSessionStats,
  UpdateDetectedFaceInput,
  BulkUpdateFacesInput,
  FaceRecognitionConfig,
  DetectFacesInput,
  SearchFaceInput,
  FaceMatch,
  SectionStudent,
  FaceEnrollmentStatus,
  FaceSessionStatus,
  DetectedFaceStatus,
  FaceAttendanceStatus,
  BoundingBox,
  MatchedStudent,
  DetectedFaceResult,
};
