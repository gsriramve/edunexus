"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { usePrincipalExamOverview } from "@/hooks/use-principal-dashboard";
import { useTenantId } from "@/hooks/use-tenant";

export default function PrincipalExamsPage() {
  const tenantId = useTenantId();
  const [selectedSemester, setSelectedSemester] = useState("odd-2025");

  const { data: examData, isLoading, error } = usePrincipalExamOverview(tenantId || '');

  const getExamTypeBadge = (type: string) => {
    const typeLabel = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    switch (type.toLowerCase()) {
      case "external":
      case "end_semester":
        return <Badge className="bg-blue-100 text-blue-800">{typeLabel}</Badge>;
      case "practical":
        return <Badge className="bg-purple-100 text-purple-800">{typeLabel}</Badge>;
      case "internal":
      case "internal_1":
      case "internal_2":
      case "mid_semester":
        return <Badge className="bg-orange-100 text-orange-800">{typeLabel}</Badge>;
      case "quiz":
        return <Badge className="bg-green-100 text-green-800">{typeLabel}</Badge>;
      default:
        return <Badge variant="secondary">{typeLabel}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-800">Failed to load exam data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = examData?.stats || {
    totalExams: 0,
    completed: 0,
    ongoing: 0,
    upcoming: 0,
    totalStudentsAppeared: 0,
    averagePassRate: 0,
    resultsPublished: 0,
    resultsPending: 0,
  };

  const upcomingExams = examData?.upcomingExams || [];
  const departmentResults = examData?.departmentResults || [];
  const recentResults = examData?.recentResults || [];

  // Generate performance alerts from data
  const performanceAlerts: { type: 'warning' | 'info' | 'success'; title: string; message: string }[] = [];

  // Find high failure departments
  const highFailureDepts = departmentResults.filter(d => d.passRate < 80 && d.appeared > 0);
  highFailureDepts.forEach(dept => {
    performanceAlerts.push({
      type: 'warning',
      title: `${dept.department} - High Failure Rate`,
      message: `${dept.failed} students failed with ${dept.passRate}% pass rate. Consider remedial classes.`,
    });
  });

  // Pending results alert
  if (stats.resultsPending > 0) {
    performanceAlerts.push({
      type: 'info',
      title: `${stats.resultsPending} Results Pending Publication`,
      message: `${stats.resultsPending} exam results are awaiting review and publication.`,
    });
  }

  // Top performer
  const topPerformer = departmentResults.reduce((best, curr) =>
    curr.passRate > (best?.passRate || 0) && curr.appeared > 0 ? curr : best,
    departmentResults[0] || null
  );
  if (topPerformer && topPerformer.passRate >= 90) {
    performanceAlerts.push({
      type: 'success',
      title: `${topPerformer.department} - Top Performer`,
      message: `${topPerformer.passRate}% pass rate - highest across all departments.`,
    });
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations Overview</h1>
          <p className="text-muted-foreground">
            Institution-wide examination schedule and results summary
          </p>
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="odd-2025">Odd Sem 2025-26</SelectItem>
            <SelectItem value="even-2024">Even Sem 2024-25</SelectItem>
            <SelectItem value="odd-2024">Odd Sem 2024-25</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">{stats.completed} completed</span>
              <span className="text-xs text-yellow-600">{stats.ongoing} ongoing</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Appeared</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudentsAppeared.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all examinations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePassRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall institution average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resultsPublished}/{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resultsPending} results pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
          <TabsTrigger value="results">Results Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {/* Upcoming Exams */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Examinations</CardTitle>
              <CardDescription>Scheduled exams across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingExams.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming examinations scheduled.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Examination</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Max Marks</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          <div>{exam.name}</div>
                          <div className="text-xs text-muted-foreground">{exam.subjectName}</div>
                        </TableCell>
                        <TableCell>{getExamTypeBadge(exam.type)}</TableCell>
                        <TableCell>{exam.department}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(exam.date)}
                        </TableCell>
                        <TableCell className="text-center">{exam.totalMarks}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Scheduled
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Exam Calendar Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">Examinations conducted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Ongoing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.ongoing}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.upcoming}</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled examinations</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {/* Department-wise Results */}
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Results</CardTitle>
              <CardDescription>Performance summary across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              {departmentResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No exam results available yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Appeared</TableHead>
                      <TableHead className="text-center">Passed</TableHead>
                      <TableHead className="text-center">Pass Rate</TableHead>
                      <TableHead className="text-center">Distinction</TableHead>
                      <TableHead className="text-center">First Class</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentResults.map((dept) => (
                      <TableRow key={dept.departmentId}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell className="text-center">{dept.appeared}</TableCell>
                        <TableCell className="text-center text-green-600">{dept.passed}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={dept.passRate} className="w-16 h-2" />
                            <span className={dept.passRate >= 90 ? "text-green-600 font-medium" : "text-yellow-600"}>
                              {dept.passRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-purple-600">{dept.distinction}</TableCell>
                        <TableCell className="text-center text-blue-600">{dept.firstClass}</TableCell>
                        <TableCell className="text-center text-red-600">{dept.failed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Results & Performance Alerts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recently Published Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentResults.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent results published.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentResults.slice(0, 5).map((result) => (
                      <div key={result.examId} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{result.examName}</p>
                          <p className="text-xs text-muted-foreground">{result.department}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${result.passRate >= 90 ? "text-green-600" : "text-yellow-600"}`}>
                            {result.passRate}% pass
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(result.publishedDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Performance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performanceAlerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No alerts at this time.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {performanceAlerts.slice(0, 3).map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          alert.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : alert.type === 'success'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <p className={`text-sm font-medium ${
                          alert.type === 'warning'
                            ? 'text-yellow-800'
                            : alert.type === 'success'
                            ? 'text-green-800'
                            : 'text-blue-800'
                        }`}>
                          {alert.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          alert.type === 'warning'
                            ? 'text-yellow-700'
                            : alert.type === 'success'
                            ? 'text-green-700'
                            : 'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
