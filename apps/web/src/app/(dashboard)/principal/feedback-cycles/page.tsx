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
import { Switch } from "@/components/ui/switch";
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
  MessageSquare,
  Plus,
  MoreVertical,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Building2,
  TrendingUp,
  Download,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useFeedbackCycles,
  useCreateFeedbackCycle,
  useActivateFeedbackCycle,
  useCloseFeedbackCycle,
  useProcessFeedbackCycle,
  useFeedbackStats,
  useFeedbackDashboard,
  type FeedbackCycle,
  type CreateFeedbackCycleInput,
} from "@/hooks/use-feedback";
import { useDepartments } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  closed: "bg-yellow-100 text-yellow-800",
  processed: "bg-blue-100 text-blue-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  active: <Play className="h-4 w-4" />,
  closed: <Pause className="h-4 w-4" />,
  processed: <CheckCircle2 className="h-4 w-4" />,
};

export default function PrincipalFeedbackCyclesPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateFeedbackCycleInput>>({
    name: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    enablePeerFeedback: true,
    enableSelfAssessment: true,
    anonymousPeerFeedback: true,
  });

  const tenantId = useTenantId();

  const { data: cyclesData, isLoading: cyclesLoading, refetch } = useFeedbackCycles(tenantId || "");
  const { data: stats, isLoading: statsLoading } = useFeedbackStats(tenantId || "");
  const { data: dashboard, isLoading: dashboardLoading } = useFeedbackDashboard(tenantId || "");
  const { data: departments } = useDepartments(tenantId || "");

  const createCycle = useCreateFeedbackCycle(tenantId || "");
  const activateCycle = useActivateFeedbackCycle(tenantId || "");
  const closeCycle = useCloseFeedbackCycle(tenantId || "");
  const processCycle = useProcessFeedbackCycle(tenantId || "");

  const isLoading = cyclesLoading || statsLoading || dashboardLoading;
  const cycles = cyclesData?.data || [];

  const handleCreate = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    createCycle.mutate(formData as CreateFeedbackCycleInput, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({
          name: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          startDate: "",
          endDate: "",
          enablePeerFeedback: true,
          enableSelfAssessment: true,
          anonymousPeerFeedback: true,
        });
        refetch();
      },
    });
  };

  const handleActivate = (cycleId: string) => {
    activateCycle.mutate(cycleId, { onSuccess: () => refetch() });
  };

  const handleClose = (cycleId: string) => {
    closeCycle.mutate(cycleId, { onSuccess: () => refetch() });
  };

  const handleProcess = (cycleId: string) => {
    processCycle.mutate(
      { cycleId, generateSummaries: true, calculateNormalization: true },
      { onSuccess: () => refetch() }
    );
  };

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

  const activeCycles = cycles.filter((c: FeedbackCycle) => c.status === "active").length;
  const completionRate = stats?.totalFeedbackEntries && stats?.pendingFeedback
    ? Math.round(((stats.totalFeedbackEntries - stats.pendingFeedback) / stats.totalFeedbackEntries) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Cycles</h1>
          <p className="text-muted-foreground">
            Manage institution-wide 360-degree feedback collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Cycle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {activeCycles}
              </span>
              <Play className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {stats?.totalFeedbackEntries || 0}
              </span>
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {completionRate}%
              </span>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                {stats?.pendingFeedback || 0}
              </span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cycles">
            <Calendar className="h-4 w-4 mr-2" />
            All Cycles
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Building2 className="h-4 w-4 mr-2" />
            By Department
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Active Cycle Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Active Cycle Progress</CardTitle>
                <CardDescription>Current feedback collection status</CardDescription>
              </CardHeader>
              <CardContent>
                {cycles.filter((c: FeedbackCycle) => c.status === "active").length > 0 ? (
                  <div className="space-y-4">
                    {cycles
                      .filter((c: FeedbackCycle) => c.status === "active")
                      .map((cycle: FeedbackCycle) => (
                        <div key={cycle.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{cycle.name}</h4>
                            <Badge className={statusColors.active}>Active</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {cycle._count?.feedbackEntries || 0} entries
                              </span>
                            </div>
                            <Progress value={65} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(cycle.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No active cycles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback by Evaluator Type */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Evaluator Type</CardTitle>
                <CardDescription>Distribution of feedback sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Faculty", count: 450, color: "bg-blue-500" },
                    { type: "Mentor", count: 320, color: "bg-green-500" },
                    { type: "Peer", count: 890, color: "bg-purple-500" },
                    { type: "Self", count: 500, color: "bg-orange-500" },
                  ].map((item) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.type}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${(item.count / 900) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Rate by Department */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Department Response Rates</CardTitle>
                <CardDescription>Feedback completion by department</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Faculty</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-center">Response Rate</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Computer Science", faculty: 25, students: 180, rate: 85 },
                      { name: "Electronics", faculty: 20, students: 150, rate: 72 },
                      { name: "Mechanical", faculty: 18, students: 120, rate: 68 },
                      { name: "Civil", faculty: 15, students: 100, rate: 78 },
                      { name: "Electrical", faculty: 12, students: 90, rate: 65 },
                    ].map((dept) => (
                      <TableRow key={dept.name}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell className="text-center">{dept.faculty}</TableCell>
                        <TableCell className="text-center">{dept.students}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <Progress value={dept.rate} className="h-2 w-20" />
                            <span className="text-sm font-medium">{dept.rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {dept.rate >= 75 ? (
                            <Badge variant="default">On Track</Badge>
                          ) : (
                            <Badge variant="secondary">Needs Attention</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Cycles Tab */}
        <TabsContent value="cycles">
          <Card>
            <CardHeader>
              <CardTitle>All Feedback Cycles</CardTitle>
              <CardDescription>{cycles.length} cycles total</CardDescription>
            </CardHeader>
            <CardContent>
              {cycles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cycle Name</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Entries</TableHead>
                      <TableHead className="text-center">Settings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cycles.map((cycle: FeedbackCycle) => (
                      <TableRow key={cycle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cycle.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(2000, cycle.month - 1).toLocaleString("default", { month: "long" })} {cycle.year}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(cycle.startDate).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                              to {new Date(cycle.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusColors[cycle.status]}>
                            <span className="mr-1">{statusIcons[cycle.status]}</span>
                            {cycle.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <p className="font-medium">{cycle._count?.feedbackEntries || 0}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            {cycle.enablePeerFeedback && (
                              <Badge variant="outline" className="text-xs">Peer</Badge>
                            )}
                            {cycle.enableSelfAssessment && (
                              <Badge variant="outline" className="text-xs">Self</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {cycle.status === "draft" && (
                                <DropdownMenuItem onClick={() => handleActivate(cycle.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {cycle.status === "active" && (
                                <DropdownMenuItem onClick={() => handleClose(cycle.id)}>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Close
                                </DropdownMenuItem>
                              )}
                              {cycle.status === "closed" && (
                                <DropdownMenuItem onClick={() => handleProcess(cycle.id)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Process Results
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                View Entries
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Report
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
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No Feedback Cycles</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first cycle to start collecting feedback
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Cycle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Department Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Feedback Summary</CardTitle>
              <CardDescription>Feedback statistics per department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Computer Science", code: "CSE", faculty: 25, students: 180, avgScore: 4.2, entries: 450 },
                  { name: "Electronics", code: "ECE", faculty: 20, students: 150, avgScore: 3.9, entries: 320 },
                  { name: "Mechanical", code: "MECH", faculty: 18, students: 120, avgScore: 3.7, entries: 280 },
                  { name: "Civil", code: "CIVIL", faculty: 15, students: 100, avgScore: 4.0, entries: 220 },
                  { name: "Electrical", code: "EEE", faculty: 12, students: 90, avgScore: 3.8, entries: 180 },
                ].map((dept) => (
                  <Card key={dept.code}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{dept.name}</CardTitle>
                        <Badge variant="outline">{dept.code}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Faculty</span>
                          <span className="font-medium">{dept.faculty}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Students</span>
                          <span className="font-medium">{dept.students}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Feedback Entries</span>
                          <span className="font-medium">{dept.entries}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Score</span>
                          <Badge variant={dept.avgScore >= 4 ? "default" : "secondary"}>
                            {dept.avgScore.toFixed(1)} / 5
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Cycle Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Feedback Cycle</DialogTitle>
            <DialogDescription>
              Set up a new institution-wide feedback collection cycle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cycle Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., January 2026 Feedback"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={2024}
                  max={2030}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Peer Feedback</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow students to give feedback to peers
                  </p>
                </div>
                <Switch
                  checked={formData.enablePeerFeedback}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enablePeerFeedback: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Self Assessment</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow students to self-assess
                  </p>
                </div>
                <Switch
                  checked={formData.enableSelfAssessment}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enableSelfAssessment: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymous Peer Feedback</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep peer feedback anonymous
                  </p>
                </div>
                <Switch
                  checked={formData.anonymousPeerFeedback}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, anonymousPeerFeedback: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createCycle.isPending || !formData.name}
            >
              {createCycle.isPending ? "Creating..." : "Create Cycle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
