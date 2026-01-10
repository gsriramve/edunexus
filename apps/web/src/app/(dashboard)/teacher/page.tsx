"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  AlertCircle,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  PenLine,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useTeacherDashboard, type TeacherDashboardResponse, type ScheduleItemDto, type PendingTaskDto, type SubjectStatsDto } from "@/hooks/use-teacher-dashboard";

// Sample data for demo purposes when API fails
const sampleDashboardData: TeacherDashboardResponse = {
  teacher: {
    id: 'sample-teacher',
    name: 'Dr. Priya Sharma',
    employeeId: 'EMP001',
    department: 'Computer Science',
    departmentCode: 'CSE',
    designation: 'Assistant Professor',
    email: 'teacher@quantum-it.edu',
    subjectsCount: 3,
    totalStudents: 120,
  },
  quickStats: {
    totalStudents: 120,
    classesToday: 4,
    subjectsCount: 3,
    pendingTasks: 2,
    upcomingExams: 1,
    lowAttendanceStudents: 5,
  },
  todaySchedule: [
    {
      id: '1',
      time: '09:00 AM',
      subject: 'Data Structures',
      subjectCode: 'CS301',
      section: 'A',
      room: 'Room 201',
      type: 'Lecture',
      students: 45,
    },
    {
      id: '2',
      time: '11:00 AM',
      subject: 'Operating Systems',
      subjectCode: 'CS401',
      section: 'B',
      room: 'Lab 101',
      type: 'Lab',
      students: 30,
    },
    {
      id: '3',
      time: '02:00 PM',
      subject: 'Database Management',
      subjectCode: 'CS302',
      section: 'A',
      room: 'Room 305',
      type: 'Lecture',
      students: 45,
    },
  ],
  pendingTasks: [
    {
      id: '1',
      task: 'Mark attendance for Data Structures (CS301)',
      type: 'attendance',
      due: 'Today',
      urgent: true,
    },
    {
      id: '2',
      task: 'Enter marks for Mid-term Exam - Database Management',
      type: 'marks',
      due: 'This Week',
      urgent: false,
    },
  ],
  subjectStats: [
    {
      id: '1',
      subject: 'Data Structures',
      code: 'CS301',
      sections: 2,
      students: 90,
      avgAttendance: 82,
      classesThisWeek: 4,
    },
    {
      id: '2',
      subject: 'Operating Systems',
      code: 'CS401',
      sections: 1,
      students: 45,
      avgAttendance: 78,
      classesThisWeek: 3,
    },
    {
      id: '3',
      subject: 'Database Management',
      code: 'CS302',
      sections: 1,
      students: 45,
      avgAttendance: 85,
      classesThisWeek: 3,
    },
  ],
};

const quickActions = [
  { title: "Mark Attendance", icon: CheckCircle2, href: "/teacher/attendance", description: "Today's classes" },
  { title: "Enter Marks", icon: PenLine, href: "/teacher/marks", description: "Grades & scores" },
  { title: "Assignments", icon: FileText, href: "/teacher/assignments", description: "Create & grade" },
  { title: "Upload Materials", icon: Upload, href: "/teacher/materials", description: "Notes & PPTs" },
  { title: "My Students", icon: GraduationCap, href: "/teacher/students", description: "View all" },
  { title: "Reports", icon: TrendingUp, href: "/teacher/reports", description: "Analytics" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const tenantId = useTenantId() || "";
  const { data: dashboardData, isLoading, error } = useTeacherDashboard(tenantId);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "assignment":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "material":
        return <Upload className="h-4 w-4 text-green-500" />;
      case "marks":
        return <PenLine className="h-4 w-4 text-orange-500" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Use sample data if API fails or returns no data
  const effectiveData = dashboardData || sampleDashboardData;
  const isUsingDemoData = !dashboardData || error;

  const { teacher, quickStats, todaySchedule, pendingTasks, subjectStats } = effectiveData;

  const statsConfig = [
    { title: "Total Students", value: quickStats.totalStudents, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Classes Today", value: quickStats.classesToday, icon: Calendar, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Subjects", value: quickStats.subjectsCount, icon: BookOpen, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "Pending Tasks", value: quickStats.pendingTasks, icon: ClipboardList, color: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {teacher.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{greeting}, {teacher.name.split(" ").slice(-1)[0]}!</h1>
              {isUsingDemoData && (
                <Badge variant="secondary" className="text-xs">
                  Sample Data
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {teacher.designation} • {teacher.departmentCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/teacher/profile">
              View Profile
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/teacher/attendance">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Attendance
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats Row */}
      {(quickStats.upcomingExams > 0 || quickStats.lowAttendanceStudents > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {quickStats.upcomingExams > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                    <p className="text-2xl font-bold">{quickStats.upcomingExams}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {quickStats.lowAttendanceStudents > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-red-50">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Attendance Students</p>
                    <p className="text-2xl font-bold text-red-600">{quickStats.lowAttendanceStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </div>
            <Link href="/teacher/timetable">
              <Button variant="ghost" size="sm">
                Full Timetable
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedule.map((item: ScheduleItemDto, index: number) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index === 0 ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center w-20">
                        <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{item.time}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.section ? `${item.section} • ` : ""}{item.room || "Room TBD"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.students} students</p>
                        <Badge variant={item.type === "Lab" ? "default" : "outline"}>
                          {item.type}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/attendance?class=${item.id}`}>
                          Mark
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              pendingTasks.map((task: PendingTaskDto) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.urgent ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  {getTaskIcon(task.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                  </div>
                  {task.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject Overview */}
      {subjectStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>Current semester assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectStats.map((subject: SubjectStatsDto) => (
                <div key={subject.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {subject.code}
                        </Badge>
                        <span className="font-medium">{subject.subject}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {subject.sections} section(s) • {subject.students} students
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                      <div className="flex items-center gap-2">
                        <Progress value={subject.avgAttendance} className="h-2 flex-1" />
                        <span className={`text-sm font-medium ${subject.avgAttendance >= 75 ? "text-green-600" : "text-red-600"}`}>
                          {subject.avgAttendance}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Classes This Week</p>
                      <p className="font-medium">{subject.classesThisWeek}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-colors cursor-pointer">
                  <div className="p-3 rounded-full bg-primary/10 mb-3">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
