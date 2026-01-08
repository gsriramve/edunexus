"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Save,
  RotateCcw,
  Search,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";
import {
  useClassAttendance,
  useMarkAttendance,
  type AttendanceStatus,
} from "@/hooks/use-teacher-attendance";
import { toast } from "sonner";

type LocalAttendanceStatus = AttendanceStatus | "not_marked";

export default function TeacherAttendance() {
  const searchParams = useSearchParams();
  const classIdFromUrl = searchParams.get("class");

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [localAttendance, setLocalAttendance] = useState<Record<string, LocalAttendanceStatus>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const tenantId = useTenantId();

  // Load teacher's classes
  const { data: classesData, isLoading: isLoadingClasses } = useTeacherClasses(tenantId || "");

  // Set initial class from URL or first available
  useEffect(() => {
    if (classIdFromUrl) {
      setSelectedClass(classIdFromUrl);
    } else if (classesData?.classes && classesData.classes.length > 0 && !selectedClass) {
      setSelectedClass(classesData.classes[0].id);
    }
  }, [classIdFromUrl, classesData?.classes, selectedClass]);

  // Load attendance for selected class
  const {
    data: attendanceData,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useClassAttendance(tenantId || "", selectedClass, selectedDate);

  // Mark attendance mutation
  const { mutate: saveAttendance, isPending: isSaving } = useMarkAttendance(tenantId || "");

  // Initialize local attendance when data loads
  useEffect(() => {
    if (attendanceData) {
      const initial: Record<string, LocalAttendanceStatus> = {};
      for (const student of attendanceData.students) {
        initial[student.id] = attendanceData.attendance[student.id] || "not_marked";
      }
      setLocalAttendance(initial);
      setHasChanges(false);
    }
  }, [attendanceData]);

  const classes = classesData?.classes || [];
  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const filteredStudents = useMemo(() => {
    if (!attendanceData?.students) return [];
    return attendanceData.students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attendanceData?.students, searchQuery]);

  const updateAttendance = (studentId: string, status: LocalAttendanceStatus) => {
    setLocalAttendance((prev) => ({ ...prev, [studentId]: status }));
    setHasChanges(true);
  };

  const markAllPresent = () => {
    if (!attendanceData?.students) return;
    const newAttendance = attendanceData.students.reduce(
      (acc, student) => ({ ...acc, [student.id]: "present" as LocalAttendanceStatus }),
      {}
    );
    setLocalAttendance(newAttendance);
    setHasChanges(true);
  };

  const resetAttendance = () => {
    if (!attendanceData?.students) return;
    const newAttendance = attendanceData.students.reduce(
      (acc, student) => ({ ...acc, [student.id]: "not_marked" as LocalAttendanceStatus }),
      {}
    );
    setLocalAttendance(newAttendance);
    setHasChanges(true);
  };

  const handleSaveAttendance = () => {
    const attendanceEntries = Object.entries(localAttendance)
      .filter(([, status]) => status !== "not_marked")
      .map(([studentId, status]) => ({
        studentId,
        status: status as AttendanceStatus,
      }));

    if (attendanceEntries.length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    saveAttendance(
      {
        teacherSubjectId: selectedClass,
        date: selectedDate,
        attendance: attendanceEntries,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          setHasChanges(false);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to save attendance");
        },
      }
    );
  };

  const stats = useMemo(() => {
    const values = Object.values(localAttendance);
    return {
      total: attendanceData?.students.length || 0,
      present: values.filter((s) => s === "present").length,
      absent: values.filter((s) => s === "absent").length,
      late: values.filter((s) => s === "late").length,
    };
  }, [localAttendance, attendanceData?.students.length]);

  const getStatusBadge = (status: LocalAttendanceStatus) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-500">Late</Badge>;
      case "excused":
        return <Badge className="bg-blue-500">Excused</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  // Loading state
  if (isLoadingClasses) {
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

  // No classes assigned
  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          <p className="text-muted-foreground">
            Record student attendance for your classes
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Classes Assigned</h3>
            <p className="text-muted-foreground">
              You don't have any classes assigned for this semester.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          <p className="text-muted-foreground">
            Record student attendance for your classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAttendance} disabled={isSaving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveAttendance} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Class Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.subjectName} - Section {cls.section || "A"} ({cls.subjectCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          {selectedClassData && (
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {selectedClassData.subjectCode}
                </Badge>
                <span className="font-medium">{selectedClassData.subjectName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {selectedClassData.studentCount} students
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {selectedClassData.department}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>Mark attendance for each student</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={markAllPresent}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark All Present
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAttendance ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : attendanceError ? (
            <div className="text-center py-8 text-muted-foreground">
              {attendanceError instanceof Error ? attendanceError.message : "Failed to load attendance"}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found in this class
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Late</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-mono">{student.rollNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {student.photoUrl && <AvatarImage src={student.photoUrl} />}
                          <AvatarFallback className="text-xs">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={localAttendance[student.id] === "present"}
                        onCheckedChange={(checked) =>
                          updateAttendance(student.id, checked ? "present" : "not_marked")
                        }
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={localAttendance[student.id] === "absent"}
                        onCheckedChange={(checked) =>
                          updateAttendance(student.id, checked ? "absent" : "not_marked")
                        }
                        className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={localAttendance[student.id] === "late"}
                        onCheckedChange={(checked) =>
                          updateAttendance(student.id, checked ? "late" : "not_marked")
                        }
                        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(localAttendance[student.id])}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-800">Attendance Summary</h3>
                <p className="text-sm text-blue-700">
                  {stats.present} present, {stats.absent} absent, {stats.late} late out of {stats.total} students
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
