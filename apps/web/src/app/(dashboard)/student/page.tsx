"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  BookOpen,
  Calendar,
  Clock,
  CreditCard,
  GraduationCap,
  Bell,
  TrendingUp,
  FileText,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId, useStudentDashboard, useStudentAcademics } from "@/hooks/use-api";
import { CareerPathVisualizer } from "@/components/insights";
import { useStudentCGPA } from "@/hooks/use-exams";
import { type StudentScheduleItem, type StudentNotification, type AIInsight } from "@/lib/api";

// Fallback data when API returns empty
const defaultNotifications: StudentNotification[] = [
  { id: '1', title: "Welcome", message: "Welcome to your student dashboard", time: "Just now", type: "info", createdAt: new Date().toISOString(), read: false },
];

const defaultAiInsights: AIInsight[] = [
  { type: 'welcome', text: "Welcome! Complete your profile to get personalized insights", positive: true },
  { type: 'tip', text: "Attend classes regularly to maintain good standing", positive: true },
  { type: 'tip', text: "Check the career hub for placement opportunities", positive: true },
];

const quickActions = [
  { title: "Academics", icon: BookOpen, href: "/student/academics", description: "Subjects & Materials" },
  { title: "Attendance", icon: Calendar, href: "/student/attendance", description: "View Records" },
  { title: "Fees", icon: CreditCard, href: "/student/fees", description: "Pay & History" },
  { title: "Exams", icon: FileText, href: "/student/exams", description: "Schedule & Results" },
  { title: "Career Hub", icon: Target, href: "/student/career", description: "Placements" },
  { title: "Practice", icon: Sparkles, href: "/student/practice", description: "Mock Tests" },
];

export default function StudentDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId() || '';
  const [greeting, setGreeting] = useState("Good morning");

  // Fetch student data
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useStudentDashboard(tenantId, studentId);

  // Fetch academics for progress display
  const { data: academicsData, isLoading: academicsLoading } = useStudentAcademics(tenantId, studentId);

  // Fetch CGPA
  const { data: cgpaData } = useStudentCGPA(tenantId, studentId);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const isLoading = authLoading || studentLoading || dashboardLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // Derive display data
  const firstName = user?.name?.split(' ')[0] || dashboardData?.name?.split(' ')[0] || studentData?.user?.name?.split(' ')[0] || 'Student';
  const fullName = user?.name || dashboardData?.name || studentData?.user?.name || 'Student';
  const photoUrl = studentData?.user?.profile?.photoUrl || '';
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const rollNo = dashboardData?.rollNo || studentData?.rollNo || 'N/A';
  const departmentCode = dashboardData?.departmentCode || studentData?.department?.code || '';
  const semester = dashboardData?.semester || studentData?.semester || 0;
  const cgpa = cgpaData ?? dashboardData?.cgpa ?? 0;
  const attendancePercentage = dashboardData?.attendancePercentage ?? 0;
  const pendingFees = dashboardData?.pendingFees ?? 0;
  const upcomingExams = dashboardData?.upcomingExams ?? 0;
  const notificationCount = dashboardData?.notifications ?? 0;

  // Get real notifications and AI insights from API
  const recentNotifications: StudentNotification[] =
    (dashboardData?.recentNotifications && dashboardData.recentNotifications.length > 0)
      ? dashboardData.recentNotifications
      : defaultNotifications;
  const aiInsights: AIInsight[] =
    (dashboardData?.aiInsights && dashboardData.aiInsights.length > 0)
      ? dashboardData.aiInsights
      : defaultAiInsights;

  const quickStats = [
    { title: "Attendance", value: `${attendancePercentage}%`, icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "CGPA", value: cgpa > 0 ? cgpa.toFixed(1) : 'N/A', icon: GraduationCap, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Pending Fees", value: pendingFees > 0 ? `₹${(pendingFees / 1000).toFixed(0)}K` : '₹0', icon: CreditCard, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Exams", value: upcomingExams, icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  // Get subjects for academic progress
  const subjects = academicsData?.subjects || [];

  // Get today's schedule from dashboard data
  const todaySchedule: StudentScheduleItem[] = dashboardData?.todaySchedule || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={photoUrl} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{greeting}, {firstName}!</h1>
            <p className="text-muted-foreground">
              {rollNo} • {departmentCode || 'N/A'} • {semester > 0 ? `Semester ${semester}` : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/student/profile">
              View Profile
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/student/notifications">
              <Bell className="mr-2 h-4 w-4" />
              {notificationCount > 0 ? `${notificationCount} New` : 'Notifications'}
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
            <Link href="/student/timetable">
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
                {todaySchedule.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      index === 0 ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center w-20">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-sm font-medium">{item.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.room || 'Room TBD'} • {item.teacher}
                      </p>
                    </div>
                    <Badge variant={item.type === "Lab" ? "default" : "outline"}>
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Insights
            </CardTitle>
            <CardDescription>Personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsights.map((insight, index) => {
              const IconComponent = insight.type === 'performance' ? TrendingUp
                : insight.type === 'focus' ? Target
                : insight.type === 'attendance' ? Calendar
                : insight.type === 'placement' ? Sparkles
                : insight.type === 'fees' ? CreditCard
                : Sparkles;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    insight.positive ? "bg-green-50" : "bg-amber-50"
                  }`}
                >
                  <IconComponent
                    className={`h-5 w-5 mt-0.5 ${
                      insight.positive ? "text-green-600" : "text-amber-600"
                    }`}
                  />
                  <p className="text-sm">{insight.text}</p>
                </div>
              );
            })}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/student/insights">
                View All Insights
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Career Path Visualizer */}
      {studentId && (
        <CareerPathVisualizer
          tenantId={tenantId}
          studentId={studentId}
          onAlumniClick={(alumniId) => {
            // Navigate to alumni profile or start chat
            console.log('Connect with alumni:', alumniId);
          }}
        />
      )}

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent updates</CardDescription>
            </div>
            <Link href="/student/notifications">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      notification.type === "error"
                        ? "bg-red-500"
                        : notification.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Academic Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Progress</CardTitle>
            <CardDescription>
              {semester > 0 ? `Semester ${semester} performance` : 'Your subjects'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {academicsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : subjects.length > 0 ? (
              <>
                {subjects.slice(0, 4).map((subject) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{subject.name}</span>
                      <span className="font-medium">{subject.credits} credits</span>
                    </div>
                    <Progress value={Math.random() * 40 + 60} className="h-2" />
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/student/academics">View All Subjects</Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No subjects enrolled yet</p>
              </div>
            )}
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
