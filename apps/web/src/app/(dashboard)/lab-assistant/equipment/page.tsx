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
  Edit,
  Settings,
  Cpu,
  HardDrive,
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
import { useTenantId } from "@/hooks/use-tenant";

// TODO: Replace mock data with API calls when backend endpoints are implemented
// Required endpoints:
// - GET /lab-assistant/labs - Labs assigned to this assistant
// - GET /lab-assistant/equipment?labId=X - Equipment inventory by lab
// - GET /lab-assistant/equipment/stats - Equipment status statistics
// - POST /lab-assistant/equipment/issues - Report new equipment issue
// - GET /lab-assistant/equipment/issues - List reported issues
// - GET /lab-assistant/equipment/maintenance - Maintenance history
// - PUT /lab-assistant/equipment/:id/status - Update equipment status

// Mock data
const labs = [
  { id: "lab-1", name: "Computer Networks Lab", code: "CN-LAB", room: "Lab 201" },
  { id: "lab-2", name: "Data Structures Lab", code: "DS-LAB", room: "Lab 202" },
];

const equipmentStats = {
  total: 75,
  working: 68,
  underRepair: 4,
  faulty: 3,
};

const equipmentList = [
  { id: "eq-1", name: "Desktop Computer", assetId: "CSE-PC-001", lab: "CN Lab", location: "System 1", status: "working", lastMaintenance: "Dec 15, 2025", specs: "Intel i5, 8GB RAM, 256GB SSD" },
  { id: "eq-2", name: "Desktop Computer", assetId: "CSE-PC-002", lab: "CN Lab", location: "System 2", status: "working", lastMaintenance: "Dec 15, 2025", specs: "Intel i5, 8GB RAM, 256GB SSD" },
  { id: "eq-3", name: "Desktop Computer", assetId: "CSE-PC-003", lab: "CN Lab", location: "System 3", status: "faulty", lastMaintenance: "Nov 20, 2025", specs: "Intel i5, 8GB RAM, 256GB SSD", issue: "Network card not working" },
  { id: "eq-4", name: "Desktop Computer", assetId: "CSE-PC-015", lab: "CN Lab", location: "System 15", status: "under_repair", lastMaintenance: "Dec 10, 2025", specs: "Intel i5, 8GB RAM, 256GB SSD", issue: "Hard disk failure" },
  { id: "eq-5", name: "Network Switch", assetId: "CSE-SW-001", lab: "CN Lab", location: "Server Rack", status: "working", lastMaintenance: "Dec 1, 2025", specs: "Cisco 24-port Gigabit" },
  { id: "eq-6", name: "Router", assetId: "CSE-RT-001", lab: "CN Lab", location: "Server Rack", status: "working", lastMaintenance: "Dec 1, 2025", specs: "Cisco 2900 Series" },
  { id: "eq-7", name: "Router", assetId: "CSE-RT-002", lab: "CN Lab", location: "Demo Table", status: "faulty", lastMaintenance: "Nov 15, 2025", specs: "Cisco 1900 Series", issue: "Intermittent connectivity" },
  { id: "eq-8", name: "Desktop Computer", assetId: "CSE-PC-031", lab: "DS Lab", location: "System 1", status: "working", lastMaintenance: "Dec 15, 2025", specs: "Intel i5, 8GB RAM, 256GB SSD" },
  { id: "eq-9", name: "Desktop Computer", assetId: "CSE-PC-038", lab: "DS Lab", location: "System 8", status: "under_repair", lastMaintenance: "Dec 5, 2025", specs: "Intel i5, 8GB RAM, 256GB SSD", issue: "Monitor display issue" },
  { id: "eq-10", name: "Projector", assetId: "CSE-PJ-001", lab: "DS Lab", location: "Ceiling Mount", status: "working", lastMaintenance: "Nov 25, 2025", specs: "Epson 3500 Lumens" },
];

