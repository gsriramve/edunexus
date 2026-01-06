"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Printer,
  GraduationCap,
  UserCheck,
  FileCheck,
  Award,
  IdCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreHorizontal,
  Plus,
  X,
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

// Mock data
const recordStats = {
  totalStudents: 4850,
  activeStudents: 4720,
  graduatedStudents: 98,
  droppedOut: 32,
  pendingCertificates: 45,
  pendingTCs: 12,
  profilesIncomplete: 156,
};

const students = [
  {
    id: "STU-001",
    rollNo: "21CS101",
    name: "Rahul Sharma",
    email: "rahul.s@college.edu",
    phone: "9876543210",
    branch: "CSE",
    semester: 6,
    section: "A",
    batch: "2021-25",
    status: "active",
    cgpa: 8.5,
    attendance: 87,
    feeStatus: "paid",
    profileComplete: 100,
    photo: "/avatars/student1.jpg",
    address: "123 Main Street, Hyderabad",
    parentName: "Mr. Suresh Sharma",
    parentPhone: "9876543200",
  },
  {
    id: "STU-002",
    rollNo: "21EC045",
    name: "Priya Patel",
    email: "priya.p@college.edu",
    phone: "9876543211",
    branch: "ECE",
    semester: 6,
    section: "B",
    batch: "2021-25",
    status: "active",
    cgpa: 9.1,
    attendance: 92,
    feeStatus: "paid",
    profileComplete: 95,
    photo: "",
    address: "456 Park Avenue, Secunderabad",
    parentName: "Mrs. Meena Patel",
    parentPhone: "9876543201",
  },
  {
    id: "STU-003",
    rollNo: "22ME032",
    name: "Amit Kumar",
    email: "amit.k@college.edu",
    phone: "9876543212",
    branch: "ME",
    semester: 4,
    section: "A",
    batch: "2022-26",
    status: "active",
    cgpa: 7.8,
    attendance: 78,
    feeStatus: "pending",
    profileComplete: 85,
    photo: "",
    address: "789 Gandhi Nagar, Hyderabad",
    parentName: "Mr. Ramesh Kumar",
    parentPhone: "9876543202",
  },
  {
    id: "STU-004",
    rollNo: "21CE078",
    name: "Sneha Reddy",
    email: "sneha.r@college.edu",
    phone: "9876543213",
    branch: "CE",
    semester: 6,
    section: "A",
    batch: "2021-25",
    status: "active",
    cgpa: 8.9,
    attendance: 95,
    feeStatus: "paid",
    profileComplete: 100,
    photo: "/avatars/student4.jpg",
    address: "321 Lake View, Hyderabad",
    parentName: "Dr. Suresh Reddy",
    parentPhone: "9876543203",
  },
  {
    id: "STU-005",
    rollNo: "20CS089",
    name: "Vikram Singh",
    email: "vikram.s@college.edu",
    phone: "9876543214",
    branch: "CSE",
    semester: 8,
    section: "B",
    batch: "2020-24",
    status: "graduated",
    cgpa: 8.2,
    attendance: 85,
    feeStatus: "paid",
    profileComplete: 100,
    photo: "",
    address: "567 Tech Park, Hyderabad",
    parentName: "Mr. Anil Singh",
    parentPhone: "9876543204",
  },
  {
    id: "STU-006",
    rollNo: "21IT056",
    name: "Neha Gupta",
    email: "neha.g@college.edu",
    phone: "9876543215",
    branch: "IT",
    semester: 6,
    section: "A",
    batch: "2021-25",
    status: "active",
    cgpa: 7.5,
    attendance: 72,
    feeStatus: "overdue",
    profileComplete: 75,
    photo: "",
    address: "890 Hill Road, Secunderabad",
    parentName: "Mrs. Kavita Gupta",
    parentPhone: "9876543205",
  },
  {
    id: "STU-007",
    rollNo: "22EE012",
    name: "Kiran Rao",
    email: "kiran.r@college.edu",
    phone: "9876543216",
    branch: "EE",
    semester: 4,
    section: "A",
    batch: "2022-26",
    status: "dropped",
    cgpa: 6.2,
    attendance: 45,
    feeStatus: "pending",
    profileComplete: 60,
    photo: "",
    address: "234 Station Road, Hyderabad",
    parentName: "Mr. Venkat Rao",
    parentPhone: "9876543206",
  },
  {
    id: "STU-008",
    rollNo: "23CS034",
    name: "Ravi Prasad",
    email: "ravi.p@college.edu",
    phone: "9876543217",
    branch: "CSE",
    semester: 2,
    section: "B",
    batch: "2023-27",
    status: "active",
    cgpa: 8.7,
    attendance: 90,
    feeStatus: "paid",
    profileComplete: 90,
    photo: "",
    address: "456 University Road, Hyderabad",
    parentName: "Mr. Srinivas Prasad",
    parentPhone: "9876543207",
  },
];

