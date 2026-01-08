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
import {
  useHodFaculty,
  useDepartmentTimetable,
  useWorkloadDetails,
  type FacultyDto,
} from "@/hooks/use-hod-faculty";

// Mock leave requests - Leave model not yet implemented
const leaveRequests = [
  { id: 1, faculty: "Dr. Suresh Pillai", type: "Medical", from: "Jan 6, 2026", to: "Jan 8, 2026", days: 3, status: "pending" },
  { id: 2, faculty: "Prof. Kavitha Nair", type: "Personal", from: "Jan 15, 2026", to: "Jan 15, 2026", days: 1, status: "pending" },
];

export default function HODFacultyManagement() {
  const tenantId = useTenantId() || '';
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyDto | null>(null);

  // Fetch faculty data from HoD faculty API
  const { data: facultyData, isLoading: facultyLoading, error } = useHodFaculty(tenantId, {
    search: searchQuery || undefined,
    designation: filterDesignation !== 'all' ? filterDesignation : undefined,
  });
  const { data: timetableData } = useDepartmentTimetable(tenantId);
  const { data: workloadData } = useWorkloadDetails(tenantId);

  const isLoading = facultyLoading;

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Faculty</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // Use API data
  const stats = facultyData?.stats || { totalFaculty: 0, presentToday: 0, onLeave: 0, avgClassesPerWeek: 0 };
  const workload = facultyData?.workload || { avgClassesPerFaculty: 0, avgLabsPerFaculty: 0, underloaded: 0, optimal: 0, overloaded: 0 };
  const faculty = facultyData?.faculty || [];
  const departmentName = facultyData?.department?.name || 'Department';
  const timetable = timetableData?.timetable || [];
  const workloadFaculty = workloadData?.faculty || [];

  const getAttendanceBadge = (attendance: number) => {
    if (attendance >= 90) return <Badge className="bg-green-500">{attendance}%</Badge>;
    if (attendance >= 80) return <Badge className="bg-yellow-500">{attendance}%</Badge>;
    return <Badge variant="destructive">{attendance}%</Badge>;
  };

  const formatJoinDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
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
                <p className="text-2xl font-bold">{stats.totalFaculty}</p>
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
                <p className="text-2xl font-bold">{stats.presentToday}</p>
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
                <p className="text-2xl font-bold">{stats.onLeave}</p>
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
                <p className="text-2xl font-bold">{stats.avgClassesPerWeek}</p>
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
                  <CardDescription>{departmentName}</CardDescription>
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
              {faculty.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No faculty members found
                </div>
              ) : (
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
                    {faculty.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {f.name.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{f.name}</p>
                              <p className="text-sm text-muted-foreground">{f.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{f.designation}</p>
                            <p className="text-xs text-muted-foreground">{formatJoinDate(f.joiningDate)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {f.subjects.slice(0, 2).map((subject) => (
                              <Badge key={subject.id} variant="outline" className="text-xs">
                                {subject.code}
                              </Badge>
                            ))}
                            {f.subjects.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{f.subjects.length - 2}
                              </Badge>
                            )}
                            {f.subjects.length === 0 && (
                              <span className="text-muted-foreground text-xs">No subjects</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{f.classesTaken}</span>
                          <span className="text-muted-foreground">/{f.totalClasses}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getAttendanceBadge(f.attendancePercentage)}
                        </TableCell>
                        <TableCell>
                          {f.isOnLeave ? (
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
                              <DropdownMenuItem onClick={() => setSelectedFaculty(f)}>
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
              )}
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
                {workloadFaculty.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No workload data available
                  </div>
                ) : (
                  <div className="space-y-6">
                    {workloadFaculty.map((f) => {
                      const workloadPercent = Math.min((f.subjectCount / 4) * 100, 100);
                      return (
                        <div key={f.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{f.name}</span>
                              {f.status === 'overloaded' && (
                                <Badge variant="destructive" className="text-xs">Overloaded</Badge>
                              )}
                              {f.status === 'underloaded' && (
                                <Badge variant="secondary" className="text-xs">Underloaded</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {f.subjectCount} subjects
                            </span>
                          </div>
                          <Progress
                            value={workloadPercent}
                            className={`h-3 ${
                              f.status === 'overloaded' ? "[&>div]:bg-red-500" :
                              f.status === 'underloaded' ? "[&>div]:bg-yellow-500" : ""
                            }`}
                          />
                          <div className="flex flex-wrap gap-1">
                            {f.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {subject.code}
                              </Badge>
                            ))}
                            {f.subjects.length === 0 && (
                              <span className="text-muted-foreground text-xs">No subjects assigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    <p className="text-2xl font-bold text-green-800">{workload.optimal} faculty</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-sm text-yellow-700">Underloaded</p>
                    <p className="text-2xl font-bold text-yellow-800">{workload.underloaded} faculty</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">Overloaded</p>
                    <p className="text-2xl font-bold text-red-800">{workload.overloaded} faculty</p>
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
              {timetable.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No timetable data available
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Time</TableHead>
                        <TableHead>Monday</TableHead>
                        <TableHead>Tuesday</TableHead>
                        <TableHead>Wednesday</TableHead>
                        <TableHead>Thursday</TableHead>
                        <TableHead>Friday</TableHead>
                        <TableHead>Saturday</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetable.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.time}</TableCell>
                          <TableCell>
                            {row.monday && <Badge variant="outline" className="whitespace-nowrap">{row.monday}</Badge>}
                          </TableCell>
                          <TableCell>
                            {row.tuesday && <Badge variant="outline" className="whitespace-nowrap">{row.tuesday}</Badge>}
                          </TableCell>
                          <TableCell>
                            {row.wednesday && <Badge variant="outline" className="whitespace-nowrap">{row.wednesday}</Badge>}
                          </TableCell>
                          <TableCell>
                            {row.thursday && <Badge variant="outline" className="whitespace-nowrap">{row.thursday}</Badge>}
                          </TableCell>
                          <TableCell>
                            {row.friday && <Badge variant="outline" className="whitespace-nowrap">{row.friday}</Badge>}
                          </TableCell>
                          <TableCell>
                            {row.saturday && <Badge variant="outline" className="whitespace-nowrap">{row.saturday}</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
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
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedFaculty.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{formatJoinDate(selectedFaculty.joiningDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Classes</p>
                  <p className="font-medium">{selectedFaculty.classesTaken} / {selectedFaculty.totalClasses}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance</p>
                  <p className="font-medium">{selectedFaculty.attendancePercentage}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedFaculty.email}`} className="text-blue-600 hover:underline">
                    {selectedFaculty.email}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Subjects ({selectedFaculty.subjectCount})</p>
                <div className="flex flex-wrap gap-1">
                  {selectedFaculty.subjects.length > 0 ? (
                    selectedFaculty.subjects.map((subject) => (
                      <Badge key={subject.id} variant="secondary">{subject.name}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No subjects assigned</span>
                  )}
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
