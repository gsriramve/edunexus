"use client";

import { useState, useRef } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Camera,
  Upload,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Download,
  Loader2,
  ImageIcon,
  Eye,
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useTenantId } from "@/hooks/use-tenant";
import { useDepartments } from "@/hooks/use-api";
import {
  useFaceEnrollments,
  useFaceEnrollmentStats,
  useUnenrolledStudents,
  useEnrollFace,
  useBulkEnrollFaces,
  useReEnrollFace,
  useUnenrollFace,
  type FaceEnrollment,
  type FaceEnrollmentStatus,
} from "@/hooks/use-face-recognition";

// Status badge colors
const statusColors: Record<FaceEnrollmentStatus, string> = {
  pending: "bg-gray-500",
  active: "bg-green-500",
  failed: "bg-red-500",
};

const statusLabels: Record<FaceEnrollmentStatus, string> = {
  pending: "Pending",
  active: "Enrolled",
  failed: "Failed",
};

export default function HodFaceEnrollment() {
  const tenantId = useTenantId() || "";
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FaceEnrollmentStatus | "all">("all");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [enrollImageUrl, setEnrollImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("enrolled");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: departments, isLoading: deptLoading } = useDepartments(tenantId);
  const { data: enrollmentStats, isLoading: statsLoading } = useFaceEnrollmentStats(tenantId);
  const { data: enrollmentsData, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useFaceEnrollments(
    tenantId,
    {
      departmentId: selectedDepartment || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery || undefined,
      limit: 50,
    }
  );
  const { data: unenrolledStudents, isLoading: unenrolledLoading, refetch: refetchUnenrolled } = useUnenrolledStudents(
    tenantId,
    {
      departmentId: selectedDepartment || undefined,
      limit: 100,
    }
  );

  // Mutations
  const enrollFace = useEnrollFace(tenantId);
  const bulkEnroll = useBulkEnrollFaces(tenantId);
  const reEnrollFace = useReEnrollFace(tenantId);
  const unenrollFace = useUnenrollFace(tenantId);

  const enrollments = enrollmentsData?.data || [];
  const stats = enrollmentStats || { total: 0, active: 0, pending: 0, failed: 0, byDepartment: [] };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEnrollImageUrl(url);
    }
  };

  // Open enroll dialog
  const openEnrollDialog = (student: any) => {
    setSelectedStudent(student);
    setEnrollImageUrl("");
    setShowEnrollDialog(true);
  };

  // Handle enrollment
  const handleEnroll = async () => {
    if (!selectedStudent || !enrollImageUrl) return;

    try {
      await enrollFace.mutateAsync({
        studentId: selectedStudent.id,
        imageUrl: enrollImageUrl,
      });
      setShowEnrollDialog(false);
      setSelectedStudent(null);
      setEnrollImageUrl("");
      refetchEnrollments();
      refetchUnenrolled();
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  // Handle re-enrollment
  const handleReEnroll = async (studentId: string) => {
    // Would open a dialog to capture new photo
    console.log("Re-enroll:", studentId);
  };

  // Handle unenrollment
  const handleUnenroll = async (studentId: string) => {
    if (!confirm("Are you sure you want to unenroll this student from face recognition?")) return;

    try {
      await unenrollFace.mutateAsync(studentId);
      refetchEnrollments();
      refetchUnenrolled();
    } catch (error) {
      console.error("Unenrollment failed:", error);
    }
  };

  const isLoading = statsLoading || enrollmentsLoading || unenrolledLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Face Recognition Enrollment</h1>
          <p className="text-muted-foreground">
            Manage student face enrollments for attendance recognition
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => { refetchEnrollments(); refetchUnenrolled(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Enrolled</p>
                <p className="text-2xl font-bold text-orange-600">
                  {unenrolledStudents?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Progress */}
      {stats.byDepartment && stats.byDepartment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Enrollment Progress by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.byDepartment.map((dept) => (
                <div key={dept.departmentId} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{dept.departmentName}</p>
                    <Badge variant="outline">{Math.round(dept.percentage)}%</Badge>
                  </div>
                  <Progress value={dept.percentage} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {dept.enrolled} / {dept.total} students enrolled
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="enrolled">Enrolled Students</TabsTrigger>
            <TabsTrigger value="unenrolled">Not Enrolled</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments?.data?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enrolled Students Tab */}
        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enrolled Students</CardTitle>
                  <CardDescription>
                    Students with active face recognition enrollment
                  </CardDescription>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as any)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No enrolled students found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Enrolled At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {enrollment.student?.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {enrollment.student?.user.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {enrollment.student?.department.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {enrollment.student?.rollNo}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[enrollment.status]}>
                            {statusLabels[enrollment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {enrollment.enrollmentQuality ? (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={enrollment.enrollmentQuality}
                                className="h-2 w-16"
                              />
                              <span className="text-sm">
                                {Math.round(enrollment.enrollmentQuality)}%
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {enrollment.enrolledAt
                            ? new Date(enrollment.enrolledAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReEnroll(enrollment.studentId)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleUnenroll(enrollment.studentId)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Not Enrolled Tab */}
        <TabsContent value="unenrolled">
          <Card>
            <CardHeader>
              <CardTitle>Students Not Enrolled</CardTitle>
              <CardDescription>
                Students who haven't been enrolled in face recognition yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unenrolledLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !unenrolledStudents || unenrolledStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>All students are enrolled!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unenrolledStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {student.user.profile?.photoUrl && (
                                <AvatarImage src={student.user.profile.photoUrl} />
                              )}
                              <AvatarFallback>
                                {student.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{student.rollNo}</TableCell>
                        <TableCell>{student.section || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openEnrollDialog(student)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Enroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>
              Upload a clear photo of the student's face for enrollment
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {selectedStudent.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStudent.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.rollNo}
                  </p>
                </div>
              </div>

              {/* Photo Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {enrollImageUrl ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={enrollImageUrl}
                      alt="Student photo"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setEnrollImageUrl("")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Click to upload photo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clear frontal face photo recommended
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

              {/* Guidelines */}
              <div className="p-3 rounded-lg bg-blue-50 text-sm">
                <p className="font-medium text-blue-800 mb-1">Photo Guidelines</p>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Use a clear, well-lit frontal photo</li>
                  <li>Face should be clearly visible</li>
                  <li>No sunglasses or face coverings</li>
                  <li>Recent photo recommended</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={!enrollImageUrl || enrollFace.isPending}
            >
              {enrollFace.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Enroll Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
