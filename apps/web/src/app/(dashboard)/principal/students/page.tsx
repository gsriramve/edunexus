"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Building2,
  Pencil,
  Trash2,
  UserCheck,
  Loader2,
  AlertCircle,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useStudents,
  useStudentStats,
  useDepartments,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "@/hooks/use-api";
import type { Student, CreateStudentInput } from "@/lib/api";
import { useTenantId } from "@/hooks/use-tenant";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  graduated: "bg-blue-500",
  dropped: "bg-red-500",
  suspended: "bg-yellow-500",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
  dropped: "Dropped",
  suspended: "Suspended",
};

export default function StudentsPage() {
  const tenantId = useTenantId();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    rollNo: "",
    departmentId: "",
    batch: "",
    semester: 1,
    section: "",
    gender: "" as "male" | "female" | "other" | "",
  });

  // API hooks - limit to 50 students for faster loading
  const { data: studentsData, isLoading, error } = useStudents(tenantId || '', {
    search: searchQuery || undefined,
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
    batch: batchFilter !== "all" ? batchFilter : undefined,
    semester: semesterFilter !== "all" ? parseInt(semesterFilter) : undefined,
    status: 'active',
    limit: 50,
  });
  const { data: statsData, isLoading: statsLoading } = useStudentStats(tenantId || '');
  const { data: departmentsData } = useDepartments(tenantId || '');
  const createStudent = useCreateStudent(tenantId || '');
  const updateStudent = useUpdateStudent(tenantId || '');
  const deleteStudent = useDeleteStudent(tenantId || '');

  const studentsList = studentsData?.data || [];
  const departments = departmentsData?.data || [];

  const stats = {
    total: statsData?.total || 0,
    active: statsData?.active || 0,
    inactive: statsData?.inactive || 0,
    byDepartment: statsData?.byDepartment || [],
    byBatch: statsData?.byBatch || [],
  };

  // Get unique batches from students
  const batches = Array.from(new Set(stats.byBatch.map(b => b.batch))).sort().reverse();

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleOpenAddDialog = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      rollNo: "",
      departmentId: "",
      batch: "",
      semester: 1,
      section: "",
      gender: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (student: Student) => {
    const nameParts = student.user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setFormData({
      firstName,
      lastName,
      email: student.user.email,
      phone: "", // Phone is not stored in profile currently
      rollNo: student.rollNo,
      departmentId: student.departmentId,
      batch: student.batch,
      semester: student.semester,
      section: student.section || "",
      gender: (student.user.profile?.gender as typeof formData.gender) || "",
    });
    setEditingStudent(student);
  };

  const handleSubmit = async () => {
    if (!tenantId || !formData.departmentId) return;

    try {
      await createStudent.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        rollNo: formData.rollNo,
        departmentId: formData.departmentId,
        batch: formData.batch,
        semester: formData.semester,
        section: formData.section || undefined,
        gender: formData.gender || undefined,
      });
      toast.success("Student added successfully");
      setIsAddDialogOpen(false);
    } catch (err) {
      toast.error((err as Error).message || "Failed to add student");
    }
  };

  const handleUpdate = async () => {
    if (!tenantId || !editingStudent) return;

    try {
      await updateStudent.mutateAsync({
        id: editingStudent.id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          semester: formData.semester,
          section: formData.section || undefined,
        },
      });
      toast.success("Student updated successfully");
      setEditingStudent(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update student");
    }
  };

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Tenant Selected</h2>
            <p className="text-muted-foreground">
              Please go to the Principal Dashboard to set your tenant ID.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground">
              {(error as Error).message || "Failed to load student data"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Manage student admissions, records, and academic information
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the details of the new student
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rollNo">Roll Number</Label>
                  <Input
                    id="rollNo"
                    placeholder="e.g., 22CS101"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Input
                    id="batch"
                    placeholder="e.g., 2022-2026"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semester.toString()}
                    onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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
                <div className="grid gap-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    placeholder="e.g., A"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as typeof formData.gender })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createStudent.isPending ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.rollNo ||
                  !formData.departmentId ||
                  !formData.batch
                }
              >
                {createStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.inactive} inactive
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.byDepartment.length}</div>
                <p className="text-xs text-muted-foreground">with students</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Batches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.byBatch.length}</div>
                <p className="text-xs text-muted-foreground">active batches</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="w-[130px]">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
            {studentsList.length} students found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : studentsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Batch / Semester</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsList.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.user.profile?.photoUrl} />
                          <AvatarFallback>
                            {getInitials(student.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.user.name}</p>
                          <Badge className={statusColors[student.status] || "bg-gray-500"} variant="default">
                            {statusLabels[student.status] || student.status}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{student.rollNo}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{student.department?.code || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{student.batch}</span>
                        <span className="text-xs text-muted-foreground">
                          Sem {student.semester}{student.section ? ` - Sec ${student.section}` : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-3 w-3" />
                        {student.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(student)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Academics</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeletingStudent(student)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
              <Button variant="outline" className="mt-4" onClick={handleOpenAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the details of {editingStudent?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editSemester">Semester</Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
              <div className="grid gap-2">
                <Label htmlFor="editSection">Section</Label>
                <Input
                  id="editSection"
                  placeholder="e.g., A"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                updateStudent.isPending ||
                !formData.firstName ||
                !formData.lastName
              }
            >
              {updateStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStudent} onOpenChange={() => setDeletingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate "{deletingStudent?.user.name}" from the student directory.
              The student record will be marked as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!deletingStudent) return;
                try {
                  await deleteStudent.mutateAsync(deletingStudent.id);
                  toast.success("Student deactivated successfully");
                  setDeletingStudent(null);
                } catch (err) {
                  toast.error((err as Error).message || "Failed to deactivate student");
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
