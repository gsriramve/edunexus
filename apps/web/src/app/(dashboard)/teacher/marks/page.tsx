"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";

// Mock data
const subjects = [
  { id: "cs501", name: "Data Structures", code: "CS501" },
  { id: "cs505", name: "Data Structures Lab", code: "CS505" },
  { id: "cs502", name: "Algorithms", code: "CS502" },
];

const examTypes = [
  { id: "internal1", name: "Internal 1", maxMarks: 20, weightage: 10 },
  { id: "internal2", name: "Internal 2", maxMarks: 20, weightage: 10 },
  { id: "midterm", name: "Mid Semester", maxMarks: 50, weightage: 20 },
  { id: "assignment", name: "Assignments", maxMarks: 20, weightage: 10 },
  { id: "lab", name: "Lab/Practical", maxMarks: 50, weightage: 20 },
  { id: "endsem", name: "End Semester", maxMarks: 100, weightage: 30 },
];

const students = [
  { id: "1", rollNo: "21CSE001", name: "Aakash Verma", internal1: 18, internal2: 17, midterm: 42, assignment: 18, lab: 45, endsem: null },
  { id: "2", rollNo: "21CSE002", name: "Aditi Sharma", internal1: 16, internal2: 18, midterm: 38, assignment: 17, lab: 42, endsem: null },
  { id: "3", rollNo: "21CSE003", name: "Amit Kumar", internal1: 12, internal2: 10, midterm: 28, assignment: 12, lab: 32, endsem: null },
  { id: "4", rollNo: "21CSE004", name: "Ananya Patel", internal1: 19, internal2: 20, midterm: 48, assignment: 20, lab: 48, endsem: null },
  { id: "5", rollNo: "21CSE005", name: "Arjun Singh", internal1: 14, internal2: 15, midterm: 35, assignment: 15, lab: 38, endsem: null },
  { id: "6", rollNo: "21CSE006", name: "Bhavya Reddy", internal1: 17, internal2: 16, midterm: 40, assignment: 16, lab: 44, endsem: null },
  { id: "7", rollNo: "21CSE007", name: "Chetan Gupta", internal1: 15, internal2: 17, midterm: 36, assignment: 18, lab: 40, endsem: null },
  { id: "8", rollNo: "21CSE008", name: "Deepika Joshi", internal1: 10, internal2: 8, midterm: 22, assignment: 10, lab: 28, endsem: null },
];

type ExamType = "internal1" | "internal2" | "midterm" | "assignment" | "lab" | "endsem";

