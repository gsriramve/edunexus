"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, RefreshCw, LogOut, CheckCircle } from "lucide-react";

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

export default function SetupPendingPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const checkRoleAndRedirect = useCallback(async () => {
    if (!user) return;

    setIsChecking(true);

    // Reload user data from Clerk
    await user.reload();

    const metadata = user.publicMetadata as { role?: string };
    const role = metadata?.role;

    if (role && ROLE_DASHBOARDS[role]) {
      router.replace(ROLE_DASHBOARDS[role]);
      return;
    }

    setLastChecked(new Date());
    setIsChecking(false);
    setCountdown(15);
  }, [user, router]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!isLoaded || !user) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkRoleAndRedirect();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, user, checkRoleAndRedirect]);

  // Check immediately on load
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as { role?: string };
      const role = metadata?.role;

      if (role && ROLE_DASHBOARDS[role]) {
        router.replace(ROLE_DASHBOARDS[role]);
      }
    }
  }, [isLoaded, user, router]);

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-md px-4">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">EduNexus</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Setup Pending</h1>

        <p className="text-muted-foreground mb-6">
          Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}! Your account has been created
          but is awaiting role assignment.
        </p>

        <div className="bg-white border rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <span>Your administrator will assign your role and permissions.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <span>You will receive an email notification once your account is ready.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <span>This page will automatically redirect you when ready.</span>
            </li>
          </ul>
        </div>

        {/* Status indicator */}
        <div className="bg-slate-100 rounded-lg px-4 py-3 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking for role assignment...</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span>Next check in {countdown}s</span>
                <span className="text-xs">
                  (Last: {lastChecked.toLocaleTimeString()})
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={checkRoleAndRedirect}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Check Now
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Need help? Contact your college administrator or email{" "}
          <a href="mailto:support@edunexus.io" className="text-primary hover:underline">
            support@edunexus.io
          </a>
        </p>
      </div>
    </div>
  );
}
