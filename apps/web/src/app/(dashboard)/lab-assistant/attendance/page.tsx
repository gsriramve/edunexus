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
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useLabAssistantLabs,
  useLabAssistantBatches,
  useLabAssistantStudents,
  useAttendanceHistory,
  useLowAttendanceStudents,
  useSubmitAttendance,
} from "@/hooks/use-lab-assistant";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LabAttendance() {
  const tenantId = useTenantId() || '';
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [labNumber, setLabNumber] = useState("9");
  const [timeSlot, setTimeSlot] = useState("morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  // Fetch data
  const { data: labsData, isLoading: labsLoading } = useLabAssistantLabs(tenantId);
  const { data: batchesData, isLoading: batchesLoading } = useLabAssistantBatches(tenantId);
  const { data: studentsData, isLoading: studentsLoading } = useLabAssistantStudents(tenantId, {
    batchId: selectedBatch,
    search: searchQuery || undefined,
  });
  const { data: historyData, isLoading: historyLoading } = useAttendanceHistory(tenantId, { limit: 10 });
  const { data: lowAttendanceData, isLoading: lowAttendanceLoading } = useLowAttendanceStudents(tenantId);
  const submitAttendance = useSubmitAttendance(tenantId);

  const isLoading = labsLoading || batchesLoading;

  // Set default selections when data loads
  if (labsData?.labs?.length && !selectedLab) {
    setSelectedLab(labsData.labs[0].id);
  }
  if (batchesData?.batches?.length && !selectedBatch) {
    setSelectedBatch(batchesData.batches[0].id);
  }

  // Initialize attendance state when students load
  if (studentsData?.students && Object.keys(attendance).length === 0) {
    const initialAttendance: Record<string, string> = {};
    studentsData.students.forEach((s) => {
      initialAttendance[s.id] = s.status || 'present';
    });
    if (Object.keys(initialAttendance).length > 0) {
      setAttendance(initialAttendance);
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const labs = labsData?.labs || [];
  const batches = batchesData?.batches || [];
  const students = studentsData?.students || [];
  const attendanceHistory = historyData?.records || [];
  const lowAttendanceStudents = lowAttendanceData?.students || [];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    total: students.length,
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const newAttendance: Record<string, string> = {};
    students.forEach((s) => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleReset = () => {
    const newAttendance: Record<string, string> = {};
    students.forEach((s) => {
      newAttendance[s.id] = "present";
    });
    setAttendance(newAttendance);
  };

  const handleSaveAttendance = () => {
    const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status: status as 'present' | 'absent' | 'late',
    }));

    submitAttendance.mutate({
      labId: selectedLab,
      batchId: selectedBatch,
      date: selectedDate,
      labNumber: parseInt(labNumber),
      timeSlot,
      attendance: attendanceData,
    });
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
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lab</label>
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab" />
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
                        <SelectValue placeholder="Select batch" />
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
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
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
                      {labs.find((l) => l.id === selectedLab)?.name || 'Select Lab'} • {batches.find((b) => b.id === selectedBatch)?.name || 'Select Batch'} • Lab {labNumber}
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
                {studentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <>
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
                              <Badge className={getStatusColor(attendance[student.id] || 'present')}>
                                {attendance[student.id] || 'present'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={handleSaveAttendance} disabled={submitAttendance.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {submitAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No students found</p>
                )}
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
                      {labs.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : attendanceHistory.length > 0 ? (
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
              ) : (
                <p className="text-center text-muted-foreground py-8">No attendance history found</p>
              )}
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
              {lowAttendanceLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : lowAttendanceStudents.length > 0 ? (
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
              ) : (
                <p className="text-center text-muted-foreground py-8">No students with low attendance</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
