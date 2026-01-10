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
  Loader2,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useCurriculumStats,
  useCurriculumSubjects,
  useFacultyAssignments,
  useSubjectDetail,
  useUpdateSyllabusUnit,
  Subject,
} from "@/hooks/use-hod-curriculum";

export default function HODCurriculum() {
  const tenantIdValue = useTenantId();
  const tenantId = tenantIdValue || "";
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "theory" | "lab">("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Queries
  const { data: stats, isLoading: statsLoading, error: statsError } = useCurriculumStats(tenantId);
  const { data: subjectsData, isLoading: subjectsLoading } = useCurriculumSubjects(tenantId, {
    semester: selectedSemester !== "all" ? parseInt(selectedSemester) : undefined,
    type: filterType,
    search: searchQuery || undefined,
  });
  const { data: facultyData, isLoading: facultyLoading } = useFacultyAssignments(tenantId);
  const { data: subjectDetail } = useSubjectDetail(tenantId, selectedSubjectId || "");

  // Mutations
  const updateSyllabusUnitMutation = useUpdateSyllabusUnit(tenantId);

  const subjects = subjectsData?.subjects || [];
  const facultyAssignments = facultyData?.assignments || [];

  const curriculumStats = stats || {
    totalSubjects: 0,
    theorySubjects: 0,
    labSubjects: 0,
    avgSyllabusCompletion: 0,
    subjectsOnTrack: 0,
    subjectsBehind: 0,
    totalCredits: 0,
    totalHoursPerWeek: 0,
  };

  const isLoading = statsLoading || subjectsLoading;

  const handleUpdateUnitStatus = async (unitId: string, status: "pending" | "in_progress" | "completed") => {
    try {
      await updateSyllabusUnitMutation.mutateAsync({
        id: unitId,
        data: { status },
      });
    } catch (error) {
      console.error("Failed to update unit status:", error);
    }
  };

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

  // Loading state
  if (!tenantId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum Management</h1>
          <p className="text-muted-foreground">
            Manage subjects, syllabus, and faculty assignments
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load curriculum data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : curriculumStats.totalSubjects}
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
                <p className="text-sm text-muted-foreground">Theory</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : curriculumStats.theorySubjects}
                </p>
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
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : curriculumStats.labSubjects}
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
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${curriculumStats.avgSyllabusCompletion}%`}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : curriculumStats.subjectsOnTrack}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : curriculumStats.subjectsBehind}
                </p>
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
                      <SelectValue placeholder="All Semesters" />
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
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 w-[150px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | "theory" | "lab")}>
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
              {subjectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No subjects found</h3>
                  <p className="text-muted-foreground mt-1">
                    No subjects match your current filters
                  </p>
                </div>
              ) : (
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
                    {subjects.map((subject) => (
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
                        <TableCell>{subject.faculty || "Not assigned"}</TableCell>
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
                              <DropdownMenuItem onClick={() => setSelectedSubjectId(subject.id)}>
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
              )}
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
              {subjectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No subjects found</h3>
                  <p className="text-muted-foreground mt-1">
                    Add subjects to track syllabus progress
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {subjects.map((subject) => (
                    <AccordionItem key={subject.id} value={subject.code}>
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">{subject.code}</Badge>
                            <span className="font-medium">{subject.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{subject.faculty || "Not assigned"}</span>
                            {getCompletionBadge(subject.syllabusCompletion)}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {subject.totalUnits === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              No syllabus units defined for this subject
                            </p>
                          ) : subjectDetail && subjectDetail.id === subject.id ? (
                            subjectDetail.syllabusUnits.map((unit) => (
                              <div key={unit.id} className="p-4 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Unit {unit.unitNumber}:</span>
                                    <span>{unit.title}</span>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        {getUnitStatusBadge(unit.status)}
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleUpdateUnitStatus(unit.id, "pending")}>
                                        Mark as Pending
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateUnitStatus(unit.id, "in_progress")}>
                                        Mark as In Progress
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateUnitStatus(unit.id, "completed")}>
                                        Mark as Completed
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {unit.topics.map((topic, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <Button variant="outline" onClick={() => setSelectedSubjectId(subject.id)}>
                                Load Syllabus Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
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
              {facultyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : facultyAssignments.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No faculty assignments</h3>
                  <p className="text-muted-foreground mt-1">
                    Assign faculty to subjects to see them here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {facultyAssignments.map((assignment) => (
                    <Card key={assignment.facultyId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{assignment.facultyName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {assignment.totalHours} hours/week - {assignment.sections} sections
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
