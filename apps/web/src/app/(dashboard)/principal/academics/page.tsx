"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, GraduationCap, Users, TrendingUp, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePrincipalAcademicsOverview } from "@/hooks/use-principal-dashboard";
import { useTenantId } from "@/hooks/use-tenant";

export default function PrincipalAcademicsPage() {
  const tenantId = useTenantId();
  const [selectedYear, setSelectedYear] = useState("2025-26");

  const { data: academicsData, isLoading, error } = usePrincipalAcademicsOverview(tenantId || '');

  const getSyllabusStatusBadge = (status: 'completed' | 'in_progress' | 'pending') => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "pending":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-800">Failed to load academics data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = academicsData?.stats || {
    totalCourses: 0,
    activeCourses: 0,
    totalSubjects: 0,
    totalCredits: 0,
    averagePassRate: 0,
    studentsEnrolled: 0,
  };

  const departmentCurriculum = academicsData?.departmentCurriculum || [];
  const recentUpdates = academicsData?.recentUpdates || [];
  const semesterProgress = academicsData?.semesterProgress || [];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academics Overview</h1>
          <p className="text-muted-foreground">
            Institution-wide curriculum and course management overview
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-26">2025-26</SelectItem>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2023-24">2023-24</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCourses} active this semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCredits} total credits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsEnrolled.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePassRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall institution average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Curriculum Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Department Curriculum Status</CardTitle>
            <CardDescription>Course and syllabus status across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentCurriculum.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No curriculum data available yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-center">Subjects</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Syllabus Status</TableHead>
                    <TableHead className="text-center">Pass Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentCurriculum.map((dept) => (
                    <TableRow key={dept.departmentId}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell className="text-center">{dept.courses}</TableCell>
                      <TableCell className="text-center">{dept.subjects}</TableCell>
                      <TableCell className="text-center">{dept.credits}</TableCell>
                      <TableCell className="text-center">{getSyllabusStatusBadge(dept.syllabusStatus)}</TableCell>
                      <TableCell className="text-center">
                        <span className={dept.passRate >= 90 ? "text-green-600 font-medium" : dept.passRate >= 80 ? "text-yellow-600" : "text-red-600"}>
                          {dept.passRate > 0 ? `${dept.passRate}%` : '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Syllabus Completion by Semester */}
        <Card>
          <CardHeader>
            <CardTitle>Syllabus Completion</CardTitle>
            <CardDescription>Progress across all semesters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {semesterProgress.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No semester data available yet.
              </p>
            ) : (
              semesterProgress.map((sem) => (
                <div key={sem.semester} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Semester {sem.semester}</span>
                    <span className="text-muted-foreground">
                      {sem.completionPercentage}% ({sem.withSyllabus}/{sem.totalSubjects})
                    </span>
                  </div>
                  <Progress value={sem.completionPercentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Curriculum Updates</CardTitle>
            <CardDescription>Latest changes across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUpdates.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent updates available.
              </p>
            ) : (
              <div className="space-y-4">
                {recentUpdates.slice(0, 5).map((update) => (
                  <div key={update.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{update.subjectName}</p>
                      <p className="text-xs text-muted-foreground">{update.courseName} - {update.department}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">{update.action}</Badge>
                        <span className="text-xs text-muted-foreground">{update.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
