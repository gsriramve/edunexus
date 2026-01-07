"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Target,
  Download,
  ChevronRight,
  Calendar,
  FileText,
  Users,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useParentChildren } from "@/hooks/use-parents";
import { useStudentAcademics } from "@/hooks/use-api";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /students/:id/academics - Student academic overview (already exists)
// - GET /students/:id/academics/current - Current semester marks
// - GET /students/:id/academics/results - Past semester results
// - GET /students/:id/academics/remarks - Teacher remarks/feedback

// Mock data
const childInfo = {
  name: "Rahul Sharma",
  rollNo: "21CSE101",
  department: "Computer Science & Engineering",
  currentSemester: 5,
};

const academicOverview = {
  cgpa: 8.5,
  totalCredits: 95,
  earnedCredits: 95,
  rank: 12,
  totalStudents: 120,
  percentile: 90,
};

const semesterResults = [
  { semester: 5, sgpa: 8.7, credits: 20, status: "ongoing" },
  { semester: 4, sgpa: 8.5, credits: 20, status: "completed" },
  { semester: 3, sgpa: 8.3, credits: 22, status: "completed" },
  { semester: 2, sgpa: 8.6, credits: 18, status: "completed" },
  { semester: 1, sgpa: 8.4, credits: 15, status: "completed" },
];

const currentSubjects = [
  { code: "CS501", name: "Data Structures & Algorithms", credits: 4, internal1: 18, internal2: 17, midterm: 42, assignment: 18, attendance: 90, teacher: "Dr. Ramesh Kumar" },
  { code: "CS502", name: "Computer Networks", credits: 4, internal1: 15, internal2: 16, midterm: 35, assignment: 16, attendance: 78, teacher: "Dr. Priya Sharma" },
  { code: "CS503", name: "Operating Systems", credits: 4, internal1: 17, internal2: 18, midterm: 44, assignment: 17, attendance: 92, teacher: "Dr. Arun Menon" },
  { code: "CS504", name: "Software Engineering", credits: 3, internal1: 16, internal2: 17, midterm: 40, assignment: 18, attendance: 85, teacher: "Prof. Kavitha Nair" },
  { code: "CS505", name: "Data Structures Lab", credits: 2, internal1: 19, internal2: null, midterm: null, assignment: 18, attendance: 95, teacher: "Dr. Ramesh Kumar" },
  { code: "CS506", name: "Computer Networks Lab", credits: 2, internal1: 17, internal2: null, midterm: null, assignment: 16, attendance: 82, teacher: "Dr. Priya Sharma" },
];

const semesterDetailedResults = {
  4: [
    { code: "CS401", name: "Database Systems", credits: 4, grade: "A", marks: 85, total: 100 },
    { code: "CS402", name: "Theory of Computation", credits: 4, grade: "A+", marks: 92, total: 100 },
    { code: "CS403", name: "Computer Architecture", credits: 4, grade: "A", marks: 82, total: 100 },
    { code: "CS404", name: "Discrete Mathematics", credits: 3, grade: "B+", marks: 75, total: 100 },
    { code: "CS405", name: "Database Lab", credits: 2, grade: "A+", marks: 95, total: 100 },
    { code: "CS406", name: "Web Development Lab", credits: 2, grade: "A", marks: 88, total: 100 },
  ],
};

const gradePoints: Record<string, number> = {
  "A+": 10, A: 9, "B+": 8, B: 7, "C+": 6, C: 5, D: 4, F: 0,
};

const teacherRemarks = [
  { subject: "Data Structures", teacher: "Dr. Ramesh Kumar", date: "Jan 5, 2026", remark: "Excellent performance in problem-solving. Keep up the good work!" },
  { subject: "Computer Networks", teacher: "Dr. Priya Sharma", date: "Jan 3, 2026", remark: "Needs to improve attendance. Good understanding of concepts but missing classes affects continuity." },
  { subject: "Operating Systems", teacher: "Dr. Arun Menon", date: "Jan 2, 2026", remark: "Very active in class discussions. Strong grasp of OS concepts." },
];

