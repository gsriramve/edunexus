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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";

// Mock data - will be replaced with API calls
const mockSubjectsData = {
  subjects: [
    {
      id: "1",
      code: "CS301",
      name: "Data Structures & Algorithms",
      credits: 4,
      semester: 3,
      type: "core",
      facultyCount: 3,
      sections: 4,
      studentsEnrolled: 180,
      lectureHours: 3,
      labHours: 2,
      tutorialHours: 1,
    },
    {
      id: "2",
      code: "CS302",
      name: "Database Management Systems",
      credits: 4,
      semester: 3,
      type: "core",
      facultyCount: 2,
      sections: 4,
      studentsEnrolled: 180,
      lectureHours: 3,
      labHours: 2,
      tutorialHours: 0,
    },
    {
      id: "3",
      code: "CS303",
      name: "Operating Systems",
      credits: 4,
      semester: 3,
      type: "core",
      facultyCount: 2,
      sections: 4,
      studentsEnrolled: 180,
      lectureHours: 3,
      labHours: 2,
      tutorialHours: 1,
    },
    {
      id: "4",
      code: "CS401",
      name: "Machine Learning",
      credits: 3,
      semester: 5,
      type: "elective",
      facultyCount: 2,
      sections: 2,
      studentsEnrolled: 80,
      lectureHours: 3,
      labHours: 0,
      tutorialHours: 1,
    },
    {
      id: "5",
      code: "CS402",
      name: "Cloud Computing",
      credits: 3,
      semester: 5,
      type: "elective",
      facultyCount: 1,
      sections: 2,
      studentsEnrolled: 75,
      lectureHours: 3,
      labHours: 0,
      tutorialHours: 0,
    },
  ],
  stats: {
    totalSubjects: 25,
    coreSubjects: 18,
    electiveSubjects: 7,
    totalCredits: 160,
  },
};

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<typeof mockSubjectsData.subjects[0] | null>(null);

  const tenantId = useTenantId();

  const isLoading = false;
  const data = mockSubjectsData;

  const filteredSubjects = data.subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester =
      semesterFilter === "all" || subject.semester.toString() === semesterFilter;
    const matchesType = typeFilter === "all" || subject.type === typeFilter;
    return matchesSearch && matchesSemester && matchesType;
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">
            Manage department subjects and curriculum
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.stats.totalSubjects}</span>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Core Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.stats.coreSubjects}</span>
              <GraduationCap className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Electives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.stats.electiveSubjects}</span>
              <BookOpen className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.stats.totalCredits}</span>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="elective">Elective</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>
            {filteredSubjects.length} subjects found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead className="text-center">Semester</TableHead>
                <TableHead className="text-center">Credits</TableHead>
                <TableHead className="text-center">Hours (L/T/P)</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Faculty</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell className="text-center">{subject.semester}</TableCell>
                  <TableCell className="text-center">{subject.credits}</TableCell>
                  <TableCell className="text-center">
                    {subject.lectureHours}/{subject.tutorialHours}/{subject.labHours}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={subject.type === "core" ? "default" : "secondary"}>
                      {subject.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{subject.facultyCount}</TableCell>
                  <TableCell className="text-center">{subject.studentsEnrolled}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSubject(subject)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Assign Faculty
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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

      {/* Add/Edit Subject Dialog */}
      <Dialog
        open={showAddDialog || editingSubject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingSubject(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? "Update subject details"
                : "Add a new subject to the curriculum"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CS301"
                  defaultValue={editingSubject?.code}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  max={6}
                  defaultValue={editingSubject?.credits || 4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="e.g., Data Structures & Algorithms"
                defaultValue={editingSubject?.name}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select defaultValue={editingSubject?.semester?.toString() || "1"}>
                  <SelectTrigger>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={editingSubject?.type || "core"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lecture">Lecture Hours</Label>
                <Input
                  id="lecture"
                  type="number"
                  min={0}
                  max={6}
                  defaultValue={editingSubject?.lectureHours || 3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorial">Tutorial Hours</Label>
                <Input
                  id="tutorial"
                  type="number"
                  min={0}
                  max={3}
                  defaultValue={editingSubject?.tutorialHours || 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lab">Lab Hours</Label>
                <Input
                  id="lab"
                  type="number"
                  min={0}
                  max={4}
                  defaultValue={editingSubject?.labHours || 0}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingSubject(null);
              }}
            >
              Cancel
            </Button>
            <Button>
              {editingSubject ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
