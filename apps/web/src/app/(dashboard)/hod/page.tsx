"use client";

import { useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
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

// Mock HOD data
const hodInfo = {
  name: "Dr. Ramesh Kumar",
  department: "Computer Science & Engineering",
  departmentCode: "CSE",
  designation: "Professor & Head",
};

const departmentStats = {
  totalFaculty: 24,
  totalStudents: 480,
  activeSubjects: 32,
  avgAttendance: 84,
  avgCGPA: 7.8,
  placementRate: 85,
};

const facultyOverview = [
  { id: 1, name: "Dr. Priya Sharma", designation: "Associate Professor", subjects: 3, attendance: 92, classesToday: 2 },
  { id: 2, name: "Dr. Arun Menon", designation: "Associate Professor", subjects: 2, attendance: 88, classesToday: 3 },
  { id: 3, name: "Prof. Kavitha Nair", designation: "Assistant Professor", subjects: 3, attendance: 95, classesToday: 1 },
  { id: 4, name: "Dr. Suresh Pillai", designation: "Associate Professor", subjects: 2, attendance: 78, classesToday: 2 },
  { id: 5, name: "Prof. Vijay Kumar", designation: "Assistant Professor", subjects: 3, attendance: 90, classesToday: 0 },
];

const semesterWiseStudents = [
  { semester: 1, students: 120, avgAttendance: 88, avgCGPA: null },
  { semester: 2, students: 118, avgAttendance: 85, avgCGPA: 7.5 },
  { semester: 3, students: 115, avgAttendance: 82, avgCGPA: 7.6 },
  { semester: 4, students: 112, avgAttendance: 80, avgCGPA: 7.8 },
  { semester: 5, students: 108, avgAttendance: 84, avgCGPA: 7.9 },
  { semester: 6, students: 105, avgAttendance: 86, avgCGPA: 8.0 },
  { semester: 7, students: 102, avgAttendance: 88, avgCGPA: 8.1 },
  { semester: 8, students: 100, avgAttendance: 90, avgCGPA: 8.2 },
];

const recentAlerts = [
  { id: 1, type: "attendance", message: "15 students in Sem 5 have attendance below 75%", severity: "high", time: "2 hours ago" },
  { id: 2, type: "faculty", message: "Dr. Suresh Pillai has 3 pending leave requests", severity: "medium", time: "4 hours ago" },
  { id: 3, type: "academic", message: "Internal marks entry deadline: Jan 15, 2026", severity: "medium", time: "1 day ago" },
  { id: 4, type: "placement", message: "TechCorp placement drive scheduled for Feb 10", severity: "low", time: "2 days ago" },
];

const upcomingEvents = [
  { id: 1, title: "Faculty Meeting", date: "Jan 8, 2026", time: "10:00 AM", type: "meeting" },
  { id: 2, title: "Internal Exam - Sem 5", date: "Jan 12, 2026", time: "9:00 AM", type: "exam" },
  { id: 3, title: "Guest Lecture - AI/ML", date: "Jan 15, 2026", time: "2:00 PM", type: "event" },
  { id: 4, title: "Marks Submission Deadline", date: "Jan 20, 2026", time: "5:00 PM", type: "deadline" },
];

const pendingApprovals = [
  { id: 1, type: "Leave Request", from: "Dr. Suresh Pillai", submitted: "Jan 5, 2026", days: 2 },
  { id: 2, type: "Lab Equipment", from: "Prof. Kavitha Nair", submitted: "Jan 4, 2026", amount: "₹45,000" },
  { id: 3, type: "Guest Lecture", from: "Dr. Arun Menon", submitted: "Jan 3, 2026", speaker: "Industry Expert" },
];

export default function HODDashboard() {
  const [selectedSemester, setSelectedSemester] = useState("all");

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
            {hodInfo.department} • {hodInfo.name}
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
                <p className="text-2xl font-bold">{departmentStats.totalFaculty}</p>
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
                <p className="text-2xl font-bold">{departmentStats.totalStudents}</p>
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
                <p className="text-2xl font-bold">{departmentStats.activeSubjects}</p>
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
                <p className="text-2xl font-bold">{departmentStats.avgAttendance}%</p>
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
                <p className="text-2xl font-bold">{departmentStats.avgCGPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-teal-50">
                <Target className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Placement</p>
                <p className="text-2xl font-bold">{departmentStats.placementRate}%</p>
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
                      <p className="font-medium">{faculty.subjects}</p>
                      <p className="text-muted-foreground">Subjects</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-medium ${faculty.attendance < 80 ? "text-red-600" : ""}`}>
                        {faculty.attendance}%
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
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>{pendingApprovals.length} items need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-xs text-muted-foreground">{item.submitted}</span>
                  </div>
                  <p className="text-sm font-medium">{item.from}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.days && `${item.days} days`}
                    {item.amount && item.amount}
                    {item.speaker && item.speaker}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {semesterWiseStudents.map((sem) => (
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
