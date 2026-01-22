"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Search,
  Mail,
  Eye,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useStudentEnrollments,
  useSendEnrollmentInvitation,
  useDeleteEnrollment,
  type EnrollmentStatusType,
} from "@/hooks/use-api";
import { useDepartments } from "@/hooks/use-api";
import { useTenantId } from "@/hooks/use-tenant";
import { toast } from "sonner";

const getStatusBadge = (status: EnrollmentStatusType) => {
  const statusConfig: Record<EnrollmentStatusType, { label: string; variant: string }> = {
    INITIATED: { label: "Initiated", variant: "secondary" },
    INVITATION_SENT: { label: "Invitation Sent", variant: "blue" },
    STUDENT_SIGNED_UP: { label: "Signed Up", variant: "purple" },
    PROFILE_INCOMPLETE: { label: "Profile Incomplete", variant: "yellow" },
    SUBMITTED: { label: "Submitted", variant: "orange" },
    ADMIN_APPROVED: { label: "Admin Approved", variant: "cyan" },
    CHANGES_REQUESTED: { label: "Changes Requested", variant: "yellow" },
    HOD_APPROVED: { label: "HOD Approved", variant: "teal" },
    PRINCIPAL_APPROVED: { label: "Principal Approved", variant: "indigo" },
    COMPLETED: { label: "Completed", variant: "green" },
    REJECTED: { label: "Rejected", variant: "red" },
    EXPIRED: { label: "Expired", variant: "gray" },
  };

  const config = statusConfig[status];
  const colorClasses: Record<string, string> = {
    secondary: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    cyan: "bg-cyan-100 text-cyan-800",
    teal: "bg-teal-100 text-teal-800",
    indigo: "bg-indigo-100 text-indigo-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-500",
  };

  return (
    <Badge className={colorClasses[config.variant]}>
      {config.label}
    </Badge>
  );
};

export default function EnrollmentsPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatusType | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Queries
  const { data: enrollmentsData, isLoading, refetch } = useStudentEnrollments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
    search: searchQuery || undefined,
  });

  const { data: departmentsData } = useDepartments(tenantId || "");

  // Mutations
  const sendInvitation = useSendEnrollmentInvitation();
  const deleteEnrollment = useDeleteEnrollment();

  const enrollments = enrollmentsData?.data || [];
  const departments = departmentsData?.data || [];

  // Calculate stats from enrollments
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter((e) =>
      ["INITIATED", "INVITATION_SENT", "STUDENT_SIGNED_UP", "PROFILE_INCOMPLETE"].includes(e.status)
    ).length,
    submitted: enrollments.filter((e) => e.status === "SUBMITTED").length,
    adminApproved: enrollments.filter((e) => e.status === "ADMIN_APPROVED").length,
    completed: enrollments.filter((e) => e.status === "COMPLETED").length,
    rejected: enrollments.filter((e) => e.status === "REJECTED").length,
  };

  const handleSendInvitation = async (id: string) => {
    try {
      await sendInvitation.mutateAsync(id);
      toast.success("Invitation sent successfully");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this enrollment?")) return;

    try {
      await deleteEnrollment.mutateAsync(id);
      toast.success("Enrollment cancelled");
    } catch (error) {
      console.error("Failed to delete enrollment:", error);
      toast.error("Failed to cancel enrollment");
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      enrollment.firstName.toLowerCase().includes(query) ||
      enrollment.lastName.toLowerCase().includes(query) ||
      enrollment.email.toLowerCase().includes(query) ||
      enrollment.mobileNumber.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Enrollments</h1>
          <p className="text-muted-foreground">
            Manage student enrollment and onboarding workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/admin/enrollments/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Enrollment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
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
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-50">
                <Send className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Approved</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.adminApproved}</p>
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Enrollments</CardTitle>
              <CardDescription>View and manage student enrollment applications</CardDescription>
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
                  placeholder="Search by name, email, or phone..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EnrollmentStatusType | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="INITIATED">Initiated</SelectItem>
                <SelectItem value="INVITATION_SENT">Invitation Sent</SelectItem>
                <SelectItem value="STUDENT_SIGNED_UP">Signed Up</SelectItem>
                <SelectItem value="PROFILE_INCOMPLETE">Profile Incomplete</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ADMIN_APPROVED">Admin Approved</SelectItem>
                <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
                <SelectItem value="HOD_APPROVED">HOD Approved</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No enrollments found. Click &quot;New Enrollment&quot; to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {enrollment.firstName} {enrollment.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{enrollment.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{enrollment.department.code}</Badge>
                    </TableCell>
                    <TableCell>{enrollment.academicYear}</TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell>
                      {enrollment.rollNumber || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/enrollments/${enrollment.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {(enrollment.status === "INITIATED" ||
                            enrollment.status === "INVITATION_SENT") && (
                            <DropdownMenuItem
                              onClick={() => handleSendInvitation(enrollment.id)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Invitation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {enrollment.status !== "COMPLETED" && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(enrollment.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Enrollment
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
}
