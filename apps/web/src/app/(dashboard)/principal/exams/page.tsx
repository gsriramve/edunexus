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
  BarChart3
} from "lucide-react";
import { useState } from "react";

// Mock data - Replace with real API calls
const examStats = {
  totalExams: 24,
  completed: 18,
  ongoing: 2,
  upcoming: 4,
  totalStudents: 1250,
  averagePassRate: 84.5,
  resultsPublished: 16,
  resultsPending: 2,
};

const upcomingExams = [
  {
    id: "1",
    name: "End Semester Examination",
    type: "Theory",
    department: "All Departments",
    startDate: "2026-01-15",
    endDate: "2026-01-30",
    status: "scheduled",
    studentsRegistered: 1180,
  },
  {
    id: "2",
    name: "Practical Examination",
    type: "Practical",
    department: "Computer Science",
    startDate: "2026-01-20",
    endDate: "2026-01-25",
    status: "scheduled",
    studentsRegistered: 245,
  },
  {
    id: "3",
    name: "Mid Semester Test - II",
    type: "Internal",
    department: "Electronics",
    startDate: "2026-02-01",
    endDate: "2026-02-03",
    status: "scheduled",
    studentsRegistered: 198,
  },
  {
    id: "4",
    name: "Lab Assessment",
    type: "Practical",
    department: "Mechanical",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    status: "scheduled",
    studentsRegistered: 220,
  },
];

const departmentResults = [
  {
    department: "Computer Science",
    appeared: 240,
    passed: 228,
    passRate: 95,
    distinction: 45,
    firstClass: 120,
    secondClass: 63,
    failed: 12,
  },
  {
    department: "Electronics",
    appeared: 195,
    passed: 172,
    passRate: 88,
    distinction: 28,
    firstClass: 85,
    secondClass: 59,
    failed: 23,
  },
  {
    department: "Mechanical",
    appeared: 215,
    passed: 180,
    passRate: 84,
    distinction: 22,
    firstClass: 78,
    secondClass: 80,
    failed: 35,
  },
  {
    department: "Civil",
    appeared: 180,
    passed: 158,
    passRate: 88,
    distinction: 25,
    firstClass: 72,
    secondClass: 61,
    failed: 22,
  },
  {
    department: "Electrical",
    appeared: 165,
    passed: 140,
    passRate: 85,
    distinction: 18,
    firstClass: 65,
    secondClass: 57,
    failed: 25,
  },
];

const recentResults = [
  { exam: "Mid Semester Test - I", department: "Computer Science", passRate: 94, publishedDate: "2025-12-20" },
  { exam: "Internal Assessment 2", department: "Electronics", passRate: 87, publishedDate: "2025-12-18" },
  { exam: "Lab Practical", department: "Mechanical", passRate: 91, publishedDate: "2025-12-15" },
  { exam: "Mid Semester Test - I", department: "Civil", passRate: 89, publishedDate: "2025-12-12" },
];

export default function PrincipalExamsPage() {
  const [selectedSemester, setSelectedSemester] = useState("odd-2025");

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case "Theory":
        return <Badge className="bg-blue-100 text-blue-800">{type}</Badge>;
      case "Practical":
        return <Badge className="bg-purple-100 text-purple-800">{type}</Badge>;
      case "Internal":
        return <Badge className="bg-orange-100 text-orange-800">{type}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
            <div className="text-2xl font-bold">{examStats.totalExams}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">{examStats.completed} completed</span>
              <span className="text-xs text-yellow-600">{examStats.ongoing} ongoing</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Appeared</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examStats.totalStudents.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{examStats.averagePassRate}%</div>
            <p className="text-xs text-green-600">
              +1.5% from last semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examStats.resultsPublished}/{examStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {examStats.resultsPending} results pending
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Examination</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>{getExamTypeBadge(exam.type)}</TableCell>
                      <TableCell>{exam.department}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                      </TableCell>
                      <TableCell className="text-center">{exam.studentsRegistered}</TableCell>
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
                <div className="text-3xl font-bold text-green-600">{examStats.completed}</div>
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
                <div className="text-3xl font-bold text-yellow-600">{examStats.ongoing}</div>
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
                <div className="text-3xl font-bold text-blue-600">{examStats.upcoming}</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled this month</p>
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
                    <TableRow key={dept.department}>
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
                <div className="space-y-4">
                  {recentResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{result.exam}</p>
                        <p className="text-xs text-muted-foreground">{result.department}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${result.passRate >= 90 ? "text-green-600" : "text-yellow-600"}`}>
                          {result.passRate}% pass
                        </p>
                        <p className="text-xs text-muted-foreground">{result.publishedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">Mechanical - High Failure Rate</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      35 students failed in recent exams. Consider remedial classes.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">2 Results Pending Publication</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Electronics Mid-Sem and Civil Lab results awaiting approval.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">Computer Science - Top Performer</p>
                    <p className="text-xs text-green-700 mt-1">
                      95% pass rate - highest across all departments this semester.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
