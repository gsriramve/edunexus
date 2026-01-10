"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useTeacherClasses,
  useClassStudents,
  type StudentDetail,
} from "@/hooks/use-teacher-classes";

export default function TeacherStudents() {
  const searchParams = useSearchParams();
  const classIdFromUrl = searchParams.get("class");

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);

  const tenantId = useTenantId();

  // Load teacher's classes
  const { data: classesData, isLoading: isLoadingClasses } = useTeacherClasses(tenantId || "");

  // Set initial class from URL or first available
  useEffect(() => {
    if (classIdFromUrl) {
      setSelectedClass(classIdFromUrl);
    } else if (classesData?.classes && classesData.classes.length > 0 && !selectedClass) {
      setSelectedClass(classesData.classes[0].id);
    }
  }, [classIdFromUrl, classesData?.classes, selectedClass]);

  // Load students for selected class
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useClassStudents(tenantId || "", selectedClass);

  const classes = classesData?.classes || [];

  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) return [];
    return studentsData.students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [studentsData?.students, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    if (!studentsData?.stats) {
      return { total: 0, excellent: 0, good: 0, warning: 0, atRisk: 0 };
    }
    return studentsData.stats;
  }, [studentsData?.stats]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-500">Excellent</Badge>;
      case "good":
        return <Badge className="bg-blue-500">Good</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "at_risk":
        return <Badge className="bg-red-500">At Risk</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoadingClasses) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // No classes assigned
  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">
            View and manage students in your classes
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Classes Assigned</h3>
            <p className="text-muted-foreground">
              You don't have any classes assigned for this semester.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">
            View and manage students in your classes
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.subjectName} - Section {cls.section || "A"} ({cls.subjectCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll no..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
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
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Excellent</p>
                <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Good</p>
                <p className="text-2xl font-bold text-blue-600">{stats.good}</p>
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
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            Students enrolled in {studentsData?.classInfo?.subjectName || "selected class"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : studentsError ? (
            <div className="text-center py-8 text-muted-foreground">
              {studentsError instanceof Error ? studentsError.message : "Failed to load students"}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Avg. Marks</TableHead>
                  <TableHead className="text-center">Assignments</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{student.rollNo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.section}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Progress
                          value={student.attendance}
                          className={`w-16 h-2 ${student.attendance < 75 ? "[&>div]:bg-red-500" : ""}`}
                        />
                        <span className={`text-sm font-medium ${student.attendance < 75 ? "text-red-600" : ""}`}>
                          {student.attendance}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium ${student.avgMarks < 50 ? "text-red-600" : student.avgMarks >= 80 ? "text-green-600" : ""}`}>
                        {student.avgMarks}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {student.assignments.submitted}/{student.assignments.submitted + student.assignments.pending}
                      </span>
                      {student.assignments.pending > 0 && (
                        <span className="text-xs text-red-600 ml-1">
                          ({student.assignments.pending} pending)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(student.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Student Details</DialogTitle>
                              <DialogDescription>
                                Performance overview for {student.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="text-lg">
                                    {student.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-lg font-semibold">{student.name}</h3>
                                  <p className="text-muted-foreground font-mono">{student.rollNo}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline">{student.section}</Badge>
                                    {getStatusBadge(student.status)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{student.email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{student.phone || "No phone"}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="pt-4">
                                    <p className="text-sm text-muted-foreground">Attendance</p>
                                    <p className="text-2xl font-bold">{student.attendance}%</p>
                                    <Progress value={student.attendance} className="h-2 mt-2" />
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4">
                                    <p className="text-sm text-muted-foreground">Average Marks</p>
                                    <p className="text-2xl font-bold">{student.avgMarks}%</p>
                                    <Progress value={student.avgMarks} className="h-2 mt-2" />
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4">
                                    <p className="text-sm text-muted-foreground">Assignments</p>
                                    <p className="text-2xl font-bold">
                                      {student.assignments.submitted}/{student.assignments.submitted + student.assignments.pending}
                                    </p>
                                    <Progress
                                      value={(student.assignments.submitted / (student.assignments.submitted + student.assignments.pending)) * 100}
                                      className="h-2 mt-2"
                                    />
                                  </CardContent>
                                </Card>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </Button>
                                <Button variant="outline" className="flex-1">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Send Message
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
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

      {/* At Risk Alert */}
      {stats.atRisk > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Students At Risk</h3>
                <p className="text-sm text-red-700 mt-1">
                  {stats.atRisk} student(s) have low attendance or poor performance. Consider reaching out to them.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {filteredStudents
                    .filter((s) => s.status === "at_risk")
                    .map((s) => (
                      <Badge key={s.id} variant="outline" className="text-red-700 border-red-300">
                        {s.name} ({s.rollNo})
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
