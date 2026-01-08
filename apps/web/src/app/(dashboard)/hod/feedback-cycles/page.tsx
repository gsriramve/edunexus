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
  AlertTriangle,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useFeedbackCycles,
  useCreateFeedbackCycle,
  useActivateFeedbackCycle,
  useCloseFeedbackCycle,
  useProcessFeedbackCycle,
  useFeedbackStats,
  type FeedbackCycle,
  type CreateFeedbackCycleInput,
  FeedbackCycleStatus,
} from "@/hooks/use-feedback";

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

export default function FeedbackCyclesPage() {
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

  const { data: cyclesData, isLoading, refetch } = useFeedbackCycles(tenantId || "");
  const { data: stats } = useFeedbackStats(tenantId || "");
  const createCycle = useCreateFeedbackCycle(tenantId || "");
  const activateCycle = useActivateFeedbackCycle(tenantId || "");
  const closeCycle = useCloseFeedbackCycle(tenantId || "");
  const processCycle = useProcessFeedbackCycle(tenantId || "");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Cycles</h1>
          <p className="text-muted-foreground">
            Manage 360-degree feedback collection cycles
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Cycle
        </Button>
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
                {stats?.activeCycles || cycles.filter((c) => c.status === "active").length}
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats?.completedFeedback || 0}
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cycles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cycles</CardTitle>
          <CardDescription>
            {cycles.length} feedback cycles
          </CardDescription>
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
                        <p className="font-medium">
                          {cycle._count?.feedbackEntries || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">entries</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {cycle.enablePeerFeedback && (
                          <Badge variant="outline" className="text-xs">
                            Peer
                          </Badge>
                        )}
                        {cycle.enableSelfAssessment && (
                          <Badge variant="outline" className="text-xs">
                            Self
                          </Badge>
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
                Create your first feedback cycle to start collecting feedback
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Cycle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Cycle Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Feedback Cycle</DialogTitle>
            <DialogDescription>
              Set up a new 360-degree feedback collection cycle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cycle Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, month: parseInt(e.target.value) })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
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
