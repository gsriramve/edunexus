"use client";

import {
  IndianRupee,
  Users,
  GraduationCap,
  FileText,
  Clock,
  AlertTriangle,
  UserPlus,
  Receipt,
  Send,
  ClipboardList,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useUser } from "@clerk/nextjs";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

export default function AdminStaffDashboard() {
  const tenantId = useTenantId() || '';
  const { user, isLoaded: userLoaded } = useUser();

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading, error } = useAdminDashboard(tenantId);

  // Extract data from API response
  const adminInfo = dashboardData?.adminInfo;
  const stats = dashboardData?.stats;
  const recentCollections = dashboardData?.recentCollections || [];
  const pendingApplications = dashboardData?.pendingApplications || [];
  const certificateRequests = dashboardData?.certificateRequests || [];
  const upcomingTasks = dashboardData?.upcomingTasks || [];
  const recentAnnouncements = dashboardData?.recentAnnouncements || [];

  const collectionProgress = stats ? (stats.monthlyCollected / stats.monthlyTarget) * 100 : 0;

  // Loading state
  if (!tenantId || !userLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error.message || 'Failed to load dashboard data'}</p>
        </div>
      </div>
    );
  }

  // Get user display name
  const displayName = user?.fullName || user?.firstName || adminInfo?.name || 'Admin';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "document_review":
        return <Badge className="bg-blue-500">Document Review</Badge>;
      case "verification":
        return <Badge className="bg-orange-500">Verification</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "ready":
        return <Badge className="bg-green-500">Ready</Badge>;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {displayName} • {adminInfo?.role || 'Administrative Officer'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Send Notice
          </Button>
          <Button>
            <IndianRupee className="mr-2 h-4 w-4" />
            Collect Fee
          </Button>
        </div>
      </div>

      {/* Quick Stats - Responsive Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 shrink-0">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{(stats?.totalStudents || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 shrink-0">
                <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">New Admissions</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">+{stats?.newAdmissions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950 shrink-0">
                <ClipboardList className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Pending Apps</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">{stats?.pendingApplications || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 shrink-0">
                <IndianRupee className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Collection</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{formatCurrency(stats?.todayCollections || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Pending Fees</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">{formatCurrency(stats?.pendingFees || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950 shrink-0">
                <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats?.certificatesRequested || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Collection Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Monthly Fee Collection</CardTitle>
              <CardDescription>January 2026 collection progress</CardDescription>
            </div>
            <Badge
              className={`${collectionProgress >= 75 ? "bg-green-500" : collectionProgress >= 50 ? "bg-orange-500" : "bg-red-500"} text-sm px-3 py-1`}
            >
              {collectionProgress.toFixed(0)}% of target
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
              <span className="text-muted-foreground">Collected: <span className="font-medium text-foreground">{formatCurrency(stats?.monthlyCollected || 0)}</span></span>
              <span className="text-muted-foreground">Target: <span className="font-medium text-foreground">{formatCurrency(stats?.monthlyTarget || 0)}</span></span>
            </div>
            <Progress value={collectionProgress} className="h-3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="text-center p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency((stats?.monthlyTarget || 0) - (stats?.monthlyCollected || 0))}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency((stats?.monthlyCollected || 0) / 6)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-sm text-muted-foreground mb-1">Pending Dues</p>
                <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.pendingFees || 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Collections & Pending Applications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Collections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Recent Collections
                </CardTitle>
                <CardDescription>Today's fee payments</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCollections.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent collections</p>
              ) : (
                recentCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{collection.studentName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{collection.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {collection.rollNo} • {collection.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(collection.amount)}</p>
                      <p className="text-xs text-muted-foreground">{collection.time} • {collection.mode}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Pending Applications
                </CardTitle>
                <CardDescription>Applications requiring action</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending applications</p>
              ) : (
                pendingApplications.map((app) => (
                  <div key={app.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.type} {app.type === "Branch Transfer" ? `(${app.from} → ${app.to})` : app.branch ? `- ${app.branch}` : ''}
                        </p>
                      </div>
                      {getPriorityBadge(app.priority)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Submitted: {app.submitted}</span>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Requests & Upcoming Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Certificate Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Certificate Requests
                </CardTitle>
                <CardDescription>Pending certificate requests</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificateRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending certificate requests</p>
              ) : (
                certificateRequests.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{cert.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.rollNo} • {cert.type}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(cert.status)}
                      <p className="text-xs text-muted-foreground mt-1">{cert.requestDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>Tasks requiring attention</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No upcoming tasks</p>
              ) : (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{task.title}</span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{task.type}</Badge>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Recent Announcements
              </CardTitle>
              <CardDescription>Notices and communications sent</CardDescription>
            </div>
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentAnnouncements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No recent announcements</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {recentAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{announcement.audience}</Badge>
                      <Badge
                        className={
                          announcement.status === "active"
                            ? "bg-green-500"
                            : announcement.status === "scheduled"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }
                      >
                        {announcement.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground mt-2">{announcement.date}</p>
                  </CardContent>
                </Card>
              ))}
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
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Button variant="outline" className="h-20 sm:h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
              <IndianRupee className="h-6 w-6 text-primary" />
              <span className="text-sm">Collect Fee</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex-col gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950 transition-colors">
              <UserPlus className="h-6 w-6 text-green-600" />
              <span className="text-sm">New Admission</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Issue Certificate</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950 transition-colors">
              <Send className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Send SMS</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950 transition-colors col-span-2 sm:col-span-1">
              <GraduationCap className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Student Records</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