export default function TeacherMarks() {
  const [selectedSubject, setSelectedSubject] = useState("cs501");
  const [selectedSection, setSelectedSection] = useState("CSE-A");
  const [selectedExam, setSelectedExam] = useState<ExamType>("internal1");
  const [searchQuery, setSearchQuery] = useState("");
  const [marks, setMarks] = useState<Record<string, Record<ExamType, number | null>>>(
    students.reduce((acc, student) => ({
      ...acc,
      [student.id]: {
        internal1: student.internal1,
        internal2: student.internal2,
        midterm: student.midterm,
        assignment: student.assignment,
        lab: student.lab,
        endsem: student.endsem,
      },
    }), {})
  );
  const [hasChanges, setHasChanges] = useState(false);

  const selectedExamData = examTypes.find((e) => e.id === selectedExam);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateMarks = (studentId: string, value: string) => {
    const numValue = value === "" ? null : Math.min(Number(value), selectedExamData?.maxMarks || 100);
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [selectedExam]: numValue,
      },
    }));
    setHasChanges(true);
  };

  const calculateTotal = (studentId: string) => {
    const studentMarks = marks[studentId];
    let total = 0;
    let maxPossible = 0;

    examTypes.forEach((exam) => {
      const mark = studentMarks[exam.id as ExamType];
      if (mark !== null) {
        total += (mark / exam.maxMarks) * exam.weightage;
        maxPossible += exam.weightage;
      }
    });

    return maxPossible > 0 ? Math.round((total / maxPossible) * 100) : null;
  };

  const getGrade = (percentage: number | null) => {
    if (percentage === null) return "-";
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const saveMarks = () => {
    // TODO: API call to save marks
    console.log("Saving marks:", { subjectId: selectedSubject, examType: selectedExam, marks });
    setHasChanges(false);
    alert("Marks saved successfully!");
  };

  const stats = {
    entered: filteredStudents.filter((s) => marks[s.id][selectedExam] !== null).length,
    total: filteredStudents.length,
    average: Math.round(
      filteredStudents
        .filter((s) => marks[s.id][selectedExam] !== null)
        .reduce((sum, s) => sum + (marks[s.id][selectedExam] || 0), 0) /
        Math.max(filteredStudents.filter((s) => marks[s.id][selectedExam] !== null).length, 1)
    ),
    highest: Math.max(...filteredStudents.map((s) => marks[s.id][selectedExam] || 0)),
    lowest: Math.min(
      ...filteredStudents
        .filter((s) => marks[s.id][selectedExam] !== null)
        .map((s) => marks[s.id][selectedExam] || 0)
    ),
  };

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
          <Button onClick={saveMarks} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Marks
          </Button>
        </div>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE-A">CSE-A</SelectItem>
                  <SelectItem value="CSE-B">CSE-B</SelectItem>
                  <SelectItem value="CSE-C">CSE-C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Exam Type</label>
              <Select value={selectedExam} onValueChange={(v) => setSelectedExam(v as ExamType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} (Max: {exam.maxMarks})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          {selectedExamData && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Max Marks: {selectedExamData.maxMarks}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Weightage: {selectedExamData.weightage}%</Badge>
              </div>
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
                <p className="text-2xl font-bold">{stats.entered}/{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.average}</p>
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
                <p className="text-2xl font-bold">{stats.highest}</p>
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
                <p className="text-2xl font-bold">{stats.lowest || "-"}</p>
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
                <p className="text-2xl font-bold">{Math.round((stats.entered / stats.total) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marks Entry Table */}
      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Marks Entry</TabsTrigger>
          <TabsTrigger value="summary">Summary View</TabsTrigger>
        </TabsList>

        {/* Entry Tab */}
        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>Enter Marks - {selectedExamData?.name}</CardTitle>
              <CardDescription>
                Maximum marks: {selectedExamData?.maxMarks} | Enter marks for each student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-32 text-center">
                      Marks (/{selectedExamData?.maxMarks})
                    </TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => {
                    const studentMark = marks[student.id][selectedExam];
                    const percentage = studentMark !== null && selectedExamData
                      ? Math.round((studentMark / selectedExamData.maxMarks) * 100)
                      : null;

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-mono">{student.rollNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {student.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={selectedExamData?.maxMarks}
                            value={studentMark ?? ""}
                            onChange={(e) => updateMarks(student.id, e.target.value)}
                            className="w-24 text-center mx-auto"
                            placeholder="-"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {percentage !== null ? (
                            <span className={`font-medium ${percentage < 40 ? "text-red-600" : percentage >= 80 ? "text-green-600" : ""}`}>
                              {percentage}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {studentMark !== null ? (
                            <Badge className={percentage! < 40 ? "bg-red-500" : percentage! >= 80 ? "bg-green-500" : "bg-blue-500"}>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Marks Summary</CardTitle>
              <CardDescription>
                Complete marks overview for all exam types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    {examTypes.map((exam) => (
                      <TableHead key={exam.id} className="text-center text-xs">
                        {exam.name}
                        <br />
                        <span className="text-muted-foreground">/{exam.maxMarks}</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Total %</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const total = calculateTotal(student.id);
                    const grade = getGrade(total);

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono">{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        {examTypes.map((exam) => (
                          <TableCell key={exam.id} className="text-center">
                            {marks[student.id][exam.id as ExamType] ?? "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">
                          {total !== null ? `${total}%` : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              grade === "F"
                                ? "bg-red-500"
                                : grade.startsWith("A")
                                ? "bg-green-500"
                                : grade.startsWith("B")
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                            }
                          >
                            {grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                <li>• Enter marks within the maximum limit for each exam type</li>
                <li>• Save your changes before switching to another exam type</li>
                <li>• Use the Summary view to see overall student performance</li>
                <li>• Export marks to Excel for record keeping</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
