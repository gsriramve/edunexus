"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  User,
  Video,
  File,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId } from "@/hooks/use-api";
import { useStudentCGPA } from "@/hooks/use-exams";
import { useStudentSubjects, useStudentAcademicSummary, type AcademicSubject } from "@/hooks/use-student-academics";

// Sample materials data - Course materials model doesn't exist in the database yet
// These are sample files shown when no real materials are available
const sampleMaterialsBySubject: Record<string, Array<{ id: string; name: string; type: string; size: string }>> = {
  default: [
    { id: "m1", name: "Course Syllabus", type: "pdf", size: "0.5 MB" },
    { id: "m2", name: "Lecture Notes - Week 1", type: "pdf", size: "2.1 MB" },
  ],
};

// Sample timetable data - Timetable/Schedule model doesn't exist in the database yet
// This is sample data shown when no real timetable is available
const sampleTimetable = [
  { day: "Monday", slots: ["Subject 1", "Subject 2", "-", "Lab 1", "-"] },
  { day: "Tuesday", slots: ["Subject 3", "Subject 4", "-", "Lab 2", "-"] },
  { day: "Wednesday", slots: ["Subject 1", "Subject 3", "-", "Subject 4", "-"] },
  { day: "Thursday", slots: ["Subject 2", "Subject 1", "-", "Lab 1", "-"] },
  { day: "Friday", slots: ["Subject 3", "Subject 4", "-", "Lab 2", "-"] },
  { day: "Saturday", slots: ["Subject 2", "-", "-", "-", "-"] },
];

const timeSlots = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "2:00-3:00", "3:00-4:00"];

// Helper to generate a sample timetable based on available subjects
function generateTimetableFromSubjects(subjects: AcademicSubject[]) {
  const theorySubjects = subjects.filter(s => s.type === 'Theory');
  const labSubjects = subjects.filter(s => s.type === 'Lab');

  // Create a simple rotation schedule
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return days.map((day, dayIndex) => {
    const slots: string[] = [];

    // Morning slots (3)
    for (let i = 0; i < 3; i++) {
      const subjectIndex = (dayIndex + i) % theorySubjects.length;
      if (i < 2 && theorySubjects[subjectIndex]) {
        slots.push(theorySubjects[subjectIndex].code);
      } else {
        slots.push('-');
      }
    }

    // Afternoon slots (2) - usually labs
    for (let i = 0; i < 2; i++) {
      const labIndex = dayIndex % Math.max(1, labSubjects.length);
      if (i === 0 && labSubjects[labIndex] && (dayIndex % 2 === 0)) {
        slots.push(labSubjects[labIndex].code);
      } else {
        slots.push('-');
      }
    }

    return { day, slots };
  });
}

// Helper to get materials for a subject (uses sample data since materials model doesn't exist)
function getMaterialsForSubject(subject: AcademicSubject) {
  return sampleMaterialsBySubject[subject.code] || sampleMaterialsBySubject.default || [];
}

export default function StudentAcademics() {
  const { user } = useAuth();
  const tenantId = useTenantId() || '';
  const [selectedSemester, setSelectedSemester] = useState("0"); // "0" means current semester

  // Get student data for context
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  // Set initial semester once student data loads
  const currentSemester = studentData?.semester || 1;

  // Fetch subjects for the selected semester
  const semesterNum = selectedSemester === "0" ? undefined : parseInt(selectedSemester, 10);
  const { data: academicsData, isLoading: subjectsLoading } = useStudentSubjects(studentId, semesterNum);

  // Fetch academic summary (CGPA and semester-wise SGPA)
  const { data: summaryData, isLoading: summaryLoading } = useStudentAcademicSummary(studentId);

  // Fetch CGPA - this is real data from the API (returns a number)
  const { data: cgpaData, isLoading: cgpaLoading } = useStudentCGPA(tenantId, studentId);

  // Use real data with fallbacks
  const subjects = academicsData?.subjects || [];
  const progress = academicsData?.progress || { totalCredits: 0, totalSubjects: 0, avgProgress: 0, avgAttendance: 0 };

  // Use real CGPA if available (API returns a single number for cgpa)
  const actualCgpa = cgpaData ?? summaryData?.cgpa ?? 0;
  // Get SGPA for selected semester from summary
  const selectedSemesterNum = selectedSemester === "0" ? currentSemester : parseInt(selectedSemester, 10);
  const semesterResult = summaryData?.semesterResults?.find(s => s.semester === selectedSemesterNum);
  const actualSgpa = semesterResult?.sgpa ?? 0;

  // Generate timetable from subjects when available
  const timetable = subjects.length > 0
    ? generateTimetableFromSubjects(subjects)
    : sampleTimetable;

  const isLoading = studentLoading || (studentId && subjectsLoading);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academics</h1>
          <p className="text-muted-foreground">
            Your courses, materials, and academic progress
          </p>
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              Current Semester ({currentSemester})
            </SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Semester Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{progress.totalCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {progress.avgProgress}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current SGPA</p>
                <p className="text-2xl font-bold">
                  {cgpaLoading ? <Skeleton className="h-8 w-12" /> : actualSgpa}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall CGPA</p>
                <p className="text-2xl font-bold">
                  {cgpaLoading ? <Skeleton className="h-8 w-12" /> : actualCgpa}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          {subjects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Subjects Found</h3>
                  <p className="text-muted-foreground">
                    No subjects enrolled for this semester yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {subject.code}
                      </Badge>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3" />
                        {subject.teacher}
                      </CardDescription>
                    </div>
                    <Badge variant={subject.type === "Lab" ? "default" : "secondary"}>
                      {subject.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Credits</span>
                      <span className="font-medium">{subject.credits}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className={`font-medium ${subject.attendance >= 75 ? "text-green-600" : "text-red-600"}`}>
                          {subject.attendance}%
                        </span>
                      </div>
                      <Progress value={subject.attendance} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Syllabus Progress</span>
                        <span className="font-medium">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>
                Semester {selectedSemester === "0" ? currentSemester : selectedSemester} class schedule
                {subjects.length === 0 && " (Sample data - no subjects enrolled)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Day</th>
                      {timeSlots.map((slot) => (
                        <th key={slot} className="text-center p-3 font-medium text-sm">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((row) => (
                      <tr key={row.day} className="border-b last:border-0">
                        <td className="p-3 font-medium">{row.day}</td>
                        {row.slots.map((slot, idx) => (
                          <td key={idx} className="p-3 text-center">
                            {slot !== "-" ? (
                              <Badge variant="outline" className="font-mono">
                                {slot}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          {subjects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Subjects Found</h3>
                  <p className="text-muted-foreground">
                    No subjects enrolled for this semester yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            subjects.map((subject) => {
              const materials = getMaterialsForSubject(subject);
              return (
                <Collapsible key={subject.id}>
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <CardTitle className="text-base">{subject.name}</CardTitle>
                              <CardDescription>{subject.code}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{materials.length} files</Badge>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-3">
                            Sample materials - Course materials feature coming soon
                          </p>
                          {materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                {material.type === "pdf" ? (
                                  <File className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Video className="h-5 w-5 text-blue-500" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{material.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {material.type.toUpperCase()} • {material.size}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
