"use client";

import { useState } from "react";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Mail,
  Printer,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useDepartmentReports, QueryReportsParams } from "@/hooks/use-hod-reports";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function HODReports() {
  const tenantId = useTenantId();
  const [selectedPeriod, setSelectedPeriod] = useState<QueryReportsParams["period"]>("current");
  const [reportType, setReportType] = useState("all");

  const { data, isLoading, error } = useDepartmentReports(tenantId || "", {
    period: selectedPeriod,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load department reports: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const quickStats = data?.quickStats;
  const attendanceReport = data?.attendance;
  const academicReport = data?.academic;
  const placementReport = data?.placement;
  const availableReports = data?.availableReports || [];

  const filteredReports = availableReports.filter(
    (report) => reportType === "all" || report.type === reportType
  );

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Reports</h1>
          <p className="text-muted-foreground">
            Analytics, reports, and insights for your department
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as QueryReportsParams["period"])}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
              <SelectItem value="year">Academic Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Attendance</p>
                  <p className="text-2xl font-bold">{quickStats?.avgAttendance || 0}%</p>
                </div>
              </div>
              {quickStats && (
                <div className={`flex items-center gap-1 ${getTrendColor(quickStats.attendanceTrend)}`}>
                  {getTrendIcon(quickStats.attendanceTrend)}
                  <span className="text-sm">
                    {quickStats.attendanceChange > 0 ? "+" : ""}
                    {quickStats.attendanceChange}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg CGPA</p>
                  <p className="text-2xl font-bold">{quickStats?.avgCGPA?.toFixed(1) || "0.0"}</p>
                </div>
              </div>
              {quickStats && (
                <div className={`flex items-center gap-1 ${getTrendColor(quickStats.cgpaTrend)}`}>
                  {getTrendIcon(quickStats.cgpaTrend)}
                  <span className="text-sm">
                    {quickStats.cgpaChange > 0 ? "+" : ""}
                    {quickStats.cgpaChange?.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Placement Rate</p>
                <p className="text-2xl font-bold">{quickStats?.placementRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">{quickStats?.passRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="placement">Placement</TabsTrigger>
          <TabsTrigger value="download">Download Reports</TabsTrigger>
        </TabsList>

        {/* Attendance Report */}
        <TabsContent value="attendance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Semester-wise Attendance</CardTitle>
                <CardDescription>Average attendance by semester</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceReport?.semesterWise && attendanceReport.semesterWise.length > 0 ? (
                  <div className="space-y-4">
                    {attendanceReport.semesterWise.map((sem) => (
                      <div key={sem.semester} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Semester {sem.semester}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {sem.belowThreshold} below 75%
                            </span>
                            <Badge className={sem.attendance >= 85 ? "bg-green-500" : sem.attendance >= 75 ? "bg-yellow-500" : "bg-red-500"}>
                              {sem.attendance}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={sem.attendance} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No semester attendance data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Trend</CardTitle>
                <CardDescription>Attendance trend over past months</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceReport?.monthlyTrend && attendanceReport.monthlyTrend.length > 0 ? (
                  <div className="flex items-end justify-between h-48 gap-2">
                    {attendanceReport.monthlyTrend.map((month, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-xs font-medium">{month.attendance}%</div>
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${(month.attendance / 100) * 150}px` }}
                        />
                        <div className="text-xs text-muted-foreground text-center">
                          {month.month.split(" ")[0]?.slice(0, 3) || month.month.slice(0, 3)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No monthly trend data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Report */}
        <TabsContent value="academic">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Semester Results Summary</CardTitle>
                <CardDescription>Academic performance by semester</CardDescription>
              </CardHeader>
              <CardContent>
                {academicReport?.semesterResults && academicReport.semesterResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Semester</TableHead>
                        <TableHead className="text-center">Avg CGPA</TableHead>
                        <TableHead className="text-center">Pass %</TableHead>
                        <TableHead className="text-center">Distinction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicReport.semesterResults.map((sem) => (
                        <TableRow key={sem.semester}>
                          <TableCell>
                            <Badge variant="outline">Sem {sem.semester}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">{sem.avgCGPA?.toFixed(1)}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-500">{sem.pass}%</Badge>
                          </TableCell>
                          <TableCell className="text-center">{sem.distinction}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No semester results data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>Current semester subject analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {academicReport?.subjectPerformance && academicReport.subjectPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {academicReport.subjectPerformance.map((subject, idx) => (
                      <div key={subject.subjectId || idx} className="p-3 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{subject.subject}</span>
                          <Badge variant="outline">Top: {subject.topScore}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Avg: </span>
                            <span className="font-medium">{subject.avgMarks?.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pass Rate: </span>
                            <span className="font-medium text-green-600">{subject.passRate}%</span>
                          </div>
                        </div>
                        <Progress value={subject.avgMarks} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No subject performance data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Placement Report */}
        <TabsContent value="placement">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Year-wise Placement Statistics</CardTitle>
                <CardDescription>Placement trends over years</CardDescription>
              </CardHeader>
              <CardContent>
                {placementReport?.yearWise && placementReport.yearWise.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead className="text-center">Placed</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Rate</TableHead>
                          <TableHead className="text-center">Avg Package (LPA)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {placementReport.yearWise.map((year) => (
                          <TableRow key={year.year}>
                            <TableCell className="font-medium">{year.year}</TableCell>
                            <TableCell className="text-center">{year.placed}</TableCell>
                            <TableCell className="text-center">{year.total}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-500">{year.rate}%</Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold">₹{year.avgPackage?.toFixed(1)} LPA</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="grid grid-cols-3 gap-4 mt-6 p-4 rounded-lg bg-muted">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">₹{placementReport.highestPackage?.toFixed(1) || 0} LPA</p>
                        <p className="text-sm text-muted-foreground">Highest Package</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{placementReport.companiesVisited || 0}</p>
                        <p className="text-sm text-muted-foreground">Companies Visited</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{placementReport.ongoingDrives || 0}</p>
                        <p className="text-sm text-muted-foreground">Ongoing Drives</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No placement statistics available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Recruiters</CardTitle>
                <CardDescription>Companies with most offers</CardDescription>
              </CardHeader>
              <CardContent>
                {placementReport?.topRecruiters && placementReport.topRecruiters.length > 0 ? (
                  <div className="space-y-4">
                    {placementReport.topRecruiters.map((company, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{company.company}</p>
                          <p className="text-sm text-muted-foreground">{company.offers} offers</p>
                        </div>
                        <Badge variant="outline">₹{company.avgPackage?.toFixed(1)} LPA</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recruiter data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Download Reports */}
        <TabsContent value="download">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Download Reports</CardTitle>
                  <CardDescription>Generate and download various department reports</CardDescription>
                </div>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReports.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredReports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{report.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{report.type}</Badge>
                                <span className="text-xs text-muted-foreground">{report.format}</span>
                              </div>
                              {report.description && (
                                <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No reports available for the selected filter</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
