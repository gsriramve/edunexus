'use client';

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDepartments, useDepartmentStats, useStaffStats, useStudentStats } from "@/hooks/use-api";
import { useTenantId } from "@/hooks/use-tenant";

// Note: Activities, events, and alerts will be loaded from API when available

export default function PrincipalDashboard() {
  const { isLoaded: clerkLoaded } = useUser();
  const tenantId = useTenantId();

  // Fetch data with tenant ID
  const { data: deptStats, isLoading: deptStatsLoading } = useDepartmentStats(tenantId || '');
  const { data: staffStats, isLoading: staffStatsLoading } = useStaffStats(tenantId || '');
  const { data: studentStats, isLoading: studentStatsLoading } = useStudentStats(tenantId || '');
  const { data: departmentsData, isLoading: deptsLoading } = useDepartments(tenantId || '', { limit: 10 });

  const isLoading = !clerkLoaded || deptStatsLoading || staffStatsLoading || studentStatsLoading || deptsLoading;

  // Build stats from API data
  const stats = [
    {
      title: "Total Departments",
      value: deptStats?.totalDepartments?.toString() || "0",
      change: `${deptStats?.departmentsWithHod || 0} with HOD`,
      icon: Building2,
      href: "/principal/departments",
    },
    {
      title: "Total Staff",
      value: staffStats?.total?.toString() || "0",
      change: `${staffStats?.active || 0} active`,
      icon: Users,
      href: "/principal/staff",
    },
    {
      title: "Total Students",
      value: studentStats?.total?.toLocaleString() || "0",
      change: `${studentStats?.active || 0} active`,
      icon: GraduationCap,
      href: "/principal/students",
    },
    {
      title: "Fee Collection",
      value: "₹--",
      change: "Coming soon",
      icon: Wallet,
      href: "/principal/fees",
    },
  ];

  // Build department performance from API data
  const departmentPerformance = departmentsData?.data?.map(dept => ({
    name: dept.code,
    students: dept._count?.students || 0,
    staff: dept._count?.staff || 0,
    attendance: 0, // Would come from attendance API
    placement: 0, // Would come from placement API
  })) || [];

  // Show loading while Clerk is loading
  if (!clerkLoaded) {
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
                {departmentPerformance.map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {dept.name}
                      </div>
                      <div>
                        <p className="font-medium">{dept.name} Department</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.students} students, {dept.staff} staff
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{dept.attendance || '--'}%</p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">
                          {dept.placement || '--'}%
                        </p>
                        <p className="text-xs text-muted-foreground">Placement</p>
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
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No alerts</p>
              <p className="text-xs text-muted-foreground mt-1">
                Alerts will appear here when there are items requiring your attention
              </p>
            </div>
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No recent activities</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activity feed coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled events this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
              <p className="text-xs text-muted-foreground mt-1">
                Event calendar coming soon
              </p>
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
          <div className="grid gap-4 md:grid-cols-5">
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
