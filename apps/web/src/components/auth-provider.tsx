'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { setAuthContext } from '@/lib/api';

/**
 * AuthProvider syncs Clerk user data to the API client's auth context.
 * This enables API calls to include proper authentication headers.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      const metadata = user.publicMetadata as {
        role?: string;
        tenantId?: string;
      };

      setAuthContext({
        userId: user.id,
        role: metadata.role,
        tenantId: metadata.tenantId || null,
        name: user.fullName || user.firstName || 'Unknown',
      });
    } else {
      setAuthContext(null);
    }
  }, [user, isLoaded]);

  return <>{children}</>;
}
