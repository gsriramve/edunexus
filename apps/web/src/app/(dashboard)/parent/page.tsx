"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  Calendar,
  CreditCard,
  Bell,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Bus,
  BookOpen,
  Award,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useParentChildren } from "@/hooks/use-parents";
import { useStudentFees, useStudentAcademics } from "@/hooks/use-api";
import { useStudentAttendanceStats } from "@/hooks/use-attendance";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /parent/dashboard/activity - Recent activity for child
// - GET /parent/dashboard/notifications - Parent notifications
// - GET /parent/dashboard/events - Upcoming events
// - GET /parent/dashboard/performance - Subject-wise performance

// Mock data - Parent can have multiple children
const children = [
  {
    id: "child-1",
    name: "Rahul Sharma",
    rollNo: "21CSE101",
    class: "B.Tech CSE",
    semester: 5,
    photo: null,
  },
  {
    id: "child-2",
    name: "Priya Sharma",
    rollNo: "23ECE045",
    class: "B.Tech ECE",
    semester: 3,
    photo: null,
  },
];

const childData = {
  "child-1": {
    name: "Rahul Sharma",
    rollNo: "21CSE101",
    department: "Computer Science & Engineering",
    semester: 5,
    batchYear: 2021,
    cgpa: 8.5,
    sgpa: 8.7,
    attendancePercentage: 87,
    pendingFees: 45000,
    rank: 12,
    totalStudents: 120,
  },
  "child-2": {
    name: "Priya Sharma",
    rollNo: "23ECE045",
    department: "Electronics & Communication",
    semester: 3,
    batchYear: 2023,
    cgpa: 8.9,
    sgpa: 9.1,
    attendancePercentage: 92,
    pendingFees: 0,
    rank: 5,
    totalStudents: 110,
  },
};

const recentActivity = [
  { id: 1, type: "attendance", message: "Marked present in Data Structures", time: "Today, 9:15 AM", status: "positive" },
  { id: 2, type: "assignment", message: "Submitted DSA Assignment 3", time: "Yesterday, 4:30 PM", status: "positive" },
  { id: 3, type: "exam", message: "Mid-semester exam scheduled for Jan 15", time: "2 days ago", status: "info" },
  { id: 4, type: "attendance", message: "Absent in Computer Networks class", time: "3 days ago", status: "negative" },
  { id: 5, type: "fee", message: "Fee payment reminder: Due Jan 15", time: "3 days ago", status: "warning" },
];

const upcomingEvents = [
  { id: 1, title: "Mid-Semester Exams", date: "Jan 15-25, 2026", type: "exam" },
  { id: 2, title: "Parent-Teacher Meeting", date: "Jan 28, 2026", type: "meeting" },
  { id: 3, title: "Fee Payment Deadline", date: "Jan 15, 2026", type: "fee" },
  { id: 4, title: "Annual Day", date: "Feb 10, 2026", type: "event" },
];

const subjectPerformance = [
  { subject: "Data Structures", code: "CS501", marks: 85, attendance: 90, trend: "up" },
  { subject: "Computer Networks", code: "CS502", marks: 72, attendance: 78, trend: "down" },
  { subject: "Operating Systems", code: "CS503", marks: 88, attendance: 92, trend: "up" },
  { subject: "Software Engineering", code: "CS504", marks: 80, attendance: 85, trend: "stable" },
];

const notifications = [
  { id: 1, title: "Fee Reminder", message: "Semester fee of ₹45,000 due on Jan 15", type: "warning", unread: true },
  { id: 2, title: "Exam Schedule Released", message: "Mid-semester exam timetable is now available", type: "info", unread: true },
  { id: 3, title: "Low Attendance Alert", message: "Attendance in CN is below 80%", type: "alert", unread: false },
];

