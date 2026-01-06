"use client";

import { useState } from "react";
import {
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileCheck,
  Send,
  Phone,
  Mail,
  MoreHorizontal,
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
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Mock data
const admissionStats = {
  totalApplications: 256,
  newApplications: 45,
  underReview: 78,
  documentPending: 34,
  approved: 89,
  rejected: 10,
  seatsFilled: 128,
  totalSeats: 180,
};

const applications = [
  {
    id: "APP-2026-001",
    name: "Arjun Verma",
    email: "arjun.v@email.com",
    phone: "9876543210",
    branch: "CSE",
    category: "General",
    percentage: 85.4,
    submittedOn: "Jan 5, 2026",
    status: "document_review",
    documents: { aadhar: true, marksheet: true, photo: true, tc: false, caste: false },
    priority: "high",
    remarks: "",
  },
  {
    id: "APP-2026-002",
    name: "Neha Gupta",
    email: "neha.g@email.com",
    phone: "9876543211",
    branch: "ECE",
    category: "OBC",
    percentage: 82.1,
    submittedOn: "Jan 4, 2026",
    status: "pending",
    documents: { aadhar: true, marksheet: true, photo: true, tc: true, caste: true },
    priority: "medium",
    remarks: "",
  },
  {
    id: "APP-2026-003",
    name: "Kiran Rao",
    email: "kiran.r@email.com",
    phone: "9876543212",
    branch: "ME",
    category: "SC",
    percentage: 78.9,
    submittedOn: "Jan 4, 2026",
    status: "verification",
    documents: { aadhar: true, marksheet: false, photo: true, tc: true, caste: true },
    priority: "high",
    remarks: "Marksheet copy unclear",
  },
  {
    id: "APP-2026-004",
    name: "Ravi Prasad",
    email: "ravi.p@email.com",
    phone: "9876543213",
    branch: "CE",
    category: "General",
    percentage: 88.2,
    submittedOn: "Jan 3, 2026",
    status: "approved",
    documents: { aadhar: true, marksheet: true, photo: true, tc: true, caste: false },
    priority: "low",
    remarks: "All documents verified",
  },
  {
    id: "APP-2026-005",
    name: "Sneha Reddy",
    email: "sneha.r@email.com",
    phone: "9876543214",
    branch: "CSE",
    category: "OBC",
    percentage: 91.3,
    submittedOn: "Jan 3, 2026",
    status: "approved",
    documents: { aadhar: true, marksheet: true, photo: true, tc: true, caste: true },
    priority: "low",
    remarks: "Excellent academic record",
  },
  {
    id: "APP-2026-006",
    name: "Amit Kumar",
    email: "amit.k@email.com",
    phone: "9876543215",
    branch: "IT",
    category: "ST",
    percentage: 72.5,
    submittedOn: "Jan 2, 2026",
    status: "document_pending",
    documents: { aadhar: true, marksheet: true, photo: false, tc: false, caste: true },
    priority: "medium",
    remarks: "Photo and TC pending",
  },
  {
    id: "APP-2026-007",
    name: "Pooja Sharma",
    email: "pooja.s@email.com",
    phone: "9876543216",
    branch: "EE",
    category: "General",
    percentage: 79.8,
    submittedOn: "Jan 2, 2026",
    status: "rejected",
    documents: { aadhar: true, marksheet: true, photo: true, tc: true, caste: false },
    priority: "low",
    remarks: "Does not meet eligibility criteria",
  },
  {
    id: "APP-2026-008",
    name: "Mahesh Reddy",
    email: "mahesh.r@email.com",
    phone: "9876543217",
    branch: "CSE",
    category: "EWS",
    percentage: 86.7,
    submittedOn: "Jan 1, 2026",
    status: "pending",
    documents: { aadhar: true, marksheet: true, photo: true, tc: true, caste: false },
    priority: "medium",
    remarks: "",
  },
];

const branchSeats = [
  { branch: "CSE", total: 60, filled: 45, reserved: { SC: 9, ST: 5, OBC: 16, EWS: 6, General: 24 } },
  { branch: "ECE", total: 60, filled: 38, reserved: { SC: 9, ST: 5, OBC: 16, EWS: 6, General: 24 } },
  { branch: "ME", total: 60, filled: 32, reserved: { SC: 9, ST: 5, OBC: 16, EWS: 6, General: 24 } },
  { branch: "CE", total: 60, filled: 28, reserved: { SC: 9, ST: 5, OBC: 16, EWS: 6, General: 24 } },
  { branch: "IT", total: 60, filled: 42, reserved: { SC: 9, ST: 5, OBC: 16, EWS: 6, General: 24 } },
  { branch: "EE", total: 60, filled: 25, reserved: { SC: 9, ST: 5, OBC: 16, EWS: 6, General: 24 } },
];

const documentTypes = [
  { key: "aadhar", name: "Aadhar Card" },
  { key: "marksheet", name: "10+2 Marksheet" },
  { key: "photo", name: "Passport Photo" },
  { key: "tc", name: "Transfer Certificate" },
  { key: "caste", name: "Caste Certificate" },
];

export default function AdmissionsPage() {
  const [selectedTab, setSelectedTab] = useState("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<typeof applications[0] | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_docs">("approve");
  const [remarks, setRemarks] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "document_review":
        return <Badge className="bg-blue-500">Document Review</Badge>;
      case "verification":
        return <Badge className="bg-orange-500">Verification</Badge>;
      case "document_pending":
        return <Badge className="bg-yellow-500">Docs Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-500 text-xs">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesBranch = branchFilter === "all" || app.branch === branchFilter;
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesBranch && matchesCategory;
  });

  const handleViewApplication = (app: typeof applications[0]) => {
    setSelectedApplication(app);
    setViewDialogOpen(true);
  };

  const handleAction = (app: typeof applications[0], action: "approve" | "reject" | "request_docs") => {
    setSelectedApplication(app);
    setActionType(action);
    setRemarks("");
    setActionDialogOpen(true);
  };

  const getDocumentStatus = (docs: typeof applications[0]["documents"]) => {
    const total = Object.keys(docs).length;
    const verified = Object.values(docs).filter(Boolean).length;
    return { total, verified, percentage: (verified / total) * 100 };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground">Manage student applications and admissions for 2026-27</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{admissionStats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Today</p>
                <p className="text-2xl font-bold text-purple-600">+{admissionStats.newApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-orange-600">{admissionStats.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Docs Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{admissionStats.documentPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{admissionStats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{admissionStats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seat Availability Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seat Availability - 2026-27</CardTitle>
              <CardDescription>
                Branch-wise seat status: {admissionStats.seatsFilled} / {admissionStats.totalSeats} seats filled
              </CardDescription>
            </div>
            <Badge className="bg-blue-500 text-lg px-4 py-1">
              {((admissionStats.seatsFilled / admissionStats.totalSeats) * 100).toFixed(0)}% Filled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {branchSeats.map((branch) => {
              const percentage = (branch.filled / branch.total) * 100;
              return (
                <div key={branch.branch} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{branch.branch}</span>
                    <Badge variant="outline">{branch.filled}/{branch.total}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {branch.total - branch.filled} seats remaining
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        {/* All Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Applications</CardTitle>
                  <CardDescription>Review and process admission applications</CardDescription>
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
                      placeholder="Search by name, ID, or email..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="document_review">Document Review</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="document_pending">Docs Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="EWS">EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Applications Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => {
                    const docStatus = getDocumentStatus(app.documents);
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{app.id}</span>
                            {getPriorityBadge(app.priority)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-sm text-muted-foreground">{app.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{app.branch}</TableCell>
                        <TableCell>{app.category}</TableCell>
                        <TableCell>
                          <span className={app.percentage >= 80 ? "text-green-600 font-medium" : ""}>
                            {app.percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={docStatus.percentage} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {docStatus.verified}/{docStatus.total}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewApplication(app)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {app.status !== "approved" && app.status !== "rejected" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleAction(app, "approve")}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction(app, "reject")}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction(app, "request_docs")}>
                                    <FileText className="mr-2 h-4 w-4 text-orange-600" />
                                    Request Documents
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Call Applicant
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Applications awaiting review and verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications
                  .filter((app) => ["pending", "document_review", "verification", "document_pending"].includes(app.status))
                  .map((app) => {
                    const docStatus = getDocumentStatus(app.documents);
                    return (
                      <div key={app.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-muted">
                              <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{app.name}</h4>
                                {getPriorityBadge(app.priority)}
                                {getStatusBadge(app.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {app.id} • {app.branch} • {app.category} • {app.percentage}%
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  {app.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  {app.phone}
                                </span>
                              </div>
                              {app.remarks && (
                                <p className="text-sm text-orange-600 mt-2">
                                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                                  {app.remarks}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">Documents:</span>
                              <Progress value={docStatus.percentage} className="w-20 h-2" />
                              <span className="text-sm font-medium">{docStatus.verified}/{docStatus.total}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewApplication(app)}>
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleAction(app, "approve")}>
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approved Applications</CardTitle>
                  <CardDescription>Students ready for enrollment</CardDescription>
                </div>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Admission Letters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Approved On</TableHead>
                    <TableHead>Enrollment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications
                    .filter((app) => app.status === "approved")
                    .map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm">{app.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-sm text-muted-foreground">{app.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{app.branch}</TableCell>
                        <TableCell>{app.category}</TableCell>
                        <TableCell>{app.percentage}%</TableCell>
                        <TableCell>{app.submittedOn}</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-500">Fee Pending</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <FileText className="mr-1 h-4 w-4" />
                              Offer Letter
                            </Button>
                            <Button size="sm">
                              Enroll
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication && `${selectedApplication.id} - ${selectedApplication.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedApplication.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Application ID</Label>
                  <p className="font-mono">{selectedApplication.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedApplication.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedApplication.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Branch Applied</Label>
                  <p>{selectedApplication.branch}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Category</Label>
                  <p>{selectedApplication.category}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">12th Percentage</Label>
                  <p className="font-semibold text-lg">{selectedApplication.percentage}%</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>

              {/* Document Status */}
              <div>
                <Label className="text-muted-foreground mb-3 block">Document Verification</Label>
                <div className="grid grid-cols-2 gap-3">
                  {documentTypes.map((doc) => (
                    <div
                      key={doc.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        selectedApplication.documents[doc.key as keyof typeof selectedApplication.documents]
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <span className="text-sm">{doc.name}</span>
                      {selectedApplication.documents[doc.key as keyof typeof selectedApplication.documents] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              {selectedApplication.remarks && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Remarks</Label>
                  <p className="p-3 rounded-lg bg-muted">{selectedApplication.remarks}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedApplication && selectedApplication.status !== "approved" && selectedApplication.status !== "rejected" && (
              <>
                <Button variant="destructive" onClick={() => { setViewDialogOpen(false); handleAction(selectedApplication, "reject"); }}>
                  Reject
                </Button>
                <Button className="bg-green-500 hover:bg-green-600" onClick={() => { setViewDialogOpen(false); handleAction(selectedApplication, "approve"); }}>
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Application"}
              {actionType === "reject" && "Reject Application"}
              {actionType === "request_docs" && "Request Documents"}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication && `${selectedApplication.name} (${selectedApplication.id})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === "request_docs" && (
              <div className="space-y-2">
                <Label>Select missing documents</Label>
                <div className="space-y-2">
                  {documentTypes.map((doc) => (
                    <div key={doc.key} className="flex items-center gap-2">
                      <input type="checkbox" id={doc.key} className="rounded" />
                      <Label htmlFor={doc.key}>{doc.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Remarks {actionType === "reject" && "(Required)"}</Label>
              <Textarea
                placeholder={
                  actionType === "approve"
                    ? "Add any notes..."
                    : actionType === "reject"
                    ? "Provide reason for rejection..."
                    : "Add message to applicant..."
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className={
                actionType === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : actionType === "reject"
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }
              disabled={actionType === "reject" && !remarks}
            >
              {actionType === "approve" && "Confirm Approval"}
              {actionType === "reject" && "Confirm Rejection"}
              {actionType === "request_docs" && "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
