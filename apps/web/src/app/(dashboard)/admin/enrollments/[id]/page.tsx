"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStudentEnrollment,
  useSendEnrollmentInvitation,
  useAdminReviewEnrollment,
  type EnrollmentStatusType,
} from "@/hooks/use-api";
import { toast } from "sonner";

const getStatusBadge = (status: EnrollmentStatusType) => {
  const statusConfig: Record<EnrollmentStatusType, { label: string; color: string }> = {
    INITIATED: { label: "Initiated", color: "bg-gray-100 text-gray-800" },
    INVITATION_SENT: { label: "Invitation Sent", color: "bg-blue-100 text-blue-800" },
    STUDENT_SIGNED_UP: { label: "Signed Up", color: "bg-purple-100 text-purple-800" },
    PROFILE_INCOMPLETE: { label: "Profile Incomplete", color: "bg-yellow-100 text-yellow-800" },
    SUBMITTED: { label: "Submitted for Review", color: "bg-orange-100 text-orange-800" },
    ADMIN_APPROVED: { label: "Admin Approved", color: "bg-cyan-100 text-cyan-800" },
    CHANGES_REQUESTED: { label: "Changes Requested", color: "bg-yellow-100 text-yellow-800" },
    HOD_APPROVED: { label: "HOD Approved", color: "bg-teal-100 text-teal-800" },
    PRINCIPAL_APPROVED: { label: "Principal Approved", color: "bg-indigo-100 text-indigo-800" },
    COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
    EXPIRED: { label: "Expired", color: "bg-gray-100 text-gray-500" },
  };

  const config = statusConfig[status];
  return <Badge className={config.color}>{config.label}</Badge>;
};

