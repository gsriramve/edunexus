"use client";

import { Camera, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HodFaceEnrollment() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Face Recognition Enrollment</h1>
        <p className="text-muted-foreground">
          Manage student face enrollments for attendance recognition
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-orange-100 p-4 mb-4">
            <Camera className="h-12 w-12 text-orange-600" />
          </div>
          <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
          <h2 className="text-xl font-semibold mb-2">Feature Under Development</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Face recognition enrollment is currently being developed.
            This feature will allow you to enroll students for automated
            face-based attendance tracking.
          </p>
          <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Expected availability: Q2 2026</span>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bulk Enrollment</CardTitle>
            <CardDescription>
              Enroll multiple students at once using batch photo uploads
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality Verification</CardTitle>
            <CardDescription>
              Automatic photo quality checks for reliable recognition
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Re-enrollment</CardTitle>
            <CardDescription>
              Easy re-enrollment for updated photos or failed captures
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
