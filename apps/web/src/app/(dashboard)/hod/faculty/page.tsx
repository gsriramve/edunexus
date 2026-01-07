"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  BookOpen,
  Clock,
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  UserCheck,
  AlertTriangle,
  Download,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStaff, useStaffStats } from "@/hooks/use-api";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /staff/by-user/:userId - Get staff member by Clerk user ID (to get HOD's departmentId)
// - GET /staff?departmentId=X - Already implemented, filter staff by department
// - GET /hod/workload - Faculty workload summary for department
// - GET /hod/timetable - Department timetable
// - GET /hod/leave-requests - Pending leave requests for department

// Mock faculty data
const facultyList = [
  {
    id: "fac-1",
    name: "Dr. Priya Sharma",
    employeeId: "CSE-FAC-001",
    designation: "Associate Professor",
    qualification: "Ph.D. (Computer Science)",
    specialization: "Machine Learning, Data Mining",
    email: "priya.sharma@college.edu",
    phone: "+91 98765 43210",
    joinDate: "Aug 2015",
    experience: "10 years",
    subjects: ["Computer Networks", "Data Communication"],
    totalClasses: 45,
    classesTaken: 42,
    attendance: 93,
    status: "active",
    onLeave: false,
  },
  {
    id: "fac-2",
    name: "Dr. Arun Menon",
    employeeId: "CSE-FAC-002",
    designation: "Associate Professor",
    qualification: "Ph.D. (Computer Science)",
    specialization: "Operating Systems, Distributed Computing",
    email: "arun.menon@college.edu",
    phone: "+91 98765 43211",
    joinDate: "Jun 2012",
    experience: "13 years",
    subjects: ["Operating Systems", "System Programming"],
    totalClasses: 50,
    classesTaken: 44,
    attendance: 88,
    status: "active",
    onLeave: false,
  },
  {
    id: "fac-3",
    name: "Prof. Kavitha Nair",
    employeeId: "CSE-FAC-003",
    designation: "Assistant Professor",
    qualification: "M.Tech (Software Engineering)",
    specialization: "Software Engineering, Web Technologies",
    email: "kavitha.nair@college.edu",
    phone: "+91 98765 43212",
    joinDate: "Jul 2018",
    experience: "7 years",
    subjects: ["Software Engineering", "Web Development", "DBMS Lab"],
    totalClasses: 55,
    classesTaken: 52,
    attendance: 95,
    status: "active",
    onLeave: false,
  },
  {
    id: "fac-4",
    name: "Dr. Suresh Pillai",
    employeeId: "CSE-FAC-004",
    designation: "Associate Professor",
    qualification: "Ph.D. (Information Technology)",
    specialization: "Database Systems, Big Data",
    email: "suresh.pillai@college.edu",
    phone: "+91 98765 43213",
    joinDate: "Mar 2014",
    experience: "11 years",
    subjects: ["Database Systems", "Big Data Analytics"],
    totalClasses: 48,
    classesTaken: 37,
    attendance: 77,
    status: "active",
    onLeave: true,
  },
  {
    id: "fac-5",
    name: "Prof. Vijay Kumar",
    employeeId: "CSE-FAC-005",
    designation: "Assistant Professor",
    qualification: "M.Tech (Computer Science)",
    specialization: "Algorithms, Theory of Computation",
    email: "vijay.kumar@college.edu",
    phone: "+91 98765 43214",
    joinDate: "Aug 2019",
    experience: "6 years",
    subjects: ["Data Structures", "Design & Analysis of Algorithms", "DS Lab"],
    totalClasses: 60,
    classesTaken: 54,
    attendance: 90,
    status: "active",
    onLeave: false,
  },
  {
    id: "fac-6",
    name: "Dr. Meera Nair",
    employeeId: "CSE-FAC-006",
    designation: "Professor",
    qualification: "Ph.D. (Computer Science)",
    specialization: "Artificial Intelligence, Neural Networks",
    email: "meera.nair@college.edu",
    phone: "+91 98765 43215",
    joinDate: "Jan 2008",
    experience: "18 years",
    subjects: ["Artificial Intelligence", "Machine Learning"],
    totalClasses: 40,
    classesTaken: 38,
    attendance: 95,
    status: "active",
    onLeave: false,
  },
];

const workloadSummary = {
  avgClassesPerFaculty: 8.5,
  avgLabsPerFaculty: 2.3,
  underloaded: 2,
  optimal: 3,
  overloaded: 1,
};

const leaveRequests = [
  { id: 1, faculty: "Dr. Suresh Pillai", type: "Medical", from: "Jan 6, 2026", to: "Jan 8, 2026", days: 3, status: "pending" },
  { id: 2, faculty: "Prof. Kavitha Nair", type: "Personal", from: "Jan 15, 2026", to: "Jan 15, 2026", days: 1, status: "pending" },
];

const timetableData = [
  { time: "9:00 AM", mon: "Dr. Priya - CN", tue: "Dr. Arun - OS", wed: "Prof. Vijay - DS", thu: "Dr. Meera - AI", fri: "Dr. Suresh - DBMS" },
  { time: "10:00 AM", mon: "Prof. Kavitha - SE", tue: "Dr. Priya - CN", wed: "Dr. Arun - OS", thu: "Prof. Vijay - DS", fri: "Dr. Meera - AI" },
  { time: "11:00 AM", mon: "Dr. Arun - OS Lab", tue: "Prof. Kavitha - Web Lab", wed: "Dr. Priya - CN Lab", thu: "Dr. Suresh - DB Lab", fri: "Prof. Vijay - DS Lab" },
  { time: "2:00 PM", mon: "Dr. Meera - ML", tue: "Dr. Suresh - BDA", wed: "Prof. Kavitha - SE", thu: "Dr. Priya - DC", fri: "Dr. Arun - SP" },
  { time: "3:00 PM", mon: "Prof. Vijay - DAA", tue: "Dr. Meera - AI", wed: "Dr. Suresh - DBMS", thu: "Prof. Kavitha - Web", fri: "Dr. Priya - CN" },
];

export default function HODFacultyManagement() {
  const tenantId = useTenantId() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState<typeof facultyList[0] | null>(null);

  // Fetch staff data - TODO: Add departmentId filter when HOD's department can be determined
  const { data: staffData, isLoading: staffLoading } = useStaff(tenantId, {
    search: searchQuery || undefined,
    // departmentId: hodDepartmentId, // TODO: Get HOD's department ID
  });
  const { data: staffStats, isLoading: statsLoading } = useStaffStats(tenantId);

  // Use API data when available, fall back to mock data
  const apiStaff = staffData?.data || [];
  const isLoading = staffLoading || statsLoading;

  // Loading state
  if (!tenantId || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Use API data if available, otherwise fall back to mock data for demo
  const displayFaculty = apiStaff.length > 0 ? apiStaff.map(staff => ({
    id: staff.id,
    name: staff.user?.name || 'Unknown',
    employeeId: staff.employeeId,
    designation: staff.designation || 'Staff',
    qualification: 'N/A', // Not available in Staff type
    specialization: 'N/A', // Not available in Staff type
    email: staff.user?.email || 'N/A',
    phone: 'N/A', // Not available in Staff type
    joinDate: staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A',
    experience: 'N/A',
    subjects: [],
    totalClasses: 0,
    classesTaken: 0,
    attendance: 0,
    status: 'active', // Staff type doesn't have status field
    onLeave: false,
  })) : facultyList;

  const filteredFaculty = displayFaculty.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDesignation =
      filterDesignation === "all" || faculty.designation === filterDesignation;
    return matchesSearch && matchesDesignation;
  });

  const getAttendanceBadge = (attendance: number) => {
    if (attendance >= 90) return <Badge className="bg-green-500">{attendance}%</Badge>;
    if (attendance >= 80) return <Badge className="bg-yellow-500">{attendance}%</Badge>;
    return <Badge variant="destructive">{attendance}%</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground">
            Manage department faculty, workload, and schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogDescription>
                  Request to add a new faculty member to the department
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center text-muted-foreground">
                Faculty addition requests are processed by the Principal's office.
                Please submit a formal request through the HR portal.
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Go to HR Portal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <p className="text-sm text-muted-foreground">Total Faculty</p>
                <p className="text-2xl font-bold">{staffStats?.total || displayFaculty.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{staffStats?.active || displayFaculty.filter(f => !f.onLeave).length}</p>
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
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{displayFaculty.filter(f => f.onLeave).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Classes/Week</p>
                <p className="text-2xl font-bold">{workloadSummary.avgClassesPerFaculty}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Faculty List</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
        </TabsList>

        {/* Faculty List */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Faculty Members</CardTitle>
                  <CardDescription>Department of Computer Science & Engineering</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search faculty..."
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterDesignation} onValueChange={setFilterDesignation}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Designations</SelectItem>
                      <SelectItem value="Professor">Professor</SelectItem>
                      <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                      <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-center">Classes</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {faculty.name.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{faculty.name}</p>
                            <p className="text-sm text-muted-foreground">{faculty.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{faculty.designation}</p>
                          <p className="text-xs text-muted-foreground">{faculty.experience}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {faculty.subjects.slice(0, 2).map((subject, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {faculty.subjects.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{faculty.subjects.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{faculty.classesTaken}</span>
                        <span className="text-muted-foreground">/{faculty.totalClasses}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getAttendanceBadge(faculty.attendance)}
                      </TableCell>
                      <TableCell>
                        {faculty.onLeave ? (
                          <Badge variant="secondary">On Leave</Badge>
                        ) : (
                          <Badge className="bg-green-500">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedFaculty(faculty)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              View Timetable
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Message
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

        {/* Workload Tab */}
        <TabsContent value="workload">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Faculty Workload Distribution</CardTitle>
                <CardDescription>Classes and lab sessions per faculty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {facultyList.map((faculty) => {
                    const workloadPercent = (faculty.subjects.length / 4) * 100;
                    const isOverloaded = workloadPercent > 80;
                    const isUnderloaded = workloadPercent < 50;
                    return (
                      <div key={faculty.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{faculty.name}</span>
                            {isOverloaded && (
                              <Badge variant="destructive" className="text-xs">Overloaded</Badge>
                            )}
                            {isUnderloaded && (
                              <Badge variant="secondary" className="text-xs">Underloaded</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {faculty.subjects.length} subjects
                          </span>
                        </div>
                        <Progress
                          value={workloadPercent}
                          className={`h-3 ${
                            isOverloaded ? "[&>div]:bg-red-500" :
                            isUnderloaded ? "[&>div]:bg-yellow-500" : ""
                          }`}
                        />
                        <div className="flex flex-wrap gap-1">
                          {faculty.subjects.map((subject, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workload Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-700">Optimal Workload</p>
                    <p className="text-2xl font-bold text-green-800">{workloadSummary.optimal} faculty</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-700">Underloaded</p>
                    <p className="text-2xl font-bold text-yellow-800">{workloadSummary.underloaded} faculty</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">Overloaded</p>
                    <p className="text-2xl font-bold text-red-800">{workloadSummary.overloaded} faculty</p>
                  </div>
                  <Button className="w-full">
                    Optimize Workload
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Department Timetable</CardTitle>
                  <CardDescription>Weekly class schedule for all faculty</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Time</TableHead>
                      <TableHead>Monday</TableHead>
                      <TableHead>Tuesday</TableHead>
                      <TableHead>Wednesday</TableHead>
                      <TableHead>Thursday</TableHead>
                      <TableHead>Friday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetableData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.time}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">{row.mon}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">{row.tue}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">{row.wed}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">{row.thu}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">{row.fri}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Requests Tab */}
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>Approve or reject faculty leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.length > 0 ? (
                <div className="space-y-4">
                  {leaveRequests.map((leave) => (
                    <div key={leave.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{leave.faculty}</span>
                            <Badge variant="outline">{leave.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {leave.from} to {leave.to} ({leave.days} days)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Approve</Button>
                          <Button size="sm" variant="outline">Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending leave requests
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Faculty Profile Dialog */}
      <Dialog open={!!selectedFaculty} onOpenChange={() => setSelectedFaculty(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Faculty Profile</DialogTitle>
          </DialogHeader>
          {selectedFaculty && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedFaculty.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedFaculty.name}</h3>
                  <p className="text-muted-foreground">{selectedFaculty.designation}</p>
                  <Badge variant="outline" className="mt-1">{selectedFaculty.employeeId}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Qualification</p>
                  <p className="font-medium">{selectedFaculty.qualification}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{selectedFaculty.experience}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedFaculty.specialization}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{selectedFaculty.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedFaculty.email}`} className="text-blue-600 hover:underline">
                    {selectedFaculty.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedFaculty.phone}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                <div className="flex flex-wrap gap-1">
                  {selectedFaculty.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFaculty(null)}>Close</Button>
            <Button>Edit Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
