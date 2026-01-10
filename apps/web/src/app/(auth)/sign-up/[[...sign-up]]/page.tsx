"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";

interface InvitationValidation {
  valid: boolean;
  invitation?: {
    id: string;
    email: string;
    role: string;
    message?: string;
    expiresAt: string;
  };
  tenant?: {
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
  };
  error?: string;
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validating, setValidating] = useState(true);
  const [validation, setValidation] = useState<InvitationValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError("No invitation token provided. You can only sign up with a valid invitation link from your administrator.");
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/invitations/validate/${token}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Invalid or expired invitation token.");
          setValidating(false);
          return;
        }

        const data = await response.json();
        setValidation(data);
        setValidating(false);
      } catch (err) {
        setError("Failed to validate invitation. Please try again later.");
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  // Loading state
  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Validating your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - no valid token
  if (error || !validation?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Unable to Sign Up</CardTitle>
            <CardDescription className="mt-2">
              {error || "This invitation is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">How to get access:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Contact your college administrator</li>
                <li>Request an invitation to be sent to your email</li>
                <li>Click the link in the invitation email</li>
              </ol>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign In Instead
              </Link>
              <Link
                href="/"
                className="w-full rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-muted"
              >
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show sign up form with invitation details
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Invitation Info Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-green-900">Valid Invitation</p>
                <p className="text-sm text-green-800">
                  You have been invited to join as a <span className="font-semibold capitalize">{validation.invitation?.role}</span>
                </p>
                {validation.tenant?.name && (
                  <p className="text-sm text-green-700">
                    Organization: {validation.tenant.displayName || validation.tenant.name}
                  </p>
                )}
                {validation.invitation?.message && (
                  <p className="mt-2 text-sm italic text-green-700">
                    &ldquo;{validation.invitation.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important: Sign up with the SAME email as invitation */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Important:</span> Please sign up with email{" "}
              <span className="font-mono font-semibold">{validation.invitation?.email}</span>
            </p>
          </CardContent>
        </Card>

        {/* Clerk Sign Up Component */}
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              card: "shadow-xl",
            },
          }}
          initialValues={{
            emailAddress: validation.invitation?.email,
          }}
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
