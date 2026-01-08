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
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";

// Mock data - will be replaced with API calls
const mockExamsData = {
  stats: {
    totalExams: 24,
    upcoming: 8,
    ongoing: 2,
    completed: 14,
  },
  upcomingExams: [
    {
      id: "1",
      code: "CS301",
      name: "Data Structures & Algorithms",
      type: "Mid-Semester",
      date: "2026-01-20",
      time: "09:00 AM",
      duration: "2 hours",
      venue: "Hall A, B",
      students: 180,
      status: "scheduled",
    },
    {
      id: "2",
      code: "CS302",
      name: "Database Management Systems",
      type: "Mid-Semester",
      date: "2026-01-22",
      time: "09:00 AM",
      duration: "2 hours",
      venue: "Hall C, D",
      students: 180,
      status: "scheduled",
    },
    {
      id: "3",
      code: "CS401",
      name: "Machine Learning",
      type: "Internal",
      date: "2026-01-15",
      time: "02:00 PM",
      duration: "1.5 hours",
      venue: "Room 101",
      students: 80,
      status: "scheduled",
    },
  ],
  completedExams: [
    {
      id: "4",
      code: "CS301",
      name: "Data Structures & Algorithms",
      type: "Internal 1",
      date: "2025-12-10",
      avgMarks: 68,
      passPercentage: 85,
      students: 180,
    },
    {
      id: "5",
      code: "CS302",
      name: "Database Management Systems",
      type: "Internal 1",
      date: "2025-12-12",
      avgMarks: 72,
      passPercentage: 88,
      students: 180,
    },
  ],
  examTypes: ["Internal 1", "Internal 2", "Mid-Semester", "End-Semester", "Practical"],
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  ongoing: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  postponed: "bg-yellow-100 text-yellow-800",
};

export default function HodExamsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const tenantId = useTenantId();

  const isLoading = false;
  const data = mockExamsData;

  const filteredUpcoming = data.upcomingExams.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || exam.type === typeFilter;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-muted-foreground">
            Manage department examination schedules and results
          </p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)}>
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
              <span className="text-2xl font-bold">{data.stats.totalExams}</span>
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
                {data.stats.upcoming}
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
                {data.stats.ongoing}
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
                {data.stats.completed}
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
            {data.examTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
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
            Upcoming ({data.stats.upcoming})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed ({data.stats.completed})
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
                      <TableHead className="text-center">Students</TableHead>
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
                        <TableCell>{exam.venue}</TableCell>
                        <TableCell className="text-center">{exam.students}</TableCell>
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
                              <DropdownMenuItem>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                View Students
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Hall Ticket
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Avg. Marks</TableHead>
                    <TableHead className="text-center">Pass %</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.completedExams.map((exam) => (
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
                      <TableCell className="text-center">{exam.students}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{exam.avgMarks}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={exam.passPercentage >= 80 ? "default" : "secondary"}
                        >
                          {exam.passPercentage}%
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Exam Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Examination</DialogTitle>
            <DialogDescription>
              Set up a new examination for the department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs301">CS301 - Data Structures</SelectItem>
                  <SelectItem value="cs302">CS302 - Database Systems</SelectItem>
                  <SelectItem value="cs303">CS303 - Operating Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Exam Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {data.examTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase().replace(" ", "-")}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMarks">Max Marks</Label>
                <Input id="maxMarks" type="number" placeholder="100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" placeholder="e.g., Hall A, Room 101" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button>Schedule Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