const certificateRequests = [
  { id: "CERT-001", studentId: "STU-001", rollNo: "21CS101", name: "Rahul Sharma", type: "Bonafide", purpose: "Bank Loan", requestDate: "Jan 5, 2026", status: "processing" },
  { id: "CERT-002", studentId: "STU-004", rollNo: "21CE078", name: "Sneha Reddy", type: "Study Certificate", purpose: "Visa Application", requestDate: "Jan 4, 2026", status: "ready" },
  { id: "CERT-003", studentId: "STU-002", rollNo: "21EC045", name: "Priya Patel", type: "Character Certificate", purpose: "Higher Studies", requestDate: "Jan 4, 2026", status: "pending" },
  { id: "CERT-004", studentId: "STU-005", rollNo: "20CS089", name: "Vikram Singh", type: "TC", purpose: "Course Completion", requestDate: "Jan 3, 2026", status: "processing" },
  { id: "CERT-005", studentId: "STU-003", rollNo: "22ME032", name: "Amit Kumar", type: "Bonafide", purpose: "Scholarship", requestDate: "Jan 3, 2026", status: "pending" },
];

const certificateTypes = [
  { id: "bonafide", name: "Bonafide Certificate", fee: 100 },
  { id: "study", name: "Study Certificate", fee: 100 },
  { id: "character", name: "Character Certificate", fee: 100 },
  { id: "tc", name: "Transfer Certificate", fee: 500 },
  { id: "migration", name: "Migration Certificate", fee: 300 },
  { id: "conduct", name: "Conduct Certificate", fee: 100 },
  { id: "medium", name: "Medium of Instruction", fee: 150 },
  { id: "provisional", name: "Provisional Certificate", fee: 200 },
];

export default function StudentRecordsPage() {
  const [selectedTab, setSelectedTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedCertType, setSelectedCertType] = useState("");
  const [certificatePurpose, setCertificatePurpose] = useState("");

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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === "all" || student.branch === branchFilter;
    const matchesSemester = semesterFilter === "all" || student.semester.toString() === semesterFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesBranch && matchesSemester && matchesStatus;
  });

  const handleViewStudent = (student: typeof students[0]) => {
    setSelectedStudent(student);
    setViewDialogOpen(true);
  };

  const handleIssueCertificate = (student: typeof students[0]) => {
    setSelectedStudent(student);
    setSelectedCertType("");
    setCertificatePurpose("");
    setCertificateDialogOpen(true);
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
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
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
                  {filteredStudents.map((student) => (
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                      <TableCell className="font-mono text-sm">{cert.id}</TableCell>
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
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                              Process
                            </Button>
                          )}
                          {cert.status === "processing" && (
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              Mark Ready
                            </Button>
                          )}
                          {cert.status === "ready" && (
                            <>
                              <Button size="sm" variant="outline">
                                <Printer className="mr-1 h-4 w-4" />
                                Print
                              </Button>
                              <Button size="sm">
                                Issue
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedStudent.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedStudent.phone}
                    </span>
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

              {/* Contact & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    {selectedStudent.address}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Parent/Guardian</Label>
                  <p className="font-medium">{selectedStudent.parentName}</p>
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedStudent.parentPhone}
                  </p>
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
            <Button disabled={!selectedCertType || !certificatePurpose}>
              <FileText className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
