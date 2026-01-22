"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  Building,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePendingEnrollmentApprovals,
  useApproveEnrollment,
} from "@/hooks/use-api";
import { toast } from "sonner";

export default function EnrollmentApprovalsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: enrollments, isLoading, refetch } = usePendingEnrollmentApprovals();

  // Mutations
  const approveEnrollment = useApproveEnrollment();

  const pendingEnrollments = enrollments || [];

  const handleApprove = async (id: string) => {
    try {
      await approveEnrollment.mutateAsync({
        id,
        data: { action: "approve" },
      });
      toast.success("Enrollment approved successfully");
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve enrollment");
    }
  };

  const filteredEnrollments = pendingEnrollments.filter((enrollment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      enrollment.firstName.toLowerCase().includes(query) ||
      enrollment.lastName.toLowerCase().includes(query) ||
      enrollment.email.toLowerCase().includes(query) ||
      enrollment.department.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve pending student enrollments
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">{pendingEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Approved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingEnrollments.filter((e) => e.status === "ADMIN_APPROVED").length}
                </p>
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
                <p className="text-sm text-muted-foreground">Ready for Final</p>
                <p className="text-2xl font-bold text-green-600">
                  {pendingEnrollments.filter((e) => e.status === "HOD_APPROVED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Pending Enrollments</CardTitle>
              <CardDescription>
                Enrollments awaiting your approval
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enrollments..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending approvals</p>
              <p className="text-sm text-muted-foreground mt-1">
                All enrollments have been processed
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Admin Reviewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {enrollment.firstName} {enrollment.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{enrollment.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{enrollment.department.name}</span>
                        <Badge variant="outline" className="ml-1">
                          {enrollment.department.code}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {enrollment.academicYear}
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.section ? (
                        <Badge variant="secondary">Section {enrollment.section}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.adminReviewedAt && (
                        <div className="text-sm">
                          <p>{new Date(enrollment.adminReviewedAt).toLocaleDateString()}</p>
                          {enrollment.adminNotes && (
                            <p className="text-muted-foreground truncate max-w-[150px]">
                              {enrollment.adminNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/approvals/enrollments/${enrollment.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(enrollment.id)}
                          disabled={approveEnrollment.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Approve
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
    </div>
  );
}
