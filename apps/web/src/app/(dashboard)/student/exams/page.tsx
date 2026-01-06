"use client";

import { useState } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const examStats = {
  cgpa: 8.5,
  sgpa: 8.7,
  totalCredits: 95,
  earnedCredits: 95,
  rank: 12,
  totalStudents: 120,
};

const upcomingExams = [
  {
    id: "exam-001",
    subject: "Data Structures & Algorithms",
    code: "CS501",
    type: "Mid Semester",
    date: "2026-01-15",
    time: "10:00 AM - 12:00 PM",
    venue: "Exam Hall A",
    totalMarks: 50,
  },
  {
    id: "exam-002",
    subject: "Computer Networks",
    code: "CS502",
    type: "Mid Semester",
    date: "2026-01-17",
    time: "10:00 AM - 12:00 PM",
    venue: "Exam Hall B",
    totalMarks: 50,
  },
  {
    id: "exam-003",
    subject: "Operating Systems",
    code: "CS503",
    type: "Mid Semester",
    date: "2026-01-19",
    time: "10:00 AM - 12:00 PM",
    venue: "Exam Hall A",
    totalMarks: 50,
  },
  {
    id: "exam-004",
    subject: "Software Engineering",
    code: "CS504",
    type: "Mid Semester",
    date: "2026-01-21",
    time: "2:00 PM - 4:00 PM",
    venue: "Exam Hall C",
    totalMarks: 50,
  },
];

const semesterResults = [
  {
    semester: 4,
    sgpa: 8.5,
    credits: 20,
    year: "2024-25",
    subjects: [
      { code: "CS401", name: "Database Systems", credits: 4, grade: "A", marks: 85, total: 100 },
      { code: "CS402", name: "Theory of Computation", credits: 4, grade: "A+", marks: 92, total: 100 },
      { code: "CS403", name: "Computer Architecture", credits: 4, grade: "A", marks: 82, total: 100 },
      { code: "CS404", name: "Discrete Mathematics", credits: 3, grade: "B+", marks: 75, total: 100 },
      { code: "CS405", name: "Database Lab", credits: 2, grade: "A+", marks: 95, total: 100 },
      { code: "CS406", name: "Web Development Lab", credits: 2, grade: "A", marks: 88, total: 100 },
      { code: "HS401", name: "Professional Ethics", credits: 1, grade: "A", marks: 85, total: 100 },
    ],
  },
  {
    semester: 3,
    sgpa: 8.3,
    credits: 22,
    year: "2024-25",
    subjects: [
      { code: "CS301", name: "Object Oriented Programming", credits: 4, grade: "A", marks: 84, total: 100 },
      { code: "CS302", name: "Data Structures", credits: 4, grade: "A+", marks: 90, total: 100 },
      { code: "CS303", name: "Digital Logic Design", credits: 4, grade: "B+", marks: 78, total: 100 },
      { code: "CS304", name: "Computer Organization", credits: 4, grade: "A", marks: 82, total: 100 },
      { code: "CS305", name: "OOP Lab", credits: 2, grade: "A+", marks: 92, total: 100 },
      { code: "CS306", name: "Data Structures Lab", credits: 2, grade: "A+", marks: 94, total: 100 },
      { code: "MA301", name: "Probability & Statistics", credits: 2, grade: "A", marks: 80, total: 100 },
    ],
  },
];

const gradePoints: Record<string, number> = {
  "A+": 10,
  A: 9,
  "B+": 8,
  B: 7,
  "C+": 6,
  C: 5,
  D: 4,
  F: 0,
};

const aiPredictions = [
  { subject: "Data Structures", predicted: 82, confidence: "High", improvement: "+5% from last" },
  { subject: "Computer Networks", predicted: 75, confidence: "Medium", improvement: "Focus needed" },
  { subject: "Operating Systems", predicted: 88, confidence: "High", improvement: "+8% from last" },
  { subject: "Software Engineering", predicted: 80, confidence: "High", improvement: "On track" },
];

