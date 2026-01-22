'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentEnrollmentApi,
  type StudentEnrollment,
  type EnrollmentStatusType,
  type InitiateEnrollmentInput,
  type EnrollmentQueryParams,
  type UpdateProfileInput,
  type AdminReviewInput,
  type ApprovalInput,
  type StudentSignupInput,
  type TokenVerificationResult,
} from '@/lib/api';

// Re-export types for convenience
export type {
  StudentEnrollment,
  EnrollmentStatusType,
  InitiateEnrollmentInput,
  EnrollmentQueryParams,
  UpdateProfileInput,
  AdminReviewInput,
  ApprovalInput,
  StudentSignupInput,
  TokenVerificationResult,
};

// ============ Query Keys ============

export const studentEnrollmentKeys = {
  all: ['student-enrollments'] as const,
  lists: () => [...studentEnrollmentKeys.all, 'list'] as const,
  list: (params?: EnrollmentQueryParams) => [...studentEnrollmentKeys.lists(), params] as const,
  details: () => [...studentEnrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentEnrollmentKeys.details(), id] as const,
  token: (token: string) => [...studentEnrollmentKeys.all, 'token', token] as const,
  pendingApprovals: () => [...studentEnrollmentKeys.all, 'pending-approvals'] as const,
};

// ============ Admin Query Hooks ============

export function useStudentEnrollments(params?: EnrollmentQueryParams) {
  return useQuery({
    queryKey: studentEnrollmentKeys.list(params),
    queryFn: () => studentEnrollmentApi.list(params),
  });
}

export function useStudentEnrollment(id: string) {
  return useQuery({
    queryKey: studentEnrollmentKeys.detail(id),
    queryFn: () => studentEnrollmentApi.get(id),
    enabled: !!id,
  });
}

// ============ Admin Mutation Hooks ============

export function useInitiateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InitiateEnrollmentInput) => studentEnrollmentApi.initiate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.lists() });
    },
  });
}

export function useSendEnrollmentInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentEnrollmentApi.sendInvitation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.lists() });
    },
  });
}

export function useAdminReviewEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminReviewInput }) =>
      studentEnrollmentApi.adminReview(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.pendingApprovals() });
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentEnrollmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.lists() });
    },
  });
}

// ============ Public (Token-based) Query Hooks ============

export function useVerifyEnrollmentToken(token: string) {
  return useQuery({
    queryKey: studentEnrollmentKeys.token(token),
    queryFn: () => studentEnrollmentApi.verifyToken(token),
    enabled: !!token,
    retry: false,
  });
}

// ============ Public Mutation Hooks ============

export function useEnrollmentSignup(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentSignupInput) => studentEnrollmentApi.signup(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.token(token) });
    },
  });
}

export function useUpdateEnrollmentProfile(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => studentEnrollmentApi.updateProfile(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.token(token) });
    },
  });
}

export function useSubmitEnrollment(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => studentEnrollmentApi.submit(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.token(token) });
    },
  });
}

// ============ Approval Query Hooks ============

export function usePendingEnrollmentApprovals() {
  return useQuery({
    queryKey: studentEnrollmentKeys.pendingApprovals(),
    queryFn: () => studentEnrollmentApi.getPendingApprovals(),
  });
}

// ============ Approval Mutation Hooks ============

export function useApproveEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalInput }) =>
      studentEnrollmentApi.approve(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentEnrollmentKeys.pendingApprovals() });
    },
  });
}
