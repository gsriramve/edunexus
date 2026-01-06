"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [selectedChild, setSelectedChild] = useState("child-1");
  const currentChild = childData[selectedChild as keyof typeof childData];

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
          {children.length > 1 && (
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} ({child.rollNo})
                  </SelectItem>
                ))}
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
