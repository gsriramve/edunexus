"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  Pencil,
  Trash2,
  Upload,
  Search,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useTeacherAssignments,
  useTeacherSubjectsForAssignments,
  useRecentSubmissions,
  useCreateAssignment,
  useDeleteAssignment,
  useGradeSubmission,
  type Assignment,
  type Submission,
  type CreateAssignmentInput,
} from "@/hooks/use-teacher-assignments";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-16" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}

export default function TeacherAssignments() {
  const tenantId = useTenantId() || "";

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState<Partial<CreateAssignmentInput>>({
    title: "",
    description: "",
    instructions: "",
    totalMarks: 20,
    status: "draft",
    allowLateSubmission: false,
  });

  // Fetch data
  const { data: assignmentsData, isLoading: assignmentsLoading, error: assignmentsError } = useTeacherAssignments(
    tenantId,
    {
      subjectCode: selectedSubject !== "all" ? selectedSubject : undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      search: searchQuery || undefined,
    }
  );

  const { data: subjects } = useTeacherSubjectsForAssignments(tenantId);
  const { data: recentSubmissionsData, isLoading: submissionsLoading } = useRecentSubmissions(tenantId, { limit: 10 });

  // Mutations
  const createAssignment = useCreateAssignment(tenantId);
  const deleteAssignment = useDeleteAssignment(tenantId);
  const gradeSubmission = useGradeSubmission(tenantId);

  const assignments = assignmentsData?.assignments || [];
  const stats = assignmentsData?.stats || {
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    pendingGrading: 0,
    avgSubmissionRate: 0,
  };
  const submissions = recentSubmissionsData?.submissions || [];

  const handleCreateAssignment = async () => {
    if (!newAssignment.teacherSubjectId || !newAssignment.title || !newAssignment.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createAssignment.mutateAsync(newAssignment as CreateAssignmentInput);
      toast.success("Assignment created successfully");
      setIsCreateDialogOpen(false);
      setNewAssignment({
        title: "",
        description: "",
        instructions: "",
        totalMarks: 20,
        status: "draft",
        allowLateSubmission: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create assignment");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteAssignment.mutateAsync(id);
      toast.success("Assignment deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete assignment");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-green-500">Graded</Badge>;
      case "submitted":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "late":
        return <Badge className="bg-red-500">Late</Badge>;
      case "returned":
        return <Badge className="bg-blue-500">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Show loading state
  if (!tenantId || assignmentsLoading) {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (assignmentsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to load assignments</h2>
        <p className="text-muted-foreground">
          {assignmentsError instanceof Error ? assignmentsError.message : "An error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Create, manage, and grade student assignments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new assignment for your students
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., DSA Assignment 4 - Dynamic Programming"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Subject *</Label>
                  <Select
                    value={newAssignment.teacherSubjectId}
                    onValueChange={(value) => setNewAssignment({ ...newAssignment, teacherSubjectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subjectName} ({subject.subjectCode}) {subject.section ? `- ${subject.section}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={newAssignment.status}
                    onValueChange={(value: "draft" | "active") => setNewAssignment({ ...newAssignment, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active (Publish Now)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marks">Total Marks *</Label>
                  <Input
                    id="marks"
                    type="number"
                    placeholder="20"
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the assignment..."
                  rows={2}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Detailed assignment instructions and requirements..."
                  rows={4}
                  value={newAssignment.instructions}
                  onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowLate"
                  checked={newAssignment.allowLateSubmission}
                  onChange={(e) => setNewAssignment({ ...newAssignment, allowLateSubmission: e.target.checked })}
                />
                <Label htmlFor="allowLate">Allow late submissions</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment} disabled={createAssignment.isPending}>
                {createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="h-6 w-6 text-blue-600" />
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
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Grading</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingGrading}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Submission</p>
                <p className="text-2xl font-bold">{stats.avgSubmissionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.subjectCode} value={subject.subjectCode}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Assignment List</TabsTrigger>
          <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No assignments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedSubject !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first assignment to get started"}
                </p>
                {!searchQuery && selectedSubject === "all" && statusFilter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {assignment.subjectCode}
                        </Badge>
                        <h3 className="font-semibold">{assignment.title}</h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {assignment.description || "No description provided"}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.section || "All sections"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{assignment.totalMarks} marks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        disabled={deleteAssignment.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Submissions</span>
                      <span className="text-sm font-medium">
                        {assignment.submissions}/{assignment.totalStudents} ({assignment.totalStudents > 0 ? Math.round((assignment.submissions / assignment.totalStudents) * 100) : 0}%)
                      </span>
                    </div>
                    <Progress
                      value={assignment.totalStudents > 0 ? (assignment.submissions / assignment.totalStudents) * 100 : 0}
                      className="h-2 mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">
                          {assignment.graded} graded
                        </span>
                        <span className="text-orange-600">
                          {assignment.submissions - assignment.graded} pending
                        </span>
                        <span className="text-muted-foreground">
                          {assignment.totalStudents - assignment.submissions} not submitted
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAssignment(assignment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Submissions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest assignment submissions from students</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No submissions yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {submission.studentName.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{submission.studentName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{submission.rollNo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{submission.assignmentTitle}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {getSubmissionStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {submission.marks !== null ? `${submission.marks}/${submission.totalMarks}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            {submission.status === "graded" ? "Edit" : "Grade"}
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
    </div>
  );
}
