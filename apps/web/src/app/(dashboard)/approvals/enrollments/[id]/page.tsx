"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Home,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useStudentEnrollment,
  useApproveEnrollment,
} from "@/hooks/use-api";
import { toast } from "sonner";

export default function EnrollmentApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const enrollmentId = params.id as string;

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Queries
  const { data: enrollment, isLoading } = useStudentEnrollment(enrollmentId);

  // Mutations
  const approveEnrollment = useApproveEnrollment();

  const handleApprove = async () => {
    try {
      await approveEnrollment.mutateAsync({
        id: enrollmentId,
        data: {
          action: "approve",
          notes: notes || undefined,
        },
      });
      toast.success("Enrollment approved successfully!");
      router.push("/approvals/enrollments");
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve enrollment");
    }
  };

  const handleReject = async () => {
    if (!notes) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await approveEnrollment.mutateAsync({
        id: enrollmentId,
        data: {
          action: "reject",
          notes,
        },
      });
      toast.success("Enrollment rejected");
      router.push("/approvals/enrollments");
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject enrollment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-muted-foreground">Enrollment not found</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const personalDetails = enrollment.personalDetails || {};
  const academicDetails = enrollment.academicDetails || {};
  const documents = enrollment.documents || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {enrollment.firstName} {enrollment.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-cyan-100 text-cyan-800">
                {enrollment.status === "ADMIN_APPROVED" ? "Admin Approved" : "HOD Approved"}
              </Badge>
              <span className="text-muted-foreground">
                {enrollment.department.name} | {enrollment.academicYear}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setRejectDialogOpen(true)}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setApproveDialogOpen(true)}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>

      {/* Admin Notes */}
      {enrollment.adminNotes && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">Admin Notes</p>
                <p className="text-blue-700 mt-1">{enrollment.adminNotes}</p>
                <p className="text-sm text-blue-600 mt-2">
                  Reviewed on {new Date(enrollment.adminReviewedAt!).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{enrollment.firstName} {enrollment.lastName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {enrollment.email}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mobile</Label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {enrollment.mobileNumber}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {enrollment.department.name}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Academic Year</Label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {enrollment.academicYear}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Section</Label>
                <p className="font-medium">
                  {enrollment.section ? `Section ${enrollment.section}` : "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(personalDetails).length === 0 ? (
              <p className="text-muted-foreground">No personal details provided</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {personalDetails.dateOfBirth && (
                  <div>
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <p className="font-medium">{personalDetails.dateOfBirth}</p>
                  </div>
                )}
                {personalDetails.gender && (
                  <div>
                    <Label className="text-muted-foreground">Gender</Label>
                    <p className="font-medium capitalize">{personalDetails.gender}</p>
                  </div>
                )}
                {personalDetails.bloodGroup && (
                  <div>
                    <Label className="text-muted-foreground">Blood Group</Label>
                    <p className="font-medium">{personalDetails.bloodGroup}</p>
                  </div>
                )}
                {personalDetails.category && (
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{personalDetails.category}</p>
                  </div>
                )}
                {personalDetails.fatherName && (
                  <div>
                    <Label className="text-muted-foreground">Father&apos;s Name</Label>
                    <p className="font-medium">{personalDetails.fatherName}</p>
                  </div>
                )}
                {personalDetails.motherName && (
                  <div>
                    <Label className="text-muted-foreground">Mother&apos;s Name</Label>
                    <p className="font-medium">{personalDetails.motherName}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(academicDetails).length === 0 ? (
              <p className="text-muted-foreground">No academic details provided</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {academicDetails.previousInstitution && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Previous Institution</Label>
                    <p className="font-medium">{academicDetails.previousInstitution}</p>
                  </div>
                )}
                {academicDetails.previousBoard && (
                  <div>
                    <Label className="text-muted-foreground">Board</Label>
                    <p className="font-medium">{academicDetails.previousBoard}</p>
                  </div>
                )}
                {academicDetails.passingYear && (
                  <div>
                    <Label className="text-muted-foreground">Passing Year</Label>
                    <p className="font-medium">{academicDetails.passingYear}</p>
                  </div>
                )}
                {academicDetails.percentage && (
                  <div>
                    <Label className="text-muted-foreground">Percentage</Label>
                    <p className="font-medium text-lg text-green-600">
                      {academicDetails.percentage}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(documents).length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(documents).map(([key, doc]: [string, any]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Enrollment</DialogTitle>
            <DialogDescription>
              {enrollment.firstName} {enrollment.lastName} - {enrollment.department.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Approving this enrollment will:
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
                <li>Generate a unique roll number for the student</li>
                <li>Create an official email address</li>
                <li>Create the student account in the system</li>
                <li>Send a welcome email with login credentials</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes for this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleApprove}
              disabled={approveEnrollment.isPending}
            >
              {approveEnrollment.isPending ? "Processing..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment</DialogTitle>
            <DialogDescription>
              {enrollment.firstName} {enrollment.lastName} - {enrollment.department.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Rejecting this enrollment will notify the student
                and they will not be able to proceed with admission.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Rejection *</Label>
              <Textarea
                placeholder="Please provide a clear reason for rejection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={approveEnrollment.isPending || !notes}
            >
              {approveEnrollment.isPending ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
