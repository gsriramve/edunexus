"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Save,
  RotateCcw,
  Search,
  Filter,
  Download,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data
const classes = [
  { id: "class-1", subject: "Data Structures", code: "CS501", section: "CSE-A", time: "09:00 AM", students: 60 },
  { id: "class-2", subject: "Data Structures", code: "CS501", section: "CSE-B", time: "11:00 AM", students: 58 },
  { id: "class-3", subject: "Data Structures Lab", code: "CS505", section: "CSE-A (Batch 1)", time: "02:00 PM", students: 30 },
  { id: "class-4", subject: "Algorithms", code: "CS502", section: "CSE-C", time: "04:00 PM", students: 55 },
];

const studentsList = [
  { id: "1", rollNo: "21CSE001", name: "Aakash Verma", status: "present" },
  { id: "2", rollNo: "21CSE002", name: "Aditi Sharma", status: "present" },
  { id: "3", rollNo: "21CSE003", name: "Amit Kumar", status: "absent" },
  { id: "4", rollNo: "21CSE004", name: "Ananya Patel", status: "present" },
  { id: "5", rollNo: "21CSE005", name: "Arjun Singh", status: "late" },
  { id: "6", rollNo: "21CSE006", name: "Bhavya Reddy", status: "present" },
  { id: "7", rollNo: "21CSE007", name: "Chetan Gupta", status: "present" },
  { id: "8", rollNo: "21CSE008", name: "Deepika Joshi", status: "absent" },
  { id: "9", rollNo: "21CSE009", name: "Dhruv Mehta", status: "present" },
  { id: "10", rollNo: "21CSE010", name: "Esha Kapoor", status: "present" },
  { id: "11", rollNo: "21CSE011", name: "Farhan Khan", status: "present" },
  { id: "12", rollNo: "21CSE012", name: "Garima Saxena", status: "late" },
  { id: "13", rollNo: "21CSE013", name: "Harsh Agarwal", status: "present" },
  { id: "14", rollNo: "21CSE014", name: "Ishita Malhotra", status: "present" },
  { id: "15", rollNo: "21CSE015", name: "Jai Prakash", status: "absent" },
];

type AttendanceStatus = "present" | "absent" | "late" | "not_marked";

export default function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    studentsList.reduce((acc, student) => ({ ...acc, [student.id]: student.status as AttendanceStatus }), {})
  );
  const [hasChanges, setHasChanges] = useState(false);

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const filteredStudents = studentsList.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setHasChanges(true);
  };

  const markAllPresent = () => {
    const newAttendance = studentsList.reduce(
      (acc, student) => ({ ...acc, [student.id]: "present" as AttendanceStatus }),
      {}
    );
    setAttendance(newAttendance);
    setHasChanges(true);
  };

  const resetAttendance = () => {
    const newAttendance = studentsList.reduce(
      (acc, student) => ({ ...acc, [student.id]: "not_marked" as AttendanceStatus }),
      {}
    );
    setAttendance(newAttendance);
    setHasChanges(true);
  };

  const saveAttendance = () => {
    // TODO: API call to save attendance
    console.log("Saving attendance:", { classId: selectedClass, date: selectedDate, attendance });
    setHasChanges(false);
    alert("Attendance saved successfully!");
  };

  const stats = {
    total: filteredStudents.length,
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-500">Late</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

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
          <Button variant="outline" onClick={resetAttendance}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={saveAttendance} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
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
                      {cls.subject} - {cls.section} ({cls.time})
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
                  {selectedClassData.code}
                </Badge>
                <span className="font-medium">{selectedClassData.subject}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {selectedClassData.students} students
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {selectedClassData.time}
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
                        <AvatarFallback className="text-xs">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {student.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={attendance[student.id] === "present"}
                      onCheckedChange={(checked) =>
                        updateAttendance(student.id, checked ? "present" : "not_marked")
                      }
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={attendance[student.id] === "absent"}
                      onCheckedChange={(checked) =>
                        updateAttendance(student.id, checked ? "absent" : "not_marked")
                      }
                      className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={attendance[student.id] === "late"}
                      onCheckedChange={(checked) =>
                        updateAttendance(student.id, checked ? "late" : "not_marked")
                      }
                      className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(attendance[student.id])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
