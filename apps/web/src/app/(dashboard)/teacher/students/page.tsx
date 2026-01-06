"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const subjects = [
  { id: "cs501", name: "Data Structures", code: "CS501", sections: ["CSE-A", "CSE-B"] },
  { id: "cs505", name: "Data Structures Lab", code: "CS505", sections: ["CSE-A Batch 1", "CSE-A Batch 2"] },
  { id: "cs502", name: "Algorithms", code: "CS502", sections: ["CSE-C"] },
];

const students = [
  {
    id: "1",
    rollNo: "21CSE001",
    name: "Aakash Verma",
    email: "aakash.verma@college.edu",
    phone: "+91 98765 43201",
    section: "CSE-A",
    attendance: 92,
    avgMarks: 85,
    assignments: { submitted: 8, pending: 2 },
    status: "good",
  },
  {
    id: "2",
    rollNo: "21CSE002",
    name: "Aditi Sharma",
    email: "aditi.sharma@college.edu",
    phone: "+91 98765 43202",
    section: "CSE-A",
    attendance: 88,
    avgMarks: 78,
    assignments: { submitted: 9, pending: 1 },
    status: "good",
  },
  {
    id: "3",
    rollNo: "21CSE003",
    name: "Amit Kumar",
    email: "amit.kumar@college.edu",
    phone: "+91 98765 43203",
    section: "CSE-A",
    attendance: 65,
    avgMarks: 55,
    assignments: { submitted: 5, pending: 5 },
    status: "at_risk",
  },
  {
    id: "4",
    rollNo: "21CSE004",
    name: "Ananya Patel",
    email: "ananya.patel@college.edu",
    phone: "+91 98765 43204",
    section: "CSE-A",
    attendance: 95,
    avgMarks: 92,
    assignments: { submitted: 10, pending: 0 },
    status: "excellent",
  },
  {
    id: "5",
    rollNo: "21CSE005",
    name: "Arjun Singh",
    email: "arjun.singh@college.edu",
    phone: "+91 98765 43205",
    section: "CSE-B",
    attendance: 72,
    avgMarks: 68,
    assignments: { submitted: 7, pending: 3 },
    status: "warning",
  },
  {
    id: "6",
    rollNo: "21CSE006",
    name: "Bhavya Reddy",
    email: "bhavya.reddy@college.edu",
    phone: "+91 98765 43206",
    section: "CSE-B",
    attendance: 85,
    avgMarks: 82,
    assignments: { submitted: 8, pending: 2 },
    status: "good",
  },
  {
    id: "7",
    rollNo: "21CSE007",
    name: "Chetan Gupta",
    email: "chetan.gupta@college.edu",
    phone: "+91 98765 43207",
    section: "CSE-B",
    attendance: 90,
    avgMarks: 75,
    assignments: { submitted: 9, pending: 1 },
    status: "good",
  },
  {
    id: "8",
    rollNo: "21CSE008",
    name: "Deepika Joshi",
    email: "deepika.joshi@college.edu",
    phone: "+91 98765 43208",
    section: "CSE-B",
    attendance: 58,
    avgMarks: 45,
    assignments: { submitted: 4, pending: 6 },
    status: "at_risk",
  },
];

export default function TeacherStudents() {
  const [selectedSubject, setSelectedSubject] = useState("cs501");
  const [selectedSection, setSelectedSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === "all" || student.section === selectedSection;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesSection && matchesStatus;
  });

  const stats = {
    total: filteredStudents.length,
    excellent: filteredStudents.filter((s) => s.status === "excellent").length,
    good: filteredStudents.filter((s) => s.status === "good").length,
    warning: filteredStudents.filter((s) => s.status === "warning").length,
    atRisk: filteredStudents.filter((s) => s.status === "at_risk").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-500">Excellent</Badge>;
      case "good":
        return <Badge className="bg-blue-500">Good</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "at_risk":
        return <Badge className="bg-red-500">At Risk</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">
            View and manage students in your classes
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="CSE-A">CSE-A</SelectItem>
                  <SelectItem value="CSE-B">CSE-B</SelectItem>
                  <SelectItem value="CSE-C">CSE-C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll no..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
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
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Excellent</p>
                <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Good</p>
                <p className="text-2xl font-bold text-blue-600">{stats.good}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            Students enrolled in {subjects.find((s) => s.id === selectedSubject)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">Avg. Marks</TableHead>
                <TableHead className="text-center">Assignments</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{student.rollNo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.section}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Progress
                        value={student.attendance}
                        className={`w-16 h-2 ${student.attendance < 75 ? "[&>div]:bg-red-500" : ""}`}
                      />
                      <span className={`text-sm font-medium ${student.attendance < 75 ? "text-red-600" : ""}`}>
                        {student.attendance}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${student.avgMarks < 50 ? "text-red-600" : student.avgMarks >= 80 ? "text-green-600" : ""}`}>
                      {student.avgMarks}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">
                      {student.assignments.submitted}/{student.assignments.submitted + student.assignments.pending}
                    </span>
                    {student.assignments.pending > 0 && (
                      <span className="text-xs text-red-600 ml-1">
                        ({student.assignments.pending} pending)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(student.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Student Details</DialogTitle>
                            <DialogDescription>
                              Performance overview for {student.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-lg">
                                  {student.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold">{student.name}</h3>
                                <p className="text-muted-foreground font-mono">{student.rollNo}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{student.section}</Badge>
                                  {getStatusBadge(student.status)}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.phone}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-4">
                                  <p className="text-sm text-muted-foreground">Attendance</p>
                                  <p className="text-2xl font-bold">{student.attendance}%</p>
                                  <Progress value={student.attendance} className="h-2 mt-2" />
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4">
                                  <p className="text-sm text-muted-foreground">Average Marks</p>
                                  <p className="text-2xl font-bold">{student.avgMarks}%</p>
                                  <Progress value={student.avgMarks} className="h-2 mt-2" />
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4">
                                  <p className="text-sm text-muted-foreground">Assignments</p>
                                  <p className="text-2xl font-bold">
                                    {student.assignments.submitted}/{student.assignments.submitted + student.assignments.pending}
                                  </p>
                                  <Progress
                                    value={(student.assignments.submitted / (student.assignments.submitted + student.assignments.pending)) * 100}
                                    className="h-2 mt-2"
                                  />
                                </CardContent>
                              </Card>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send Message
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* At Risk Alert */}
      {stats.atRisk > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Students At Risk</h3>
                <p className="text-sm text-red-700 mt-1">
                  {stats.atRisk} student(s) have low attendance or poor performance. Consider reaching out to them.
                </p>
                <div className="mt-3 flex gap-2">
                  {filteredStudents
                    .filter((s) => s.status === "at_risk")
                    .map((s) => (
                      <Badge key={s.id} variant="outline" className="text-red-700 border-red-300">
                        {s.name} ({s.rollNo})
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
