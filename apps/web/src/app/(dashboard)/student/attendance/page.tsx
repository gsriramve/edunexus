"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId } from "@/hooks/use-api";
import {
  useStudentAttendance,
  useStudentAttendanceStats,
  useStudentSubjectAttendance,
} from "@/hooks/use-attendance";

export default function StudentAttendance() {
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Get student data for context
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  // Fetch attendance data using hooks
  const { data: attendanceRecords, isLoading: attendanceLoading } = useStudentAttendance(tenantId, studentId);
  const { data: attendanceStats, isLoading: statsLoading } = useStudentAttendanceStats(tenantId, studentId);
  const { data: subjectAttendance, isLoading: subjectLoading } = useStudentSubjectAttendance(tenantId, studentId);

  // Calculate stats from API data or use defaults
  const attendanceOverview = useMemo(() => {
    if (attendanceStats) {
      return {
        totalClasses: attendanceStats.totalDays || 0,
        present: attendanceStats.present || 0,
        absent: attendanceStats.absent || 0,
        late: attendanceStats.late || 0,
        percentage: attendanceStats.percentage || 0,
        requiredPercentage: 75,
      };
    }
    return {
      totalClasses: 0,
      present: 0,
      absent: 0,
      late: 0,
      percentage: 0,
      requiredPercentage: 75,
    };
  }, [attendanceStats]);

  // Subject-wise attendance from API
  const subjectWiseAttendance = useMemo(() => {
    if (subjectAttendance && Array.isArray(subjectAttendance)) {
      return subjectAttendance.map((subject) => ({
        code: subject.subjectCode || 'N/A',
        name: subject.subjectName || 'Unknown Subject',
        total: subject.totalClasses || 0,
        present: subject.present || 0,
        percentage: subject.percentage || 0,
      }));
    }
    return [];
  }, [subjectAttendance]);

  // Recent attendance records from API
  const recentAttendance = useMemo(() => {
    if (attendanceRecords && Array.isArray(attendanceRecords)) {
      return attendanceRecords.slice(0, 10).map((record) => ({
        date: record.date,
        subject: record.subject?.name || 'N/A',
        status: record.status,
        time: record.time || 'N/A',
      }));
    }
    return [];
  }, [attendanceRecords]);

  // Calculate monthly trend from attendance records
  const monthlyTrend = useMemo(() => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) return [];

    const monthData: Record<string, { total: number; present: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthData[monthKey]) {
        monthData[monthKey] = { total: 0, present: 0 };
      }
      monthData[monthKey].total++;
      if (record.status === 'present' || record.status === 'late') {
        monthData[monthKey].present++;
      }
    });

    return Object.entries(monthData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, data]) => {
        const [, monthIdx] = key.split('-');
        return {
          month: monthNames[parseInt(monthIdx)],
          percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        };
      });
  }, [attendanceRecords]);

  const isLoading = studentLoading || attendanceLoading || statsLoading || subjectLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-32 md:col-span-2" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

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
          {subjectWiseAttendance.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No subject attendance data available</p>
            </div>
          )}
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
            {monthlyTrend.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trend data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Records</CardTitle>
              <CardDescription>Last 10 attendance entries</CardDescription>
            </div>
            {subjectWiseAttendance.length > 0 && (
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
            )}
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance records yet</p>
              </div>
            )}
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
