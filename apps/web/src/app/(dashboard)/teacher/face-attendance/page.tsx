"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  RefreshCw,
  Save,
  Eye,
  UserCheck,
  UserX,
  HelpCircle,
  ChevronRight,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import { useDepartments } from "@/hooks/use-api";
import {
  useFaceSessions,
  useFaceSession,
  useCreateFaceSession,
  useProcessFaceSession,
  useConfirmFaceSession,
  useCancelFaceSession,
  useSectionStudents,
  useUpdateDetectedFace,
  type SessionResult,
  type DetectedFaceResult,
  type FaceSessionStatus,
} from "@/hooks/use-face-recognition";

// Session status badge colors
const statusColors: Record<FaceSessionStatus, string> = {
  pending: "bg-gray-500",
  processing: "bg-blue-500",
  review: "bg-orange-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<FaceSessionStatus, string> = {
  pending: "Pending",
  processing: "Processing...",
  review: "Ready for Review",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export default function TeacherFaceAttendance() {
  const tenantId = useTenantId() || "";
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [classPhotoUrl, setClassPhotoUrl] = useState<string>("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: departments, isLoading: deptLoading } = useDepartments(tenantId);
  const { data: sessionsData, isLoading: sessionsLoading } = useFaceSessions(tenantId, {
    departmentId: selectedDepartment || undefined,
    limit: 10,
  });
  const { data: activeSession, isLoading: sessionLoading } = useFaceSession(
    tenantId,
    activeSessionId || ""
  );
  const { data: sectionStudents } = useSectionStudents(tenantId, {
    departmentId: selectedDepartment || undefined,
    section: selectedSection || undefined,
  });

  // Mutations
  const createSession = useCreateFaceSession(tenantId);
  const processSession = useProcessFaceSession(tenantId);
  const confirmSession = useConfirmFaceSession(tenantId);
  const cancelSession = useCancelFaceSession(tenantId);
  const updateFace = useUpdateDetectedFace(tenantId);

  const sessions = sessionsData?.data || [];

  // Handle file upload (mock - would integrate with S3/cloud storage)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In production, upload to S3 and get URL
      // For now, create a local object URL for preview
      const url = URL.createObjectURL(file);
      setClassPhotoUrl(url);
    }
  };

  // Create and process a new session
  const handleStartSession = async () => {
    if (!selectedDepartment || !classPhotoUrl) return;

    try {
      const result = await createSession.mutateAsync({
        departmentId: selectedDepartment,
        section: selectedSection || undefined,
        classPhotoUrl,
        date: selectedDate,
      });

      setActiveSessionId(result.id);

      // Automatically start processing
      await processSession.mutateAsync({ sessionId: result.id });
      setShowReviewDialog(true);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  // Handle face override
  const handleFaceOverride = async (faceId: string, studentId: string | undefined) => {
    try {
      await updateFace.mutateAsync({
        faceId,
        data: { overrideStudentId: studentId, status: studentId ? "manual_override" : "unmatched" },
      });
    } catch (error) {
      console.error("Failed to update face:", error);
    }
  };

  // Confirm session
  const handleConfirmSession = async () => {
    if (!activeSessionId) return;

    try {
      await confirmSession.mutateAsync({ sessionId: activeSessionId });
      setShowReviewDialog(false);
      setActiveSessionId(null);
      setClassPhotoUrl("");
    } catch (error) {
      console.error("Failed to confirm session:", error);
    }
  };

  // Cancel session
  const handleCancelSession = async () => {
    if (!activeSessionId) return;

    try {
      await cancelSession.mutateAsync(activeSessionId);
      setShowReviewDialog(false);
      setActiveSessionId(null);
      setClassPhotoUrl("");
    } catch (error) {
      console.error("Failed to cancel session:", error);
    }
  };

  const isProcessing = createSession.isPending || processSession.isPending;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Face Recognition Attendance</h1>
          <p className="text-muted-foreground">
            Upload a class photo to automatically mark attendance
          </p>
        </div>
      </div>

      {/* How it Works */}
      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>How Face Recognition Attendance Works</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Select your class (department/section) and date</li>
            <li>Upload or capture a class photo</li>
            <li>The system detects faces and matches them with enrolled students</li>
            <li>Review and correct any mismatches before confirming</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Class Selection & Photo Upload */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <CardDescription>Choose the department, section, and date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {deptLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    departments?.data?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Section (Optional)</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {sectionStudents && sectionStudents.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <Users className="inline h-4 w-4 mr-1" />
                  {sectionStudents.length} students in this section
                </p>
                <p className="text-sm text-muted-foreground">
                  <UserCheck className="inline h-4 w-4 mr-1" />
                  {sectionStudents.filter((s) => s.faceEnrollment?.status === "active").length} enrolled for face recognition
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Class Photo</CardTitle>
            <CardDescription>Upload or capture a photo of the class</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {classPhotoUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={classPhotoUrl}
                    alt="Class photo"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setClassPhotoUrl("")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={handleStartSession}
                  disabled={!selectedDepartment || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Start Face Recognition
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Click to upload photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-1" />
                    Camera
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your face recognition attendance sessions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attendance sessions yet</p>
              <p className="text-sm">Upload a class photo to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Unmatched</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {new Date(session.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[session.status]}>
                        {statusLabels[session.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{session.totalFacesDetected}</TableCell>
                    <TableCell className="text-green-600">{session.matchedFaces}</TableCell>
                    <TableCell className="text-orange-600">{session.unmatchedFaces}</TableCell>
                    <TableCell className="text-right">
                      {session.status === "review" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveSessionId(session.id);
                            setShowReviewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                      {session.status === "confirmed" && (
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Detected Faces</DialogTitle>
            <DialogDescription>
              Review the detected faces and make corrections before confirming attendance
            </DialogDescription>
          </DialogHeader>

          {sessionLoading || !activeSession ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading session data...</p>
            </div>
          ) : (
            <>
              {/* Session Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted text-center">
                  <p className="text-2xl font-bold">{activeSession.totalFacesDetected}</p>
                  <p className="text-sm text-muted-foreground">Faces Detected</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <p className="text-2xl font-bold text-green-600">{activeSession.matchedFaces}</p>
                  <p className="text-sm text-muted-foreground">Matched</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 text-center">
                  <p className="text-2xl font-bold text-orange-600">{activeSession.unmatchedFaces}</p>
                  <p className="text-sm text-muted-foreground">Unmatched</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {activeSession.totalFacesDetected > 0
                      ? Math.round((activeSession.matchedFaces / activeSession.totalFacesDetected) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Match Rate</p>
                </div>
              </div>

              {/* Class Photo with Overlays */}
              <div className="relative mb-6 rounded-lg overflow-hidden border">
                <img
                  src={activeSession.classPhotoUrl}
                  alt="Class photo"
                  className="w-full"
                />
                {/* Face bounding boxes would be overlaid here */}
              </div>

              {/* Detected Faces List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <h4 className="font-medium">Detected Faces</h4>
                {activeSession.detectedFaces.map((face, index) => (
                  <div
                    key={face.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      face.status === "matched"
                        ? "border-green-200 bg-green-50"
                        : face.status === "manual_override"
                        ? "border-blue-200 bg-blue-50"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      {face.matchedStudent ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {face.matchedStudent.photoUrl && (
                              <AvatarImage src={face.matchedStudent.photoUrl} />
                            )}
                            <AvatarFallback>
                              {face.matchedStudent.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{face.matchedStudent.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {face.matchedStudent.rollNo}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-orange-600">Unidentified</p>
                            <p className="text-sm text-muted-foreground">
                              Select a student to assign
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {face.matchConfidence && (
                        <Badge variant="outline">
                          {Math.round(face.matchConfidence)}% match
                        </Badge>
                      )}
                      <Select
                        value={face.matchedStudent?.id || ""}
                        onValueChange={(value) => handleFaceOverride(face.id, value || undefined)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Assign student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {sectionStudents?.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.user.name} ({student.rollNo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelSession}
              disabled={cancelSession.isPending}
            >
              Cancel Session
            </Button>
            <Button
              onClick={handleConfirmSession}
              disabled={confirmSession.isPending || !activeSession}
            >
              {confirmSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Attendance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
