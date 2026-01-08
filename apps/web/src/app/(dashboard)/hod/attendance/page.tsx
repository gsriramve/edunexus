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
  XCircle,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";

// Mock data - will be replaced with API calls
const mockAttendanceData = {
  stats: {
    departmentAverage: 82.5,
    totalStudents: 450,
    belowThreshold: 45,
    perfectAttendance: 32,
    todaysAttendance: 78.5,
  },
  bySubject: [
    { code: "CS301", name: "Data Structures", avg: 85, belowThreshold: 8 },
    { code: "CS302", name: "Database Systems", avg: 78, belowThreshold: 15 },
    { code: "CS303", name: "Operating Systems", avg: 82, belowThreshold: 10 },
    { code: "CS401", name: "Machine Learning", avg: 88, belowThreshold: 4 },
    { code: "CS402", name: "Cloud Computing", avg: 75, belowThreshold: 12 },
  ],
  bySemester: [
    { semester: 1, avg: 88, students: 60 },
    { semester: 2, avg: 85, students: 58 },
    { semester: 3, avg: 82, students: 65 },
    { semester: 4, avg: 80, students: 62 },
    { semester: 5, avg: 78, students: 55 },
    { semester: 6, avg: 76, students: 52 },
    { semester: 7, avg: 82, students: 50 },
    { semester: 8, avg: 85, students: 48 },
  ],
  lowAttendance: [
    { id: "1", name: "Rahul Sharma", rollNo: "CS2023001", semester: 3, attendance: 58, classes: 45 },
    { id: "2", name: "Priya Patel", rollNo: "CS2023015", semester: 3, attendance: 62, classes: 45 },
    { id: "3", name: "Amit Kumar", rollNo: "CS2024008", semester: 1, attendance: 65, classes: 40 },
    { id: "4", name: "Sneha Gupta", rollNo: "CS2023022", semester: 3, attendance: 68, classes: 45 },
    { id: "5", name: "Ravi Singh", rollNo: "CS2022011", semester: 5, attendance: 70, classes: 42 },
  ],
  weeklyTrend: [
    { week: "Week 1", attendance: 85 },
    { week: "Week 2", attendance: 82 },
    { week: "Week 3", attendance: 78 },
    { week: "Week 4", attendance: 80 },
  ],
};

function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return "text-green-600";
  if (percentage >= 75) return "text-yellow-600";
  return "text-red-600";
}

function getAttendanceBadge(percentage: number): "default" | "secondary" | "destructive" {
  if (percentage >= 85) return "default";
  if (percentage >= 75) return "secondary";
  return "destructive";
}

export default function HodAttendancePage() {
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const tenantId = useTenantId();

  const isLoading = false;
  const data = mockAttendanceData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
              <span className={`text-2xl font-bold ${getAttendanceColor(data.stats.departmentAverage)}`}>
                {data.stats.departmentAverage}%
              </span>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getAttendanceColor(data.stats.todaysAttendance)}`}>
                {data.stats.todaysAttendance}%
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
              <span className="text-2xl font-bold">{data.stats.totalStudents}</span>
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
                {data.stats.belowThreshold}
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
                {data.stats.perfectAttendance}
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
                {data.bySemester.map((sem) => (
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
                ))}
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
              <div className="flex items-end gap-4 h-48">
                {data.weeklyTrend.map((week, idx) => (
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
                  {data.bySubject.map((subject) => (
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
                  {data.lowAttendance.map((student) => (
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
