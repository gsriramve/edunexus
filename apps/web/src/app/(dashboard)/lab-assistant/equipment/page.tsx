"use client";

import { useState } from "react";
import {
  Monitor,
  Wrench,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Eye,
  AlertCircle,
  Settings,
  Cpu,
  Wifi,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useLabAssistantLabs,
  useLabEquipment,
  useEquipmentIssues,
  useMaintenanceHistory,
  useReportEquipmentIssue,
  type Equipment,
} from "@/hooks/use-lab-assistant";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export default function LabEquipment() {
  const tenantId = useTenantId() || '';
  const [selectedLab, setSelectedLab] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "working" | "under_repair" | "faulty">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ equipmentId: "", issue: "", priority: "medium" as "high" | "medium" | "low" });

  // API hooks
  const { data: labsData, isLoading: labsLoading } = useLabAssistantLabs(tenantId);
  const { data: equipmentData, isLoading: equipmentLoading, error: equipmentError } = useLabEquipment(tenantId, {
    labId: selectedLab !== "all" ? selectedLab : undefined,
    status: filterStatus,
    search: searchQuery || undefined,
  });
  const { data: issuesData, isLoading: issuesLoading } = useEquipmentIssues(tenantId, {
    labId: selectedLab !== "all" ? selectedLab : undefined,
  });
  const { data: maintenanceData, isLoading: maintenanceLoading } = useMaintenanceHistory(tenantId);
  const reportIssueMutation = useReportEquipmentIssue(tenantId);

  const isLoading = labsLoading || equipmentLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (equipmentError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load equipment data: {equipmentError.message}
        </AlertDescription>
      </Alert>
    );
  }

  const labs = labsData?.labs || [];
  const equipmentStats = equipmentData?.stats || { total: 0, working: 0, underRepair: 0, faulty: 0 };
  const equipmentList = equipmentData?.equipment || [];
  const issueReports = issuesData?.issues || [];
  const maintenanceHistory = maintenanceData?.records || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-500">Working</Badge>;
      case "under_repair":
        return <Badge className="bg-yellow-500">Under Repair</Badge>;
      case "faulty":
        return <Badge variant="destructive">Faulty</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getEquipmentIcon = (name: string) => {
    if (name.includes("Computer")) return <Monitor className="h-5 w-5" />;
    if (name.includes("Switch")) return <Wifi className="h-5 w-5" />;
    if (name.includes("Router")) return <Wifi className="h-5 w-5" />;
    if (name.includes("Projector")) return <Settings className="h-5 w-5" />;
    if (name.includes("Printer")) return <Printer className="h-5 w-5" />;
    return <Cpu className="h-5 w-5" />;
  };

  const handleSubmitIssue = async () => {
    if (!newIssue.equipmentId || !newIssue.issue) return;

    try {
      await reportIssueMutation.mutateAsync({
        equipmentId: newIssue.equipmentId,
        issue: newIssue.issue,
        priority: newIssue.priority,
      });
      setReportDialogOpen(false);
      setNewIssue({ equipmentId: "", issue: "", priority: "medium" });
    } catch (error) {
      console.error("Failed to report issue:", error);
    }
  };

  // Calculate lab-specific stats from equipment list
  const getLabStats = (labId: string) => {
    const labEquipment = equipmentList.filter((e) => e.labId === labId);
    return {
      working: labEquipment.filter((e) => e.status === "working").length,
      underRepair: labEquipment.filter((e) => e.status === "under_repair").length,
      faulty: labEquipment.filter((e) => e.status === "faulty").length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Equipment</h1>
          <p className="text-muted-foreground">
            Manage and monitor lab equipment status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Inventory
          </Button>
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Equipment Issue</DialogTitle>
                <DialogDescription>
                  Report a faulty or malfunctioning equipment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment</label>
                  <Select
                    value={newIssue.equipmentId}
                    onValueChange={(v) => setNewIssue({ ...newIssue, equipmentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentList.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.assetId} - {eq.name} ({eq.lab})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Issue Description</label>
                  <Textarea
                    placeholder="Describe the issue..."
                    value={newIssue.issue}
                    onChange={(e) => setNewIssue({ ...newIssue, issue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newIssue.priority}
                    onValueChange={(v) => setNewIssue({ ...newIssue, priority: v as "high" | "medium" | "low" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Affects lab sessions</SelectItem>
                      <SelectItem value="medium">Medium - Can be managed</SelectItem>
                      <SelectItem value="low">Low - Minor issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitIssue}
                  disabled={reportIssueMutation.isPending || !newIssue.equipmentId || !newIssue.issue}
                >
                  {reportIssueMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{equipmentStats.total}</p>
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
                <p className="text-sm text-muted-foreground">Working</p>
                <p className="text-2xl font-bold text-green-600">{equipmentStats.working}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Under Repair</p>
                <p className="text-2xl font-bold text-yellow-600">{equipmentStats.underRepair}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faulty</p>
                <p className="text-2xl font-bold text-red-600">{equipmentStats.faulty}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Equipment Inventory</TabsTrigger>
          <TabsTrigger value="issues">Reported Issues</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Equipment Inventory</CardTitle>
                  <CardDescription>All lab equipment and their status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search equipment..."
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedLab} onValueChange={setSelectedLab}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select Lab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Labs</SelectItem>
                      {labs.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id}>
                          {lab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="working">Working</SelectItem>
                      <SelectItem value="under_repair">Under Repair</SelectItem>
                      <SelectItem value="faulty">Faulty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {equipmentList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Lab</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Specs</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentList.map((eq) => (
                      <TableRow key={eq.id} className={eq.status === "faulty" ? "bg-red-50" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEquipmentIcon(eq.name)}
                            <span className="font-medium">{eq.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{eq.assetId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{eq.lab}</Badge>
                        </TableCell>
                        <TableCell>{eq.location}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {eq.specs || "-"}
                        </TableCell>
                        <TableCell>{eq.lastMaintenance || "Never"}</TableCell>
                        <TableCell>{getStatusBadge(eq.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {eq.status === "faulty" && (
                              <Button variant="ghost" size="sm">
                                <Wrench className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No equipment found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reported Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Reported Issues
              </CardTitle>
              <CardDescription>Equipment issues awaiting resolution</CardDescription>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : issueReports.length > 0 ? (
                <div className="space-y-4">
                  {issueReports.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-4 rounded-lg border ${
                        issue.priority === "high" ? "border-red-200 bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            {getEquipmentIcon(issue.equipment)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{issue.equipment}</span>
                              <Badge variant="outline" className="font-mono text-xs">
                                {issue.assetId}
                              </Badge>
                            </div>
                            <p className="text-sm">{issue.issue}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <span>{issue.lab}</span>
                              <span>•</span>
                              <span>Reported: {issue.reportedOn}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(issue.priority)}
                          <Button size="sm" variant="outline">
                            <Wrench className="h-4 w-4 mr-1" />
                            Request Repair
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No reported issues</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance History Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Past and ongoing maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <Skeleton className="h-[300px]" />
              ) : maintenanceHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Lab</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Reported Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-sm">{record.assetId}</TableCell>
                        <TableCell className="font-medium">{record.equipment}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.lab}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{record.issue}</TableCell>
                        <TableCell>{record.reportedDate}</TableCell>
                        <TableCell>{record.assignedTo || "-"}</TableCell>
                        <TableCell>
                          {record.status === "completed" ? (
                            <Badge className="bg-green-500">Completed</Badge>
                          ) : record.status === "in_progress" ? (
                            <Badge className="bg-yellow-500">In Progress</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.completedDate || record.estimatedCompletion || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No maintenance history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lab Overview */}
      {labs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {labs.map((lab) => {
            const labStats = getLabStats(lab.id);
            return (
              <Card key={lab.id}>
                <CardHeader>
                  <CardTitle>{lab.name}</CardTitle>
                  <CardDescription>{lab.room || lab.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-2xl font-bold text-green-600">
                        {labStats.working}
                      </p>
                      <p className="text-sm text-green-700">Working</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <p className="text-2xl font-bold text-yellow-600">
                        {labStats.underRepair}
                      </p>
                      <p className="text-sm text-yellow-700">Repair</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50">
                      <p className="text-2xl font-bold text-red-600">
                        {labStats.faulty}
                      </p>
                      <p className="text-sm text-red-700">Faulty</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
