'use client';

import { useQuery } from '@tanstack/react-query';
import {
  parentsApi,
  type ParentChild,
  type ParentProfile,
} from '@/lib/api';

// Query keys
export const parentKeys = {
  all: ['parents'] as const,
  children: () => [...parentKeys.all, 'children'] as const,
  childrenList: (tenantId: string, userId: string) => [...parentKeys.children(), tenantId, userId] as const,
  profile: () => [...parentKeys.all, 'profile'] as const,
  profileDetail: (tenantId: string, userId: string) => [...parentKeys.profile(), tenantId, userId] as const,
  child: (tenantId: string, userId: string, studentId: string) => [...parentKeys.children(), tenantId, userId, studentId] as const,
};

/**
 * Hook to get all children linked to a parent user
 */
export function useParentChildren(tenantId: string, userId: string) {
  return useQuery({
    queryKey: parentKeys.childrenList(tenantId, userId),
    queryFn: () => parentsApi.getChildren(tenantId, userId),
    enabled: !!tenantId && !!userId,
  });
}

/**
 * Hook to get parent's profile information
 */
export function useParentProfile(tenantId: string, userId: string) {
  return useQuery({
    queryKey: parentKeys.profileDetail(tenantId, userId),
    queryFn: () => parentsApi.getProfile(tenantId, userId),
    enabled: !!tenantId && !!userId,
  });
}

/**
 * Hook to get a specific child's details (validates parent has access)
 */
export function useParentChild(tenantId: string, userId: string, studentId: string) {
  return useQuery({
    queryKey: parentKeys.child(tenantId, userId, studentId),
    queryFn: () => parentsApi.getChild(tenantId, userId, studentId),
    enabled: !!tenantId && !!userId && !!studentId,
  });
}
