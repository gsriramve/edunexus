"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Save,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Calculator,
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

// Mock data
const labs = [
  { id: "lab-1", name: "Computer Networks Lab", code: "CS506", maxMarks: 50 },
  { id: "lab-2", name: "Data Structures Lab", code: "CS505", maxMarks: 50 },
];

const batches = [
  { id: "batch-1", name: "CSE-5A", semester: 5, section: "A" },
  { id: "batch-2", name: "CSE-5B", semester: 5, section: "B" },
  { id: "batch-3", name: "CSE-3A", semester: 3, section: "A" },
  { id: "batch-4", name: "CSE-3B", semester: 3, section: "B" },
];

const labExperiments = [
  { id: 1, name: "Lab 1: Network Configuration", maxMarks: 5 },
  { id: 2, name: "Lab 2: IP Addressing", maxMarks: 5 },
  { id: 3, name: "Lab 3: Subnetting", maxMarks: 5 },
  { id: 4, name: "Lab 4: Routing Protocols", maxMarks: 5 },
  { id: 5, name: "Lab 5: Socket Programming", maxMarks: 5 },
  { id: 6, name: "Lab 6: Client-Server", maxMarks: 5 },
  { id: 7, name: "Lab 7: DNS & HTTP", maxMarks: 5 },
  { id: 8, name: "Lab 8: Network Security", maxMarks: 5 },
  { id: 9, name: "Lab 9: Wireshark Analysis", maxMarks: 5 },
  { id: 10, name: "Lab 10: Final Project", maxMarks: 5 },
];

const studentMarks = [
  { id: "s1", rollNo: "21CSE001", name: "Rahul Sharma", marks: [5, 4, 5, 4, 5, 4, null, null, null, null], total: 27, percentage: 90 },
  { id: "s2", rollNo: "21CSE002", name: "Priya Menon", marks: [5, 5, 5, 5, 5, 5, null, null, null, null], total: 30, percentage: 100 },
  { id: "s3", rollNo: "21CSE003", name: "Arun Kumar", marks: [3, 4, 3, 4, 3, 4, null, null, null, null], total: 21, percentage: 70 },
  { id: "s4", rollNo: "21CSE004", name: "Kavitha Nair", marks: [4, 4, 5, 4, 4, 5, null, null, null, null], total: 26, percentage: 87 },
  { id: "s5", rollNo: "21CSE005", name: "Vijay Pillai", marks: [3, 3, 3, 3, 3, 3, null, null, null, null], total: 18, percentage: 60 },
  { id: "s6", rollNo: "21CSE006", name: "Meera Das", marks: [5, 5, 4, 5, 5, 4, null, null, null, null], total: 28, percentage: 93 },
  { id: "s7", rollNo: "21CSE007", name: "Suresh Reddy", marks: [4, 4, 4, 4, 4, 4, null, null, null, null], total: 24, percentage: 80 },
  { id: "s8", rollNo: "21CSE008", name: "Anitha Krishnan", marks: [4, 5, 4, 5, 4, 5, null, null, null, null], total: 27, percentage: 90 },
];

const marksEntryStatus = {
  totalStudents: 30,
  marksEntered: 24,
  pending: 6,
  labsCompleted: 6,
  totalLabs: 10,
};

const pendingEntries = [
  { lab: "Lab 7: DNS & HTTP", batch: "CSE-5A", students: 30, dueDate: "Jan 8, 2026" },
  { lab: "Lab 8: Network Security", batch: "CSE-5A", students: 30, dueDate: "Jan 15, 2026" },
  { lab: "Lab 7: DNS & HTTP", batch: "CSE-5B", students: 30, dueDate: "Jan 10, 2026" },
];

