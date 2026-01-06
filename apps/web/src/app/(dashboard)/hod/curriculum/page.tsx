"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Download,
  Edit,
  Eye,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Beaker,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Mock curriculum data
const curriculumStats = {
  totalSubjects: 32,
  theorySubjects: 20,
  labSubjects: 12,
  avgSyllabusCompletion: 72,
  subjectsOnTrack: 24,
  subjectsBehind: 8,
};

// Mock subjects data by semester
const semesterSubjects: Record<number, Array<{
  id: string;
  code: string;
  name: string;
  type: "theory" | "lab";
  credits: number;
  faculty: string;
  hoursPerWeek: number;
  syllabusCompletion: number;
  totalUnits: number;
  completedUnits: number;
}>> = {
  5: [
    { id: "s1", code: "CS501", name: "Data Structures & Algorithms", type: "theory", credits: 4, faculty: "Prof. Vijay Kumar", hoursPerWeek: 4, syllabusCompletion: 75, totalUnits: 5, completedUnits: 4 },
    { id: "s2", code: "CS502", name: "Computer Networks", type: "theory", credits: 4, faculty: "Dr. Priya Sharma", hoursPerWeek: 4, syllabusCompletion: 70, totalUnits: 5, completedUnits: 3 },
    { id: "s3", code: "CS503", name: "Operating Systems", type: "theory", credits: 4, faculty: "Dr. Arun Menon", hoursPerWeek: 4, syllabusCompletion: 80, totalUnits: 5, completedUnits: 4 },
    { id: "s4", code: "CS504", name: "Software Engineering", type: "theory", credits: 3, faculty: "Prof. Kavitha Nair", hoursPerWeek: 3, syllabusCompletion: 65, totalUnits: 4, completedUnits: 3 },
    { id: "s5", code: "CS505", name: "Data Structures Lab", type: "lab", credits: 2, faculty: "Prof. Vijay Kumar", hoursPerWeek: 3, syllabusCompletion: 85, totalUnits: 10, completedUnits: 8 },
    { id: "s6", code: "CS506", name: "Computer Networks Lab", type: "lab", credits: 2, faculty: "Dr. Priya Sharma", hoursPerWeek: 3, syllabusCompletion: 60, totalUnits: 10, completedUnits: 6 },
  ],
  3: [
    { id: "s7", code: "CS301", name: "Object Oriented Programming", type: "theory", credits: 4, faculty: "Prof. Kavitha Nair", hoursPerWeek: 4, syllabusCompletion: 78, totalUnits: 5, completedUnits: 4 },
    { id: "s8", code: "CS302", name: "Database Management Systems", type: "theory", credits: 4, faculty: "Dr. Suresh Pillai", hoursPerWeek: 4, syllabusCompletion: 72, totalUnits: 5, completedUnits: 4 },
    { id: "s9", code: "CS303", name: "Discrete Mathematics", type: "theory", credits: 3, faculty: "Dr. Meera Nair", hoursPerWeek: 3, syllabusCompletion: 85, totalUnits: 4, completedUnits: 3 },
    { id: "s10", code: "CS304", name: "OOP Lab", type: "lab", credits: 2, faculty: "Prof. Kavitha Nair", hoursPerWeek: 3, syllabusCompletion: 90, totalUnits: 10, completedUnits: 9 },
  ],
};

// Mock syllabus details
const syllabusDetails = {
  "CS501": {
    units: [
      { unit: 1, title: "Introduction to Data Structures", topics: ["Arrays", "Linked Lists", "Stacks", "Queues"], status: "completed" },
      { unit: 2, title: "Trees", topics: ["Binary Trees", "BST", "AVL Trees", "B-Trees"], status: "completed" },
      { unit: 3, title: "Graphs", topics: ["Graph Representation", "BFS", "DFS", "Shortest Path"], status: "completed" },
      { unit: 4, title: "Sorting & Searching", topics: ["Quick Sort", "Merge Sort", "Heap Sort", "Binary Search"], status: "in_progress" },
      { unit: 5, title: "Advanced Topics", topics: ["Hashing", "String Algorithms", "Dynamic Programming"], status: "pending" },
    ],
  },
};

