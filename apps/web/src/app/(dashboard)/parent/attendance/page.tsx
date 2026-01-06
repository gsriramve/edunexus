"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

// Mock data for children
const children = [
  { id: "child-1", name: "Rahul Sharma", rollNo: "21CSE101", department: "Computer Science", semester: 5 },
  { id: "child-2", name: "Priya Sharma", rollNo: "23ECE045", department: "Electronics", semester: 3 },
];

// Mock attendance data per child
const childAttendanceData: Record<string, {
  overview: { overall: number; present: number; absent: number; late: number; totalClasses: number; trend: string; change: number };
  subjectWise: Array<{ code: string; name: string; teacher: string; attended: number; total: number; percentage: number; lastUpdated: string }>;
  monthlyData: Array<{ date: number; status: "present" | "absent" | "late" | "holiday" | "weekend" | null }>;
  leaveHistory: Array<{ id: string; type: string; from: string; to: string; days: number; reason: string; status: string; appliedOn: string }>;
}> = {
  "child-1": {
    overview: {
      overall: 82,
      present: 156,
      absent: 28,
      late: 6,
      totalClasses: 190,
      trend: "up",
      change: 3,
    },
    subjectWise: [
      { code: "CS501", name: "Data Structures & Algorithms", teacher: "Dr. Ramesh Kumar", attended: 28, total: 30, percentage: 93, lastUpdated: "Jan 5, 2026" },
      { code: "CS502", name: "Computer Networks", teacher: "Dr. Priya Sharma", attended: 22, total: 28, percentage: 78, lastUpdated: "Jan 5, 2026" },
      { code: "CS503", name: "Operating Systems", teacher: "Dr. Arun Menon", attended: 27, total: 30, percentage: 90, lastUpdated: "Jan 4, 2026" },
      { code: "CS504", name: "Software Engineering", teacher: "Prof. Kavitha Nair", attended: 20, total: 24, percentage: 83, lastUpdated: "Jan 4, 2026" },
      { code: "CS505", name: "Data Structures Lab", teacher: "Dr. Ramesh Kumar", attended: 14, total: 15, percentage: 93, lastUpdated: "Jan 3, 2026" },
      { code: "CS506", name: "Computer Networks Lab", teacher: "Dr. Priya Sharma", attended: 11, total: 14, percentage: 78, lastUpdated: "Jan 3, 2026" },
    ],
    monthlyData: [
      { date: 1, status: "present" }, { date: 2, status: "present" }, { date: 3, status: "late" },
      { date: 4, status: "weekend" }, { date: 5, status: "weekend" }, { date: 6, status: "present" },
      { date: 7, status: "absent" }, { date: 8, status: "present" }, { date: 9, status: "present" },
      { date: 10, status: "present" }, { date: 11, status: "weekend" }, { date: 12, status: "weekend" },
      { date: 13, status: "present" }, { date: 14, status: "present" }, { date: 15, status: "holiday" },
      { date: 16, status: "present" }, { date: 17, status: "absent" }, { date: 18, status: "weekend" },
      { date: 19, status: "weekend" }, { date: 20, status: "present" }, { date: 21, status: "present" },
      { date: 22, status: "present" }, { date: 23, status: "late" }, { date: 24, status: "present" },
      { date: 25, status: "weekend" }, { date: 26, status: "holiday" }, { date: 27, status: "present" },
      { date: 28, status: "present" }, { date: 29, status: "present" }, { date: 30, status: "present" },
      { date: 31, status: null },
    ],
    leaveHistory: [
      { id: "leave-1", type: "Medical", from: "Dec 15, 2025", to: "Dec 17, 2025", days: 3, reason: "Fever and cold", status: "approved", appliedOn: "Dec 14, 2025" },
      { id: "leave-2", type: "Personal", from: "Nov 20, 2025", to: "Nov 21, 2025", days: 2, reason: "Family function", status: "approved", appliedOn: "Nov 15, 2025" },
      { id: "leave-3", type: "Medical", from: "Oct 5, 2025", to: "Oct 6, 2025", days: 2, reason: "Doctor appointment", status: "approved", appliedOn: "Oct 3, 2025" },
    ],
  },
  "child-2": {
    overview: {
      overall: 91,
      present: 138,
      absent: 10,
      late: 4,
      totalClasses: 152,
      trend: "up",
      change: 5,
    },
    subjectWise: [
      { code: "EC301", name: "Analog Circuits", teacher: "Dr. Suresh Pillai", attended: 26, total: 28, percentage: 93, lastUpdated: "Jan 5, 2026" },
      { code: "EC302", name: "Digital Electronics", teacher: "Dr. Meera Nair", attended: 28, total: 30, percentage: 93, lastUpdated: "Jan 5, 2026" },
      { code: "EC303", name: "Signals & Systems", teacher: "Prof. Vijay Kumar", attended: 25, total: 28, percentage: 89, lastUpdated: "Jan 4, 2026" },
      { code: "EC304", name: "Electromagnetic Theory", teacher: "Dr. Rajan Menon", attended: 24, total: 26, percentage: 92, lastUpdated: "Jan 4, 2026" },
    ],
    monthlyData: [
      { date: 1, status: "present" }, { date: 2, status: "present" }, { date: 3, status: "present" },
      { date: 4, status: "weekend" }, { date: 5, status: "weekend" }, { date: 6, status: "present" },
      { date: 7, status: "present" }, { date: 8, status: "present" }, { date: 9, status: "present" },
      { date: 10, status: "late" }, { date: 11, status: "weekend" }, { date: 12, status: "weekend" },
      { date: 13, status: "present" }, { date: 14, status: "present" }, { date: 15, status: "holiday" },
      { date: 16, status: "present" }, { date: 17, status: "present" }, { date: 18, status: "weekend" },
      { date: 19, status: "weekend" }, { date: 20, status: "present" }, { date: 21, status: "present" },
      { date: 22, status: "present" }, { date: 23, status: "present" }, { date: 24, status: "present" },
      { date: 25, status: "weekend" }, { date: 26, status: "holiday" }, { date: 27, status: "present" },
      { date: 28, status: "absent" }, { date: 29, status: "present" }, { date: 30, status: "present" },
      { date: 31, status: null },
    ],
    leaveHistory: [
      { id: "leave-1", type: "Medical", from: "Dec 28, 2025", to: "Dec 28, 2025", days: 1, reason: "Not feeling well", status: "approved", appliedOn: "Dec 27, 2025" },
    ],
  },
};

