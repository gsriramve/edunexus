'use client';

import { useAuth } from '@/lib/auth';
import { useParams, useSearchParams } from 'next/navigation';

/**
 * Hook to get the current tenant ID.
 * Priority:
 * 1. User's tenantId from JWT (for authenticated users with assigned tenant)
 * 2. URL params (e.g., /[tenantId]/dashboard)
 * 3. Query string (e.g., ?tenantId=xxx) - for development/testing
 * 4. localStorage - for development/testing fallback
 */
export function useTenantId(): string | null {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();

  // 1. First priority: Get from user's tenantId (production flow)
  if (!isLoading && user && user.tenantId) {
    return user.tenantId;
  }

  // 2. Try to get from URL params (e.g., /[tenantId]/dashboard)
  if (params?.tenantId && typeof params.tenantId === 'string') {
    return params.tenantId;
  }

  // 3. Try to get from query string (e.g., ?tenantId=xxx) - for testing
  const queryTenantId = searchParams.get('tenantId');
  if (queryTenantId) {
    return queryTenantId;
  }

  // 4. For development, check localStorage for a saved tenant ID
  if (typeof window !== 'undefined') {
    const savedTenantId = localStorage.getItem('edunexus_tenant_id');
    if (savedTenantId) {
      return savedTenantId;
    }
  }

  return null;
}

/**
 * Save tenant ID to localStorage for development/testing
 */
export function setTenantId(tenantId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('edunexus_tenant_id', tenantId);
  }
}

/**
 * Clear tenant ID from localStorage
 */
export function clearTenantId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('edunexus_tenant_id');
  }
}
