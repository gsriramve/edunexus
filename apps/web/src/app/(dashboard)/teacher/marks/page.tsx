"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PenLine,
  Save,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Calculator,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useExams,
  useExamResultsByExam,
  useBulkCreateExamResults,
  useStudents,
} from "@/hooks/use-api";
import type { Exam, ExamResult, Student } from "@/lib/api";

export default function TeacherMarks() {
  const tenantId = useTenantId();
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [marks, setMarks] = useState<Record<string, number | null>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch exams
  const {
    data: examsData,
    isLoading: examsLoading,
  } = useExams(tenantId || "");

  // Fetch students
  const {
    data: studentsData,
    isLoading: studentsLoading,
  } = useStudents(tenantId || "", {
    section: selectedSection !== "all" ? selectedSection : undefined,
    status: "active",
    limit: 200,
  });

  // Fetch existing results for selected exam
  const {
    data: examResultsData,
    isLoading: resultsLoading,
    refetch: refetchResults,
  } = useExamResultsByExam(tenantId || "", selectedExamId);

  // Bulk create mutation
  const bulkCreateMutation = useBulkCreateExamResults(tenantId || "");

  const exams = examsData?.data || [];
  const students = studentsData?.data || [];
  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const existingResults = examResultsData?.results || [];
  const examStats = examResultsData?.stats;

  // Initialize marks from existing results when exam changes
  useEffect(() => {
    if (existingResults.length > 0) {
      const existingMarks: Record<string, number | null> = {};
      existingResults.forEach((result: ExamResult) => {
        existingMarks[result.studentId] = Number(result.marks);
      });
      setMarks(existingMarks);
    } else {
      setMarks({});
    }
    setHasChanges(false);
  }, [selectedExamId, existingResults.length]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return students.filter((student: Student) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        student.user.name.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower)
      );
    });
  }, [students, searchQuery]);

  // Update marks for a student
  const updateMarks = (studentId: string, value: string) => {
    const maxMarks = selectedExam?.totalMarks || 100;
    const numValue = value === "" ? null : Math.min(Math.max(0, Number(value)), maxMarks);
    setMarks((prev) => ({
      ...prev,
      [studentId]: numValue,
    }));
    setHasChanges(true);
  };

  // Calculate stats from current marks
  const currentStats = useMemo(() => {
    const enteredMarks = Object.values(marks).filter((m) => m !== null && m !== undefined) as number[];
    return {
      entered: enteredMarks.length,
      total: filteredStudents.length,
      average: enteredMarks.length > 0
        ? Math.round(enteredMarks.reduce((a, b) => a + b, 0) / enteredMarks.length)
        : 0,
      highest: enteredMarks.length > 0 ? Math.max(...enteredMarks) : 0,
      lowest: enteredMarks.length > 0 ? Math.min(...enteredMarks) : 0,
    };
  }, [marks, filteredStudents]);

  // Save marks
  const saveMarks = async () => {
    if (!selectedExamId || !tenantId) {
      toast.error("Please select an exam first");
      return;
    }

    // Build results array
    const results = Object.entries(marks)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([studentId, marksValue]) => ({
        studentId,
        marks: marksValue!,
      }));

    if (results.length === 0) {
      toast.error("No marks to save");
      return;
    }

    try {
      const response = await bulkCreateMutation.mutateAsync({
        examId: selectedExamId,
        results,
      });

      if (response.failed > 0) {
        toast.warning(`Saved ${response.success} results, ${response.failed} failed`);
        response.errors.forEach((err) => {
          console.error(`Failed for ${err.studentId}: ${err.error}`);
        });
      } else {
        toast.success(`Successfully saved ${response.success} marks`);
      }

      setHasChanges(false);
      refetchResults();
    } catch (error) {
      toast.error("Failed to save marks");
      console.error("Save marks error:", error);
    }
  };

  // Get grade from percentage
  const getGrade = (marks: number | null, totalMarks: number) => {
    if (marks === null) return "-";
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  // Get unique sections from students
  const sections = useMemo(() => {
    const sectionSet = new Set<string>();
    students.forEach((s: Student) => {
      if (s.section) sectionSet.add(s.section);
    });
    return Array.from(sectionSet).sort();
  }, [students]);

  // Loading state
  if (!tenantId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">
          Please select a tenant to enter marks.
        </p>
        <p className="text-sm text-muted-foreground">
          Add <code className="bg-muted px-2 py-1 rounded">?tenantId=your-tenant-id</code> to the URL
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marks Entry</h1>
          <p className="text-muted-foreground">
            Enter and manage student marks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={saveMarks}
            disabled={!hasChanges || bulkCreateMutation.isPending}
          >
            {bulkCreateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Marks
          </Button>
        </div>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Exam</label>
              {examsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No exams available
                      </SelectItem>
                    ) : (
                      exams.map((exam: Exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name} - {exam.subject?.name || "N/A"} ({exam.totalMarks} marks)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or roll number..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          {selectedExam && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <Badge variant="outline">
                Subject: {selectedExam.subject?.name || "N/A"}
              </Badge>
              <Badge variant="outline">
                Max Marks: {selectedExam.totalMarks}
              </Badge>
              <Badge variant="secondary">
                Type: {selectedExam.type}
              </Badge>
              <Badge variant="secondary">
                Date: {new Date(selectedExam.date).toLocaleDateString()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <PenLine className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entered</p>
                <p className="text-2xl font-bold">
                  {currentStats.entered}/{currentStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">{currentStats.average}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest</p>
                <p className="text-2xl font-bold">{currentStats.highest}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lowest</p>
                <p className="text-2xl font-bold">{currentStats.lowest || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <FileSpreadsheet className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {currentStats.total > 0
                    ? Math.round((currentStats.entered / currentStats.total) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marks Entry Table */}
      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Marks Entry</TabsTrigger>
          <TabsTrigger value="results">Saved Results</TabsTrigger>
        </TabsList>

        {/* Entry Tab */}
        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>
                Enter Marks {selectedExam ? `- ${selectedExam.name}` : ""}
              </CardTitle>
              <CardDescription>
                {selectedExam
                  ? `Maximum marks: ${selectedExam.totalMarks} | Enter marks for each student`
                  : "Select an exam to enter marks"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedExamId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PenLine className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">Select an Exam</h3>
                  <p className="text-muted-foreground">
                    Choose an exam from the dropdown above to start entering marks.
                  </p>
                </div>
              ) : studentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Students Found</h3>
                  <p className="text-muted-foreground">
                    No students match your search criteria.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-32 text-center">
                        Marks (/{selectedExam?.totalMarks})
                      </TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student: Student, index: number) => {
                      const studentMark = marks[student.id] ?? null;
                      const maxMarks = selectedExam?.totalMarks || 100;
                      const percentage = studentMark !== null
                        ? Math.round((studentMark / maxMarks) * 100)
                        : null;
                      const grade = getGrade(studentMark, maxMarks);

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono">{student.rollNo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {student.user.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.user.name}</p>
                                {student.section && (
                                  <p className="text-xs text-muted-foreground">
                                    Section: {student.section}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={studentMark ?? ""}
                              onChange={(e) => updateMarks(student.id, e.target.value)}
                              className="w-24 text-center mx-auto"
                              placeholder="-"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {percentage !== null ? (
                              <span
                                className={`font-medium ${
                                  percentage < 40
                                    ? "text-red-600"
                                    : percentage >= 80
                                    ? "text-green-600"
                                    : ""
                                }`}
                              >
                                {percentage}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={grade === "-" ? "outline" : "default"}
                              className={
                                grade === "F"
                                  ? "bg-red-500"
                                  : grade.startsWith("A")
                                  ? "bg-green-500"
                                  : grade.startsWith("B")
                                  ? "bg-blue-500"
                                  : grade === "-"
                                  ? ""
                                  : "bg-yellow-500"
                              }
                            >
                              {grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {studentMark !== null ? (
                              <Badge
                                className={
                                  percentage! < 40 ? "bg-red-500" : "bg-green-500"
                                }
                              >
                                {percentage! < 40 ? "Fail" : "Pass"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Entered</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Saved Results</CardTitle>
              <CardDescription>
                {selectedExam
                  ? `Previously saved results for ${selectedExam.name}`
                  : "Select an exam to view saved results"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedExamId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">Select an Exam</h3>
                  <p className="text-muted-foreground">
                    Choose an exam to view saved results.
                  </p>
                </div>
              ) : resultsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : existingResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Results Saved</h3>
                  <p className="text-muted-foreground">
                    No marks have been saved for this exam yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats summary */}
                  {examStats && (
                    <div className="mb-6 p-4 bg-muted rounded-lg flex gap-8">
                      <div>
                        <span className="text-sm text-muted-foreground">Total Students: </span>
                        <span className="font-bold">{examStats.totalStudents}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Average: </span>
                        <span className="font-bold">{examStats.average}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Highest: </span>
                        <span className="font-bold">{examStats.highest}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Lowest: </span>
                        <span className="font-bold">{examStats.lowest}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Pass Count: </span>
                        <span className="font-bold">{examStats.passCount}</span>
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-center">Marks</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {existingResults.map((result: ExamResult, index: number) => (
                        <TableRow key={result.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-mono">
                            {result.student?.rollNo || "N/A"}
                          </TableCell>
                          <TableCell>
                            {result.student?.user?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {result.marks}/{selectedExam?.totalMarks}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                result.grade === "F"
                                  ? "bg-red-500"
                                  : result.grade?.startsWith("A")
                                  ? "bg-green-500"
                                  : result.grade?.startsWith("B")
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                              }
                            >
                              {result.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {result.remarks || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-blue-800">Marks Entry Guidelines</h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Select an exam first, then enter marks for each student</li>
                <li>• Marks are automatically validated against the maximum marks</li>
                <li>• Click &quot;Save Marks&quot; to save your changes to the database</li>
                <li>• Existing marks will be updated when you save again</li>
                <li>• Use the &quot;Saved Results&quot; tab to view previously entered marks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
