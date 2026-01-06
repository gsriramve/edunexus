"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  GraduationCap,
  UserCheck,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  useDepartments,
  useDepartmentStats,
  useTeachers,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/use-api";
import type { Department } from "@/lib/api";
import { useTenantId } from "@/hooks/use-tenant";

export default function DepartmentsPage() {
  const tenantId = useTenantId();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hodId: "",
  });

  // API hooks
  const { data: departmentsData, isLoading, error } = useDepartments(tenantId || '', { search: searchQuery || undefined });
  const { data: statsData, isLoading: statsLoading } = useDepartmentStats(tenantId || '');
  const { data: teachersData } = useTeachers(tenantId || '');
  const createDepartment = useCreateDepartment(tenantId || '');
  const updateDepartment = useUpdateDepartment(tenantId || '');
  const deleteDepartment = useDeleteDepartment(tenantId || '');

  const departments = departmentsData?.data || [];
  const teachers = teachersData || [];

  const stats = {
    totalDepartments: statsData?.totalDepartments || 0,
    withHod: statsData?.departmentsWithHod || 0,
    totalStaff: statsData?.totalStaff || 0,
    totalStudents: statsData?.totalStudents || 0,
  };

  const handleOpenAddDialog = () => {
    setFormData({ name: "", code: "", hodId: "" });
    setEditingDepartment(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (dept: Department) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      hodId: dept.hodId || "",
    });
    setEditingDepartment(dept);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!tenantId) return;

    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          data: {
            name: formData.name,
            hodId: formData.hodId || undefined,
          },
        });
        toast.success("Department updated successfully");
      } else {
        await createDepartment.mutateAsync({
          name: formData.name,
          code: formData.code,
          hodId: formData.hodId || undefined,
        });
        toast.success("Department created successfully");
      }
      setIsAddDialogOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deletingDepartment || !tenantId) return;

    try {
      await deleteDepartment.mutateAsync(deletingDepartment.id);
      toast.success("Department deleted successfully");
      setDeletingDepartment(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete department");
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
              {(error as Error).message || "Failed to load departments"}
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
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage college departments and assign HODs
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment
                  ? "Update department details"
                  : "Create a new department for your college"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Computer Science & Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Department Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CSE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!editingDepartment}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hod">Head of Department (HOD)</Label>
                <Select
                  value={formData.hodId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, hodId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HOD (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No HOD assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user.name} ({teacher.department.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingDepartment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createDepartment.isPending || updateDepartment.isPending || !formData.name || !formData.code}
              >
                {(createDepartment.isPending || updateDepartment.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingDepartment ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With HOD</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.withHod}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalDepartments - stats.withHod} without HOD
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            A list of all departments in your college
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : departments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>HOD</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {dept.code}
                        </div>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">{dept.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dept.hod ? (
                        <div>
                          <p className="font-medium">{dept.hod.user.name}</p>
                          <p className="text-sm text-muted-foreground">{dept.hod.user.email}</p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Not Assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {dept._count?.staff || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                        {dept._count?.students || 0}
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
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(dept)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Department
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Staff</DropdownMenuItem>
                          <DropdownMenuItem>View Students</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeletingDepartment(dept)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Department
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
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No departments found</p>
              <Button variant="outline" className="mt-4" onClick={handleOpenAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Department
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDepartment} onOpenChange={() => setDeletingDepartment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department "{deletingDepartment?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDepartment.isPending}
            >
              {deleteDepartment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
