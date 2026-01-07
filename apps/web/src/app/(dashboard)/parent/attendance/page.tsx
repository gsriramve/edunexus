"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
  Users,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useParentChildren } from "@/hooks/use-parents";
import {
  useStudentAttendance,
  useStudentAttendanceStats,
  useStudentSubjectAttendance,
} from "@/hooks/use-attendance";

export default function ParentAttendance() {
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState("january");

  // Fetch parent's children
  const { data: childrenData, isLoading: childrenLoading } = useParentChildren(tenantId, user?.id || '');
  const children = childrenData || [];

  // Set first child as default when children load
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Get selected child info
  const currentChild = useMemo(() => {
    const childRecord = children.find((c) => c.id === selectedChildId);
    if (!childRecord) return null;
    return {
      id: childRecord.id,
      name: `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown',
      rollNo: childRecord.rollNo || 'N/A',
      department: 'N/A', // ParentChild doesn't have department info
      semester: childRecord.currentSemester || 0,
    };
  }, [children, selectedChildId]);

  // Fetch attendance data for selected child
  const { data: attendanceRecords, isLoading: attendanceLoading } = useStudentAttendance(tenantId, selectedChildId);
  const { data: attendanceStats, isLoading: statsLoading } = useStudentAttendanceStats(tenantId, selectedChildId);
  const { data: subjectAttendance, isLoading: subjectLoading } = useStudentSubjectAttendance(tenantId, selectedChildId);

  // Derive attendance overview from API data
  const attendanceOverview = useMemo(() => {
    if (attendanceStats) {
      return {
        overall: attendanceStats.percentage || 0,
        present: attendanceStats.present || 0,
        absent: attendanceStats.absent || 0,
        late: attendanceStats.late || 0,
        totalClasses: attendanceStats.totalDays || 0,
        trend: 'up' as const, // Would need historical data to determine
        change: 0,
      };
    }
    return {
      overall: 0,
      present: 0,
      absent: 0,
      late: 0,
      totalClasses: 0,
      trend: 'up' as const,
      change: 0,
    };
  }, [attendanceStats]);

  // Derive subject-wise data from API
  const subjectWiseData = useMemo(() => {
    if (subjectAttendance && Array.isArray(subjectAttendance)) {
      return subjectAttendance.map((subject) => ({
        code: subject.subjectCode || 'N/A',
        name: subject.subjectName || 'Unknown',
        teacher: 'N/A', // SubjectAttendance doesn't have teacher info
        attended: subject.present || 0,
        total: subject.totalClasses || 0,
        percentage: subject.percentage || 0,
        lastUpdated: 'N/A', // SubjectAttendance doesn't have lastUpdated
      }));
    }
    return [];
  }, [subjectAttendance]);

  // Derive monthly calendar data from attendance records
  const monthlyData = useMemo(() => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) return [];

    // Create a map of dates in the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const dailyStatus: Array<{ date: number; status: 'present' | 'absent' | 'late' | 'holiday' | 'weekend' | null }> = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dayOfWeek = date.getDay();

      // Check if weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dailyStatus.push({ date: i, status: 'weekend' });
        continue;
      }

      // Find attendance record for this date
      const record = attendanceRecords.find((r) => {
        const recordDate = new Date(r.date);
        return recordDate.getDate() === i && recordDate.getMonth() === currentMonth;
      });

      if (record) {
        dailyStatus.push({ date: i, status: record.status as 'present' | 'absent' | 'late' });
      } else {
        dailyStatus.push({ date: i, status: null });
      }
    }

    return dailyStatus;
  }, [attendanceRecords]);

  // Leave history would need its own API - using empty for now
  const leaveHistory: Array<{ id: string; type: string; from: string; to: string; days: number; reason: string; status: string; appliedOn: string }> = [];

  const isLoading = childrenLoading || (selectedChildId && (attendanceLoading || statsLoading || subjectLoading));

  // Loading state
  if (childrenLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your child's attendance and leave history
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Children Linked</h3>
              <p>No children are currently linked to your account.</p>
              <p className="text-sm mt-2">Please contact the school administration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentChild) return null;

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

  const lowAttendanceSubjects = subjectWiseData.filter(
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
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((childRecord) => {
                const childName = `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown';
                return (
                  <SelectItem key={childRecord.id} value={childRecord.id}>
                    {childName} ({childRecord.rollNo || 'N/A'})
                  </SelectItem>
                );
              })}
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
                  <p className="text-2xl font-bold">{attendanceOverview.overall}%</p>
                  {attendanceOverview.trend === "up" ? (
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
                <p className="text-2xl font-bold text-green-600">{attendanceOverview.present}</p>
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
                <p className="text-2xl font-bold text-red-600">{attendanceOverview.absent}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{attendanceOverview.late}</p>
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
                <p className="text-2xl font-bold">{attendanceOverview.totalClasses}</p>
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
                  {subjectWiseData.length > 0 ? (
                    subjectWiseData.map((subject) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No subject attendance data available
                      </TableCell>
                    </TableRow>
                  )}
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
                {monthlyData.length > 0 ? (
                  monthlyData.map((day) =>
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
                  )
                ) : (
                  <div className="col-span-7 text-center py-8 text-muted-foreground">
                    No calendar data available
                  </div>
                )}
              </div>

              {/* Monthly Summary */}
              {monthlyData.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">
                    {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Summary
                  </h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Working Days:</span>
                      <span className="ml-2 font-medium">
                        {monthlyData.filter(d => d.status !== 'weekend' && d.status !== 'holiday' && d.status !== null).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Present:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {monthlyData.filter(d => d.status === 'present').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Absent:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {monthlyData.filter(d => d.status === 'absent').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Late:</span>
                      <span className="ml-2 font-medium text-yellow-600">
                        {monthlyData.filter(d => d.status === 'late').length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
              {leaveHistory.length > 0 ? (
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
                    {leaveHistory.map((leave) => (
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