// Mock faculty assignments
const facultyAssignments = [
  { faculty: "Dr. Priya Sharma", subjects: ["Computer Networks", "Data Communication"], totalHours: 8, sections: 2 },
  { faculty: "Dr. Arun Menon", subjects: ["Operating Systems", "System Programming"], totalHours: 7, sections: 2 },
  { faculty: "Prof. Kavitha Nair", subjects: ["Software Engineering", "Web Development", "OOP"], totalHours: 10, sections: 3 },
  { faculty: "Dr. Suresh Pillai", subjects: ["Database Systems", "Big Data Analytics"], totalHours: 8, sections: 2 },
  { faculty: "Prof. Vijay Kumar", subjects: ["Data Structures", "Algorithms"], totalHours: 8, sections: 2 },
  { faculty: "Dr. Meera Nair", subjects: ["Artificial Intelligence", "Machine Learning"], totalHours: 6, sections: 2 },
];

export default function HODCurriculum() {
  const [selectedSemester, setSelectedSemester] = useState("5");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const currentSubjects = semesterSubjects[parseInt(selectedSemester)] || [];

  const filteredSubjects = currentSubjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || subject.type === filterType;
    return matchesSearch && matchesType;
  });

  const getCompletionBadge = (completion: number) => {
    if (completion >= 80) return <Badge className="bg-green-500">{completion}%</Badge>;
    if (completion >= 60) return <Badge className="bg-yellow-500">{completion}%</Badge>;
    return <Badge variant="destructive">{completion}%</Badge>;
  };

  const getUnitStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum Management</h1>
          <p className="text-muted-foreground">
            Manage subjects, syllabus, and faculty assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Curriculum
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Submit a request to add a new subject to the curriculum
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center text-muted-foreground">
                Curriculum changes require approval from the Academic Council.
                Please submit a proposal through the academic affairs portal.
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Submit Proposal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{curriculumStats.totalSubjects}</p>
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
                <p className="text-sm text-muted-foreground">Theory</p>
                <p className="text-2xl font-bold">{curriculumStats.theorySubjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Beaker className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Labs</p>
                <p className="text-2xl font-bold">{curriculumStats.labSubjects}</p>
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
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{curriculumStats.avgSyllabusCompletion}%</p>
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
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-600">{curriculumStats.subjectsOnTrack}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Behind</p>
                <p className="text-2xl font-bold text-red-600">{curriculumStats.subjectsBehind}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus Progress</TabsTrigger>
          <TabsTrigger value="assignments">Faculty Assignments</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Subject List</CardTitle>
                  <CardDescription>All subjects in the curriculum</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 w-[150px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[120px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-center">Hours/Week</TableHead>
                    <TableHead className="w-[150px]">Syllabus Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="font-mono mb-1">
                            {subject.code}
                          </Badge>
                          <p className="font-medium">{subject.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subject.type === "theory" ? "default" : "secondary"}>
                          {subject.type === "theory" ? (
                            <><FileText className="h-3 w-3 mr-1" /> Theory</>
                          ) : (
                            <><Beaker className="h-3 w-3 mr-1" /> Lab</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{subject.credits}</TableCell>
                      <TableCell>{subject.faculty}</TableCell>
                      <TableCell className="text-center">{subject.hoursPerWeek}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={subject.syllabusCompletion} className="h-2" />
                          <div className="flex justify-between text-xs">
                            <span>{subject.completedUnits}/{subject.totalUnits} units</span>
                            {getCompletionBadge(subject.syllabusCompletion)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Syllabus
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Change Faculty
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syllabus Progress Tab */}
        <TabsContent value="syllabus">
          <Card>
            <CardHeader>
              <CardTitle>Syllabus Completion Details</CardTitle>
              <CardDescription>Unit-wise progress for each subject</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {currentSubjects.map((subject) => (
                  <AccordionItem key={subject.id} value={subject.code}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">{subject.code}</Badge>
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{subject.faculty}</span>
                          {getCompletionBadge(subject.syllabusCompletion)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {syllabusDetails["CS501"]?.units.map((unit) => (
                          <div key={unit.unit} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Unit {unit.unit}:</span>
                                <span>{unit.title}</span>
                              </div>
                              {getUnitStatusBadge(unit.status)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {unit.topics.map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faculty-Subject Assignments</CardTitle>
                  <CardDescription>Current teaching assignments for the semester</CardDescription>
                </div>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Modify Assignments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {facultyAssignments.map((assignment, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{assignment.faculty}</h3>
                          <p className="text-sm text-muted-foreground">
                            {assignment.totalHours} hours/week • {assignment.sections} sections
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {assignment.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="outline">{subject}</Badge>
                        ))}
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
