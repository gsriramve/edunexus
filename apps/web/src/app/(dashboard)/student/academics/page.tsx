"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
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

// TODO: Implement course enrollment and curriculum API for subjects and materials
// Mock data - Replace with API calls when course/curriculum endpoints are available
const currentSemester = 5;

const subjects = [
  {
    id: "1",
    code: "CS501",
    name: "Data Structures & Algorithms",
    credits: 4,
    type: "Theory",
    teacher: "Dr. Ramesh Kumar",
    attendance: 85,
    progress: 72,
    materials: [
      { id: "m1", name: "Unit 1 - Arrays & Linked Lists", type: "pdf", size: "2.4 MB" },
      { id: "m2", name: "Unit 2 - Trees & Graphs", type: "pdf", size: "3.1 MB" },
      { id: "m3", name: "Lecture Recording - Week 5", type: "video", size: "145 MB" },
    ],
  },
  {
    id: "2",
    code: "CS502",
    name: "Computer Networks",
    credits: 4,
    type: "Theory",
    teacher: "Dr. Priya Sharma",
    attendance: 78,
    progress: 65,
    materials: [
      { id: "m4", name: "OSI Model Notes", type: "pdf", size: "1.8 MB" },
      { id: "m5", name: "TCP/IP Protocol Suite", type: "pdf", size: "2.2 MB" },
    ],
  },
  {
    id: "3",
    code: "CS503",
    name: "Operating Systems",
    credits: 4,
    type: "Theory",
    teacher: "Dr. Arun Menon",
    attendance: 92,
    progress: 80,
    materials: [
      { id: "m6", name: "Process Management", type: "pdf", size: "2.0 MB" },
      { id: "m7", name: "Memory Management", type: "pdf", size: "1.9 MB" },
      { id: "m8", name: "Lab Manual - Week 6", type: "pdf", size: "0.8 MB" },
    ],
  },
  {
    id: "4",
    code: "CS504",
    name: "Software Engineering",
    credits: 3,
    type: "Theory",
    teacher: "Prof. Kavitha Nair",
    attendance: 88,
    progress: 70,
    materials: [
      { id: "m9", name: "SDLC Models", type: "pdf", size: "1.5 MB" },
      { id: "m10", name: "Agile & Scrum Guide", type: "pdf", size: "2.1 MB" },
    ],
  },
  {
    id: "5",
    code: "CS505",
    name: "Data Structures Lab",
    credits: 2,
    type: "Lab",
    teacher: "Dr. Ramesh Kumar",
    attendance: 90,
    progress: 85,
    materials: [
      { id: "m11", name: "Lab Manual", type: "pdf", size: "3.5 MB" },
      { id: "m12", name: "Practice Problems Set", type: "pdf", size: "1.2 MB" },
    ],
  },
  {
    id: "6",
    code: "CS506",
    name: "Computer Networks Lab",
    credits: 2,
    type: "Lab",
    teacher: "Dr. Priya Sharma",
    attendance: 82,
    progress: 60,
    materials: [
      { id: "m13", name: "Lab Manual - Networking", type: "pdf", size: "2.8 MB" },
    ],
  },
];

const semesterProgress = {
  totalCredits: 19,
  completedTopics: 45,
  totalTopics: 62,
  cgpa: 8.5,
  sgpa: 8.7,
};

const timetable = [
  { day: "Monday", slots: ["CS501", "CS502", "-", "CS505", "-"] },
  { day: "Tuesday", slots: ["CS503", "CS504", "-", "CS506", "-"] },
  { day: "Wednesday", slots: ["CS501", "CS503", "-", "CS504", "-"] },
  { day: "Thursday", slots: ["CS502", "CS501", "-", "CS505", "-"] },
  { day: "Friday", slots: ["CS503", "CS504", "-", "CS506", "-"] },
  { day: "Saturday", slots: ["CS502", "-", "-", "-", "-"] },
];

const timeSlots = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "2:00-3:00", "3:00-4:00"];

export default function StudentAcademics() {
  const { user } = useUser();
  const tenantId = useTenantId() || '';
  const [selectedSemester, setSelectedSemester] = useState(currentSemester.toString());

  // Get student data for context
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  // Fetch CGPA - this is real data from the API (returns a number)
  const { data: cgpaData, isLoading: cgpaLoading } = useStudentCGPA(tenantId, studentId);

  // TODO: Replace with actual API hooks when available:
  // const { data: enrolledCourses } = useStudentCourses(tenantId, studentId, selectedSemester);
  // const { data: timetableData } = useStudentTimetable(tenantId, studentId, selectedSemester);
  // const { data: courseMaterials } = useCourseMaterials(tenantId, studentId);

  // Use real CGPA if available (API returns a single number for cgpa)
  const actualCgpa = cgpaData ?? semesterProgress.cgpa;
  // SGPA would need a separate endpoint or semester results call
  const actualSgpa = semesterProgress.sgpa;

  // Loading state
  if (studentLoading) {
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
                {sem === currentSemester && " (Current)"}
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
                <p className="text-2xl font-bold">{semesterProgress.totalCredits}</p>
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
                <p className="text-sm text-muted-foreground">Topics Covered</p>
                <p className="text-2xl font-bold">
                  {semesterProgress.completedTopics}/{semesterProgress.totalTopics}
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
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>Semester {selectedSemester} class schedule</CardDescription>
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
          {subjects.map((subject) => (
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
                        <Badge variant="secondary">{subject.materials.length} files</Badge>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {subject.materials.map((material) => (
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
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
