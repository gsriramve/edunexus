"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Save,
  RotateCcw,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /lab-assistant/labs - Labs assigned to this assistant
// - GET /lab-assistant/batches - Batches for a lab
// - GET /lab-assistant/students?batchId=X - Students in a batch for attendance
// - GET /lab-assistant/attendance/history - Past attendance records
// - POST /lab-assistant/attendance - Submit attendance for a lab session
// - GET /lab-assistant/attendance/low - Students with low attendance
// - POST /lab-assistant/attendance/notify - Notify student/parent about low attendance

// Mock data
const labs = [
  { id: "lab-1", name: "Computer Networks Lab", code: "CN-LAB" },
  { id: "lab-2", name: "Data Structures Lab", code: "DS-LAB" },
];

const batches = [
  { id: "batch-1", name: "CSE-5A", semester: 5, section: "A", students: 30 },
  { id: "batch-2", name: "CSE-5B", semester: 5, section: "B", students: 30 },
  { id: "batch-3", name: "CSE-3A", semester: 3, section: "A", students: 32 },
  { id: "batch-4", name: "CSE-3B", semester: 3, section: "B", students: 28 },
];

const studentsList = [
  { id: "s1", rollNo: "21CSE001", name: "Rahul Sharma", status: "present" },
  { id: "s2", rollNo: "21CSE002", name: "Priya Menon", status: "present" },
  { id: "s3", rollNo: "21CSE003", name: "Arun Kumar", status: "absent" },
  { id: "s4", rollNo: "21CSE004", name: "Kavitha Nair", status: "present" },
  { id: "s5", rollNo: "21CSE005", name: "Vijay Pillai", status: "present" },
  { id: "s6", rollNo: "21CSE006", name: "Meera Das", status: "present" },
  { id: "s7", rollNo: "21CSE007", name: "Suresh Reddy", status: "late" },
  { id: "s8", rollNo: "21CSE008", name: "Anitha Krishnan", status: "present" },
  { id: "s9", rollNo: "21CSE009", name: "Deepak Verma", status: "present" },
  { id: "s10", rollNo: "21CSE010", name: "Sneha Gupta", status: "absent" },
  { id: "s11", rollNo: "21CSE011", name: "Ravi Kumar", status: "present" },
  { id: "s12", rollNo: "21CSE012", name: "Pooja Sharma", status: "present" },
  { id: "s13", rollNo: "21CSE013", name: "Amit Singh", status: "present" },
  { id: "s14", rollNo: "21CSE014", name: "Divya Nair", status: "present" },
  { id: "s15", rollNo: "21CSE015", name: "Karthik Menon", status: "present" },
];

const attendanceHistory = [
  { id: 1, date: "Jan 6, 2026", lab: "CN Lab", batch: "CSE-5A", labNo: 8, present: 28, absent: 2, late: 0, percentage: 93 },
  { id: 2, date: "Jan 5, 2026", lab: "DS Lab", batch: "CSE-5B", labNo: 7, present: 27, absent: 2, late: 1, percentage: 90 },
  { id: 3, date: "Jan 5, 2026", lab: "CN Lab", batch: "CSE-3A", labNo: 8, present: 30, absent: 2, late: 0, percentage: 94 },
  { id: 4, date: "Jan 4, 2026", lab: "DS Lab", batch: "CSE-3B", labNo: 7, present: 26, absent: 2, late: 0, percentage: 93 },
  { id: 5, date: "Jan 3, 2026", lab: "CN Lab", batch: "CSE-5A", labNo: 7, present: 29, absent: 1, late: 0, percentage: 97 },
];

const lowAttendanceStudents = [
  { id: "la1", rollNo: "21CSE003", name: "Arun Kumar", batch: "CSE-5A", attendance: 65, sessionsAttended: 5, totalSessions: 8 },
  { id: "la2", rollNo: "21CSE010", name: "Sneha Gupta", batch: "CSE-5A", attendance: 62, sessionsAttended: 5, totalSessions: 8 },
  { id: "la3", rollNo: "22CSE015", name: "Vikram Shah", batch: "CSE-3A", attendance: 70, sessionsAttended: 7, totalSessions: 10 },
];

export default function LabAttendance() {
  const tenantId = useTenantId() || '';
  const [selectedLab, setSelectedLab] = useState(labs[0].id);
  const [selectedBatch, setSelectedBatch] = useState(batches[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [labNumber, setLabNumber] = useState("9");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>(
    Object.fromEntries(studentsList.map((s) => [s.id, s.status]))
  );

  const filteredStudents = studentsList.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    total: studentsList.length,
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const newAttendance: Record<string, string> = {};
    studentsList.forEach((s) => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleReset = () => {
    const newAttendance: Record<string, string> = {};
    studentsList.forEach((s) => {
      newAttendance[s.id] = "present";
    });
    setAttendance(newAttendance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "late":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Attendance</h1>
          <p className="text-muted-foreground">
            Mark and manage lab session attendance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mark" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
          <TabsTrigger value="low">Low Attendance</TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark">
          <div className="space-y-4">
            {/* Selection Row */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lab</label>
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {labs.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch</label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} (Sem {batch.semester})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lab Number</label>
                    <Select value={labNumber} onValueChange={setLabNumber}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            Lab {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Slot</label>
                    <Select defaultValue="morning">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">9:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="afternoon">2:00 PM - 5:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Student Attendance</CardTitle>
                    <CardDescription>
                      {labs.find((l) => l.id === selectedLab)?.name} • {batches.find((b) => b.id === selectedBatch)?.name} • Lab {labNumber}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="pl-8 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleMarkAll("present")}>
                      Mark All Present
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student</TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={attendance[student.id] === "present"}
                            onCheckedChange={() => handleAttendanceChange(student.id, "present")}
                            className="border-green-500 data-[state=checked]:bg-green-500"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={attendance[student.id] === "absent"}
                            onCheckedChange={() => handleAttendanceChange(student.id, "absent")}
                            className="border-red-500 data-[state=checked]:bg-red-500"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={attendance[student.id] === "late"}
                            onCheckedChange={() => handleAttendanceChange(student.id, "late")}
                            className="border-yellow-500 data-[state=checked]:bg-yellow-500"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(attendance[student.id])}>
                            {attendance[student.id]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Past attendance records</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Labs</SelectItem>
                      <SelectItem value="cn">CN Lab</SelectItem>
                      <SelectItem value="ds">DS Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-center">Lab #</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>{record.lab}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.batch}</Badge>
                      </TableCell>
                      <TableCell className="text-center">Lab {record.labNo}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {record.present}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {record.absent}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {record.late}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={record.percentage >= 90 ? "bg-green-500" : record.percentage >= 75 ? "bg-yellow-500" : "bg-red-500"}>
                          {record.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Attendance Tab */}
        <TabsContent value="low">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Students with Low Lab Attendance
              </CardTitle>
              <CardDescription>
                Students below 75% lab attendance threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowAttendanceStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-lg border border-red-200 bg-red-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.rollNo} • {student.batch}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{student.attendance}%</p>
                          <p className="text-xs text-muted-foreground">Attendance</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">
                            {student.sessionsAttended}/{student.totalSessions}
                          </p>
                          <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Notify Student
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
