"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarDays,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useHodAttendance } from "@/hooks/use-hod-attendance";

function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return "text-green-600";
  if (percentage >= 75) return "text-yellow-600";
  return "text-red-600";
}

export default function HodAttendancePage() {
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const tenantId = useTenantId() || "";

  const { data, isLoading, error } = useHodAttendance(tenantId, {
    semester: selectedSemester !== "all" ? selectedSemester : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Attendance</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    departmentAverage: 0,
    todaysAttendance: 0,
    totalStudents: 0,
    belowThreshold: 0,
    perfectAttendance: 0,
  };
  const bySubject = data?.bySubject || [];
  const bySemester = data?.bySemester || [];
  const lowAttendance = data?.lowAttendance || [];
  const weeklyTrend = data?.weeklyTrend || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Overview</h1>
          <p className="text-muted-foreground">
            Monitor department-wide attendance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[150px]">
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Department Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getAttendanceColor(stats.departmentAverage)}`}>
                {stats.departmentAverage}%
              </span>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getAttendanceColor(stats.todaysAttendance)}`}>
                {stats.todaysAttendance}%
              </span>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.totalStudents}</span>
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Below 75%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">
                {stats.belowThreshold}
              </span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              100% Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats.perfectAttendance}
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <CalendarDays className="h-4 w-4 mr-2" />
            By Subject
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Attendance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Semester-wise Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Semester</CardTitle>
              <CardDescription>
                Average attendance across all semesters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bySemester.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No attendance data available</p>
                ) : (
                  bySemester.map((sem) => (
                    <div key={sem.semester} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Semester {sem.semester}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {sem.students} students
                          </span>
                          <span className={`font-medium ${getAttendanceColor(sem.avg)}`}>
                            {sem.avg}%
                          </span>
                        </div>
                      </div>
                      <Progress value={sem.avg} className="h-2" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trend</CardTitle>
              <CardDescription>
                Attendance trend over the past weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyTrend.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No weekly trend data available</p>
              ) : (
                <div className="flex items-end gap-4 h-48">
                  {weeklyTrend.map((week) => (
                    <div key={week.week} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t ${
                          week.attendance >= 80 ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{ height: `${week.attendance}%` }}
                      />
                      <p className="text-xs mt-2 text-muted-foreground">{week.week}</p>
                      <p className="text-sm font-medium">{week.attendance}%</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Subject Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Subject</CardTitle>
              <CardDescription>
                Subject-wise attendance breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bySubject.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subject data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead className="text-center">Avg. Attendance</TableHead>
                      <TableHead className="text-center">Below 75%</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bySubject.map((subject) => (
                      <TableRow key={subject.code}>
                        <TableCell className="font-medium">{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${getAttendanceColor(subject.avg)}`}>
                            {subject.avg}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={subject.belowThreshold > 10 ? "destructive" : "secondary"}>
                            {subject.belowThreshold} students
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.avg >= 80 ? (
                            <Badge variant="default">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Good
                            </Badge>
                          ) : subject.avg >= 75 ? (
                            <Badge variant="secondary">
                              Average
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Low
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Attendance Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Students with Low Attendance
              </CardTitle>
              <CardDescription>
                Students below 75% attendance threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No students with low attendance!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Semester</TableHead>
                      <TableHead className="text-center">Classes Held</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowAttendance.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-center">{student.semester}</TableCell>
                        <TableCell className="text-center">{student.classes}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive">{student.attendance}%</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm">
                            Send Notice
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
