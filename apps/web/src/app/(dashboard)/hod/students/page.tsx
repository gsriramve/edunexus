"use client";

import { useState } from "react";
import {
  GraduationCap,
  Search,
  Download,
  AlertTriangle,
  TrendingUp,
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
import {
  useHodStudents,
  useAtRiskStudents,
  useTopPerformers,
} from "@/hooks/use-hod-students";

export default function HODStudentManagement() {
  const tenantId = useTenantId() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterSection, setFilterSection] = useState("all");

  // Fetch data using HoD-specific hooks
  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useHodStudents(tenantId, {
    search: searchQuery || undefined,
    semester: filterSemester !== 'all' ? filterSemester : undefined,
    section: filterSection !== 'all' ? filterSection : undefined,
  });

  const {
    data: atRiskData,
    isLoading: atRiskLoading,
  } = useAtRiskStudents(tenantId);

  const {
    data: topPerformersData,
    isLoading: topPerformersLoading,
  } = useTopPerformers(tenantId, 10);

  // Show loading skeleton while data loads
  const isLoading = studentsLoading && !studentsData;
  if (isLoading) {
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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

  // Show error state
  if (studentsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage department students
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600">
                {studentsError instanceof Error ? studentsError.message : 'Failed to load students'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please make sure you are assigned as HoD with a valid department.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from API response
  const stats = studentsData?.stats || {
    total: 0,
    activeStudents: 0,
    onLeave: 0,
    detained: 0,
    avgAttendance: 0,
    avgCGPA: 0,
    atRisk: 0,
  };
  const semesterData = studentsData?.semesterData || [];
  const students = studentsData?.students || [];
  const department = studentsData?.department;

  const atRiskStudentsList = atRiskData?.students || [];
  const topPerformers = topPerformersData?.students || [];

  const getCGPABadge = (cgpa: number) => {
    if (cgpa >= 8.5) return <Badge className="bg-green-500">{cgpa.toFixed(1)}</Badge>;
    if (cgpa >= 7.0) return <Badge className="bg-blue-500">{cgpa.toFixed(1)}</Badge>;
    if (cgpa >= 5.5) return <Badge className="bg-yellow-500">{cgpa.toFixed(1)}</Badge>;
    if (cgpa === 0) return <Badge variant="outline">-</Badge>;
    return <Badge variant="destructive">{cgpa.toFixed(1)}</Badge>;
  };

  const getAttendanceBadge = (attendance: number) => {
    if (attendance >= 85) return <Badge className="bg-green-500">{attendance}%</Badge>;
    if (attendance >= 75) return <Badge className="bg-yellow-500">{attendance}%</Badge>;
    if (attendance === 0) return <Badge variant="outline">-</Badge>;
    return <Badge variant="destructive">{attendance}%</Badge>;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-orange-100 border-orange-300';
      default: return 'bg-yellow-100 border-yellow-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            {department ? `${department.name} (${department.code})` : 'Monitor and manage department students'}
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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
                <p className="text-2xl font-bold">{stats.avgCGPA || '-'}</p>
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
              {semesterData.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No semester data available
                </div>
              )}
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
              {studentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : students.length > 0 ? (
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
                    {students.map((student) => (
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
                        <TableCell className="text-center">{student.section || '-'}</TableCell>
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No students found matching your criteria
                </div>
              )}
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
              {atRiskLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {atRiskStudentsList.length > 0 ? atRiskStudentsList.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg border ${getRiskLevelColor(student.riskLevel)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{student.name}</p>
                              <Badge variant={student.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-xs">
                                {student.riskLevel} risk
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {student.rollNo} | Semester {student.semester} | Section {student.section || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className={`font-bold ${student.cgpa > 0 && student.cgpa < 6 ? "text-red-600" : ""}`}>
                              {student.cgpa > 0 ? student.cgpa.toFixed(1) : '-'}
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
                        {student.riskReasons.map((reason, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No at-risk students found. All students are in good standing.
                    </div>
                  )}
                </div>
              )}
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
              {topPerformersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : topPerformers.length > 0 ? (
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
                              {student.rollNo} | Semester {student.semester}
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No top performers data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
