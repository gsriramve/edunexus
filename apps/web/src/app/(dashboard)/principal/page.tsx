'use client';

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  Building2,
  Users,
  GraduationCap,
  Wallet,
  Calendar,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Bell,
  Loader2,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTenantId } from "@/hooks/use-tenant";
import {
  usePrincipalDashboard,
  type DepartmentPerformanceDto,
  type AlertDto,
  type ActivityDto,
  type EventDto,
} from "@/hooks/use-principal-dashboard";
import { InstitutionalPulse } from "@/components/insights";

export default function PrincipalDashboard() {
  const { isLoading: authLoading } = useAuth();
  const tenantId = useTenantId();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error } = usePrincipalDashboard(tenantId || '');

  const isLoading = authLoading || dashboardLoading;

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error if no tenant ID is available after Clerk loaded
  if (!tenantId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">College Not Assigned</h2>
        <p className="text-muted-foreground max-w-md">
          Your account is not associated with a college yet. Please contact your administrator
          to complete your account setup.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground max-w-md mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Extract data from dashboard response
  const institutionStats = dashboardData?.institutionStats;
  const departmentPerformance = dashboardData?.departmentPerformance || [];
  const feeCollection = dashboardData?.feeCollection;
  const recentAlerts = dashboardData?.recentAlerts || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  // Build stats from API data
  const stats = [
    {
      title: "Total Departments",
      value: institutionStats?.totalDepartments?.toString() || "0",
      change: `${institutionStats?.departmentsWithHod || 0} with HOD`,
      icon: Building2,
      href: "/principal/departments",
    },
    {
      title: "Total Staff",
      value: institutionStats?.totalStaff?.toString() || "0",
      change: `${institutionStats?.activeStaff || 0} active`,
      icon: Users,
      href: "/principal/staff",
    },
    {
      title: "Total Students",
      value: institutionStats?.totalStudents?.toLocaleString() || "0",
      change: `${institutionStats?.avgAttendance || 0}% avg attendance`,
      icon: GraduationCap,
      href: "/principal/students",
    },
    {
      title: "Fee Collection",
      value: feeCollection?.totalCollected
        ? `₹${(feeCollection.totalCollected / 100000).toFixed(1)}L`
        : "₹0",
      change: `${feeCollection?.collectionRate || 0}% collected`,
      icon: Wallet,
      href: "/principal/fees",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="h-4 w-4" />;
      case 'fee':
        return <Wallet className="h-4 w-4" />;
      case 'staff':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">College Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your college
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Academic Calendar
          </Button>
          <Button>
            <Bell className="mr-2 h-4 w-4" />
            Announcements
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* AI-Powered Institutional Pulse */}
      <InstitutionalPulse
        tenantId={tenantId}
        onViewDepartment={(departmentId) => {
          window.location.href = `/principal/departments/${departmentId}`;
        }}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Overview of all departments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : departmentPerformance.length > 0 ? (
              <div className="space-y-4">
                {departmentPerformance.map((dept: DepartmentPerformanceDto) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {dept.code}
                      </div>
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.studentCount} students, {dept.staffCount} staff
                          {dept.hodName && ` • HoD: ${dept.hodName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className={`text-sm font-medium ${dept.avgAttendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                          {dept.avgAttendance}%
                        </p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${dept.atRiskStudents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {dept.atRiskStudents}
                        </p>
                        <p className="text-xs text-muted-foreground">At Risk</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No departments found</p>
                <Link href="/principal/departments">
                  <Button variant="outline" className="mt-4">
                    Add Department
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {recentAlerts.map((alert: AlertDto) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.departmentCode && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {alert.departmentCode}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No alerts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All systems are running smoothly
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your college</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity: ActivityDto) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.action} - {activity.entity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.performedBy} • {new Date(activity.performedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No recent activities</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activity feed will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled events and exams</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event: EventDto) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                      </p>
                      {event.departmentCode && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {event.departmentCode}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Events will appear here when scheduled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection Overview */}
      {feeCollection && (feeCollection.totalCollected > 0 || feeCollection.totalPending > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Overview</CardTitle>
            <CardDescription>Current academic year fee status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{(feeCollection.totalCollected / 100000).toFixed(2)}L
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{(feeCollection.totalPending / 100000).toFixed(2)}L
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <div className="flex items-center gap-2">
                  <Progress value={feeCollection.collectionRate} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{feeCollection.collectionRate}%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className={`text-2xl font-bold ${feeCollection.overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {feeCollection.overdueCount} students
                </p>
              </div>
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Link href="/principal/departments">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <Building2 className="h-6 w-6 mb-2" />
                <span>Departments</span>
              </Button>
            </Link>
            <Link href="/principal/staff">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span>Staff</span>
              </Button>
            </Link>
            <Link href="/principal/students">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <GraduationCap className="h-6 w-6 mb-2" />
                <span>Students</span>
              </Button>
            </Link>
            <Link href="/principal/academics">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Academics</span>
              </Button>
            </Link>
            <Link href="/principal/reports">
              <Button variant="outline" className="h-auto py-4 w-full flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
