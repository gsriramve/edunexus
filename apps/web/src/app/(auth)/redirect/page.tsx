'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
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
  alumni: '/alumni',
};

export default function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const role = user.role;
    const dashboard = role ? ROLE_DASHBOARDS[role] : null;

    if (dashboard) {
      router.replace(dashboard);
    } else {
      router.replace('/setup-pending');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
