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
  Building2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useTeacherClasses,
  type TeacherClass,
  type TodaysClass,
} from "@/hooks/use-teacher-classes";

export default function TeacherClassesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const tenantId = useTenantId();

  const { data, isLoading, error } = useTeacherClasses(tenantId || "");

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

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error instanceof Error ? error.message : "Failed to load classes"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = data?.stats || {
    currentSemester: "Spring 2026",
    currentAcademicYear: "2025-2026",
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    todaysClassCount: 0,
  };

  const classes = data?.classes || [];
  const todaysClasses = data?.todaysClasses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            {stats.currentSemester} - Manage your classes and students
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
              <span className="text-2xl font-bold">{stats.totalClasses}</span>
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
              <span className="text-2xl font-bold">{stats.totalStudents}</span>
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
              <span className="text-2xl font-bold">{stats.averageAttendance}%</span>
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
              <span className="text-2xl font-bold">{stats.todaysClassCount}</span>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      {todaysClasses.length > 0 && (
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
              {todaysClasses.map((cls: TodaysClass) => (
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
                        {cls.subjectCode} - Section {cls.section || "A"} | Room {cls.room || "TBD"}
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
                      <Link href={`/teacher/attendance?class=${cls.teacherSubjectId}`}>
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

      {/* Empty state for today's classes */}
      {todaysClasses.length === 0 && (
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
            <p className="text-center text-muted-foreground py-8">
              No classes scheduled for today
            </p>
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
          {classes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Classes Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any classes assigned for this semester yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {classes.map((cls: TeacherClass) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {cls.subjectCode}
                        </Badge>
                        <CardTitle className="text-lg">{cls.subjectName}</CardTitle>
                        <CardDescription>
                          Section {cls.section || "A"} | Semester {cls.semester}
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

                    {cls.schedule.length > 0 && (
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
                    )}

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
          )}
        </TabsContent>

        <TabsContent value="by-subject" className="space-y-4">
          {/* Group by subject */}
          {classes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Classes Assigned</h3>
                <p className="text-muted-foreground">
                  You don't have any classes assigned for this semester yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            Array.from(new Set(classes.map((c: TeacherClass) => c.subjectCode))).map(
              (subjectCode) => {
                const subjectClasses = classes.filter(
                  (c: TeacherClass) => c.subjectCode === subjectCode
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
                            {subjectClasses.reduce((sum: number, c: TeacherClass) => sum + c.studentCount, 0)}{" "}
                            students total
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 md:grid-cols-3">
                        {subjectClasses.map((cls: TeacherClass) => (
                          <div
                            key={cls.id}
                            className="p-3 border rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">Section {cls.section || "A"}</p>
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
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
