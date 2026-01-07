"use client";

import { useState } from "react";
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Users,
  Award,
  Eye,
  Mail,
  MoreVertical,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudents, useStudentStats } from "@/hooks/use-api";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /students?departmentId=X - Filter students by department (already exists)
// - GET /hod/students/stats - Department-specific student statistics
// - GET /hod/students/at-risk - At-risk students in department
// - GET /hod/students/top-performers - Top performers in department
// - GET /hod/students/semester-overview - Semester-wise distribution

// Mock department stats
const departmentStudentStats = {
  total: 480,
  activeStudents: 465,
  onLeave: 8,
  detained: 7,
  avgAttendance: 84,
  avgCGPA: 7.8,
  atRisk: 32,
};

// Mock semester-wise data
const semesterData = [
  { semester: 1, students: 120, avgAttendance: 88, avgCGPA: null, atRisk: 5 },
  { semester: 2, students: 118, avgAttendance: 85, avgCGPA: 7.5, atRisk: 6 },
  { semester: 3, students: 115, avgAttendance: 82, avgCGPA: 7.6, atRisk: 8 },
  { semester: 4, students: 112, avgAttendance: 80, avgCGPA: 7.8, atRisk: 5 },
  { semester: 5, students: 108, avgAttendance: 84, avgCGPA: 7.9, atRisk: 4 },
  { semester: 6, students: 105, avgAttendance: 86, avgCGPA: 8.0, atRisk: 2 },
  { semester: 7, students: 102, avgAttendance: 88, avgCGPA: 8.1, atRisk: 1 },
  { semester: 8, students: 100, avgAttendance: 90, avgCGPA: 8.2, atRisk: 1 },
];

// Mock student list
const studentList = [
  { id: "s1", rollNo: "21CSE001", name: "Rahul Sharma", semester: 5, section: "A", cgpa: 8.5, attendance: 90, status: "active", atRisk: false },
  { id: "s2", rollNo: "21CSE002", name: "Priya Menon", semester: 5, section: "A", cgpa: 9.1, attendance: 95, status: "active", atRisk: false },
  { id: "s3", rollNo: "21CSE003", name: "Arun Kumar", semester: 5, section: "A", cgpa: 6.8, attendance: 72, status: "active", atRisk: true },
  { id: "s4", rollNo: "21CSE004", name: "Kavitha Nair", semester: 5, section: "A", cgpa: 7.9, attendance: 88, status: "active", atRisk: false },
  { id: "s5", rollNo: "21CSE005", name: "Vijay Pillai", semester: 5, section: "B", cgpa: 5.5, attendance: 65, status: "active", atRisk: true },
  { id: "s6", rollNo: "21CSE006", name: "Meera Das", semester: 5, section: "B", cgpa: 8.2, attendance: 92, status: "active", atRisk: false },
  { id: "s7", rollNo: "21CSE007", name: "Suresh Reddy", semester: 5, section: "B", cgpa: 7.1, attendance: 78, status: "active", atRisk: false },
  { id: "s8", rollNo: "21CSE008", name: "Anitha Krishnan", semester: 5, section: "B", cgpa: 6.2, attendance: 70, status: "active", atRisk: true },
  { id: "s9", rollNo: "22CSE001", name: "Deepak Verma", semester: 3, section: "A", cgpa: 7.8, attendance: 85, status: "active", atRisk: false },
  { id: "s10", rollNo: "22CSE002", name: "Sneha Gupta", semester: 3, section: "A", cgpa: 8.9, attendance: 94, status: "active", atRisk: false },
];

// Mock at-risk students
const atRiskStudents = studentList.filter(s => s.atRisk);

// Mock top performers
const topPerformers = [
  { id: "t1", rollNo: "21CSE002", name: "Priya Menon", semester: 5, cgpa: 9.1, rank: 1 },
  { id: "t2", rollNo: "22CSE002", name: "Sneha Gupta", semester: 3, cgpa: 8.9, rank: 2 },
  { id: "t3", rollNo: "21CSE001", name: "Rahul Sharma", semester: 5, cgpa: 8.5, rank: 3 },
  { id: "t4", rollNo: "21CSE006", name: "Meera Das", semester: 5, cgpa: 8.2, rank: 4 },
  { id: "t5", rollNo: "21CSE004", name: "Kavitha Nair", semester: 5, cgpa: 7.9, rank: 5 },
];

