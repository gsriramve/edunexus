"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  GraduationCap,
  Target,
  Award,
  BarChart3,
  Building2,
  Download,
  RefreshCw,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useSgiStats,
  useCriStats,
  useBulkCalculateSgi,
  useBulkCalculateCri,
} from "@/hooks/use-student-indices";
import { useDepartments } from "@/hooks/use-api";

const trendIcons = {
  improving: <TrendingUp className="h-4 w-4 text-green-500" />,
  declining: <TrendingDown className="h-4 w-4 text-red-500" />,
  stable: <Minus className="h-4 w-4 text-yellow-500" />,
};

export default function InstitutionMetricsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState("overview");

  const tenantId = useTenantId();

  const { data: sgiStats, isLoading: sgiLoading, refetch: refetchSgi } = useSgiStats(tenantId || "");
  const { data: criStats, isLoading: criLoading, refetch: refetchCri } = useCriStats(tenantId || "");
  const { data: departments, isLoading: deptLoading } = useDepartments(tenantId || "");
  const bulkSgi = useBulkCalculateSgi(tenantId || "");
  const bulkCri = useBulkCalculateCri(tenantId || "");

  const isLoading = sgiLoading || criLoading || deptLoading;

  const handleRecalculateAll = () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    bulkSgi.mutate({ month, year }, { onSuccess: () => refetchSgi() });
    bulkCri.mutate({}, { onSuccess: () => refetchCri() });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate institution-wide metrics
  const totalStudents = sgiStats?.totalStudents || 0;
  const avgSgi = sgiStats?.tenantAverageSgi || 0;
  const improvingStudents = sgiStats?.improvingCount || 0;
  const decliningStudents = sgiStats?.decliningCount || 0;
  const atRiskStudents = sgiStats?.atRiskStudents?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institution Metrics</h1>
          <p className="text-muted-foreground">
            Monitor SGI and CRI across the entire institution
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRecalculateAll}
            disabled={bulkSgi.isPending || bulkCri.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(bulkSgi.isPending || bulkCri.isPending) ? "animate-spin" : ""}`} />
            Recalculate All
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Institution SGI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{avgSgi.toFixed(1)}</span>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">+2.3</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Student Growth Index
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Placement Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">68%</span>
              <Briefcase className="h-8 w-8 text-green-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Students with CRI &gt; 60
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{totalStudents}</span>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">{atRiskStudents}</span>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              SGI below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Building2 className="h-4 w-4 mr-2" />
            By Department
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* SGI Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>SGI Distribution</CardTitle>
                <CardDescription>
                  Student Growth Index distribution across institution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: "Excellent (80-100)", count: 120, percentage: 24, color: "bg-green-500" },
                    { range: "Good (60-79)", count: 185, percentage: 37, color: "bg-blue-500" },
                    { range: "Average (40-59)", count: 140, percentage: 28, color: "bg-yellow-500" },
                    { range: "At Risk (<40)", count: 55, percentage: 11, color: "bg-red-500" },
                  ].map((item) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.range}</span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className={`h-2 ${item.color}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CRI Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Career Readiness Index</CardTitle>
                <CardDescription>
                  Placement probability distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: "High (>80%)", count: 85, percentage: 17, color: "bg-green-500" },
                    { range: "Good (60-80%)", count: 165, percentage: 33, color: "bg-blue-500" },
                    { range: "Moderate (40-60%)", count: 150, percentage: 30, color: "bg-yellow-500" },
                    { range: "Low (<40%)", count: 100, percentage: 20, color: "bg-red-500" },
                  ].map((item) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.range}</span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className={`h-2 ${item.color}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Trend Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Student Growth Trends</CardTitle>
              <CardDescription>
                Month-over-month growth trajectory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-700">{improvingStudents}</p>
                      <p className="text-sm text-green-600">Improving Students</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Minus className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-700">{sgiStats?.stableCount || 0}</p>
                      <p className="text-sm text-yellow-600">Stable Students</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-700">{decliningStudents}</p>
                      <p className="text-sm text-red-600">Declining Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Performance</CardTitle>
              <CardDescription>
                SGI and CRI metrics by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Avg SGI</TableHead>
                    <TableHead className="text-center">Avg CRI</TableHead>
                    <TableHead className="text-center">Improving</TableHead>
                    <TableHead className="text-center">At Risk</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Computer Science", code: "CSE", students: 180, sgi: 72.5, cri: 68.2, improving: 45, atRisk: 12, trend: "improving" },
                    { name: "Electronics", code: "ECE", students: 150, sgi: 68.8, cri: 62.5, improving: 32, atRisk: 18, trend: "stable" },
                    { name: "Mechanical", code: "MECH", students: 120, sgi: 65.2, cri: 58.3, improving: 25, atRisk: 22, trend: "declining" },
                    { name: "Civil", code: "CIVIL", students: 100, sgi: 70.1, cri: 55.8, improving: 28, atRisk: 15, trend: "improving" },
                    { name: "Electrical", code: "EEE", students: 90, sgi: 67.5, cri: 60.1, improving: 20, atRisk: 14, trend: "stable" },
                  ].map((dept) => (
                    <TableRow key={dept.code}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">{dept.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{dept.students}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={dept.sgi >= 70 ? "default" : "secondary"}>
                          {dept.sgi.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={dept.cri >= 60 ? "default" : "secondary"}>
                          {dept.cri.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-green-600">
                        {dept.improving}
                      </TableCell>
                      <TableCell className="text-center text-red-600">
                        {dept.atRisk}
                      </TableCell>
                      <TableCell className="text-center">
                        {trendIcons[dept.trend as keyof typeof trendIcons]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend Analysis</CardTitle>
              <CardDescription>
                SGI and CRI trends over the academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monthly SGI Trend */}
                <div>
                  <h4 className="font-medium mb-4">Average SGI by Month</h4>
                  <div className="flex items-end gap-2 h-48">
                    {[
                      { month: "Aug", sgi: 65 },
                      { month: "Sep", sgi: 66 },
                      { month: "Oct", sgi: 68 },
                      { month: "Nov", sgi: 69 },
                      { month: "Dec", sgi: 71 },
                      { month: "Jan", sgi: 72 },
                    ].map((item) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${item.sgi}%` }}
                        />
                        <p className="text-xs mt-2 text-muted-foreground">{item.month}</p>
                        <p className="text-sm font-medium">{item.sgi}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Top Performer</span>
                    </div>
                    <p className="text-lg font-bold">Computer Science</p>
                    <p className="text-sm text-muted-foreground">Avg SGI: 72.5</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Most Improved</span>
                    </div>
                    <p className="text-lg font-bold">Civil Engineering</p>
                    <p className="text-sm text-muted-foreground">+8.2% this semester</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Needs Attention</span>
                    </div>
                    <p className="text-lg font-bold">Mechanical</p>
                    <p className="text-sm text-muted-foreground">22 at-risk students</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
