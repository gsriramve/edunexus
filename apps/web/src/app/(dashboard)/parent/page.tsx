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
  MessageSquare,
  FileText,
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
import { useParentDashboard } from "@/hooks/use-parent-dashboard";

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

  // Fetch dashboard data for selected child
  const { data: dashboardData, isLoading: dashboardLoading } = useParentDashboard(tenantId, selectedChildId);

  // Extract data from API response
  const childInfo = dashboardData?.childInfo;
  const stats = dashboardData?.stats;
  const recentActivity = dashboardData?.recentActivity || [];
  const notifications = dashboardData?.notifications || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const subjectPerformance = dashboardData?.subjectPerformance || [];

  // Get selected child info from children list (for basic info while dashboard loads)
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

  // Use dashboard data when available, fallback to child info from children list
  const currentChild = {
    name: childInfo?.name || currentApiChild?.name || 'Student',
    rollNo: childInfo?.rollNo || currentApiChild?.rollNo || 'N/A',
    department: childInfo?.department || currentApiChild?.department || 'N/A',
    semester: childInfo?.semester || currentApiChild?.semester || 1,
    batchYear: childInfo?.batchYear || 2021,
    cgpa: stats?.cgpa || 0,
    sgpa: stats?.sgpa || 0,
    attendancePercentage: stats?.attendancePercentage || 0,
    pendingFees: stats?.pendingFees || 0,
    rank: stats?.rank || 0,
    totalStudents: stats?.totalStudents || 0,
  };

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

  const unreadNotifications = notifications.filter(n => n.unread).length;

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
              {unreadNotifications > 0 ? `${unreadNotifications} New` : 'Notifications'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {dashboardLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 shrink-0">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">CGPA</p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{currentChild.cgpa}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Current SGPA</p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{currentChild.sgpa}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${currentChild.attendancePercentage >= 75 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                  <Calendar className={`h-6 w-6 ${currentChild.attendancePercentage >= 75 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                  <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${currentChild.attendancePercentage >= 75 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {currentChild.attendancePercentage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950 shrink-0">
                  <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Pending Fees</p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {currentChild.pendingFees > 0 ? `₹${(currentChild.pendingFees / 1000).toFixed(0)}K` : "Paid"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 shrink-0">
                  <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Class Rank</p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{currentChild.rank}/{currentChild.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            {dashboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : subjectPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No subject performance data available</p>
            ) : (
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
            )}
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
            {dashboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No notifications</p>
            ) : (
              <>
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
              </>
            )}
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
            {dashboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No upcoming events</p>
            ) : (
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
                    Semester fee of ₹{currentChild.pendingFees.toLocaleString()} is pending.
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