export default function HODStudentManagement() {
  const tenantId = useTenantId() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterSection, setFilterSection] = useState("all");

  // Fetch students - filter by department when HOD's department is available
  // TODO: Get HOD's department ID from user context/metadata
  const { data: studentsData, isLoading: studentsLoading } = useStudents(tenantId, {
    search: searchQuery || undefined,
    // departmentId: hodDepartmentId, // TODO: Add department filter
  });
  const { data: studentStats, isLoading: statsLoading } = useStudentStats(tenantId);

  // Extract students from paginated response
  const apiStudents = studentsData?.data || [];

  // Map API students to display format, or use mock data as fallback
  const displayStudents = apiStudents.length > 0 ? apiStudents.map(student => ({
    id: student.id,
    rollNo: student.rollNo || '',
    name: student.user?.name || 'Unknown',
    semester: student.semester || 1,
    section: student.section || 'A',
    cgpa: 0, // TODO: Get from academics API
    attendance: 0, // TODO: Get from attendance API
    status: student.status || 'active',
    atRisk: false, // TODO: Calculate based on attendance/grades
  })) : studentList;

  // Show loading skeleton while data loads
  const isLoading = studentsLoading || statsLoading;
  if (isLoading && !studentsData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Use API stats when available, fallback to mock
  const stats = {
    total: studentStats?.total || departmentStudentStats.total,
    activeStudents: studentStats?.active || departmentStudentStats.activeStudents,
    onLeave: departmentStudentStats.onLeave, // TODO: API doesn't have this
    detained: departmentStudentStats.detained, // TODO: API doesn't have this
    avgAttendance: departmentStudentStats.avgAttendance, // TODO: Get from attendance API
    avgCGPA: departmentStudentStats.avgCGPA, // TODO: Get from academics API
    atRisk: departmentStudentStats.atRisk, // TODO: Calculate from data
  };

  // Calculate at-risk students from display data
  const atRiskStudentsList = displayStudents.filter(s => s.atRisk);

  const filteredStudents = displayStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester =
      filterSemester === "all" || student.semester.toString() === filterSemester;
    const matchesSection =
      filterSection === "all" || student.section === filterSection;
    return matchesSearch && matchesSemester && matchesSection;
  });

  const getCGPABadge = (cgpa: number) => {
    if (cgpa >= 8.5) return <Badge className="bg-green-500">{cgpa.toFixed(1)}</Badge>;
    if (cgpa >= 7.0) return <Badge className="bg-blue-500">{cgpa.toFixed(1)}</Badge>;
    if (cgpa >= 5.5) return <Badge className="bg-yellow-500">{cgpa.toFixed(1)}</Badge>;
    return <Badge variant="destructive">{cgpa.toFixed(1)}</Badge>;
  };

  const getAttendanceBadge = (attendance: number) => {
    if (attendance >= 85) return <Badge className="bg-green-500">{attendance}%</Badge>;
    if (attendance >= 75) return <Badge className="bg-yellow-500">{attendance}%</Badge>;
    return <Badge variant="destructive">{attendance}%</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage department students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <GraduationCap className="h-6 w-6 text-blue-600" />
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
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg CGPA</p>
                <p className="text-2xl font-bold">{stats.avgCGPA}</p>
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detained</p>
                <p className="text-2xl font-bold">{stats.detained}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Semester Overview</TabsTrigger>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Students</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
        </TabsList>

        {/* Semester Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Semester-wise Distribution</CardTitle>
              <CardDescription>Student count and performance by semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {semesterData.map((sem) => (
                  <Card key={sem.semester}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          Sem {sem.semester}
                        </Badge>
                        {sem.atRisk > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {sem.atRisk} at risk
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Students</span>
                          <span className="font-bold">{sem.students}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Attendance</span>
                          <span className={`font-bold ${sem.avgAttendance < 80 ? "text-red-600" : ""}`}>
                            {sem.avgAttendance}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg CGPA</span>
                          <span className="font-bold">
                            {sem.avgCGPA ? sem.avgCGPA.toFixed(1) : "-"}
                          </span>
                        </div>
                        <Progress value={sem.avgAttendance} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student List */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Students</CardTitle>
                  <CardDescription>Complete list of department students</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterSemester} onValueChange={setFilterSemester}>
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
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Semester</TableHead>
                    <TableHead className="text-center">Section</TableHead>
                    <TableHead className="text-center">CGPA</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className={student.atRisk ? "bg-red-50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">Sem {student.semester}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{student.section}</TableCell>
                      <TableCell className="text-center">{getCGPABadge(student.cgpa)}</TableCell>
                      <TableCell className="text-center">{getAttendanceBadge(student.attendance)}</TableCell>
                      <TableCell>
                        {student.atRisk ? (
                          <Badge variant="destructive">At Risk</Badge>
                        ) : (
                          <Badge className="bg-green-500">Good Standing</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Academic History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Parent
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

        {/* At-Risk Students */}
        <TabsContent value="at-risk">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    At-Risk Students
                  </CardTitle>
                  <CardDescription>
                    Students with low attendance or poor academic performance
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Notify Parents
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskStudentsList.length > 0 ? atRiskStudentsList.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-lg border border-red-200 bg-red-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.rollNo} • Semester {student.semester} • Section {student.section}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className={`font-bold ${student.cgpa < 6 ? "text-red-600" : ""}`}>
                            {student.cgpa.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">CGPA</p>
                        </div>
                        <div className="text-center">
                          <p className={`font-bold ${student.attendance < 75 ? "text-red-600" : ""}`}>
                            {student.attendance}%
                          </p>
                          <p className="text-xs text-muted-foreground">Attendance</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {student.cgpa < 6 && (
                        <Badge variant="destructive" className="text-xs">
                          Low CGPA
                        </Badge>
                      )}
                      {student.attendance < 75 && (
                        <Badge variant="destructive" className="text-xs">
                          Low Attendance
                        </Badge>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No at-risk students found. All students are in good standing.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers */}
        <TabsContent value="top-performers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>Highest achieving students in the department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className={`p-4 rounded-lg border ${
                      index === 0
                        ? "border-yellow-300 bg-yellow-50"
                        : index === 1
                        ? "border-gray-300 bg-gray-50"
                        : index === 2
                        ? "border-orange-300 bg-orange-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          {student.rank}
                        </div>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.rollNo} • Semester {student.semester}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">
                          {student.cgpa.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">CGPA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
