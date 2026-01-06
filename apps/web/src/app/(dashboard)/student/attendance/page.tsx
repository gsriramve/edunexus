"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Mock data
const attendanceOverview = {
  totalClasses: 120,
  present: 102,
  absent: 12,
  late: 6,
  percentage: 85,
  requiredPercentage: 75,
};

const subjectWiseAttendance = [
  { code: "CS501", name: "Data Structures & Algorithms", total: 24, present: 20, percentage: 83 },
  { code: "CS502", name: "Computer Networks", total: 22, present: 17, percentage: 77 },
  { code: "CS503", name: "Operating Systems", total: 24, present: 22, percentage: 92 },
  { code: "CS504", name: "Software Engineering", total: 20, present: 17, percentage: 85 },
  { code: "CS505", name: "Data Structures Lab", total: 15, present: 14, percentage: 93 },
  { code: "CS506", name: "Computer Networks Lab", total: 15, present: 12, percentage: 80 },
];

const recentAttendance = [
  { date: "2026-01-06", subject: "Data Structures", status: "present", time: "09:00 AM" },
  { date: "2026-01-06", subject: "Computer Networks Lab", status: "present", time: "02:00 PM" },
  { date: "2026-01-05", subject: "Operating Systems", status: "present", time: "09:00 AM" },
  { date: "2026-01-05", subject: "Software Engineering", status: "late", time: "11:15 AM" },
  { date: "2026-01-04", subject: "Data Structures", status: "present", time: "09:00 AM" },
  { date: "2026-01-04", subject: "Computer Networks", status: "absent", time: "11:00 AM" },
  { date: "2026-01-03", subject: "Operating Systems", status: "present", time: "09:00 AM" },
  { date: "2026-01-03", subject: "Data Structures Lab", status: "present", time: "02:00 PM" },
  { date: "2026-01-02", subject: "Computer Networks", status: "present", time: "09:00 AM" },
  { date: "2026-01-02", subject: "Software Engineering", status: "present", time: "11:00 AM" },
];

const monthlyTrend = [
  { month: "Aug", percentage: 92 },
  { month: "Sep", percentage: 88 },
  { month: "Oct", percentage: 82 },
  { month: "Nov", percentage: 85 },
  { month: "Dec", percentage: 87 },
  { month: "Jan", percentage: 85 },
];

export default function StudentAttendance() {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-500">Late</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track your attendance across all subjects
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-4xl font-bold">{attendanceOverview.percentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Required: {attendanceOverview.requiredPercentage}%
                </p>
              </div>
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - attendanceOverview.percentage / 100)}`}
                    className={attendanceOverview.percentage >= 75 ? "text-green-500" : "text-red-500"}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {attendanceOverview.percentage >= 75 ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-500" />
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
                <p className="text-2xl font-bold">{attendanceOverview.present}</p>
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
                <p className="text-2xl font-bold">{attendanceOverview.absent}</p>
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
                <p className="text-2xl font-bold">{attendanceOverview.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
          <CardDescription>Your attendance in each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectWiseAttendance.map((subject) => (
              <div key={subject.code} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {subject.code}
                    </Badge>
                    <span className="text-sm font-medium">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {subject.present}/{subject.total} classes
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        subject.percentage >= 75 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {subject.percentage}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={subject.percentage}
                  className={`h-2 ${subject.percentage < 75 ? "[&>div]:bg-red-500" : ""}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend & Recent Records */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
            <CardDescription>Your attendance pattern over months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t ${
                      month.percentage >= 75 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ height: `${month.percentage}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                  <span className="text-xs font-medium">{month.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Records</CardTitle>
              <CardDescription>Last 10 attendance entries</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjectWiseAttendance.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium">{record.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })} • {record.time}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Warning */}
      {subjectWiseAttendance.some((s) => s.percentage < 75) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Low Attendance Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  Your attendance is below 75% in the following subjects:
                </p>
                <ul className="mt-2 space-y-1">
                  {subjectWiseAttendance
                    .filter((s) => s.percentage < 75)
                    .map((s) => (
                      <li key={s.code} className="text-sm text-red-700">
                        • {s.name} ({s.percentage}%)
                      </li>
                    ))}
                </ul>
                <p className="text-sm text-red-700 mt-2">
                  Please ensure you maintain minimum 75% attendance to be eligible for exams.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
