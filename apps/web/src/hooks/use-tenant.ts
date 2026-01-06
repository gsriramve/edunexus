'use client';

import { useParams, useSearchParams } from 'next/navigation';

/**
 * Hook to get the current tenant ID from URL params or query string.
 * In production, this would come from the authenticated user's session or subdomain.
 * For development/testing, it can be passed via query param: ?tenantId=xxx
 */
export function useTenantId(): string | null {
  const params = useParams();
  const searchParams = useSearchParams();

  // Try to get from URL params first (e.g., /[tenantId]/dashboard)
  if (params?.tenantId && typeof params.tenantId === 'string') {
    return params.tenantId;
  }

  // Try to get from query string (e.g., ?tenantId=xxx)
  const queryTenantId = searchParams.get('tenantId');
  if (queryTenantId) {
    return queryTenantId;
  }

  // For development, check localStorage for a saved tenant ID
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
