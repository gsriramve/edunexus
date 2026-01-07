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
import { BookOpen, GraduationCap, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

// Mock data - Replace with real API calls
const academicStats = {
  totalCourses: 48,
  activeCourses: 42,
  totalSubjects: 156,
  totalCredits: 520,
  averagePassRate: 87.5,
  studentsEnrolled: 1250,
};

const departmentCurriculum = [
  {
    id: "1",
    department: "Computer Science",
    courses: 12,
    subjects: 45,
    credits: 140,
    syllabusStatus: "completed",
    passRate: 92,
  },
  {
    id: "2",
    department: "Electronics",
    courses: 10,
    subjects: 38,
    credits: 120,
    syllabusStatus: "completed",
    passRate: 88,
  },
  {
    id: "3",
    department: "Mechanical",
    courses: 11,
    subjects: 42,
    credits: 130,
    syllabusStatus: "in_progress",
    passRate: 85,
  },
  {
    id: "4",
    department: "Civil",
    courses: 9,
    subjects: 35,
    credits: 110,
    syllabusStatus: "completed",
    passRate: 89,
  },
  {
    id: "5",
    department: "Electrical",
    courses: 8,
    subjects: 32,
    credits: 100,
    syllabusStatus: "pending",
    passRate: 86,
  },
];

const recentCourseUpdates = [
  { course: "Data Structures", department: "Computer Science", action: "Syllabus Updated", date: "2 days ago" },
  { course: "Digital Electronics", department: "Electronics", action: "New Subject Added", date: "3 days ago" },
  { course: "Thermodynamics", department: "Mechanical", action: "Credits Modified", date: "5 days ago" },
  { course: "Structural Analysis", department: "Civil", action: "Syllabus Approved", date: "1 week ago" },
];

const semesterProgress = [
  { semester: "Semester 1", completed: 85, total: 100 },
  { semester: "Semester 2", completed: 78, total: 100 },
  { semester: "Semester 3", completed: 92, total: 100 },
  { semester: "Semester 4", completed: 70, total: 100 },
  { semester: "Semester 5", completed: 65, total: 100 },
  { semester: "Semester 6", completed: 45, total: 100 },
];

export default function PrincipalAcademicsPage() {
  const [selectedYear, setSelectedYear] = useState("2025-26");

  const getSyllabusStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "pending":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academics Overview</h1>
          <p className="text-muted-foreground">
            Institution-wide curriculum and course management overview
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-26">2025-26</SelectItem>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2023-24">2023-24</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {academicStats.activeCourses} active this semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              {academicStats.totalCredits} total credits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.studentsEnrolled.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicStats.averagePassRate}%</div>
            <p className="text-xs text-green-600">
              +2.3% from last year
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Curriculum Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Department Curriculum Status</CardTitle>
            <CardDescription>Course and syllabus status across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Syllabus Status</TableHead>
                  <TableHead className="text-center">Pass Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentCurriculum.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell className="text-center">{dept.courses}</TableCell>
                    <TableCell className="text-center">{dept.subjects}</TableCell>
                    <TableCell className="text-center">{dept.credits}</TableCell>
                    <TableCell className="text-center">{getSyllabusStatusBadge(dept.syllabusStatus)}</TableCell>
                    <TableCell className="text-center">
                      <span className={dept.passRate >= 90 ? "text-green-600 font-medium" : dept.passRate >= 80 ? "text-yellow-600" : "text-red-600"}>
                        {dept.passRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Syllabus Completion by Semester */}
        <Card>
          <CardHeader>
            <CardTitle>Syllabus Completion</CardTitle>
            <CardDescription>Progress across all semesters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {semesterProgress.map((sem) => (
              <div key={sem.semester} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{sem.semester}</span>
                  <span className="text-muted-foreground">{sem.completed}%</span>
                </div>
                <Progress value={sem.completed} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Curriculum Updates</CardTitle>
            <CardDescription>Latest changes across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourseUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{update.course}</p>
                    <p className="text-xs text-muted-foreground">{update.department}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">{update.action}</Badge>
                      <span className="text-xs text-muted-foreground">{update.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
