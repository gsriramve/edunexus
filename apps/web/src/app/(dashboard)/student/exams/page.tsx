"use client";

import { useState, useEffect } from "react";
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
  Loader2,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useUpcomingExams,
  useSemesterResults,
  useStudentCGPA,
  useExamResultsByStudent,
  useExamPredictions,
} from "@/hooks/use-api";
import type { Exam, SemesterResult, ExamPrediction } from "@/lib/api";

// Grade points mapping
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

// Helper to get student ID from localStorage (for development)
function getStudentId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("edunexus_student_id");
  }
  return null;
}

export default function StudentExams() {
  const tenantId = useTenantId();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState("4");

  // Get student ID from localStorage on mount
  useEffect(() => {
    const id = getStudentId();
    setStudentId(id);
  }, []);

  // API hooks
  const {
    data: upcomingExamsData,
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingExams(tenantId || "");

  const {
    data: semesterResultData,
    isLoading: semesterLoading,
    error: semesterError,
  } = useSemesterResults(tenantId || "", studentId || "", parseInt(selectedSemester));

  const {
    data: cgpa,
    isLoading: cgpaLoading,
  } = useStudentCGPA(tenantId || "", studentId || "");

  const {
    data: allResultsData,
    isLoading: allResultsLoading,
  } = useExamResultsByStudent(tenantId || "", studentId || "");

  const {
    data: predictionsData,
    isLoading: predictionsLoading,
  } = useExamPredictions(tenantId || "", studentId || "");

  // Transform API data
  const upcomingExams = upcomingExamsData || [];
  const semesterResult = semesterResultData;
  const studentCGPA = typeof cgpa === "number" ? cgpa : 0;

  // Calculate stats from results
  const totalCredits = semesterResult?.credits || 0;
  const latestSGPA = semesterResult?.sgpa || 0;

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

  const formatExamType = (type: string) => {
    const typeMap: Record<string, string> = {
      internal: "Internal",
      midterm: "Mid Semester",
      endsem: "End Semester",
      practical: "Practical",
      assignment: "Assignment",
      lab: "Lab Exam",
      viva: "Viva",
    };
    return typeMap[type] || type;
  };

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // No tenant/student message
  if (!tenantId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">
          Please select a tenant to view exam data.
        </p>
        <p className="text-sm text-muted-foreground">
          Add <code className="bg-muted px-2 py-1 rounded">?tenantId=your-tenant-id</code> to the URL
        </p>
      </div>
    );
  }

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
      {cgpaLoading || semesterLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="text-2xl font-bold">{studentCGPA.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold">{latestSGPA.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold">{totalCredits}</p>
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
                  <p className="text-sm text-muted-foreground">Exams Taken</p>
                  <p className="text-2xl font-bold">{allResultsData?.results?.length || 0}</p>
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
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>

        {/* Upcoming Exams Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingExams.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Upcoming Exams</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have any exams scheduled in the next 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingExams.map((exam: Exam) => {
                const daysLeft = daysUntilExam(exam.date);
                return (
                  <Card key={exam.id} className={daysLeft <= 3 ? "border-red-200" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge variant="outline" className="mb-2 font-mono">
                            {exam.subject?.code || "N/A"}
                          </Badge>
                          <h3 className="font-semibold">{exam.subject?.name || exam.name}</h3>
                          <p className="text-sm text-muted-foreground">{formatExamType(exam.type)}</p>
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
                        {exam.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.duration} minutes</span>
                          </div>
                        )}
                        {exam.venue && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{exam.venue}</span>
                          </div>
                        )}
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
          )}

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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {semesterLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !semesterResult || semesterResult.subjects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Results Found</h3>
                  <p className="text-muted-foreground">
                    No results available for Semester {selectedSemester}.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Semester {semesterResult.semester} Results</CardTitle>
                    <CardDescription>Academic Performance</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">SGPA</p>
                    <p className="text-3xl font-bold text-primary">{semesterResult.sgpa.toFixed(2)}</p>
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
                    {semesterResult.subjects.map((subject) => (
                      <TableRow key={subject.subjectId}>
                        <TableCell className="font-mono">{subject.subjectCode}</TableCell>
                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                        <TableCell className="text-center">{subject.credits}</TableCell>
                        <TableCell className="text-center">
                          {subject.obtainedMarks}/{subject.totalMarks}
                        </TableCell>
                        <TableCell className="text-center">
                          {getGradeBadge(subject.grade)}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {gradePoints[subject.grade] || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Credits: </span>
                    <span className="font-bold">{semesterResult.credits}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          {predictionsLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !predictionsData || predictionsData.predictions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No Predictions Available</h3>
                  <p className="text-muted-foreground">
                    Complete some exams to get AI-powered score predictions.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    AI Score Predictions
                  </CardTitle>
                  <CardDescription>
                    Predicted scores for upcoming exams based on your performance history
                    {predictionsData.overallPredictedAverage > 0 && (
                      <span className="ml-2 font-medium">
                        (Overall predicted average: {predictionsData.overallPredictedAverage}%)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {predictionsData.predictions.map((prediction: ExamPrediction) => (
                      <div key={prediction.subjectId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{prediction.subject}</span>
                            <Badge variant="outline" className="ml-2 text-xs font-mono">
                              {prediction.subjectCode}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              variant="outline"
                              className={
                                prediction.confidence === "High"
                                  ? "border-green-500 text-green-600"
                                  : prediction.confidence === "Medium"
                                  ? "border-yellow-500 text-yellow-600"
                                  : "border-gray-500 text-gray-600"
                              }
                            >
                              {prediction.confidence} confidence
                            </Badge>
                            <span className="text-2xl font-bold">{prediction.predicted}/100</span>
                          </div>
                        </div>
                        <Progress value={prediction.predicted} className="h-3" />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{prediction.improvement}</span>
                          {prediction.historyCount > 0 && (
                            <span className="text-xs">Based on {prediction.historyCount} past exam(s)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {predictionsData.recommendations.length > 0 && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">AI Recommendations</h4>
                      <ul className="text-sm text-purple-700 space-y-2">
                        {predictionsData.recommendations.map((recommendation: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
