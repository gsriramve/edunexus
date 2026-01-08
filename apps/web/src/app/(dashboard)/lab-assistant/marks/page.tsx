"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Search,
  Download,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Calculator,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTenantId } from "@/hooks/use-tenant";
import {
  usePracticalExams,
  useExamMarks,
  useSaveMarks,
  type PracticalExam,
  type StudentForMarks,
} from "@/hooks/use-lab-assistant";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export default function PracticalMarks() {
  const tenantId = useTenantId() || "";
  const { toast } = useToast();

  // State
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [marks, setMarks] = useState<Record<string, number | null>>({});

  // API hooks
  const {
    data: examsData,
    isLoading: examsLoading,
    error: examsError,
  } = usePracticalExams(tenantId);

  const {
    data: examMarksData,
    isLoading: examMarksLoading,
  } = useExamMarks(
    tenantId,
    selectedExamId,
    {
      section: selectedSection !== "all" ? selectedSection : undefined,
      search: searchQuery || undefined,
    }
  );

  const saveMarksMutation = useSaveMarks(tenantId);

  // Practical exams list
  const practicalExams = useMemo(() => {
    return examsData?.exams || [];
  }, [examsData]);

  // Get currently selected exam details
  const selectedExam = useMemo(() => {
    return examMarksData?.exam || practicalExams.find((e) => e.id === selectedExamId);
  }, [examMarksData, practicalExams, selectedExamId]);

  // Students with marks
  const students = useMemo(() => {
    return examMarksData?.students || [];
  }, [examMarksData]);

  // Stats
  const stats = useMemo(() => {
    return examMarksData?.stats || {
      totalStudents: 0,
      marksEntered: 0,
      pending: 0,
      averageMarks: 0,
      highestMarks: 0,
      lowestMarks: 0,
    };
  }, [examMarksData]);

  // Get unique sections from students
  const sections = useMemo(() => {
    const sectionSet = new Set<string>();
    students.forEach((s) => {
      if (s.section) sectionSet.add(s.section);
    });
    return Array.from(sectionSet).sort();
  }, [students]);

  // Initialize marks when exam changes or results load
  useEffect(() => {
    if (students.length > 0) {
      const initialMarks: Record<string, number | null> = {};
      students.forEach((student) => {
        initialMarks[student.id] = student.marks;
      });
      setMarks(initialMarks);
    }
  }, [students, selectedExamId]);

  // Auto-select first exam
  useEffect(() => {
    if (practicalExams.length > 0 && !selectedExamId) {
      setSelectedExamId(practicalExams[0].id);
    }
  }, [practicalExams, selectedExamId]);

  // Filter students by search (client-side for quick filtering)
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Handle marks change
  const handleMarksChange = (studentId: string, value: string) => {
    const maxMarks = selectedExam?.totalMarks || 50;
    const numValue =
      value === "" ? null : Math.min(maxMarks, Math.max(0, parseInt(value) || 0));
    setMarks((prev) => ({ ...prev, [studentId]: numValue }));
  };

  // Calculate percentage
  const calculatePercentage = (studentMarks: number | null) => {
    if (studentMarks === null || !selectedExam) return 0;
    return Math.round((studentMarks / selectedExam.totalMarks) * 100);
  };

  // Get grade badge
  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-500">A+</Badge>;
    if (percentage >= 80) return <Badge className="bg-green-400">A</Badge>;
    if (percentage >= 70) return <Badge className="bg-blue-500">B+</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-400">B</Badge>;
    if (percentage >= 50) return <Badge className="bg-yellow-500">C</Badge>;
    return <Badge variant="destructive">F</Badge>;
  };

  // Pending exams (upcoming)
  const pendingExams = useMemo(() => {
    return practicalExams.filter((e) => e.status === "upcoming").slice(0, 5);
  }, [practicalExams]);

  // Calculate local stats for marks entered
  const localStats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const marksEntered = Object.values(marks).filter((m) => m !== null).length;
    const pending = totalStudents - marksEntered;
    const upcomingExams = practicalExams.filter((e) => e.status === "upcoming").length;

    return {
      totalStudents,
      marksEntered,
      pending,
      upcomingExams,
      totalExams: practicalExams.length,
    };
  }, [filteredStudents, marks, practicalExams]);

  // Save marks
  const saveMarks = async () => {
    if (!selectedExamId) {
      toast({
        title: "No Exam Selected",
        description: "Please select a practical exam first.",
        variant: "destructive",
      });
      return;
    }

    const marksToSave = Object.entries(marks)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([studentId, marksValue]) => ({
        studentId,
        marks: marksValue!,
      }));

    if (marksToSave.length === 0) {
      toast({
        title: "No Marks to Save",
        description: "Please enter marks for at least one student.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await saveMarksMutation.mutateAsync({
        examId: selectedExamId,
        marks: marksToSave,
      });

      toast({
        title: "Marks Saved Successfully",
        description: `Saved: ${response.saved}${
          response.failed > 0 ? `, Failed: ${response.failed}` : ""
        }`,
      });
    } catch (error) {
      toast({
        title: "Failed to Save Marks",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No tenant selected</p>
      </div>
    );
  }

  if (examsLoading) {
    return <LoadingSkeleton />;
  }

  if (examsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load practical exams: {examsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practical Marks</h1>
          <p className="text-muted-foreground">
            Enter and manage lab practical marks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Marks
          </Button>
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Grades
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{localStats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marks Entered</p>
                <p className="text-2xl font-bold text-green-600">
                  {localStats.marksEntered}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {localStats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practical Exams</p>
                <p className="text-2xl font-bold">
                  {localStats.upcomingExams}/{localStats.totalExams}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Enter Marks</TabsTrigger>
          <TabsTrigger value="summary">Summary View</TabsTrigger>
          <TabsTrigger value="pending">Upcoming Practicals</TabsTrigger>
        </TabsList>

        {/* Marks Entry Tab */}
        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Enter Practical Marks</CardTitle>
                  <CardDescription>
                    {selectedExam
                      ? `Max Marks: ${selectedExam.totalMarks} | Average: ${stats.averageMarks}`
                      : "Select a practical exam to enter marks"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedExamId}
                    onValueChange={setSelectedExamId}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select Practical Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {practicalExams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name} ({exam.totalMarks} marks)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {sections.length > 0 && (
                    <Select
                      value={selectedSection}
                      onValueChange={setSelectedSection}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sections.map((section) => (
                          <SelectItem key={section} value={section}>
                            Section {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {examMarksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : practicalExams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No practical exams found</p>
                  <p className="text-sm">
                    Practical exams need to be created first
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students found</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background">
                            Student
                          </TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead className="text-center">
                            Marks (/{selectedExam?.totalMarks || 50})
                          </TableHead>
                          <TableHead className="text-center">%</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          const studentMarks = marks[student.id];
                          const percentage = calculatePercentage(studentMarks);
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="sticky left-0 bg-background">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {student.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {student.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {student.rollNo}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {student.section || "-"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max={selectedExam?.totalMarks || 50}
                                  value={studentMarks ?? ""}
                                  onChange={(e) =>
                                    handleMarksChange(student.id, e.target.value)
                                  }
                                  className="w-20 h-8 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                {studentMarks !== null ? `${percentage}%` : "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {studentMarks !== null
                                  ? getGradeBadge(percentage)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center gap-2 mt-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {stats.highestMarks > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Highest: {stats.highestMarks}
                        </span>
                      )}
                      {stats.lowestMarks > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          Lowest: {stats.lowestMarks}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const resetMarks: Record<string, number | null> = {};
                          filteredStudents.forEach((s) => {
                            resetMarks[s.id] = null;
                          });
                          setMarks(resetMarks);
                        }}
                      >
                        Clear All
                      </Button>
                      <Button
                        onClick={saveMarks}
                        disabled={saveMarksMutation.isPending}
                      >
                        {saveMarksMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Marks
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary View Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marks Summary</CardTitle>
                  <CardDescription>
                    Overview of student marks for {selectedExam?.name || "selected exam"}
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {examMarksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No students found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student) => {
                    const studentMarks = marks[student.id];
                    const percentage = calculatePercentage(studentMarks);
                    return (
                      <div key={student.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {student.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.rollNo} | Section {student.section || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {studentMarks ?? "-"}/{selectedExam?.totalMarks || 50}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total Marks
                              </p>
                            </div>
                            {studentMarks !== null && getGradeBadge(percentage)}
                          </div>
                        </div>
                        {studentMarks !== null && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Practicals Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Upcoming Practical Exams
              </CardTitle>
              <CardDescription>
                Scheduled practical sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {examsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : pendingExams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming practical exams</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 rounded-lg border border-orange-200 bg-orange-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{exam.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exam.lab} | Total Marks: {exam.totalMarks}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{exam.date}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedExamId(exam.id);
                              const tabTrigger = document.querySelector(
                                '[data-state="inactive"][value="entry"]'
                              ) as HTMLButtonElement;
                              tabTrigger?.click();
                            }}
                          >
                            Enter Marks
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grading Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Grading Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">A+</Badge>
              <span className="text-sm">90-100%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-400">A</Badge>
              <span className="text-sm">80-89%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">B+</Badge>
              <span className="text-sm">70-79%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-400">B</Badge>
              <span className="text-sm">60-69%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500">C</Badge>
              <span className="text-sm">50-59%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">F</Badge>
              <span className="text-sm">Below 50%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
