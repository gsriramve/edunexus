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
  FlaskConical,
  UserPlus,
  X,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useHodSubjects,
  useAvailableFaculty,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useAssignFaculty,
  useRemoveFaculty,
  SubjectDto,
  CreateSubjectInput,
} from "@/hooks/use-hod-subjects";
import { toast } from "sonner";

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
  const [showAssignFacultyDialog, setShowAssignFacultyDialog] = useState(false);
  const [selectedSubjectForFaculty, setSelectedSubjectForFaculty] = useState<SubjectDto | null>(null);
  const [assignForm, setAssignForm] = useState({ staffId: "", section: "" });
  const [formData, setFormData] = useState<CreateSubjectInput>({
    courseId: "",
    code: "",
    name: "",
    semester: 1,
    credits: 3,
    isLab: false,
    lectureHours: 3,
    tutorialHours: 1,
    labHours: 0,
  });

  const tenantId = useTenantId() || "";

  // Queries
  const { data, isLoading, error } = useHodSubjects(tenantId, {
    search: searchQuery || undefined,
    semester: semesterFilter !== "all" ? semesterFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const { data: availableFaculty } = useAvailableFaculty(tenantId);

  // Mutations
  const createSubject = useCreateSubject(tenantId);
  const updateSubject = useUpdateSubject(tenantId);
  const deleteSubject = useDeleteSubject(tenantId);
  const assignFaculty = useAssignFaculty(tenantId);
  const removeFaculty = useRemoveFaculty(tenantId);

  const handleCreateSubject = async () => {
    if (!formData.courseId || !formData.code || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSubject.mutateAsync(formData);
      toast.success("Subject created successfully");
      setShowAddDialog(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to create subject");
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    try {
      await updateSubject.mutateAsync({
        subjectId: editingSubject.id,
        data: {
          name: formData.name,
          semester: formData.semester,
          credits: formData.credits,
          isLab: formData.isLab,
        },
      });
      toast.success("Subject updated successfully");
      setEditingSubject(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to update subject");
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      await deleteSubject.mutateAsync(subjectId);
      toast.success("Subject deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subject");
    }
  };

  const handleAssignFaculty = async () => {
    if (!selectedSubjectForFaculty || !assignForm.staffId) {
      toast.error("Please select a faculty member");
      return;
    }

    try {
      await assignFaculty.mutateAsync({
        subjectId: selectedSubjectForFaculty.id,
        data: {
          staffId: assignForm.staffId,
          section: assignForm.section || undefined,
        },
      });
      toast.success("Faculty assigned successfully");
      setShowAssignFacultyDialog(false);
      setSelectedSubjectForFaculty(null);
      setAssignForm({ staffId: "", section: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to assign faculty");
    }
  };

  const handleRemoveFaculty = async (teacherSubjectId: string) => {
    if (!confirm("Remove this faculty assignment?")) return;

    try {
      await removeFaculty.mutateAsync(teacherSubjectId);
      toast.success("Faculty removed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove faculty");
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: data?.courses[0]?.id || "",
      code: "",
      name: "",
      semester: 1,
      credits: 3,
      isLab: false,
      lectureHours: 3,
      tutorialHours: 1,
      labHours: 0,
    });
  };

  const openEditDialog = (subject: SubjectDto) => {
    setEditingSubject(subject);
    setFormData({
      courseId: subject.courseId,
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits,
      isLab: subject.isLab,
      lectureHours: subject.lectureHours,
      tutorialHours: subject.tutorialHours,
      labHours: subject.labHours,
    });
  };

  const openAssignFacultyDialog = (subject: SubjectDto) => {
    setSelectedSubjectForFaculty(subject);
    setShowAssignFacultyDialog(true);
    setAssignForm({ staffId: "", section: "" });
  };

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">Failed to load subjects</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const subjects = data?.subjects || [];
  const stats = data?.stats || {
    totalSubjects: 0,
    coreSubjects: 0,
    electiveSubjects: 0,
    labSubjects: 0,
    totalCredits: 0,
    totalFacultyAssignments: 0,
  };
  const courses = data?.courses || [];
  const department = data?.department;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">
            {department ? `${department.name} - ` : ""}Manage department subjects and curriculum
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          if (courses.length > 0) {
            setFormData(prev => ({ ...prev, courseId: courses[0].id }));
          }
          setShowAddDialog(true);
        }}>
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
              <span className="text-2xl font-bold">{stats.totalSubjects}</span>
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
              <span className="text-2xl font-bold">{stats.coreSubjects}</span>
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
              <span className="text-2xl font-bold">{stats.electiveSubjects}</span>
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
              <span className="text-2xl font-bold">{stats.totalCredits}</span>
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
            <SelectItem value="lab">Lab</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>
            {subjects.length} subjects found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No subjects found. {courses.length === 0 ? "Please add courses first." : "Add your first subject."}
            </div>
          ) : (
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
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.code}</TableCell>
                    <TableCell>
                      <div>
                        <span>{subject.name}</span>
                        {subject.faculty.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {subject.faculty.slice(0, 2).map((f) => (
                              <Badge key={f.teacherSubjectId} variant="outline" className="text-xs">
                                {f.name}{f.section ? ` (${f.section})` : ""}
                              </Badge>
                            ))}
                            {subject.faculty.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{subject.faculty.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{subject.semester}</TableCell>
                    <TableCell className="text-center">{subject.credits}</TableCell>
                    <TableCell className="text-center">
                      {subject.lectureHours}/{subject.tutorialHours}/{subject.labHours}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={subject.type === "core" ? "default" : subject.type === "lab" ? "secondary" : "outline"}>
                        {subject.type === "lab" && <FlaskConical className="h-3 w-3 mr-1" />}
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
                          <DropdownMenuItem onClick={() => openEditDialog(subject)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignFacultyDialog(subject)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Faculty
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Subject Dialog */}
      <Dialog
        open={showAddDialog || editingSubject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingSubject(null);
            resetForm();
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
            {!editingSubject && (
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CS301"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!editingSubject}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  max={6}
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="e.g., Data Structures & Algorithms"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                >
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
                <Select
                  value={formData.isLab ? "lab" : "theory"}
                  onValueChange={(value) => setFormData({ ...formData, isLab: value === "lab" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lecture">Lecture Hrs</Label>
                <Input
                  id="lecture"
                  type="number"
                  min={0}
                  max={6}
                  value={formData.lectureHours}
                  onChange={(e) => setFormData({ ...formData, lectureHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tutorial">Tutorial Hrs</Label>
                <Input
                  id="tutorial"
                  type="number"
                  min={0}
                  max={3}
                  value={formData.tutorialHours}
                  onChange={(e) => setFormData({ ...formData, tutorialHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lab">Lab Hrs</Label>
                <Input
                  id="lab"
                  type="number"
                  min={0}
                  max={4}
                  value={formData.labHours}
                  onChange={(e) => setFormData({ ...formData, labHours: parseInt(e.target.value) || 0 })}
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
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingSubject ? handleUpdateSubject : handleCreateSubject}
              disabled={createSubject.isPending || updateSubject.isPending}
            >
              {editingSubject ? "Update Subject" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Faculty Dialog */}
      <Dialog
        open={showAssignFacultyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAssignFacultyDialog(false);
            setSelectedSubjectForFaculty(null);
            setAssignForm({ staffId: "", section: "" });
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Faculty</DialogTitle>
            <DialogDescription>
              {selectedSubjectForFaculty
                ? `Assign faculty to ${selectedSubjectForFaculty.code} - ${selectedSubjectForFaculty.name}`
                : "Select a faculty member to assign"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current assignments */}
            {selectedSubjectForFaculty && selectedSubjectForFaculty.faculty.length > 0 && (
              <div className="space-y-2">
                <Label>Current Assignments</Label>
                <div className="space-y-2">
                  {selectedSubjectForFaculty.faculty.map((f) => (
                    <div
                      key={f.teacherSubjectId}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div>
                        <span className="font-medium">{f.name}</span>
                        {f.section && (
                          <span className="text-muted-foreground ml-2">
                            Section {f.section}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFaculty(f.teacherSubjectId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty Member</Label>
              <Select
                value={assignForm.staffId}
                onValueChange={(value) => setAssignForm({ ...assignForm, staffId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {availableFaculty?.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.employeeId}) - {f.subjectsAssigned} subjects
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section (Optional)</Label>
              <Input
                id="section"
                placeholder="e.g., A, B, C"
                value={assignForm.section}
                onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignFacultyDialog(false);
                setSelectedSubjectForFaculty(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignFaculty}
              disabled={assignFaculty.isPending || !assignForm.staffId}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Faculty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