export default function EnrollmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const enrollmentId = params.id as string;

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "request_changes" | "reject">("approve");
  const [section, setSection] = useState("");
  const [notes, setNotes] = useState("");

  // Queries
  const { data: enrollment, isLoading } = useStudentEnrollment(enrollmentId);

  // Mutations
  const sendInvitation = useSendEnrollmentInvitation();
  const adminReview = useAdminReviewEnrollment();

  const handleSendInvitation = async () => {
    try {
      await sendInvitation.mutateAsync(enrollmentId);
      toast.success("Invitation sent successfully");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation");
    }
  };

  const handleReview = async () => {
    try {
      await adminReview.mutateAsync({
        id: enrollmentId,
        data: {
          action: reviewAction,
          section: section || undefined,
          notes: notes || undefined,
        },
      });
      toast.success(
        reviewAction === "approve"
          ? "Enrollment approved and sent for final approval"
          : reviewAction === "request_changes"
          ? "Changes requested from student"
          : "Enrollment rejected"
      );
      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Failed to review enrollment:", error);
      toast.error("Failed to submit review");
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
              {getStatusBadge(enrollment.status)}
              <span className="text-muted-foreground">
                {enrollment.department.name} ({enrollment.department.code})
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(enrollment.status === "INITIATED" || enrollment.status === "INVITATION_SENT") && (
            <Button onClick={handleSendInvitation} disabled={sendInvitation.isPending}>
              <Mail className="mr-2 h-4 w-4" />
              {enrollment.status === "INITIATED" ? "Send Invitation" : "Resend Invitation"}
            </Button>
          )}
          {enrollment.status === "SUBMITTED" && (
            <Button onClick={() => setReviewDialogOpen(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Review Application
            </Button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {[
              { key: "initiated", label: "Initiated" },
              { key: "invitation", label: "Invitation Sent" },
              { key: "signup", label: "Signed Up" },
              { key: "profile", label: "Profile Filled" },
              { key: "submitted", label: "Submitted" },
              { key: "admin", label: "Admin Review" },
              { key: "final", label: "Final Approval" },
              { key: "completed", label: "Completed" },
            ].map((step, index) => {
              const statusOrder: EnrollmentStatusType[] = [
                "INITIATED",
                "INVITATION_SENT",
                "STUDENT_SIGNED_UP",
                "PROFILE_INCOMPLETE",
                "SUBMITTED",
                "ADMIN_APPROVED",
                "HOD_APPROVED",
                "COMPLETED",
              ];
              const currentIndex = statusOrder.indexOf(enrollment.status);
              const isCompleted = index <= currentIndex;
              const isCurrent = statusOrder[index] === enrollment.status;

              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isCurrent
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isCompleted || isCurrent
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="academic">Academic Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Initial enrollment details provided by admin</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{enrollment.firstName} {enrollment.lastName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {enrollment.email}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Mobile Number</Label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {enrollment.mobileNumber}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Department</Label>
                <p className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {enrollment.department.name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Academic Year</Label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {enrollment.academicYear}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Section</Label>
                <p className="font-medium">{enrollment.section || "Not assigned"}</p>
              </div>
              {enrollment.rollNumber && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Roll Number</Label>
                  <p className="font-medium text-lg text-green-600">{enrollment.rollNumber}</p>
                </div>
              )}
              {enrollment.officialEmail && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Official Email</Label>
                  <p className="font-medium text-green-600">{enrollment.officialEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Details Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Student-provided personal information</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(personalDetails).length === 0 ? (
                <p className="text-muted-foreground">No personal details submitted yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {personalDetails.dateOfBirth && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Date of Birth</Label>
                      <p className="font-medium">{personalDetails.dateOfBirth}</p>
                    </div>
                  )}
                  {personalDetails.gender && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Gender</Label>
                      <p className="font-medium capitalize">{personalDetails.gender}</p>
                    </div>
                  )}
                  {personalDetails.bloodGroup && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Blood Group</Label>
                      <p className="font-medium">{personalDetails.bloodGroup}</p>
                    </div>
                  )}
                  {personalDetails.nationality && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Nationality</Label>
                      <p className="font-medium">{personalDetails.nationality}</p>
                    </div>
                  )}
                  {personalDetails.fatherName && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Father&apos;s Name</Label>
                      <p className="font-medium">{personalDetails.fatherName}</p>
                    </div>
                  )}
                  {personalDetails.motherName && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Mother&apos;s Name</Label>
                      <p className="font-medium">{personalDetails.motherName}</p>
                    </div>
                  )}
                  {personalDetails.address && (
                    <div className="space-y-1 col-span-2">
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">
                        {personalDetails.address.street}, {personalDetails.address.city},
                        {personalDetails.address.state} - {personalDetails.address.pincode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Details Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
              <CardDescription>Previous education information</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(academicDetails).length === 0 ? (
                <p className="text-muted-foreground">No academic details submitted yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {academicDetails.previousInstitution && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Previous Institution</Label>
                      <p className="font-medium">{academicDetails.previousInstitution}</p>
                    </div>
                  )}
                  {academicDetails.previousBoard && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Board</Label>
                      <p className="font-medium">{academicDetails.previousBoard}</p>
                    </div>
                  )}
                  {academicDetails.passingYear && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Passing Year</Label>
                      <p className="font-medium">{academicDetails.passingYear}</p>
                    </div>
                  )}
                  {academicDetails.percentage && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Percentage/CGPA</Label>
                      <p className="font-medium text-lg text-green-600">
                        {academicDetails.percentage}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>Verify all required documents</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(documents).length === 0 ? (
                <p className="text-muted-foreground">No documents uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(documents).map(([key, doc]: [string, any]) => (
                    <div key={key} className="p-4 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          {doc.uploadedAt && (
                            <p className="text-sm text-muted-foreground">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {doc.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment History</CardTitle>
              <CardDescription>Timeline of all actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium">Enrollment Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(enrollment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {enrollment.submittedAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-orange-500" />
                    <div>
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enrollment.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {enrollment.adminReviewedAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-cyan-500" />
                    <div>
                      <p className="font-medium">Admin Reviewed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enrollment.adminReviewedAt).toLocaleString()}
                      </p>
                      {enrollment.adminNotes && (
                        <p className="text-sm mt-1 p-2 bg-muted rounded">
                          {enrollment.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {enrollment.hodApprovedAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-teal-500" />
                    <div>
                      <p className="font-medium">HOD Approved</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enrollment.hodApprovedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {enrollment.principalApprovedAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500" />
                    <div>
                      <p className="font-medium">Principal Approved</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enrollment.principalApprovedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {enrollment.completedAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Enrollment Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enrollment.completedAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Roll Number: {enrollment.rollNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Enrollment Application</DialogTitle>
            <DialogDescription>
              {enrollment.firstName} {enrollment.lastName} - {enrollment.department.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={reviewAction}
                onValueChange={(value: "approve" | "request_changes" | "reject") => setReviewAction(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Approve for Final Review
                    </div>
                  </SelectItem>
                  <SelectItem value="request_changes">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Request Changes
                    </div>
                  </SelectItem>
                  <SelectItem value="reject">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Reject Application
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reviewAction === "approve" && (
              <div className="space-y-2">
                <Label>Section Assignment (Optional)</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Notes {reviewAction !== "approve" && "(Required)"}
              </Label>
              <Textarea
                placeholder={
                  reviewAction === "approve"
                    ? "Add any notes for HOD/Principal..."
                    : reviewAction === "request_changes"
                    ? "Specify what changes are needed..."
                    : "Provide reason for rejection..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={adminReview.isPending || (reviewAction !== "approve" && !notes)}
              className={
                reviewAction === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : reviewAction === "reject"
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }
            >
              {adminReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
