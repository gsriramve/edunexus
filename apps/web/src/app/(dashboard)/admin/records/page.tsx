"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  Eye,
  Edit,
  Printer,
  GraduationCap,
  UserCheck,
  FileCheck,
  IdCard,
  Phone,
  Mail,
  MoreHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useRecordsStats,
  useStudentRecords,
  useStudentDetails,
  useCertificateTypes,
  useCertificateRequests,
  useCreateCertificateRequest,
  useUpdateCertificateStatus,
  type StudentRecord,
} from "@/hooks/use-admin-records";

// Sample data for fallback when database is empty
const sampleStats = {
  totalStudents: 0,
  activeStudents: 0,
  graduatedStudents: 0,
  droppedOut: 0,
  pendingCertificates: 0,
  pendingTCs: 0,
  profilesIncomplete: 0,
};

export default function StudentRecordsPage() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedCertType, setSelectedCertType] = useState("");
  const [certificatePurpose, setCertificatePurpose] = useState("");
  const [certStatusFilter, setCertStatusFilter] = useState("all");

  // Data hooks
  const { data: statsData, isLoading: statsLoading } = useRecordsStats();
  const { data: studentsData, isLoading: studentsLoading } = useStudentRecords({
    search: searchQuery || undefined,
    branch: branchFilter !== "all" ? branchFilter : undefined,
    semester: semesterFilter !== "all" ? parseInt(semesterFilter, 10) : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: studentDetails, isLoading: detailsLoading } = useStudentDetails(selectedStudentId);
  const { data: certificateTypes = [], isLoading: typesLoading } = useCertificateTypes();
  const { data: certificateRequestsData, isLoading: requestsLoading } = useCertificateRequests({
    status: certStatusFilter !== "all" ? certStatusFilter : undefined,
  });

  // Mutations
  const createRequest = useCreateCertificateRequest();
  const updateStatus = useUpdateCertificateStatus();

  // Use fetched data or fallback
  const recordStats = statsData || sampleStats;
  const students = studentsData?.data || [];
  const certificateRequests = certificateRequestsData?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "graduated":
        return <Badge className="bg-blue-500">Graduated</Badge>;
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>;
      case "suspended":
        return <Badge className="bg-orange-500">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCertStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "ready":
        return <Badge className="bg-green-500">Ready</Badge>;
      case "issued":
        return <Badge className="bg-gray-500">Issued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    setSelectedStudentId(student.id);
    setViewDialogOpen(true);
  };

  const handleIssueCertificate = (student: StudentRecord) => {
    setSelectedStudent(student);
    setSelectedCertType("");
    setCertificatePurpose("");
    setCertificateDialogOpen(true);
  };

  const handleCreateCertificateRequest = async () => {
    if (!selectedStudent || !selectedCertType || !certificatePurpose) return;

    try {
      await createRequest.mutateAsync({
        studentId: selectedStudent.id,
        certificateTypeId: selectedCertType,
        purpose: certificatePurpose,
      });
      toast({
        title: "Request Created",
        description: "Certificate request has been created successfully.",
      });
      setCertificateDialogOpen(false);
      setSelectedCertType("");
      setCertificatePurpose("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create certificate request.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCertificateStatus = async (requestId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ requestId, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Certificate request status updated to ${newStatus}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update certificate status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Records</h1>
          <p className="text-muted-foreground">Manage student profiles, documents, and certificates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        {statsLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{recordStats.totalStudents.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-green-600">{recordStats.activeStudents.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Graduated</p>
                    <p className="text-2xl font-bold text-purple-600">{recordStats.graduatedStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-red-50">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dropped</p>
                    <p className="text-2xl font-bold text-red-600">{recordStats.droppedOut}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Certificates</p>
                    <p className="text-2xl font-bold text-orange-600">{recordStats.pendingCertificates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <FileCheck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TC Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{recordStats.pendingTCs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <AlertTriangle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Incomplete</p>
                    <p className="text-2xl font-bold text-gray-600">{recordStats.profilesIncomplete}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Student Database</TabsTrigger>
          <TabsTrigger value="certificates">Certificate Requests</TabsTrigger>
          <TabsTrigger value="documents">Document Templates</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Student Database</CardTitle>
                  <CardDescription>Search and manage student records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, roll no, or email..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="EE">EE</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Students Table */}
              {studentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No students found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || branchFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No student records available"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={student.photo} />
                              <AvatarFallback>{student.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{student.rollNo}</TableCell>
                        <TableCell>{student.branch}</TableCell>
                        <TableCell>Sem {student.semester}</TableCell>
                        <TableCell>
                          <span className={student.cgpa >= 8 ? "text-green-600 font-medium" : ""}>
                            {student.cgpa}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={student.attendance < 75 ? "text-red-600 font-medium" : ""}>
                            {student.attendance}%
                          </span>
                        </TableCell>
                        <TableCell>{getFeeStatusBadge(student.feeStatus)}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleIssueCertificate(student)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Issue Certificate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <IdCard className="mr-2 h-4 w-4" />
                                Print ID Card
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Certificate Requests</CardTitle>
                  <CardDescription>Process student certificate requests</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={certStatusFilter} onValueChange={setCertStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-4 w-20" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : certificateRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No certificate requests</h3>
                  <p className="text-muted-foreground">
                    {certStatusFilter !== "all"
                      ? "No requests with this status"
                      : "No certificate requests have been made yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Certificate Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateRequests.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-sm">
                          {cert.certificateNumber || cert.id.slice(0, 12)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-muted-foreground">{cert.rollNo}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cert.type}</TableCell>
                        <TableCell>{cert.purpose}</TableCell>
                        <TableCell>{cert.requestDate}</TableCell>
                        <TableCell>{getCertStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {cert.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => handleUpdateCertificateStatus(cert.id, "processing")}
                                disabled={updateStatus.isPending}
                              >
                                {updateStatus.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Process"
                                )}
                              </Button>
                            )}
                            {cert.status === "processing" && (
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleUpdateCertificateStatus(cert.id, "ready")}
                                disabled={updateStatus.isPending}
                              >
                                {updateStatus.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Mark Ready"
                                )}
                              </Button>
                            )}
                            {cert.status === "ready" && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Printer className="mr-1 h-4 w-4" />
                                  Print
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateCertificateStatus(cert.id, "issued")}
                                  disabled={updateStatus.isPending}
                                >
                                  {updateStatus.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Issue"
                                  )}
                                </Button>
                              </>
                            )}
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

        {/* Document Templates Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Templates</CardTitle>
              <CardDescription>Manage certificate types and templates</CardDescription>
            </CardHeader>
            <CardContent>
              {typesLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 flex-1" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : certificateTypes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No certificate types</h3>
                  <p className="text-muted-foreground">
                    No certificate types have been configured yet
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {certificateTypes.map((cert) => (
                    <Card key={cert.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-lg bg-muted">
                            <FileText className="h-6 w-6" />
                          </div>
                          <Badge variant="outline">Fee: Rs.{cert.fee}</Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{cert.name}</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="mr-1 h-4 w-4" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>
              {selectedStudent && `${selectedStudent.rollNo} - ${selectedStudent.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedStudent.photo} />
                  <AvatarFallback className="text-2xl">
                    {selectedStudent.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                    {getStatusBadge(selectedStudent.status)}
                  </div>
                  <p className="text-muted-foreground">{selectedStudent.rollNo} • {selectedStudent.branch} • Batch {selectedStudent.batch}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedStudent.email}
                    </span>
                    {selectedStudent.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedStudent.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="text-xl font-semibold">{selectedStudent.semester}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="text-xl font-semibold">{selectedStudent.section}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="text-xl font-semibold text-green-600">{selectedStudent.cgpa}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className={`text-xl font-semibold ${selectedStudent.attendance < 75 ? "text-red-600" : "text-green-600"}`}>
                    {selectedStudent.attendance}%
                  </p>
                </div>
              </div>

              {/* Department Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{selectedStudent.branchName}</p>
                  <p className="text-sm text-muted-foreground">Code: {selectedStudent.branch}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Batch</Label>
                  <p className="font-medium">{selectedStudent.batch}</p>
                </div>
              </div>

              {/* Fee Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Fee Status</p>
                  {getFeeStatusBadge(selectedStudent.feeStatus)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Completion</p>
                  <p className="font-semibold">{selectedStudent.profileComplete}%</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button onClick={() => { setViewDialogOpen(false); selectedStudent && handleIssueCertificate(selectedStudent); }}>
              <FileText className="mr-2 h-4 w-4" />
              Issue Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Certificate Dialog */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>
              {selectedStudent && `For ${selectedStudent.name} (${selectedStudent.rollNo})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Certificate Type</Label>
              <Select value={selectedCertType} onValueChange={setSelectedCertType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name} (Rs. {cert.fee})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input
                placeholder="e.g., Bank Loan, Visa Application, Higher Studies"
                value={certificatePurpose}
                onChange={(e) => setCertificatePurpose(e.target.value)}
              />
            </div>
            {selectedCertType && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Certificate Fee:</span>
                  <span className="font-semibold">
                    Rs. {certificateTypes.find((c) => c.id === selectedCertType)?.fee || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertificateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedCertType || !certificatePurpose || createRequest.isPending}
              onClick={handleCreateCertificateRequest}
            >
              {createRequest.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
