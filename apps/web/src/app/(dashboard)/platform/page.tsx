'use client';

import { Building2, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTenants, useTenantStats } from "@/hooks/use-api";

// Mock support tickets - would be a separate API
const recentTickets = [
  {
    id: "T-1234",
    college: "ABC Engineering College",
    subject: "Payment gateway issue",
    priority: "high",
    status: "open",
  },
  {
    id: "T-1233",
    college: "XYZ Institute of Technology",
    subject: "User sync problem",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "T-1232",
    college: "PQR College of Engineering",
    subject: "Feature request: Bulk import",
    priority: "low",
    status: "open",
  },
];

export default function PlatformDashboard() {
  const { data: tenantsData, isLoading: tenantsLoading, error: tenantsError } = useTenants({ limit: 10 });
  const { data: statsData, isLoading: statsLoading, error: statsError } = useTenantStats();

  const isLoading = tenantsLoading || statsLoading;
  const hasError = tenantsError || statsError;

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Build stats from API data
  const stats = [
    {
      title: "Total Colleges",
      value: statsData?.totalTenants?.toString() || "0",
      change: `${statsData?.activeTenants || 0} active`,
      icon: Building2,
      trend: "up",
    },
    {
      title: "Total Students",
      value: statsData?.totalStudents?.toLocaleString() || "0",
      change: "Across all colleges",
      icon: Users,
      trend: "up",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(statsData?.monthlyRevenue || 0),
      change: "Current month",
      icon: CreditCard,
      trend: "up",
    },
    {
      title: "Trial Colleges",
      value: statsData?.trialTenants?.toString() || "0",
      change: "Pending conversion",
      icon: TrendingUp,
      trend: "neutral",
    },
  ];

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground">
              {(tenantsError as Error)?.message || (statsError as Error)?.message || "Failed to load dashboard data"}
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all colleges and monitor platform health
          </p>
        </div>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Add New College
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
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
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colleges Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Colleges</CardTitle>
            <CardDescription>
              Overview of recently onboarded colleges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tenantsData?.data && tenantsData.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantsData.data.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.displayName || tenant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {tenant.domain}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenant.subscription?.studentCount?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tenant.subscription?.plan === "enterprise"
                              ? "default"
                              : tenant.subscription?.plan === "premium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {tenant.subscription?.plan || "No plan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tenant.subscription?.amount
                          ? formatCurrency(parseFloat(tenant.subscription.amount))
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tenant.status === "active" ? "default" : "outline"}
                          className={
                            tenant.status === "active"
                              ? "bg-green-500"
                              : tenant.status === "trial"
                              ? "bg-yellow-500"
                              : ""
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No colleges onboarded yet</p>
                <Button variant="outline" className="mt-4">
                  <Building2 className="mr-2 h-4 w-4" />
                  Add First College
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>Recent support requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                {ticket.priority === "high" ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.college}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {ticket.id}
                    </Badge>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "destructive"
                          : ticket.status === "in_progress"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Tickets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Building2 className="h-6 w-6 mb-2" />
              <span>Onboard College</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <CreditCard className="h-6 w-6 mb-2" />
              <span>View Invoices</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