export default function PracticalMarks() {
  const [selectedLab, setSelectedLab] = useState(labs[0].id);
  const [selectedBatch, setSelectedBatch] = useState(batches[0].id);
  const [selectedExperiment, setSelectedExperiment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [marks, setMarks] = useState<Record<string, (number | null)[]>>(
    Object.fromEntries(studentMarks.map((s) => [s.id, [...s.marks]]))
  );

  const filteredStudents = studentMarks.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarksChange = (studentId: string, labIndex: number, value: string) => {
    const numValue = value === "" ? null : Math.min(5, Math.max(0, parseInt(value) || 0));
    setMarks((prev) => {
      const newMarks = [...prev[studentId]];
      newMarks[labIndex] = numValue;
      return { ...prev, [studentId]: newMarks };
    });
  };

  const calculateTotal = (studentId: string) => {
    return marks[studentId].reduce((sum: number, mark) => sum + (mark || 0), 0);
  };

  const calculatePercentage = (studentId: string) => {
    const completedLabs = marks[studentId].filter((m) => m !== null).length;
    if (completedLabs === 0) return 0;
    const total = calculateTotal(studentId);
    const maxPossible = completedLabs * 5;
    return Math.round((total / maxPossible) * 100);
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-500">A+</Badge>;
    if (percentage >= 80) return <Badge className="bg-green-400">A</Badge>;
    if (percentage >= 70) return <Badge className="bg-blue-500">B+</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-400">B</Badge>;
    if (percentage >= 50) return <Badge className="bg-yellow-500">C</Badge>;
    return <Badge variant="destructive">F</Badge>;
  };

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
                <p className="text-2xl font-bold">{marksEntryStatus.totalStudents}</p>
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
                <p className="text-2xl font-bold text-green-600">{marksEntryStatus.marksEntered}</p>
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
                <p className="text-2xl font-bold text-orange-600">{marksEntryStatus.pending}</p>
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
                <p className="text-sm text-muted-foreground">Labs Progress</p>
                <p className="text-2xl font-bold">{marksEntryStatus.labsCompleted}/{marksEntryStatus.totalLabs}</p>
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
          <TabsTrigger value="pending">Pending Entries</TabsTrigger>
        </TabsList>

        {/* Marks Entry Tab */}
        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Enter Lab Marks</CardTitle>
                  <CardDescription>
                    Enter marks for each lab experiment (Max: 5 marks each)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedLab} onValueChange={setSelectedLab}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labs.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id}>
                          {lab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background">Student</TableHead>
                      {labExperiments.slice(0, 6).map((exp) => (
                        <TableHead key={exp.id} className="text-center min-w-[60px]">
                          <span className="text-xs">Lab {exp.id}</span>
                          <br />
                          <span className="text-xs text-muted-foreground">/5</span>
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-background">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                            </div>
                          </div>
                        </TableCell>
                        {marks[student.id].slice(0, 6).map((mark, idx) => (
                          <TableCell key={idx} className="text-center p-1">
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              value={mark ?? ""}
                              onChange={(e) => handleMarksChange(student.id, idx, e.target.value)}
                              className="w-12 h-8 text-center mx-auto"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold">
                          {calculateTotal(student.id)}/30
                        </TableCell>
                        <TableCell className="text-center">
                          {calculatePercentage(student.id)}%
                        </TableCell>
                        <TableCell className="text-center">
                          {getGradeBadge(calculatePercentage(student.id))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancel</Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Marks
                </Button>
              </div>
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
                  <CardDescription>Overview of all student marks</CardDescription>
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
              <div className="space-y-4">
                {filteredStudents.map((student) => {
                  const total = calculateTotal(student.id);
                  const percentage = calculatePercentage(student.id);
                  return (
                    <div key={student.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{total}/50</p>
                            <p className="text-sm text-muted-foreground">Total Marks</p>
                          </div>
                          {getGradeBadge(percentage)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {marks[student.id].map((mark, idx) => (
                          <Badge
                            key={idx}
                            variant={mark === null ? "secondary" : mark >= 4 ? "default" : "outline"}
                            className={mark === null ? "" : mark >= 4 ? "bg-green-500" : mark >= 3 ? "bg-yellow-500" : "bg-red-500"}
                          >
                            L{idx + 1}: {mark ?? "-"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Entries Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Pending Marks Entries
              </CardTitle>
              <CardDescription>Lab sessions requiring marks entry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEntries.map((entry, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{entry.lab}</h4>
                        <p className="text-sm text-muted-foreground">
                          {entry.batch} • {entry.students} students
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium">{entry.dueDate}</p>
                        </div>
                        <Button size="sm">Enter Marks</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