export default function ParentDashboard() {
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Fetch parent's children
  const { data: childrenData, isLoading: childrenLoading } = useParentChildren(tenantId, user?.id || '');
  const apiChildren = childrenData || [];

  // Set first child as default when children load
  useEffect(() => {
    if (apiChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(apiChildren[0].id);
    }
  }, [apiChildren, selectedChildId]);

  // Get selected child info from API
  const currentApiChild = useMemo(() => {
    const childRecord = apiChildren.find((c) => c.id === selectedChildId);
    if (!childRecord) return null;
    return {
      id: childRecord.id,
      name: `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown',
      rollNo: childRecord.rollNo || 'N/A',
      department: childRecord.department?.name || 'N/A',
      semester: childRecord.currentSemester || 1,
    };
  }, [apiChildren, selectedChildId]);

  // Fetch additional data for selected child
  const { data: feesData, isLoading: feesLoading } = useStudentFees(tenantId, selectedChildId);
  const { data: academicsData, isLoading: academicsLoading } = useStudentAcademics(tenantId, selectedChildId);
  const { data: attendanceStats, isLoading: attendanceLoading } = useStudentAttendanceStats(tenantId, selectedChildId);

  // Calculate pending fees from API
  const pendingFees = useMemo(() => {
    if (feesData && Array.isArray(feesData)) {
      return feesData
        .filter((fee) => fee.status === 'pending' || fee.status === 'partial')
        .reduce((sum, fee) => sum + (fee.amount - (fee.paidAmount || 0)), 0);
    }
    return 0;
  }, [feesData]);

  // Loading state
  if (childrenLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // No children state
  if (apiChildren.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your child's academic progress
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

  // Use API data when available, fallback to mock for demo
  // TODO: StudentAcademics API doesn't include cgpa, sgpa, rank, totalStudents yet
  // When backend adds them, update to use real values
  const currentChild = currentApiChild ? {
    name: currentApiChild.name,
    rollNo: currentApiChild.rollNo,
    department: currentApiChild.department,
    semester: currentApiChild.semester,
    batchYear: 2021,
    cgpa: 8.5, // Mock - StudentAcademics doesn't include this yet
    sgpa: 8.7, // Mock - StudentAcademics doesn't include this yet
    attendancePercentage: attendanceStats?.percentage || 0,
    pendingFees: pendingFees,
    rank: 12, // Mock - StudentAcademics doesn't include this yet
    totalStudents: 120, // Mock - StudentAcademics doesn't include this yet
  } : childData["child-1"];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <Calendar className="h-4 w-4" />;
      case "assignment":
        return <FileText className="h-4 w-4" />;
      case "exam":
        return <BookOpen className="h-4 w-4" />;
      case "fee":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "positive":
        return "text-green-500 bg-green-50";
      case "negative":
        return "text-red-500 bg-red-50";
      case "warning":
        return "text-orange-500 bg-orange-50";
      default:
        return "text-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Child Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {currentChild.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{currentChild.name}</h1>
            <p className="text-muted-foreground">
              {currentChild.rollNo} • {currentChild.department} • Sem {currentChild.semester}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {apiChildren.length > 1 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {apiChildren.map((childRecord) => {
                  const childName = `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown';
                  return (
                    <SelectItem key={childRecord.id} value={childRecord.id}>
                      {childName} ({childRecord.rollNo || 'N/A'})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/parent/notifications">
              <Bell className="mr-2 h-4 w-4" />
              {notifications.filter(n => n.unread).length} New
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="text-2xl font-bold">{currentChild.cgpa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current SGPA</p>
                <p className="text-2xl font-bold">{currentChild.sgpa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${currentChild.attendancePercentage >= 75 ? "bg-green-50" : "bg-red-50"}`}>
                <Calendar className={`h-6 w-6 ${currentChild.attendancePercentage >= 75 ? "text-green-600" : "text-red-600"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className={`text-2xl font-bold ${currentChild.attendancePercentage >= 75 ? "text-green-600" : "text-red-600"}`}>
                  {currentChild.attendancePercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Fees</p>
                <p className="text-2xl font-bold">
                  {currentChild.pendingFees > 0 ? `₹${(currentChild.pendingFees / 1000).toFixed(0)}K` : "Paid"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class Rank</p>
                <p className="text-2xl font-bold">{currentChild.rank}/{currentChild.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subject Performance */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Current semester progress</CardDescription>
            </div>
            <Link href="/parent/academics">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject) => (
                <div key={subject.code} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">{subject.code}</Badge>
                      <span className="font-medium">{subject.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {subject.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : subject.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className={`font-bold ${subject.marks >= 80 ? "text-green-600" : subject.marks < 60 ? "text-red-600" : ""}`}>
                        {subject.marks}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Marks</span>
                        <span>{subject.marks}%</span>
                      </div>
                      <Progress value={subject.marks} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className={subject.attendance < 75 ? "text-red-600" : ""}>{subject.attendance}%</span>
                      </div>
                      <Progress
                        value={subject.attendance}
                        className={`h-2 ${subject.attendance < 75 ? "[&>div]:bg-red-500" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Important updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${notification.unread ? "bg-blue-50/50 border-blue-200" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === "warning" ? "bg-orange-100" :
                    notification.type === "alert" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    {notification.type === "warning" ? (
                      <CreditCard className={`h-4 w-4 ${notification.type === "warning" ? "text-orange-600" : "text-blue-600"}`} />
                    ) : notification.type === "alert" ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Bell className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/parent/notifications">View All Notifications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates about {currentChild.name.split(" ")[0]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      event.type === "exam" ? "bg-purple-50" :
                      event.type === "meeting" ? "bg-blue-50" :
                      event.type === "fee" ? "bg-orange-50" : "bg-green-50"
                    }`}>
                      {event.type === "exam" ? (
                        <BookOpen className={`h-5 w-5 text-purple-600`} />
                      ) : event.type === "meeting" ? (
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      ) : event.type === "fee" ? (
                        <CreditCard className="h-5 w-5 text-orange-600" />
                      ) : (
                        <Calendar className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Link href="/parent/academics">
              <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Academics</span>
                <span className="text-xs text-muted-foreground">Grades & Results</span>
              </div>
            </Link>
            <Link href="/parent/attendance">
              <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Attendance</span>
                <span className="text-xs text-muted-foreground">View Records</span>
              </div>
            </Link>
            <Link href="/parent/fees">
              <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Fees</span>
                <span className="text-xs text-muted-foreground">Pay & History</span>
              </div>
            </Link>
            <Link href="/parent/communication">
              <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Messages</span>
                <span className="text-xs text-muted-foreground">Contact Teachers</span>
              </div>
            </Link>
            <Link href="/parent/transport">
              <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <Bus className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Transport</span>
                <span className="text-xs text-muted-foreground">Track Bus</span>
              </div>
            </Link>
            <Link href="/parent/calendar">
              <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-sm">Calendar</span>
                <span className="text-xs text-muted-foreground">Events & Exams</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Fee Alert */}
      {currentChild.pendingFees > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-orange-800">Fee Payment Due</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Semester fee of ₹{currentChild.pendingFees.toLocaleString()} is pending. Due date: January 15, 2026
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/parent/fees">Pay Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
