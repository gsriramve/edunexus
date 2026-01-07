'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  invitationsApi,
  type Invitation,
  type InvitationStats,
  type InvitationQueryParams,
  type CreateInvitationInput,
  type ResendInvitationInput,
} from '@/lib/api';

// Query keys
export const invitationKeys = {
  all: ['invitations'] as const,
  lists: () => [...invitationKeys.all, 'list'] as const,
  list: (tenantId: string, params?: InvitationQueryParams) => [...invitationKeys.lists(), tenantId, params] as const,
  details: () => [...invitationKeys.all, 'detail'] as const,
  detail: (tenantId: string, id: string) => [...invitationKeys.details(), tenantId, id] as const,
  stats: (tenantId: string) => [...invitationKeys.all, 'stats', tenantId] as const,
  validate: (token: string) => [...invitationKeys.all, 'validate', token] as const,
};

/**
 * Hook to list all invitations with optional filtering
 */
export function useInvitations(tenantId: string, params?: InvitationQueryParams) {
  return useQuery({
    queryKey: invitationKeys.list(tenantId, params),
    queryFn: () => invitationsApi.list(tenantId, params),
    enabled: !!tenantId,
  });
}

/**
 * Hook to get a single invitation by ID
 */
export function useInvitation(tenantId: string, id: string) {
  return useQuery({
    queryKey: invitationKeys.detail(tenantId, id),
    queryFn: () => invitationsApi.get(tenantId, id),
    enabled: !!tenantId && !!id,
  });
}

/**
 * Hook to get invitation statistics
 */
export function useInvitationStats(tenantId: string) {
  return useQuery({
    queryKey: invitationKeys.stats(tenantId),
    queryFn: () => invitationsApi.getStats(tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Hook to validate an invitation token (public, no tenant needed)
 */
export function useValidateInvitation(token: string) {
  return useQuery({
    queryKey: invitationKeys.validate(token),
    queryFn: () => invitationsApi.validateToken(token),
    enabled: !!token,
  });
}

/**
 * Hook to create a new invitation
 */
export function useCreateInvitation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationInput) => invitationsApi.create(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.stats(tenantId) });
    },
  });
}

/**
 * Hook to resend an invitation
 */
export function useResendInvitation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ResendInvitationInput }) =>
      invitationsApi.resend(tenantId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.detail(tenantId, id) });
    },
  });
}

/**
 * Hook to cancel an invitation
 */
export function useCancelInvitation(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invitationsApi.cancel(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.stats(tenantId) });
    },
  });
}
