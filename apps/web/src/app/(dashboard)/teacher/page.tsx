"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Bell,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  PenLine,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data
const teacherData = {
  id: "teacher-001",
  name: "Dr. Ramesh Kumar",
  employeeId: "EMP2020001",
  department: "Computer Science & Engineering",
  departmentCode: "CSE",
  designation: "Associate Professor",
  email: "ramesh.kumar@college.edu",
  subjects: 3,
  totalStudents: 180,
};

const todaySchedule = [
  { id: 1, time: "09:00 AM", subject: "Data Structures", section: "CSE-A", room: "Room 301", type: "Lecture", students: 60 },
  { id: 2, time: "11:00 AM", subject: "Data Structures", section: "CSE-B", room: "Room 302", type: "Lecture", students: 58 },
  { id: 3, time: "02:00 PM", subject: "Data Structures Lab", section: "CSE-A (Batch 1)", room: "Lab 3", type: "Lab", students: 30 },
  { id: 4, time: "04:00 PM", subject: "Algorithms", section: "CSE-C", room: "Room 205", type: "Lecture", students: 55 },
];

const pendingTasks = [
  { id: 1, task: "Mark attendance for CSE-B", type: "attendance", due: "Today", urgent: true },
  { id: 2, task: "Grade Assignment 3 - Data Structures", type: "assignment", due: "Tomorrow", urgent: false },
  { id: 3, task: "Upload lecture notes - Week 8", type: "material", due: "Jan 10", urgent: false },
  { id: 4, task: "Enter internal marks - Mid Semester", type: "marks", due: "Jan 12", urgent: true },
];

const recentSubmissions = [
  { id: 1, student: "Rahul Sharma", rollNo: "21CSE101", assignment: "DSA Assignment 3", time: "2 hours ago" },
  { id: 2, student: "Priya Patel", rollNo: "21CSE045", assignment: "DSA Assignment 3", time: "3 hours ago" },
  { id: 3, student: "Amit Singh", rollNo: "21CSE078", assignment: "DSA Assignment 3", time: "5 hours ago" },
  { id: 4, student: "Sneha Reddy", rollNo: "21CSE112", assignment: "Algorithms Quiz 2", time: "1 day ago" },
];

const subjectStats = [
  { subject: "Data Structures", code: "CS501", sections: 2, students: 118, avgAttendance: 85, pendingAssignments: 45 },
  { subject: "Data Structures Lab", code: "CS505", sections: 2, students: 60, avgAttendance: 92, pendingAssignments: 12 },
  { subject: "Algorithms", code: "CS502", sections: 1, students: 55, avgAttendance: 78, pendingAssignments: 20 },
];

const quickStats = [
  { title: "Total Students", value: teacherData.totalStudents, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
  { title: "Classes Today", value: todaySchedule.length, icon: Calendar, color: "text-green-600", bgColor: "bg-green-50" },
  { title: "Subjects", value: teacherData.subjects, icon: BookOpen, color: "text-purple-600", bgColor: "bg-purple-50" },
  { title: "Pending Tasks", value: pendingTasks.length, icon: ClipboardList, color: "text-orange-600", bgColor: "bg-orange-50" },
];

const quickActions = [
  { title: "Mark Attendance", icon: CheckCircle2, href: "/teacher/attendance", description: "Today's classes" },
  { title: "Enter Marks", icon: PenLine, href: "/teacher/marks", description: "Grades & scores" },
  { title: "Assignments", icon: FileText, href: "/teacher/assignments", description: "Create & grade" },
  { title: "Upload Materials", icon: Upload, href: "/teacher/materials", description: "Notes & PPTs" },
  { title: "My Students", icon: GraduationCap, href: "/teacher/students", description: "View all" },
  { title: "Reports", icon: TrendingUp, href: "/teacher/reports", description: "Analytics" },
];

export default function TeacherDashboard() {
  const [greeting, setGreeting] = useState("Good morning");

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {teacherData.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{greeting}, {teacherData.name.split(" ")[1]}!</h1>
            <p className="text-muted-foreground">
              {teacherData.designation} • {teacherData.departmentCode}
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
        {quickStats.map((stat) => (
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
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
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
                        {item.section} • {item.room}
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
            {pendingTasks.map((task) => (
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
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Overview */}
        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>Current semester assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStats.map((subject) => (
                <div key={subject.code} className="p-4 rounded-lg border">
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg. Attendance</p>
                      <div className="flex items-center gap-2">
                        <Progress value={subject.avgAttendance} className="h-2 flex-1" />
                        <span className={`font-medium ${subject.avgAttendance >= 75 ? "text-green-600" : "text-red-600"}`}>
                          {subject.avgAttendance}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending Submissions</p>
                      <p className="font-medium">{subject.pendingAssignments} assignments</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest assignment submissions</CardDescription>
            </div>
            <Link href="/teacher/assignments">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {submission.student.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{submission.student}</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.rollNo} • {submission.assignment}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{submission.time}</p>
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
