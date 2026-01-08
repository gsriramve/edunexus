"use client";

import { useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  FileText,
  UserCheck,
  Award,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useHodDashboard } from "@/hooks/use-hod-dashboard";

export default function HODDashboard() {
  const tenantId = useTenantId() || '';
  const [selectedSemester, setSelectedSemester] = useState("all");

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useHodDashboard(tenantId);

  // Show loading skeleton while data loads
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] md:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your department
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600">
                {error instanceof Error ? error.message : 'Failed to load dashboard'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please make sure you are assigned as HoD with a valid department.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from API response
  const department = dashboardData?.department;
  const hodInfo = dashboardData?.hodInfo;
  const stats = dashboardData?.stats || {
    totalFaculty: 0,
    totalStudents: 0,
    activeSubjects: 0,
    avgAttendance: 0,
    avgCGPA: 0,
    atRiskStudents: 0,
    presentToday: 0,
    onLeaveToday: 0,
  };
  const facultyOverview = dashboardData?.facultyOverview || [];
  const semesterOverview = dashboardData?.semesterOverview || [];
  const recentAlerts = dashboardData?.recentAlerts || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const pendingApprovals = dashboardData?.pendingApprovals || [];

  // Filter semesters based on selection
  const filteredSemesters = semesterOverview.filter((sem) => {
    if (selectedSemester === "all") return true;
    if (selectedSemester === "odd") return sem.semester % 2 === 1;
    if (selectedSemester === "even") return sem.semester % 2 === 0;
    return true;
  });

  const getAlertBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getEventBadge = (type: string) => {
    const badges: Record<string, string> = {
      meeting: "bg-blue-500",
      exam: "bg-red-500",
      event: "bg-purple-500",
      deadline: "bg-orange-500",
    };
    return <Badge className={badges[type] || "bg-gray-500"}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Dashboard</h1>
          <p className="text-muted-foreground">
            {department ? `${department.name} (${department.code})` : 'Loading...'} {hodInfo ? `• ${hodInfo.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faculty</p>
                <p className="text-2xl font-bold">{stats.totalFaculty}</p>
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
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
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
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-2xl font-bold">{stats.activeSubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-50">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg CGPA</p>
                <p className="text-2xl font-bold">{stats.avgCGPA || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.atRiskStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Faculty Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Faculty Overview</CardTitle>
                <CardDescription>Today's faculty status and workload</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {facultyOverview.length > 0 ? (
              <div className="space-y-4">
                {facultyOverview.map((faculty) => (
                  <div key={faculty.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {faculty.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">{faculty.designation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{faculty.subjectCount}</p>
                        <p className="text-muted-foreground">Subjects</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${faculty.attendancePercentage < 80 ? "text-red-600" : ""}`}>
                          {faculty.attendancePercentage}%
                        </p>
                        <p className="text-muted-foreground">Attendance</p>
                      </div>
                      <div className="text-center">
                        <Badge variant={faculty.classesToday > 0 ? "default" : "secondary"}>
                          {faculty.classesToday} classes
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No faculty data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>{pendingApprovals.length} items need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-xs text-muted-foreground">{item.submitted}</span>
                    </div>
                    <p className="text-sm font-medium">{item.from}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">Approve</Button>
                      <Button size="sm" variant="outline" className="flex-1">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending approvals
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Semester-wise Students & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Semester-wise Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Semester-wise Overview</CardTitle>
                <CardDescription>Student distribution and performance</CardDescription>
              </div>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sems</SelectItem>
                  <SelectItem value="odd">Odd Sems</SelectItem>
                  <SelectItem value="even">Even Sems</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSemesters.length > 0 ? (
              <div className="space-y-3">
                {filteredSemesters.map((sem) => (
                  <div key={sem.semester} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                    <div className="w-16 text-center">
                      <Badge variant="outline">Sem {sem.semester}</Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{sem.students} students</span>
                        <span className={sem.avgAttendance < 80 ? "text-red-600" : ""}>
                          {sem.avgAttendance}% att.
                        </span>
                      </div>
                      <Progress value={sem.avgAttendance} className="h-2" />
                    </div>
                    <div className="w-16 text-right">
                      <span className="font-medium">
                        {sem.avgCGPA ? sem.avgCGPA.toFixed(1) : "-"}
                      </span>
                      <p className="text-xs text-muted-foreground">CGPA</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No semester data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="mt-0.5">
                      {alert.severity === "high" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : alert.severity === "medium" ? (
                        <Clock className="h-4 w-4 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getAlertBadge(alert.severity)}
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No alerts at this time
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events & Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    {getEventBadge(event.type)}
                  </div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.date} • {event.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming events
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Faculty</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <GraduationCap className="h-6 w-6 mb-2" />
              <span>View Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              <span>Curriculum</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Timetable</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
