"use client";

import {
  Beaker,
  Users,
  ClipboardCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Monitor,
  Wrench,
  FileText,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import { useLabAssistantDashboard } from "@/hooks/use-lab-assistant";

function LoadingSkeleton() {
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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

export default function LabAssistantDashboard() {
  const tenantId = useTenantId() || '';

  const { data, isLoading, error } = useLabAssistantDashboard(tenantId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const labAssistantInfo = data?.labAssistantInfo;
  const labStats = data?.stats;
  const todaySchedule = data?.todaySchedule || [];
  const weekSchedule = data?.weekSchedule || [];
  const recentAttendance = data?.recentAttendance || [];
  const pendingTasks = data?.pendingTasks || [];
  const equipmentAlerts = data?.equipmentAlerts || [];

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
            {labAssistantInfo?.name || 'Lab Assistant'} • {labAssistantInfo?.department || 'Department'}
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 shrink-0">
                <Beaker className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">My Labs</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{labStats?.totalLabs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 shrink-0">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Batches</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{labStats?.totalBatches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 shrink-0">
                <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Students Today</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{labStats?.studentsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950 shrink-0">
                <ClipboardCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{labStats?.attendanceMarked || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 shrink-0">
                <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Pending Marks</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">{labStats?.pendingMarks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950 shrink-0">
                <Wrench className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Equipment Issues</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">{labStats?.equipmentIssues || 0}</p>
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
            {todaySchedule.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">No sessions scheduled for today</p>
            )}
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
            {pendingTasks.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">No pending tasks</p>
            )}
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
            {weekSchedule.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">No schedule available</p>
            )}
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
            {recentAttendance.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent attendance records</p>
            )}
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
          {equipmentAlerts.length > 0 ? (
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
          ) : (
            <p className="text-center text-muted-foreground py-8">No equipment issues reported</p>
          )}
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
