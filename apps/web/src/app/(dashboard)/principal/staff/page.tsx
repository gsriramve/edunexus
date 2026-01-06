"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Calendar,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Filter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockStaff = [
  {
    id: "1",
    employeeId: "EMP001",
    firstName: "Ramesh",
    lastName: "Kumar",
    email: "ramesh.kumar@college.edu",
    phone: "+91 98765 43210",
    role: "HOD",
    designation: "Professor & HOD",
    department: "Computer Science & Engineering",
    departmentCode: "CSE",
    joiningDate: "2015-06-15",
    qualification: "Ph.D. Computer Science",
    specialization: "Machine Learning",
    experience: 15,
    status: "active",
  },
  {
    id: "2",
    employeeId: "EMP002",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@college.edu",
    phone: "+91 98765 43211",
    role: "HOD",
    designation: "Professor & HOD",
    department: "Electronics & Communication",
    departmentCode: "ECE",
    joiningDate: "2012-08-01",
    qualification: "Ph.D. Electronics",
    specialization: "VLSI Design",
    experience: 18,
    status: "active",
  },
  {
    id: "3",
    employeeId: "EMP003",
    firstName: "Arun",
    lastName: "Menon",
    email: "arun.menon@college.edu",
    phone: "+91 98765 43212",
    role: "TEACHER",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    departmentCode: "CSE",
    joiningDate: "2018-01-10",
    qualification: "M.Tech Computer Science",
    specialization: "Data Structures",
    experience: 10,
    status: "active",
  },
  {
    id: "4",
    employeeId: "EMP004",
    firstName: "Lakshmi",
    lastName: "Nair",
    email: "lakshmi.nair@college.edu",
    phone: "+91 98765 43213",
    role: "TEACHER",
    designation: "Assistant Professor",
    department: "Mechanical Engineering",
    departmentCode: "MECH",
    joiningDate: "2020-07-01",
    qualification: "M.Tech Mechanical",
    specialization: "Thermodynamics",
    experience: 6,
    status: "active",
  },
  {
    id: "5",
    employeeId: "EMP005",
    firstName: "Vijay",
    lastName: "Krishnan",
    email: "vijay.krishnan@college.edu",
    phone: "+91 98765 43214",
    role: "LAB_ASSISTANT",
    designation: "Lab Instructor",
    department: "Electronics & Communication",
    departmentCode: "ECE",
    joiningDate: "2019-03-15",
    qualification: "B.Tech Electronics",
    specialization: "Digital Electronics Lab",
    experience: 8,
    status: "active",
  },
  {
    id: "6",
    employeeId: "EMP006",
    firstName: "Meera",
    lastName: "Patel",
    email: "meera.patel@college.edu",
    phone: "+91 98765 43215",
    role: "ADMIN_STAFF",
    designation: "Administrative Officer",
    department: "Administration",
    departmentCode: "ADMIN",
    joiningDate: "2017-11-20",
    qualification: "MBA",
    specialization: "HR Management",
    experience: 12,
    status: "active",
  },
  {
    id: "7",
    employeeId: "EMP007",
    firstName: "Suresh",
    lastName: "Reddy",
    email: "suresh.reddy@college.edu",
    phone: "+91 98765 43216",
    role: "TEACHER",
    designation: "Professor",
    department: "Civil Engineering",
    departmentCode: "CIVIL",
    joiningDate: "2010-05-01",
    qualification: "Ph.D. Civil Engineering",
    specialization: "Structural Engineering",
    experience: 20,
    status: "on_leave",
  },
];

const departments = [
  { id: "1", name: "Computer Science & Engineering", code: "CSE" },
  { id: "2", name: "Electronics & Communication", code: "ECE" },
  { id: "3", name: "Mechanical Engineering", code: "MECH" },
  { id: "4", name: "Civil Engineering", code: "CIVIL" },
  { id: "5", name: "Electrical Engineering", code: "EEE" },
  { id: "6", name: "Administration", code: "ADMIN" },
];

const roleColors: Record<string, string> = {
  HOD: "bg-purple-500",
  TEACHER: "bg-blue-500",
  LAB_ASSISTANT: "bg-teal-500",
  ADMIN_STAFF: "bg-orange-500",
  PRINCIPAL: "bg-red-500",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  on_leave: "bg-yellow-500",
  resigned: "bg-red-500",
};

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesDept =
      departmentFilter === "all" || staff.departmentCode === departmentFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const stats = {
    total: mockStaff.length,
    active: mockStaff.filter((s) => s.status === "active").length,
    teachers: mockStaff.filter((s) => s.role === "TEACHER" || s.role === "HOD").length,
    labAssistants: mockStaff.filter((s) => s.role === "LAB_ASSISTANT").length,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage faculty, lab assistants, and administrative staff
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details of the new staff member
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="First name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@college.edu" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" placeholder="EMP001" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="hod">Head of Department</SelectItem>
                      <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                      <SelectItem value="admin_staff">Admin Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" placeholder="e.g., Associate Professor" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input id="joiningDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input id="experience" type="number" placeholder="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" placeholder="e.g., Ph.D. Computer Science" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" placeholder="e.g., Machine Learning" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total - stats.active} inactive/on leave
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <p className="text-xs text-muted-foreground">Teachers & HODs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Assistants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.labAssistants}</div>
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
                placeholder="Search staff..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="LAB_ASSISTANT">Lab Assistant</SelectItem>
                  <SelectItem value="ADMIN_STAFF">Admin Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            {filteredStaff.length} staff members found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role & Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(staff.firstName, staff.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {staff.firstName} {staff.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {staff.employeeId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={roleColors[staff.role]} variant="default">
                        {staff.role.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {staff.designation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{staff.departmentCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="mr-2 h-3 w-3" />
                        {staff.email}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="mr-2 h-3 w-3" />
                        {staff.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[staff.status]}
                      variant="default"
                    >
                      {staff.status.replace("_", " ")}
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
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Assign Subjects</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <UserX className="mr-2 h-4 w-4" />
                          Mark as Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Staff
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