export default function StudentExams() {
  const [selectedSemester, setSelectedSemester] = useState("4");

  const getGradeBadge = (grade: string) => {
    const colorMap: Record<string, string> = {
      "A+": "bg-green-500",
      A: "bg-green-400",
      "B+": "bg-blue-500",
      B: "bg-blue-400",
      "C+": "bg-yellow-500",
      C: "bg-yellow-400",
      D: "bg-orange-500",
      F: "bg-red-500",
    };
    return <Badge className={colorMap[grade] || "bg-gray-500"}>{grade}</Badge>;
  };

  const daysUntilExam = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams & Results</h1>
          <p className="text-muted-foreground">
            View exam schedules, results, and AI predictions
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Marksheet
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="text-2xl font-bold">{examStats.cgpa}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest SGPA</p>
                <p className="text-2xl font-bold">{examStats.sgpa}</p>
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
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold">{examStats.earnedCredits}/{examStats.totalCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class Rank</p>
                <p className="text-2xl font-bold">{examStats.rank}/{examStats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                <p className="text-2xl font-bold">{upcomingExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>

        {/* Upcoming Exams Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingExams.map((exam) => {
              const daysLeft = daysUntilExam(exam.date);
              return (
                <Card key={exam.id} className={daysLeft <= 3 ? "border-red-200" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2 font-mono">
                          {exam.code}
                        </Badge>
                        <h3 className="font-semibold">{exam.subject}</h3>
                        <p className="text-sm text-muted-foreground">{exam.type}</p>
                      </div>
                      <Badge
                        className={
                          daysLeft <= 3
                            ? "bg-red-500"
                            : daysLeft <= 7
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }
                      >
                        {daysLeft} days left
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(exam.date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Total Marks: {exam.totalMarks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Exam Alert */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-orange-800">Exam Preparation Tips</h3>
                  <ul className="text-sm text-orange-700 mt-2 space-y-1">
                    <li>• Carry your hall ticket and college ID card</li>
                    <li>• Report to the exam hall 30 minutes before the exam</li>
                    <li>• Electronic devices are not allowed in the exam hall</li>
                    <li>• Use only blue/black pen for writing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Semester Results</h3>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {semesterResults
            .filter((r) => r.semester.toString() === selectedSemester)
            .map((result) => (
              <Card key={result.semester}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Semester {result.semester} Results</CardTitle>
                      <CardDescription>Academic Year {result.year}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">SGPA</p>
                      <p className="text-3xl font-bold text-primary">{result.sgpa}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Credits</TableHead>
                        <TableHead className="text-center">Marks</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Grade Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.subjects.map((subject) => (
                        <TableRow key={subject.code}>
                          <TableCell className="font-mono">{subject.code}</TableCell>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell className="text-center">{subject.credits}</TableCell>
                          <TableCell className="text-center">
                            {subject.marks}/{subject.total}
                          </TableCell>
                          <TableCell className="text-center">
                            {getGradeBadge(subject.grade)}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {gradePoints[subject.grade]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Total Credits: </span>
                      <span className="font-bold">{result.credits}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                AI Score Predictions
              </CardTitle>
              <CardDescription>
                Predicted scores for upcoming mid-semester exams based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {aiPredictions.map((prediction, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{prediction.subject}</span>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className={
                            prediction.confidence === "High"
                              ? "border-green-500 text-green-600"
                              : "border-yellow-500 text-yellow-600"
                          }
                        >
                          {prediction.confidence} confidence
                        </Badge>
                        <span className="text-2xl font-bold">{prediction.predicted}/100</span>
                      </div>
                    </div>
                    <Progress value={prediction.predicted} className="h-3" />
                    <p className="text-sm text-muted-foreground">{prediction.improvement}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">AI Recommendations</h4>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5" />
                    Focus on Computer Networks - Practice more networking protocols questions
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5" />
                    Your Operating Systems concepts are strong - maintain consistency
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5" />
                    Take 2-3 mock tests before exams to improve time management
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-blue-800">Practice Zone</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Take AI-generated practice tests to improve your predicted scores
                  </p>
                  <Button className="mt-4" variant="outline">
                    Start Practice Test
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
