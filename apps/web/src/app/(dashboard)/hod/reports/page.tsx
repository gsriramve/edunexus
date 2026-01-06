"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  UserCheck,
  Clock,
  Filter,
  Printer,
  Mail,
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

// Mock report data
const attendanceReportData = {
  overall: 84,
  trend: "up",
  change: 2.5,
  semesterWise: [
    { semester: 1, attendance: 88, students: 120, belowThreshold: 8 },
    { semester: 2, attendance: 85, students: 118, belowThreshold: 12 },
    { semester: 3, attendance: 82, students: 115, belowThreshold: 15 },
    { semester: 4, attendance: 80, students: 112, belowThreshold: 18 },
    { semester: 5, attendance: 84, students: 108, belowThreshold: 14 },
    { semester: 6, attendance: 86, students: 105, belowThreshold: 10 },
    { semester: 7, attendance: 88, students: 102, belowThreshold: 6 },
    { semester: 8, attendance: 90, students: 100, belowThreshold: 4 },
  ],
  monthlyTrend: [
    { month: "Aug 2025", attendance: 82 },
    { month: "Sep 2025", attendance: 80 },
    { month: "Oct 2025", attendance: 83 },
    { month: "Nov 2025", attendance: 85 },
    { month: "Dec 2025", attendance: 84 },
    { month: "Jan 2026", attendance: 84 },
  ],
};

const academicReportData = {
  avgCGPA: 7.8,
  trend: "up",
  change: 0.2,
  passPercentage: 94,
  distinctionPercentage: 28,
  semesterResults: [
    { semester: 2, avgCGPA: 7.5, pass: 92, distinction: 22, fail: 8 },
    { semester: 3, avgCGPA: 7.6, pass: 93, distinction: 24, fail: 7 },
    { semester: 4, avgCGPA: 7.8, pass: 94, distinction: 26, fail: 6 },
    { semester: 5, avgCGPA: 7.9, pass: 95, distinction: 28, fail: 5 },
    { semester: 6, avgCGPA: 8.0, pass: 96, distinction: 30, fail: 4 },
    { semester: 7, avgCGPA: 8.1, pass: 97, distinction: 32, fail: 3 },
  ],
  subjectPerformance: [
    { subject: "Data Structures", avgMarks: 78, passRate: 96, topScore: 98 },
    { subject: "Computer Networks", avgMarks: 72, passRate: 92, topScore: 95 },
    { subject: "Operating Systems", avgMarks: 75, passRate: 94, topScore: 97 },
    { subject: "Software Engineering", avgMarks: 80, passRate: 98, topScore: 96 },
    { subject: "Database Systems", avgMarks: 74, passRate: 93, topScore: 94 },
  ],
};

const placementReportData = {
  placementRate: 85,
  avgPackage: 8.5,
  highestPackage: 24,
  totalOffers: 92,
  companiesVisited: 28,
  ongoingDrives: 3,
  yearWise: [
    { year: "2023", placed: 78, total: 95, rate: 82, avgPackage: 7.2 },
    { year: "2024", placed: 85, total: 98, rate: 87, avgPackage: 7.8 },
    { year: "2025", placed: 92, total: 100, rate: 92, avgPackage: 8.5 },
  ],
  topRecruiters: [
    { company: "TechCorp", offers: 12, avgPackage: 12 },
    { company: "InfoSystems", offers: 10, avgPackage: 8 },
    { company: "DataWorks", offers: 8, avgPackage: 10 },
    { company: "CloudNet", offers: 8, avgPackage: 9 },
    { company: "SoftSolutions", offers: 6, avgPackage: 7 },
  ],
};

