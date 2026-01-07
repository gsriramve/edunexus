'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const ROLE_DASHBOARDS: Record<string, string> = {
  platform_owner: '/platform',
  principal: '/principal',
  hod: '/hod',
  admin_staff: '/admin',
  teacher: '/teacher',
  lab_assistant: '/lab-assistant',
  student: '/student',
  parent: '/parent',
};

export default function AuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace('/sign-in');
      return;
    }

    const metadata = user.publicMetadata as { role?: string };
    const role = metadata?.role;
    const dashboard = role ? ROLE_DASHBOARDS[role] : null;

    if (dashboard) {
      router.replace(dashboard);
    } else {
      router.replace('/setup-pending');
    }
  }, [user, isLoaded, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
