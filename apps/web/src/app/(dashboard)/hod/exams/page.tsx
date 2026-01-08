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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  BarChart3,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useHodExams,
  useScheduleExam,
  useUpdateExam,
  useUpdateExamStatus,
  useDeleteExam,
  type ScheduleExamInput,
  type ExamDto,
} from "@/hooks/use-hod-exams";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  ongoing: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  postponed: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

const examTypeValues = [
  { value: "internal_1", label: "Internal 1" },
  { value: "internal_2", label: "Internal 2" },
  { value: "mid_semester", label: "Mid-Semester" },
  { value: "end_semester", label: "End-Semester" },
  { value: "practical", label: "Practical" },
  { value: "assignment", label: "Assignment" },
  { value: "quiz", label: "Quiz" },
];

export default function HodExamsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamDto | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleExamInput>>({
    subjectId: "",
    type: "internal_1",
    name: "",
    date: "",
    startTime: "09:00",
    durationMinutes: 120,
    maxMarks: 100,
    passingMarks: 40,
    venue: "",
    instructions: "",
    isPublished: true,
  });

  const tenantId = useTenantId() || "";

  // Queries
  const { data, isLoading, error } = useHodExams(tenantId, {
    search: searchQuery || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  // Mutations
  const scheduleExam = useScheduleExam(tenantId);
  const updateExam = useUpdateExam(tenantId);
  const updateExamStatus = useUpdateExamStatus(tenantId);
  const deleteExam = useDeleteExam(tenantId);

  const handleScheduleExam = async () => {
    if (!formData.subjectId || !formData.name || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingExam) {
        await updateExam.mutateAsync({
          examId: editingExam.id,
          data: {
            name: formData.name,
            date: formData.date,
            startTime: formData.startTime,
            durationMinutes: formData.durationMinutes,
            maxMarks: formData.maxMarks,
            passingMarks: formData.passingMarks,
            venue: formData.venue,
            instructions: formData.instructions,
            isPublished: formData.isPublished,
          },
        });
        toast.success("Exam updated successfully");
      } else {
        await scheduleExam.mutateAsync(formData as ScheduleExamInput);
        toast.success("Exam scheduled successfully");
      }
      setShowScheduleDialog(false);
      setEditingExam(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save exam");
    }
  };

  const handleUpdateStatus = async (examId: string, status: string) => {
    try {
      await updateExamStatus.mutateAsync({ examId, data: { status } });
      toast.success(`Exam ${status} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update exam status");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      await deleteExam.mutateAsync(examId);
      toast.success("Exam deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete exam");
    }
  };

  const resetForm = () => {
    setFormData({
      subjectId: data?.subjects?.[0]?.id || "",
      type: "internal_1",
      name: "",
      date: "",
      startTime: "09:00",
      durationMinutes: 120,
      maxMarks: 100,
      passingMarks: 40,
      venue: "",
      instructions: "",
      isPublished: true,
    });
  };

  const openEditDialog = (exam: ExamDto) => {
    setEditingExam(exam);
    setFormData({
      subjectId: "", // Can't change subject when editing
      type: exam.typeValue,
      name: exam.examName,
      date: new Date(exam.date).toISOString().split("T")[0],
      startTime: exam.time,
      durationMinutes: exam.durationMinutes,
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks,
      venue: exam.venue || "",
      instructions: exam.instructions || "",
      isPublished: exam.isPublished,
    });
    setShowScheduleDialog(true);
  };

  const filteredUpcoming = (data?.upcomingExams || []).filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || exam.typeValue === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredCompleted = (data?.completedExams || []).filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || exam.typeValue === typeFilter;
    return matchesSearch && matchesType;
  });

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
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">Failed to load exams</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const stats = data?.stats || {
    totalExams: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-muted-foreground">
            {data?.department ? `${data.department.name} - ` : ""}Manage department examination schedules and results
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setEditingExam(null);
          setShowScheduleDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.totalExams}</span>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {stats.upcoming}
              </span>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ongoing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats.ongoing}
              </span>
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-600">
                {stats.completed}
              </span>
              <CheckCircle2 className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Exam Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {examTypeValues.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming ({stats.upcoming + stats.ongoing})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Exams Tab */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Examinations</CardTitle>
              <CardDescription>
                Scheduled exams for the department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUpcoming.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead className="text-center">Max Marks</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUpcoming.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {exam.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{new Date(exam.date).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {exam.time}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{exam.duration}</TableCell>
                        <TableCell>{exam.venue || "-"}</TableCell>
                        <TableCell className="text-center">{exam.maxMarks}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusColors[exam.status]}>
                            {exam.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(exam)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Schedule
                              </DropdownMenuItem>
                              {exam.status === "scheduled" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(exam.id, "ongoing")}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Ongoing
                                </DropdownMenuItem>
                              )}
                              {exam.status === "ongoing" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(exam.id, "completed")}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleUpdateStatus(exam.id, "postponed")}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Postpone
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleUpdateStatus(exam.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                              {(exam.status === "draft" || exam.status === "cancelled") && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteExam(exam.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No Upcoming Exams</h3>
                  <p className="text-muted-foreground">
                    Schedule an exam to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Exams Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Examinations</CardTitle>
              <CardDescription>
                Results and performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCompleted.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Max Marks</TableHead>
                      <TableHead className="text-center">Avg. Marks</TableHead>
                      <TableHead className="text-center">Pass %</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompleted.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {exam.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(exam.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">{exam.maxMarks}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{exam.avgMarks || "-"}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {exam.passPercentage ? (
                            <Badge
                              variant={exam.passPercentage >= 80 ? "default" : "secondary"}
                            >
                              {exam.passPercentage}%
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Results
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No Completed Exams</h3>
                  <p className="text-muted-foreground">
                    Completed exams will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Exam Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={(open) => {
        if (!open) {
          setShowScheduleDialog(false);
          setEditingExam(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit Examination" : "Schedule Examination"}</DialogTitle>
            <DialogDescription>
              {editingExam ? "Update examination details" : "Set up a new examination for the department"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingExam && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name} (Sem {subject.semester})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Exam Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  disabled={!!editingExam}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypeValues.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Exam Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mid-Semester Exam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (mins)</Label>
                <Select
                  value={formData.durationMinutes?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, durationMinutes: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 mins</SelectItem>
                    <SelectItem value="90">90 mins</SelectItem>
                    <SelectItem value="120">120 mins</SelectItem>
                    <SelectItem value="180">180 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMarks">Max Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingMarks">Passing</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 40 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="e.g., Hall A, Room 101"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Any special instructions for the exam..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowScheduleDialog(false);
              setEditingExam(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleExam}
              disabled={scheduleExam.isPending || updateExam.isPending}
            >
              {(scheduleExam.isPending || updateExam.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingExam ? "Update Exam" : "Schedule Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
