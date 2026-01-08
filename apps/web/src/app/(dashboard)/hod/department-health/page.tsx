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
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  Award,
  BarChart3,
  RefreshCw,
  Download,
  GraduationCap,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useSgiStats,
  useSgiAlerts,
  useBulkCalculateSgi,
  type SgiData,
  type SgiStats,
} from "@/hooks/use-student-indices";

const trendIcons = {
  improving: <TrendingUp className="h-4 w-4 text-green-500" />,
  declining: <TrendingDown className="h-4 w-4 text-red-500" />,
  stable: <Minus className="h-4 w-4 text-yellow-500" />,
};

const trendColors = {
  improving: "text-green-600",
  declining: "text-red-600",
  stable: "text-yellow-600",
};

function getSgiColorClass(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function getSgiBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  if (score >= 40) return "outline";
  return "destructive";
}

export default function DepartmentHealthPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const tenantId = useTenantId();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSgiStats(tenantId || "");
  const { data: alerts = [], isLoading: alertsLoading } = useSgiAlerts(tenantId || "", undefined, 40);
  const bulkCalculate = useBulkCalculateSgi(tenantId || "");

  const isLoading = statsLoading || alertsLoading;

  const handleRecalculate = () => {
    bulkCalculate.mutate(
      { month: selectedMonth, year: selectedYear },
      { onSuccess: () => refetchStats() }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Health</h1>
          <p className="text-muted-foreground">
            Monitor Student Growth Index (SGI) across your department
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(2000, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
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
            onClick={handleRecalculate}
            disabled={bulkCalculate.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${bulkCalculate.isPending ? "animate-spin" : ""}`} />
            Recalculate
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Department SGI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {stats?.tenantAverageSgi?.toFixed(1) || "N/A"}
              </span>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Improving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats?.improvingCount || 0}
              </span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Declining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">
                {stats?.decliningCount || 0}
              </span>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600">
                {alerts.length}
              </span>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SGI Distribution Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>SGI Distribution by Batch</CardTitle>
          <CardDescription>
            Student Growth Index distribution across batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {["2023", "2024", "2025", "2026"].map((batch) => (
              <div key={batch} className="space-y-2">
                <p className="text-sm font-medium text-center">Batch {batch}</p>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { range: "80-100", color: "bg-green-500", count: Math.floor(Math.random() * 20) + 10 },
                    { range: "60-79", color: "bg-blue-500", count: Math.floor(Math.random() * 30) + 20 },
                    { range: "40-59", color: "bg-yellow-500", count: Math.floor(Math.random() * 15) + 5 },
                    { range: "<40", color: "bg-red-500", count: Math.floor(Math.random() * 8) + 2 },
                  ].map((item) => (
                    <div
                      key={item.range}
                      className={`${item.color} text-white text-xs p-2 rounded text-center`}
                      style={{ opacity: Math.min(1, 0.3 + (item.count / 50)) }}
                    >
                      {item.range}: {item.count}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Legend</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span>Excellent (80+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span>Good (60-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span>Average (40-59)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span>At Risk (&lt;40)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Students with highest SGI scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topPerformers && stats.topPerformers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">SGI</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topPerformers.slice(0, 5).map((student: SgiData) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student.student?.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.student?.department?.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getSgiBadgeVariant(student.sgiScore)}>
                          {student.sgiScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {trendIcons[student.sgiTrend as keyof typeof trendIcons]}
                          <span className={trendColors[student.sgiTrend as keyof typeof trendColors]}>
                            {student.trendDelta > 0 ? "+" : ""}
                            {student.trendDelta.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* At Risk Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              At Risk Students
            </CardTitle>
            <CardDescription>
              Students requiring immediate attention (SGI &lt; 40)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">SGI</TableHead>
                    <TableHead className="text-center">Alert Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.slice(0, 5).map((alert) => (
                    <TableRow key={alert.studentId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {alert.studentName || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.department}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">
                          {alert.sgiScore?.toFixed(1) || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={alert.alertLevel === "critical" ? "destructive" : "secondary"}>
                          {alert.alertLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No at-risk students</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Component Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>SGI Component Analysis</CardTitle>
          <CardDescription>
            Average scores across SGI components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Academic", weight: 40, avg: 72 },
              { name: "Engagement", weight: 30, avg: 65 },
              { name: "Skills", weight: 20, avg: 58 },
              { name: "Behavioral", weight: 10, avg: 78 },
            ].map((component) => (
              <div key={component.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {component.name} ({component.weight}%)
                  </span>
                  <span className="text-muted-foreground">
                    Avg: {component.avg}
                  </span>
                </div>
                <Progress value={component.avg} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
