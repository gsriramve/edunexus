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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with API calls
const mockDepartments = [
  {
    id: "1",
    name: "Computer Science & Engineering",
    code: "CSE",
    description: "Department of Computer Science and Engineering",
    hodName: "Dr. Ramesh Kumar",
    hodEmail: "ramesh.kumar@college.edu",
    staffCount: 45,
    studentCount: 480,
    status: "active",
  },
  {
    id: "2",
    name: "Electronics & Communication",
    code: "ECE",
    description: "Department of Electronics and Communication Engineering",
    hodName: "Dr. Priya Sharma",
    hodEmail: "priya.sharma@college.edu",
    staffCount: 38,
    studentCount: 420,
    status: "active",
  },
  {
    id: "3",
    name: "Mechanical Engineering",
    code: "MECH",
    description: "Department of Mechanical Engineering",
    hodName: "Dr. Suresh Reddy",
    hodEmail: "suresh.reddy@college.edu",
    staffCount: 42,
    studentCount: 380,
    status: "active",
  },
  {
    id: "4",
    name: "Civil Engineering",
    code: "CIVIL",
    description: "Department of Civil Engineering",
    hodName: null,
    hodEmail: null,
    staffCount: 28,
    studentCount: 240,
    status: "active",
  },
  {
    id: "5",
    name: "Electrical Engineering",
    code: "EEE",
    description: "Department of Electrical and Electronics Engineering",
    hodName: "Dr. Kavitha Nair",
    hodEmail: "kavitha.nair@college.edu",
    staffCount: 35,
    studentCount: 320,
    status: "active",
  },
];

const mockTeachers = [
  { id: "t1", name: "Dr. Ramesh Kumar", email: "ramesh.kumar@college.edu", department: "CSE" },
  { id: "t2", name: "Dr. Priya Sharma", email: "priya.sharma@college.edu", department: "ECE" },
  { id: "t3", name: "Dr. Suresh Reddy", email: "suresh.reddy@college.edu", department: "MECH" },
  { id: "t4", name: "Dr. Kavitha Nair", email: "kavitha.nair@college.edu", department: "EEE" },
  { id: "t5", name: "Dr. Arun Menon", email: "arun.menon@college.edu", department: "CSE" },
];

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<typeof mockDepartments[0] | null>(null);

  const filteredDepartments = mockDepartments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalDepartments: mockDepartments.length,
    withHod: mockDepartments.filter((d) => d.hodName).length,
    totalStaff: mockDepartments.reduce((sum, d) => sum + d.staffCount, 0),
    totalStudents: mockDepartments.reduce((sum, d) => sum + d.studentCount, 0),
  };

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
            <Button>
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
                  defaultValue={editingDepartment?.name}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Department Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CSE"
                  defaultValue={editingDepartment?.code}
                  disabled={!!editingDepartment}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the department"
                  defaultValue={editingDepartment?.description}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hod">Head of Department (HOD)</Label>
                <Select defaultValue={editingDepartment?.hodName ? "t1" : undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select HOD (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No HOD assigned</SelectItem>
                    {mockTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.department})
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
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingDepartment(null);
                }}
              >
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
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With HOD</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withHod}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDepartments - stats.withHod} without HOD
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>HOD</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
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
                    {dept.hodName ? (
                      <div>
                        <p className="font-medium">{dept.hodName}</p>
                        <p className="text-sm text-muted-foreground">{dept.hodEmail}</p>
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
                      {dept.staffCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                      {dept.studentCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-500">
                      {dept.status}
                    </Badge>
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
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingDepartment(dept);
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Staff</DropdownMenuItem>
                        <DropdownMenuItem>View Students</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>
    </div>
  );
}
