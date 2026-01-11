"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-md px-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>

        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page.
          {user && " Your current role doesn't allow access to this resource."}
        </p>

        <div className="space-y-3">
          <Link href="/redirect">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
