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
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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

// Mock data
const assignments = [
  {
    id: "1",
    title: "DSA Assignment 3 - Trees & Graphs",
    subject: "Data Structures",
    code: "CS501",
    section: "CSE-A",
    dueDate: "2026-01-10",
    totalMarks: 20,
    submissions: 45,
    totalStudents: 60,
    graded: 30,
    status: "active",
    description: "Implement binary tree operations and graph traversal algorithms",
  },
  {
    id: "2",
    title: "DSA Assignment 2 - Linked Lists",
    subject: "Data Structures",
    code: "CS501",
    section: "CSE-A",
    dueDate: "2025-12-20",
    totalMarks: 20,
    submissions: 58,
    totalStudents: 60,
    graded: 58,
    status: "completed",
    description: "Implementation of singly and doubly linked lists with various operations",
  },
  {
    id: "3",
    title: "Algorithm Analysis Quiz",
    subject: "Algorithms",
    code: "CS502",
    section: "CSE-C",
    dueDate: "2026-01-15",
    totalMarks: 10,
    submissions: 20,
    totalStudents: 55,
    graded: 0,
    status: "active",
    description: "Time and space complexity analysis problems",
  },
  {
    id: "4",
    title: "Lab Exercise 5 - Sorting Algorithms",
    subject: "Data Structures Lab",
    code: "CS505",
    section: "CSE-A Batch 1",
    dueDate: "2026-01-08",
    totalMarks: 15,
    submissions: 28,
    totalStudents: 30,
    graded: 15,
    status: "active",
    description: "Implement and compare various sorting algorithms",
  },
];

const submissions = [
  { id: "s1", student: "Aakash Verma", rollNo: "21CSE001", submittedAt: "2026-01-05 10:30 AM", status: "graded", marks: 18, file: "assignment3_aakash.pdf" },
  { id: "s2", student: "Aditi Sharma", rollNo: "21CSE002", submittedAt: "2026-01-06 02:15 PM", status: "graded", marks: 16, file: "dsa_assignment_aditi.pdf" },
  { id: "s3", student: "Amit Kumar", rollNo: "21CSE003", submittedAt: "2026-01-07 11:45 AM", status: "pending", marks: null, file: "assignment3_amit.zip" },
  { id: "s4", student: "Ananya Patel", rollNo: "21CSE004", submittedAt: "2026-01-04 09:00 AM", status: "graded", marks: 20, file: "trees_graphs_ananya.pdf" },
  { id: "s5", student: "Arjun Singh", rollNo: "21CSE005", submittedAt: "2026-01-08 05:30 PM", status: "late", marks: null, file: "dsa3_arjun.pdf" },
];

export default function TeacherAssignments() {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<typeof assignments[0] | null>(null);

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSubject = selectedSubject === "all" || assignment.code === selectedSubject;
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesStatus && matchesSearch;
  });

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => a.status === "active").length,
    pendingGrading: assignments.reduce((sum, a) => sum + (a.submissions - a.graded), 0),
    avgSubmission: Math.round(
      (assignments.reduce((sum, a) => sum + (a.submissions / a.totalStudents) * 100, 0) /
        assignments.length)
    ),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-green-500">Graded</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "late":
        return <Badge className="bg-red-500">Late</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
                <Label htmlFor="title">Assignment Title</Label>
                <Input id="title" placeholder="e.g., DSA Assignment 4 - Dynamic Programming" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs501">Data Structures (CS501)</SelectItem>
                      <SelectItem value="cs505">Data Structures Lab (CS505)</SelectItem>
                      <SelectItem value="cs502">Algorithms (CS502)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Section</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse-a">CSE-A</SelectItem>
                      <SelectItem value="cse-b">CSE-B</SelectItem>
                      <SelectItem value="cse-c">CSE-C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="datetime-local" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marks">Total Marks</Label>
                  <Input id="marks" type="number" placeholder="20" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Assignment instructions and requirements..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop files or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, ZIP (max 10MB)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
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
                <p className="text-2xl font-bold">{stats.avgSubmission}%</p>
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
                <SelectItem value="CS501">Data Structures</SelectItem>
                <SelectItem value="CS505">Data Structures Lab</SelectItem>
                <SelectItem value="CS502">Algorithms</SelectItem>
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
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono">
                        {assignment.code}
                      </Badge>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assignment.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{assignment.section}</span>
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
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Submissions</span>
                    <span className="text-sm font-medium">
                      {assignment.submissions}/{assignment.totalStudents} ({Math.round((assignment.submissions / assignment.totalStudents) * 100)}%)
                    </span>
                  </div>
                  <Progress
                    value={(assignment.submissions / assignment.totalStudents) * 100}
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
          ))}
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
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submissions</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>File</TableHead>
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
                              {submission.student.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{submission.student}</p>
                            <p className="text-xs text-muted-foreground font-mono">{submission.rollNo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>DSA Assignment 3</TableCell>
                      <TableCell className="text-sm">{submission.submittedAt}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          {submission.file}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {getSubmissionStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {submission.marks !== null ? `${submission.marks}/20` : "-"}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