export default function ParentAttendance() {
  const [selectedChild, setSelectedChild] = useState(children[0].id);
  const [selectedMonth, setSelectedMonth] = useState("january");

  const currentChild = children.find((c) => c.id === selectedChild)!;
  const attendanceData = childAttendanceData[selectedChild];

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      case "holiday":
        return "bg-blue-300";
      case "weekend":
        return "bg-gray-200";
      default:
        return "bg-gray-100";
    }
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 85) return <Badge className="bg-green-500">{percentage}%</Badge>;
    if (percentage >= 75) return <Badge className="bg-yellow-500">{percentage}%</Badge>;
    return <Badge variant="destructive">{percentage}%</Badge>;
  };

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const lowAttendanceSubjects = attendanceData.subjectWise.filter(
    (subject) => subject.percentage < 75
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your child's attendance and leave history
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} ({child.rollNo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Low Attendance Warning */}
      {lowAttendanceSubjects.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Low Attendance Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {currentChild.name} has attendance below 75% in{" "}
                  <strong>{lowAttendanceSubjects.map((s) => s.name).join(", ")}</strong>.
                  Minimum 75% attendance is required to appear for exams.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{attendanceData.overview.overall}%</p>
                  {attendanceData.overview.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
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
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{attendanceData.overview.present}</p>
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
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{attendanceData.overview.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceData.overview.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{attendanceData.overview.totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subject" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subject">Subject-wise</TabsTrigger>
          <TabsTrigger value="calendar">Monthly Calendar</TabsTrigger>
          <TabsTrigger value="leaves">Leave History</TabsTrigger>
        </TabsList>

        {/* Subject-wise Attendance */}
        <TabsContent value="subject">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <CardDescription>
                Attendance breakdown for each subject - Semester {currentChild.semester}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-center">Classes Attended</TableHead>
                    <TableHead className="text-center">Total Classes</TableHead>
                    <TableHead className="w-[200px]">Progress</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.subjectWise.map((subject) => (
                    <TableRow key={subject.code}>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="font-mono mb-1">
                            {subject.code}
                          </Badge>
                          <p className="font-medium">{subject.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{subject.teacher}</TableCell>
                      <TableCell className="text-center font-medium">{subject.attended}</TableCell>
                      <TableCell className="text-center">{subject.total}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress
                            value={subject.percentage}
                            className={`h-2 ${
                              subject.percentage < 75 ? "[&>div]:bg-red-500" : ""
                            }`}
                          />
                          {subject.percentage < 75 && (
                            <p className="text-xs text-red-600">
                              Need {Math.ceil((0.75 * subject.total - subject.attended) / 0.25)} more classes
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getAttendanceBadge(subject.percentage)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {subject.lastUpdated}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Calendar */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Attendance</CardTitle>
                  <CardDescription>Day-by-day attendance view</CardDescription>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">January 2026</SelectItem>
                    <SelectItem value="december">December 2025</SelectItem>
                    <SelectItem value="november">November 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Legend */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-300" />
                  <span className="text-sm">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <span className="text-sm">Weekend</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells for January 2026 (starts on Thursday) */}
                {[...Array(4)].map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}

                {/* Date cells */}
                {attendanceData.monthlyData.map((day) =>
                  day.status !== null ? (
                    <div
                      key={day.date}
                      className={`p-2 rounded-lg text-center ${getStatusColor(
                        day.status
                      )} ${
                        day.status === "present" ||
                        day.status === "absent" ||
                        day.status === "late"
                          ? "text-white"
                          : ""
                      }`}
                    >
                      <span className="text-sm font-medium">{day.date}</span>
                    </div>
                  ) : (
                    <div key={day.date} className="p-2" />
                  )
                )}
              </div>

              {/* Monthly Summary */}
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <h4 className="font-medium mb-2">January 2026 Summary</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Working Days:</span>
                    <span className="ml-2 font-medium">22</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Present:</span>
                    <span className="ml-2 font-medium text-green-600">18</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Absent:</span>
                    <span className="ml-2 font-medium text-red-600">2</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Late:</span>
                    <span className="ml-2 font-medium text-yellow-600">2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave History */}
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leave History</CardTitle>
                  <CardDescription>All leave applications and their status</CardDescription>
                </div>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Apply for Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceData.leaveHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.leaveHistory.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <Badge variant="outline">{leave.type}</Badge>
                        </TableCell>
                        <TableCell>{leave.from}</TableCell>
                        <TableCell>{leave.to}</TableCell>
                        <TableCell className="text-center font-medium">{leave.days}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {leave.appliedOn}
                        </TableCell>
                        <TableCell>{getLeaveStatusBadge(leave.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-medium">No Leave Records</p>
                  <p className="text-muted-foreground">
                    No leave applications found for {currentChild.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Attendance Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Minimum Requirement</h4>
              <p className="text-sm text-blue-700">
                Students must maintain at least 75% attendance in each subject to be eligible for end-semester examinations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">Leave Application</h4>
              <p className="text-sm text-green-700">
                For planned absences, please apply for leave at least 2 days in advance. Medical leaves require a doctor's certificate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
