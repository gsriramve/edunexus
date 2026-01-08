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
  TrendingDown,
  Users,
  Award,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";

// Mock data - will be replaced with API calls
const mockResultsData = {
  subjects: [
    { id: "1", code: "CS301", name: "Data Structures & Algorithms" },
    { id: "2", code: "CS302", name: "Database Management Systems" },
    { id: "3", code: "CS401", name: "Machine Learning" },
  ],
  examTypes: ["Internal 1", "Internal 2", "Mid-Semester", "End-Semester"],
  results: [
    {
      id: "1",
      studentId: "STU001",
      studentName: "Rahul Sharma",
      rollNumber: "CS2023001",
      marks: 85,
      maxMarks: 100,
      grade: "A",
      status: "pass",
    },
    {
      id: "2",
      studentId: "STU002",
      studentName: "Priya Patel",
      rollNumber: "CS2023002",
      marks: 92,
      maxMarks: 100,
      grade: "A+",
      status: "pass",
    },
    {
      id: "3",
      studentId: "STU003",
      studentName: "Amit Kumar",
      rollNumber: "CS2023003",
      marks: 78,
      maxMarks: 100,
      grade: "B+",
      status: "pass",
    },
    {
      id: "4",
      studentId: "STU004",
      studentName: "Sneha Gupta",
      rollNumber: "CS2023004",
      marks: 65,
      maxMarks: 100,
      grade: "B",
      status: "pass",
    },
    {
      id: "5",
      studentId: "STU005",
      studentName: "Ravi Singh",
      rollNumber: "CS2023005",
      marks: 45,
      maxMarks: 100,
      grade: "D",
      status: "pass",
    },
    {
      id: "6",
      studentId: "STU006",
      studentName: "Meera Nair",
      rollNumber: "CS2023006",
      marks: 32,
      maxMarks: 100,
      grade: "F",
      status: "fail",
    },
  ],
  stats: {
    totalStudents: 45,
    appeared: 42,
    passed: 38,
    failed: 4,
    average: 72.5,
    highest: 98,
    lowest: 28,
  },
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const tenantId = useTenantId();

  const isLoading = false;
  const data = mockResultsData;

  const filteredResults = data.results.filter((result) =>
    result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const passPercentage = Math.round((data.stats.passed / data.stats.appeared) * 100);

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
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {data.subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExamType} onValueChange={setSelectedExamType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Exam Type" />
          </SelectTrigger>
          <SelectContent>
            {data.examTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase().replace(" ", "-")}>
                {type}
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
              <span className="text-2xl font-bold">{data.stats.appeared}</span>
              <span className="text-sm text-muted-foreground">
                / {data.stats.totalStudents}
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
              <span className="text-2xl font-bold">{data.stats.average}</span>
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
                {data.stats.highest}
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
              </CardDescription>
            </div>
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? (
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
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.rollNumber}</TableCell>
                  <TableCell>{result.studentName}</TableCell>
                  <TableCell className="text-center">
                    {editMode ? (
                      <Input
                        type="number"
                        defaultValue={result.marks}
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
                    <Badge className={gradeColors[result.grade]}>
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
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Overview of grade distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map((grade) => {
              const count = data.results.filter((r) => r.grade === grade).length;
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