const maintenanceHistory = [
  { id: 1, assetId: "CSE-PC-015", equipment: "Desktop Computer", lab: "CN Lab", issue: "Hard disk failure", reportedDate: "Jan 5, 2026", status: "in_progress", assignedTo: "IT Support Team", estimatedCompletion: "Jan 8, 2026" },
  { id: 2, assetId: "CSE-PC-038", equipment: "Desktop Computer", lab: "DS Lab", issue: "Monitor display issue", reportedDate: "Jan 4, 2026", status: "in_progress", assignedTo: "IT Support Team", estimatedCompletion: "Jan 7, 2026" },
  { id: 3, assetId: "CSE-PC-022", equipment: "Desktop Computer", lab: "CN Lab", issue: "Keyboard not working", reportedDate: "Dec 28, 2025", status: "completed", assignedTo: "IT Support Team", completedDate: "Dec 30, 2025" },
  { id: 4, assetId: "CSE-SW-002", equipment: "Network Switch", lab: "CN Lab", issue: "Port 12 not working", reportedDate: "Dec 20, 2025", status: "completed", assignedTo: "Network Admin", completedDate: "Dec 22, 2025" },
];

const issueReports = [
  { id: 1, assetId: "CSE-PC-003", equipment: "Desktop Computer", lab: "CN Lab", issue: "Network card not working", priority: "high", reportedOn: "Jan 5, 2026", status: "pending" },
  { id: 2, assetId: "CSE-RT-002", equipment: "Router", lab: "CN Lab", issue: "Intermittent connectivity", priority: "high", reportedOn: "Jan 3, 2026", status: "pending" },
  { id: 3, assetId: "CSE-PC-025", equipment: "Desktop Computer", lab: "DS Lab", issue: "Mouse not working", priority: "low", reportedOn: "Jan 6, 2026", status: "pending" },
];

export default function LabEquipment() {
  const tenantId = useTenantId() || '';
  const [selectedLab, setSelectedLab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ equipment: "", issue: "", priority: "medium" });

  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.assetId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLab = selectedLab === "all" || eq.lab.includes(selectedLab === "lab-1" ? "CN" : "DS");
    const matchesStatus = filterStatus === "all" || eq.status === filterStatus;
    return matchesSearch && matchesLab && matchesStatus;
  });

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
                    value={newIssue.equipment}
                    onValueChange={(v) => setNewIssue({ ...newIssue, equipment: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentList.map((eq) => (
                        <SelectItem key={eq.id} value={eq.assetId}>
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
                    onValueChange={(v) => setNewIssue({ ...newIssue, priority: v })}
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
                <Button onClick={() => setReportDialogOpen(false)}>
                  Submit Report
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                  {filteredEquipment.map((eq) => (
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
                        {eq.specs}
                      </TableCell>
                      <TableCell>{eq.lastMaintenance}</TableCell>
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
                      <TableCell>{record.assignedTo}</TableCell>
                      <TableCell>
                        {record.status === "completed" ? (
                          <Badge className="bg-green-500">Completed</Badge>
                        ) : (
                          <Badge className="bg-yellow-500">In Progress</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.completedDate || record.estimatedCompletion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lab Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {labs.map((lab) => (
          <Card key={lab.id}>
            <CardHeader>
              <CardTitle>{lab.name}</CardTitle>
              <CardDescription>{lab.room}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-600">
                    {equipmentList.filter((e) => e.lab.includes(lab.code.split("-")[0]) && e.status === "working").length}
                  </p>
                  <p className="text-sm text-green-700">Working</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <p className="text-2xl font-bold text-yellow-600">
                    {equipmentList.filter((e) => e.lab.includes(lab.code.split("-")[0]) && e.status === "under_repair").length}
                  </p>
                  <p className="text-sm text-yellow-700">Repair</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-600">
                    {equipmentList.filter((e) => e.lab.includes(lab.code.split("-")[0]) && e.status === "faulty").length}
                  </p>
                  <p className="text-sm text-red-700">Faulty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
