"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart3,
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  Edit2,
  Save,
  TrendingUp,
  Users,
  Award,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useTeacherExams,
  useExamResults,
  useSaveResults,
  type StudentResultDto,
} from "@/hooks/use-teacher-results";
import { toast } from "sonner";

const gradeColors: Record<string, string> = {
  "A+": "bg-green-100 text-green-800",
  A: "bg-green-100 text-green-800",
  "B+": "bg-blue-100 text-blue-800",
  B: "bg-blue-100 text-blue-800",
  "C+": "bg-yellow-100 text-yellow-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  F: "bg-red-100 text-red-800",
};

export default function TeacherResultsPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editedMarks, setEditedMarks] = useState<Record<string, number>>({});

  const tenantId = useTenantId();

  // Load exams and subjects
  const { data: examsData, isLoading: isLoadingExams } = useTeacherExams(tenantId || "", {
    teacherSubjectId: selectedSubject || undefined,
    type: selectedExamType || undefined,
  });

  // Load results for selected exam
  const {
    data: resultsData,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useExamResults(tenantId || "", selectedExam);

  // Save results mutation
  const { mutate: saveResults, isPending: isSaving } = useSaveResults(tenantId || "");

  // Auto-select first exam when data loads
  useEffect(() => {
    if (examsData?.exams && examsData.exams.length > 0 && !selectedExam) {
      setSelectedExam(examsData.exams[0].id);
    }
  }, [examsData?.exams, selectedExam]);

  // Initialize edited marks when results load
  useEffect(() => {
    if (resultsData?.results && editMode) {
      const marks: Record<string, number> = {};
      for (const result of resultsData.results) {
        marks[result.studentId] = result.marks;
      }
      setEditedMarks(marks);
    }
  }, [resultsData?.results, editMode]);

  const subjects = examsData?.subjects || [];
  const examTypes = examsData?.examTypes || [];
  const exams = examsData?.exams || [];

  // Filter exams by subject and type
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSubject = !selectedSubject ||
        subjects.find((s) => s.teacherSubjectId === selectedSubject)?.id === exam.subjectId;
      const matchesType = !selectedExamType || exam.type === selectedExamType;
      return matchesSubject && matchesType;
    });
  }, [exams, selectedSubject, selectedExamType, subjects]);

  const filteredResults = useMemo(() => {
    if (!resultsData?.results) return [];
    return resultsData.results.filter(
      (result) =>
        result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resultsData?.results, searchQuery]);

  const stats = resultsData?.stats || {
    totalStudents: 0,
    appeared: 0,
    passed: 0,
    failed: 0,
    average: 0,
    highest: 0,
    lowest: 0,
    gradeDistribution: {},
  };

  const passPercentage = stats.appeared > 0
    ? Math.round((stats.passed / stats.appeared) * 100)
    : 0;

  const handleSaveResults = () => {
    if (!selectedExam) return;

    const resultsToSave = Object.entries(editedMarks).map(([studentId, marks]) => ({
      studentId,
      marks,
    }));

    saveResults(
      {
        examId: selectedExam,
        results: resultsToSave,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          setEditMode(false);
          setEditedMarks({});
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to save results");
        },
      }
    );
  };

  const handleMarksChange = (studentId: string, marks: number) => {
    setEditedMarks((prev) => ({ ...prev, [studentId]: marks }));
  };

  // Loading state
  if (isLoadingExams) {
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

  // No exams
  if (exams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">
            View and manage student examination results
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Exams Found</h3>
            <p className="text-muted-foreground">
              You haven't created any exams yet, or no classes are assigned.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">
            View and manage student examination results
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.teacherSubjectId} value={subject.teacherSubjectId}>
                {subject.code} - {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExamType} onValueChange={setSelectedExamType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Exam Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Exam Types</SelectItem>
            {examTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {filteredExams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name} - {exam.subjectCode} ({exam.date})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll number..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Appeared
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.appeared}</span>
              <span className="text-sm text-muted-foreground">
                / {stats.totalStudents}
              </span>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {passPercentage}%
              </span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.average}</span>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Highest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                {stats.highest}
              </span>
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Results Table</CardTitle>
              <CardDescription>
                {filteredResults.length} students
                {resultsData?.exam && ` - ${resultsData.exam.name}`}
              </CardDescription>
            </div>
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => {
                if (editMode) {
                  handleSaveResults();
                } else {
                  setEditMode(true);
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : editMode ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Marks
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingResults ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : resultsError ? (
            <div className="text-center py-8 text-muted-foreground">
              {resultsError instanceof Error ? resultsError.message : "Failed to load results"}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No results found. Select an exam to view results.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.studentId}>
                    <TableCell className="font-medium">{result.rollNo}</TableCell>
                    <TableCell>{result.studentName}</TableCell>
                    <TableCell className="text-center">
                      {editMode ? (
                        <Input
                          type="number"
                          value={editedMarks[result.studentId] ?? result.marks}
                          onChange={(e) =>
                            handleMarksChange(result.studentId, Number(e.target.value))
                          }
                          className="w-20 text-center mx-auto"
                          min={0}
                          max={result.maxMarks}
                        />
                      ) : (
                        <span>
                          {result.marks} / {result.maxMarks}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={gradeColors[result.grade] || "bg-gray-100"}>
                        {result.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={result.status === "pass" ? "default" : "destructive"}
                      >
                        {result.status === "pass" ? "Pass" : "Fail"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      {stats.appeared > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Overview of grade distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map((grade) => {
                const count = stats.gradeDistribution[grade] || 0;
                return (
                  <div
                    key={grade}
                    className="flex items-center gap-3 p-3 border rounded-lg min-w-[100px]"
                  >
                    <Badge className={gradeColors[grade]}>{grade}</Badge>
                    <span className="text-lg font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Results</DialogTitle>
            <DialogDescription>
              Upload an Excel file with student results
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your Excel file here, or click to browse
              </p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">File format:</p>
              <p>Excel (.xlsx) with columns: Roll Number, Marks</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowUploadDialog(false)}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
