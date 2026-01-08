"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  GraduationCap,
  Building2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useTenantId } from "@/hooks/use-tenant";

// Mock data - will be replaced with API calls
const mockClassesData = {
  currentSemester: "Spring 2026",
  classes: [
    {
      id: "1",
      subjectCode: "CS301",
      subjectName: "Data Structures & Algorithms",
      department: "Computer Science",
      semester: 3,
      section: "A",
      studentCount: 45,
      schedule: [
        { day: "Monday", time: "9:00 AM - 10:30 AM" },
        { day: "Wednesday", time: "9:00 AM - 10:30 AM" },
        { day: "Friday", time: "9:00 AM - 10:30 AM" },
      ],
      averageAttendance: 87,
      averageMarks: 72,
    },
    {
      id: "2",
      subjectCode: "CS302",
      subjectName: "Database Management Systems",
      department: "Computer Science",
      semester: 3,
      section: "A",
      studentCount: 45,
      schedule: [
        { day: "Tuesday", time: "11:00 AM - 12:30 PM" },
        { day: "Thursday", time: "11:00 AM - 12:30 PM" },
      ],
      averageAttendance: 82,
      averageMarks: 68,
    },
    {
      id: "3",
      subjectCode: "CS301",
      subjectName: "Data Structures & Algorithms",
      department: "Computer Science",
      semester: 3,
      section: "B",
      studentCount: 42,
      schedule: [
        { day: "Monday", time: "2:00 PM - 3:30 PM" },
        { day: "Wednesday", time: "2:00 PM - 3:30 PM" },
        { day: "Friday", time: "2:00 PM - 3:30 PM" },
      ],
      averageAttendance: 85,
      averageMarks: 70,
    },
    {
      id: "4",
      subjectCode: "CS401",
      subjectName: "Machine Learning",
      department: "Computer Science",
      semester: 5,
      section: "A",
      studentCount: 38,
      schedule: [
        { day: "Tuesday", time: "2:00 PM - 3:30 PM" },
        { day: "Thursday", time: "2:00 PM - 3:30 PM" },
      ],
      averageAttendance: 90,
      averageMarks: 75,
    },
  ],
  todaysClasses: [
    {
      id: "1",
      subjectCode: "CS301",
      subjectName: "Data Structures & Algorithms",
      section: "A",
      time: "9:00 AM - 10:30 AM",
      room: "LH-101",
      status: "upcoming",
    },
    {
      id: "3",
      subjectCode: "CS301",
      subjectName: "Data Structures & Algorithms",
      section: "B",
      time: "2:00 PM - 3:30 PM",
      room: "LH-102",
      status: "upcoming",
    },
  ],
};

export default function TeacherClassesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const tenantId = useTenantId();

  const isLoading = false;
  const data = mockClassesData;

  const totalStudents = data.classes.reduce((sum, c) => sum + c.studentCount, 0);
  const avgAttendance = Math.round(
    data.classes.reduce((sum, c) => sum + c.averageAttendance, 0) / data.classes.length
  );

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            {data.currentSemester} - Manage your classes and students
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.classes.length}</span>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalStudents}</span>
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{avgAttendance}%</span>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.todaysClasses.length}</span>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      {data.todaysClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.todaysClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[100px]">
                      <p className="text-sm font-medium">{cls.time.split(" - ")[0]}</p>
                      <p className="text-xs text-muted-foreground">
                        {cls.time.split(" - ")[1]}
                      </p>
                    </div>
                    <div className="border-l pl-4">
                      <p className="font-medium">{cls.subjectName}</p>
                      <p className="text-sm text-muted-foreground">
                        {cls.subjectCode} - Section {cls.section} | Room {cls.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={cls.status === "ongoing" ? "default" : "secondary"}
                    >
                      {cls.status}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teacher/attendance?class=${cls.id}`}>
                        Take Attendance
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Classes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <BookOpen className="h-4 w-4 mr-2" />
            All Classes
          </TabsTrigger>
          <TabsTrigger value="by-subject">
            <BarChart3 className="h-4 w-4 mr-2" />
            By Subject
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {data.classes.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {cls.subjectCode}
                      </Badge>
                      <CardTitle className="text-lg">{cls.subjectName}</CardTitle>
                      <CardDescription>
                        Section {cls.section} | Semester {cls.semester}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.studentCount} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.department}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Avg. Attendance</p>
                      <p className="text-lg font-bold">{cls.averageAttendance}%</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Avg. Marks</p>
                      <p className="text-lg font-bold">{cls.averageMarks}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Schedule</p>
                    <div className="space-y-1">
                      {cls.schedule.map((sch, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {sch.day}: {sch.time}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/teacher/students?class=${cls.id}`}>
                        <Users className="h-4 w-4 mr-2" />
                        Students
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/teacher/attendance?class=${cls.id}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Attendance
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-subject" className="space-y-4">
          {/* Group by subject */}
          {Array.from(new Set(data.classes.map((c) => c.subjectCode))).map(
            (subjectCode) => {
              const subjectClasses = data.classes.filter(
                (c) => c.subjectCode === subjectCode
              );
              const subject = subjectClasses[0];

              return (
                <Card key={subjectCode}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {subjectCode}
                        </Badge>
                        <CardTitle>{subject.subjectName}</CardTitle>
                        <CardDescription>
                          {subjectClasses.length} section(s) |{" "}
                          {subjectClasses.reduce((sum, c) => sum + c.studentCount, 0)}{" "}
                          students total
                        </CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-3">
                      {subjectClasses.map((cls) => (
                        <div
                          key={cls.id}
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">Section {cls.section}</p>
                            <p className="text-sm text-muted-foreground">
                              {cls.studentCount} students
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {cls.averageAttendance}% att.
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
