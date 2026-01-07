"use client";

import { useState } from "react";
import {
  Beaker,
  Users,
  ClipboardCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Monitor,
  Wrench,
  FileText,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useUser } from "@clerk/nextjs";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /lab-assistant/dashboard/stats - Lab-specific overview stats
// - GET /lab-assistant/labs - Labs assigned to this assistant
// - GET /lab-assistant/schedule/today - Today's lab schedule
// - GET /lab-assistant/schedule/week - Weekly lab schedule
// - GET /lab-assistant/attendance/recent - Recent attendance records
// - GET /lab-assistant/tasks/pending - Pending tasks for lab assistant
// - GET /lab-assistant/equipment/issues - Equipment issues in assigned labs
// - GET /staff/me - Get current lab assistant's staff profile

// Mock lab assistant data
const labAssistantInfo = {
  name: "Mr. Sunil Kumar",
  employeeId: "LAB-CSE-001",
  department: "Computer Science & Engineering",
  assignedLabs: ["Computer Networks Lab", "Data Structures Lab"],
};

const labStats = {
  totalLabs: 2,
  totalBatches: 8,
  studentsToday: 60,
  pendingMarks: 24,
  equipmentIssues: 3,
  attendanceMarked: 85,
};

const todaySchedule = [
  { id: 1, time: "9:00 AM - 12:00 PM", lab: "Computer Networks Lab", batch: "CSE-5A", students: 30, faculty: "Dr. Priya Sharma", status: "completed" },
  { id: 2, time: "2:00 PM - 5:00 PM", lab: "Data Structures Lab", batch: "CSE-5B", students: 30, faculty: "Prof. Vijay Kumar", status: "upcoming" },
];

const weekSchedule = [
  { day: "Monday", sessions: [{ lab: "CN Lab", batch: "5A", time: "9-12" }, { lab: "DS Lab", batch: "5B", time: "2-5" }] },
  { day: "Tuesday", sessions: [{ lab: "DS Lab", batch: "5A", time: "9-12" }, { lab: "CN Lab", batch: "5B", time: "2-5" }] },
  { day: "Wednesday", sessions: [{ lab: "CN Lab", batch: "3A", time: "9-12" }, { lab: "DS Lab", batch: "3B", time: "2-5" }] },
  { day: "Thursday", sessions: [{ lab: "DS Lab", batch: "3A", time: "9-12" }, { lab: "CN Lab", batch: "3B", time: "2-5" }] },
  { day: "Friday", sessions: [{ lab: "CN Lab", batch: "7A", time: "9-12" }] },
];

const recentAttendance = [
  { id: 1, batch: "CSE-5A", lab: "Computer Networks Lab", date: "Jan 6, 2026", present: 28, absent: 2, percentage: 93 },
  { id: 2, batch: "CSE-5B", lab: "Data Structures Lab", date: "Jan 5, 2026", present: 27, absent: 3, percentage: 90 },
  { id: 3, batch: "CSE-3A", lab: "Computer Networks Lab", date: "Jan 5, 2026", present: 29, absent: 1, percentage: 97 },
];

const pendingTasks = [
  { id: 1, type: "marks", title: "Enter Lab 8 marks - CSE-5A", lab: "CN Lab", dueDate: "Jan 8, 2026", priority: "high" },
  { id: 2, type: "marks", title: "Enter Lab 7 marks - CSE-5B", lab: "DS Lab", dueDate: "Jan 10, 2026", priority: "medium" },
  { id: 3, type: "equipment", title: "Report faulty system in Lab 2", lab: "CN Lab", dueDate: "Jan 7, 2026", priority: "high" },
  { id: 4, type: "attendance", title: "Submit weekly attendance report", lab: "All Labs", dueDate: "Jan 7, 2026", priority: "medium" },
];

const equipmentAlerts = [
  { id: 1, lab: "Computer Networks Lab", item: "System #15", issue: "Network card not working", reportedOn: "Jan 5, 2026", status: "pending" },
  { id: 2, lab: "Data Structures Lab", item: "System #8", issue: "Monitor display issue", reportedOn: "Jan 4, 2026", status: "in_progress" },
  { id: 3, lab: "Computer Networks Lab", item: "Router #2", issue: "Intermittent connectivity", reportedOn: "Jan 3, 2026", status: "pending" },
];

export default function LabAssistantDashboard() {
  const tenantId = useTenantId() || '';
  const { user, isLoaded: userLoaded } = useUser();

  // Show loading skeleton while user data loads
  if (!userLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-7 w-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  // Get display name from Clerk or fallback to mock
  const displayName = user?.fullName || user?.firstName || labAssistantInfo.name;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "ongoing":
        return <Badge className="bg-orange-500">Ongoing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Assistant Dashboard</h1>
          <p className="text-muted-foreground">
            {displayName} • {labAssistantInfo.department}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Weekly Report
          </Button>
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Beaker className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Labs</p>
                <p className="text-2xl font-bold">{labStats.totalLabs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Batches</p>
                <p className="text-2xl font-bold">{labStats.totalBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students Today</p>
                <p className="text-2xl font-bold">{labStats.studentsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <ClipboardCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold">{labStats.attendanceMarked}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Marks</p>
                <p className="text-2xl font-bold text-red-600">{labStats.pendingMarks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipment Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{labStats.equipmentIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule & Pending Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Lab sessions for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border ${
                    session.status === "upcoming" ? "border-blue-200 bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.time}</span>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  <h4 className="font-semibold">{session.lab}</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.batch} • {session.students} students • {session.faculty}
                  </p>
                  {session.status === "upcoming" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">Start Session</Button>
                      <Button size="sm" variant="outline">View Students</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium">{task.title}</span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{task.type}</Badge>
                    <span>{task.lab}</span>
                    <span>•</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule & Recent Attendance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Your lab sessions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekSchedule.map((day) => (
                <div key={day.day} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted">
                  <div className="w-24 font-medium">{day.day}</div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {day.sessions.map((session, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {session.lab} - {session.batch} ({session.time})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Last marked attendance records</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{record.batch}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.lab} • {record.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={record.percentage >= 90 ? "bg-green-500" : "bg-yellow-500"}>
                      {record.percentage}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {record.present}P / {record.absent}A
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-yellow-500" />
                Equipment Issues
              </CardTitle>
              <CardDescription>Reported equipment problems</CardDescription>
            </div>
            <Button variant="outline">
              <Monitor className="mr-2 h-4 w-4" />
              Report New Issue
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {equipmentAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{alert.lab}</Badge>
                    <Badge
                      className={alert.status === "pending" ? "bg-red-500" : "bg-yellow-500"}
                    >
                      {alert.status === "pending" ? "Pending" : "In Progress"}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{alert.item}</h4>
                  <p className="text-sm text-muted-foreground">{alert.issue}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reported: {alert.reportedOn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <ClipboardCheck className="h-6 w-6 mb-2" />
              <span>Mark Attendance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Enter Marks</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Monitor className="h-6 w-6 mb-2" />
              <span>Equipment Status</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>View Schedule</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