export default function ParentAcademics() {
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState("5");

  // Fetch parent's children
  const { data: childrenData, isLoading: childrenLoading } = useParentChildren(tenantId, user?.id || '');
  const children = childrenData || [];

  // Set first child as default when children load
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Get selected child info
  const currentChild = useMemo(() => {
    const childRecord = children.find((c) => c.id === selectedChildId);
    if (!childRecord) return null;
    return {
      id: childRecord.id,
      name: `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown',
      rollNo: childRecord.rollNo || 'N/A',
      department: childRecord.department?.name || 'N/A',
      currentSemester: childRecord.currentSemester || 1,
    };
  }, [children, selectedChildId]);

  // Fetch academics data for selected child
  const { data: academicsData, isLoading: academicsLoading } = useStudentAcademics(tenantId, selectedChildId);

  // Derive overview from API data or use mock
  // TODO: StudentAcademics API doesn't include these aggregate fields yet
  // When backend adds them, update to use: academicsData?.cgpa, etc.
  const displayOverview = useMemo(() => {
    // Currently using mock data since StudentAcademics only has currentSemester, subjects, results
    return {
      cgpa: 8.5,
      totalCredits: 95,
      earnedCredits: 95,
      rank: 12,
      totalStudents: 120,
      percentile: 90,
    };
  }, []);

  // Loading state
  if (childrenLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Progress</h1>
          <p className="text-muted-foreground">
            View your child's academic performance and results
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Children Linked</h3>
              <p>No children are currently linked to your account.</p>
              <p className="text-sm mt-2">Please contact the school administration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use API child info or fallback to mock
  const displayChild = currentChild || childInfo;

  const getGradeBadge = (grade: string) => {
    const colorMap: Record<string, string> = {
      "A+": "bg-green-500",
      A: "bg-green-400",
      "B+": "bg-blue-500",
      B: "bg-blue-400",
      "C+": "bg-yellow-500",
      C: "bg-yellow-400",
      D: "bg-orange-500",
      F: "bg-red-500",
    };
    return <Badge className={colorMap[grade] || "bg-gray-500"}>{grade}</Badge>;
  };

  const calculateCurrentAverage = (subject: typeof currentSubjects[0]) => {
    let total = 0;
    let count = 0;
    if (subject.internal1) { total += (subject.internal1 / 20) * 100; count++; }
    if (subject.internal2) { total += (subject.internal2 / 20) * 100; count++; }
    if (subject.midterm) { total += (subject.midterm / 50) * 100; count++; }
    if (subject.assignment) { total += (subject.assignment / 20) * 100; count++; }
    return count > 0 ? Math.round(total / count) : null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Progress</h1>
          <p className="text-muted-foreground">
            {displayChild.name}'s academic performance and results
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((childRecord) => {
                const childName = `${childRecord.firstName} ${childRecord.lastName}`.trim() || 'Unknown';
                return (
                  <SelectItem key={childRecord.id} value={childRecord.id}>
                    {childName} ({childRecord.rollNo || 'N/A'})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Report Card
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="text-2xl font-bold">{displayOverview.cgpa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold">{displayOverview.earnedCredits}/{displayOverview.totalCredits}</p>
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
                <p className="text-sm text-muted-foreground">Class Rank</p>
                <p className="text-2xl font-bold">{displayOverview.rank}/{displayOverview.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentile</p>
                <p className="text-2xl font-bold">{displayOverview.percentile}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-50">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Sem</p>
                <p className="text-2xl font-bold">Sem {displayChild.currentSemester}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CGPA Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>SGPA Progression</CardTitle>
          <CardDescription>Semester-wise academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            {semesterResults.slice().reverse().map((sem) => (
              <div key={sem.semester} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm font-bold">{sem.sgpa}</div>
                <div
                  className={`w-full rounded-t ${sem.status === "ongoing" ? "bg-blue-300" : "bg-primary"}`}
                  style={{ height: `${(sem.sgpa / 10) * 100}%` }}
                />
                <div className="text-xs text-muted-foreground">Sem {sem.semester}</div>
                {sem.status === "ongoing" && (
                  <Badge variant="outline" className="text-xs">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Semester</TabsTrigger>
          <TabsTrigger value="results">Past Results</TabsTrigger>
          <TabsTrigger value="remarks">Teacher Remarks</TabsTrigger>
        </TabsList>

        {/* Current Semester */}
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Semester {displayChild.currentSemester} - Current Performance</CardTitle>
              <CardDescription>Subject-wise marks and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-center">Internal 1<br/><span className="text-xs text-muted-foreground">/20</span></TableHead>
                    <TableHead className="text-center">Internal 2<br/><span className="text-xs text-muted-foreground">/20</span></TableHead>
                    <TableHead className="text-center">Mid-Sem<br/><span className="text-xs text-muted-foreground">/50</span></TableHead>
                    <TableHead className="text-center">Assignment<br/><span className="text-xs text-muted-foreground">/20</span></TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSubjects.map((subject) => {
                    const avg = calculateCurrentAverage(subject);
                    return (
                      <TableRow key={subject.code}>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="font-mono mb-1">{subject.code}</Badge>
                            <p className="font-medium">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">{subject.credits} credits</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{subject.teacher}</TableCell>
                        <TableCell className="text-center font-medium">{subject.internal1 ?? "-"}</TableCell>
                        <TableCell className="text-center font-medium">{subject.internal2 ?? "-"}</TableCell>
                        <TableCell className="text-center font-medium">{subject.midterm ?? "-"}</TableCell>
                        <TableCell className="text-center font-medium">{subject.assignment ?? "-"}</TableCell>
                        <TableCell className="text-center">
                          <span className={subject.attendance < 75 ? "text-red-600 font-bold" : "font-medium"}>
                            {subject.attendance}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {avg !== null ? (
                            <Badge className={avg >= 80 ? "bg-green-500" : avg >= 60 ? "bg-blue-500" : "bg-orange-500"}>
                              {avg}%
                            </Badge>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Results */}
        <TabsContent value="results">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Semester Results</h3>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterResults.filter(s => s.status === "completed").map((sem) => (
                    <SelectItem key={sem.semester} value={sem.semester.toString()}>
                      Semester {sem.semester} (SGPA: {sem.sgpa})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Semester {selectedSemester} Results</CardTitle>
                    <CardDescription>Final grades and marks</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">SGPA</p>
                    <p className="text-3xl font-bold text-primary">
                      {semesterResults.find(s => s.semester.toString() === selectedSemester)?.sgpa}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Marks</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Grade Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(semesterDetailedResults[4] || []).map((subject) => (
                      <TableRow key={subject.code}>
                        <TableCell className="font-mono">{subject.code}</TableCell>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell className="text-center">{subject.credits}</TableCell>
                        <TableCell className="text-center">{subject.marks}/{subject.total}</TableCell>
                        <TableCell className="text-center">{getGradeBadge(subject.grade)}</TableCell>
                        <TableCell className="text-center font-bold">{gradePoints[subject.grade]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teacher Remarks */}
        <TabsContent value="remarks">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Remarks & Feedback</CardTitle>
              <CardDescription>Recent comments from teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherRemarks.map((remark, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{remark.subject}</Badge>
                        <span className="text-sm font-medium">{remark.teacher}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{remark.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{remark.remark}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