const availableReports = [
  { id: "att-sem", name: "Semester-wise Attendance Report", type: "attendance", format: "PDF/Excel" },
  { id: "att-sub", name: "Subject-wise Attendance Report", type: "attendance", format: "PDF/Excel" },
  { id: "att-low", name: "Low Attendance Students List", type: "attendance", format: "PDF/Excel" },
  { id: "acad-result", name: "Semester Results Summary", type: "academic", format: "PDF/Excel" },
  { id: "acad-cgpa", name: "CGPA Distribution Report", type: "academic", format: "PDF" },
  { id: "acad-toppers", name: "Top Performers List", type: "academic", format: "PDF/Excel" },
  { id: "acad-risk", name: "At-Risk Students Report", type: "academic", format: "PDF/Excel" },
  { id: "place-summary", name: "Placement Summary Report", type: "placement", format: "PDF" },
  { id: "place-company", name: "Company-wise Placements", type: "placement", format: "Excel" },
  { id: "fac-workload", name: "Faculty Workload Report", type: "faculty", format: "PDF/Excel" },
  { id: "fac-attendance", name: "Faculty Attendance Report", type: "faculty", format: "PDF/Excel" },
];

export default function HODReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [reportType, setReportType] = useState("all");

  const filteredReports = availableReports.filter(
    (report) => reportType === "all" || report.type === reportType
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Reports</h1>
          <p className="text-muted-foreground">
            Analytics, reports, and insights for Computer Science & Engineering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
              <SelectItem value="year">Academic Year 2025-26</SelectItem>
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
                  <p className="text-2xl font-bold">{attendanceReportData.overall}%</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{attendanceReportData.change}%</span>
              </div>
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
                  <p className="text-2xl font-bold">{academicReportData.avgCGPA}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{academicReportData.change}</span>
              </div>
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
                <p className="text-2xl font-bold">{placementReportData.placementRate}%</p>
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
                <p className="text-2xl font-bold">{academicReportData.passPercentage}%</p>
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
                <div className="space-y-4">
                  {attendanceReportData.semesterWise.map((sem) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Trend</CardTitle>
                <CardDescription>Attendance trend over past months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-48 gap-2">
                  {attendanceReportData.monthlyTrend.map((month, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-medium">{month.attendance}%</div>
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{ height: `${(month.attendance / 100) * 150}px` }}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        {month.month.split(" ")[0].slice(0, 3)}
                      </div>
                    </div>
                  ))}
                </div>
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
                    {academicReportData.semesterResults.map((sem) => (
                      <TableRow key={sem.semester}>
                        <TableCell>
                          <Badge variant="outline">Sem {sem.semester}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{sem.avgCGPA}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500">{sem.pass}%</Badge>
                        </TableCell>
                        <TableCell className="text-center">{sem.distinction}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>Current semester subject analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicReportData.subjectPerformance.map((subject, idx) => (
                    <div key={idx} className="p-3 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{subject.subject}</span>
                        <Badge variant="outline">Top: {subject.topScore}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg: </span>
                          <span className="font-medium">{subject.avgMarks}</span>
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
                    {placementReportData.yearWise.map((year) => (
                      <TableRow key={year.year}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell className="text-center">{year.placed}</TableCell>
                        <TableCell className="text-center">{year.total}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500">{year.rate}%</Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold">₹{year.avgPackage} LPA</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-3 gap-4 mt-6 p-4 rounded-lg bg-muted">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">₹{placementReportData.highestPackage} LPA</p>
                    <p className="text-sm text-muted-foreground">Highest Package</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{placementReportData.companiesVisited}</p>
                    <p className="text-sm text-muted-foreground">Companies Visited</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{placementReportData.ongoingDrives}</p>
                    <p className="text-sm text-muted-foreground">Ongoing Drives</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Recruiters</CardTitle>
                <CardDescription>Companies with most offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {placementReportData.topRecruiters.map((company, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{company.company}</p>
                        <p className="text-sm text-muted-foreground">{company.offers} offers</p>
                      </div>
                      <Badge variant="outline">₹{company.avgPackage} LPA</Badge>
                    </div>
                  ))}
                </div>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
