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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  TrendingDown,
  Calendar,
  MessageSquare,
  Eye,
  UserX,
  BookOpen,
  Activity,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useAlerts,
  useAlertStats,
  useAcknowledgeAlert,
  useResolveAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from "@/hooks/use-ai-guidance";

const alertTypeLabels: Record<string, string> = {
  attendance_drop: "Attendance Drop",
  grade_decline: "Grade Decline",
  activity_drop: "Activity Drop",
  feedback_concern: "Feedback Concern",
};

const alertTypeIcons: Record<string, React.ReactNode> = {
  attendance_drop: <UserX className="h-5 w-5" />,
  grade_decline: <TrendingDown className="h-5 w-5" />,
  activity_drop: <Activity className="h-5 w-5" />,
  feedback_concern: <MessageSquare className="h-5 w-5" />,
};

const severityColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  new: "bg-red-100 text-red-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  false_positive: "bg-gray-100 text-gray-800",
};

interface Alert {
  id: string;
  studentId: string;
  studentName?: string;
  alertType: string;
  severity: string;
  status: string;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  changePercent?: number;
  suggestedActions?: { action: string; priority?: string }[];
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export default function TeacherAlertsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolution, setResolution] = useState("");

  const tenantId = useTenantId();

  const { data: alertsData, isLoading: alertsLoading, refetch } = useAlerts(tenantId || "", {
    unresolvedOnly: activeTab === "active",
    severity: severityFilter !== "all" ? (severityFilter as AlertSeverity) : undefined,
    alertType: typeFilter !== "all" ? (typeFilter as AlertType) : undefined,
    limit: 50,
  });
  const { data: stats, isLoading: statsLoading } = useAlertStats(tenantId || "");

  const acknowledgeAlert = useAcknowledgeAlert(tenantId || "");
  const resolveAlert = useResolveAlert(tenantId || "");

  const isLoading = alertsLoading || statsLoading;
  const alerts = alertsData?.data || [];

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert.mutate(alertId, {
      onSuccess: () => {
        refetch();
        setSelectedAlert(null);
      },
    });
  };

  const handleResolve = () => {
    if (!selectedAlert || !resolution) return;

    resolveAlert.mutate(
      { id: selectedAlert.id, resolution },
      {
        onSuccess: () => {
          refetch();
          setSelectedAlert(null);
          setResolution("");
        },
      }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and respond to student disengagement alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unresolved Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">
                {stats?.unresolvedAlerts || 0}
              </span>
              <Bell className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">
                {stats?.criticalAlerts || 0}
              </span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {stats?.totalAlerts || 0}
              </span>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {(stats?.totalAlerts || 0) - (stats?.unresolvedAlerts || 0)}
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alert Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(alertTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            <Bell className="h-4 w-4 mr-2" />
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: Alert) => (
                <Card
                  key={alert.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    alert.severity === "critical" ? "border-red-200" : ""
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            alert.severity === "critical"
                              ? "bg-red-100 text-red-600"
                              : alert.severity === "warning"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {alertTypeIcons[alert.alertType] || <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {alert.studentName || "Student"}
                          </CardTitle>
                          <CardDescription>
                            {alertTypeLabels[alert.alertType] || alert.alertType}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        <Badge className={statusColors[alert.status]}>
                          {alert.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">{alert.metricName}: </span>
                        <span className="font-medium">{alert.currentValue}</span>
                        <span className="text-muted-foreground"> / {alert.thresholdValue} threshold</span>
                      </div>
                      {alert.changePercent !== undefined && (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          {alert.changePercent}% drop
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Active Alerts</h3>
                <p className="text-muted-foreground text-center">
                  All students are performing well
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Resolved Alerts</h3>
              <p className="text-muted-foreground text-center">
                View resolved alerts from the all alerts view
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={selectedAlert !== null} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedAlert.severity === "critical"
                        ? "bg-red-100 text-red-600"
                        : selectedAlert.severity === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {alertTypeIcons[selectedAlert.alertType] || (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <DialogTitle>
                      {alertTypeLabels[selectedAlert.alertType] || selectedAlert.alertType}
                    </DialogTitle>
                    <DialogDescription>
                      Alert for {selectedAlert.studentName || "Student"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Alert Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <Badge className={`ml-2 ${severityColors[selectedAlert.severity]}`}>
                      {selectedAlert.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`ml-2 ${statusColors[selectedAlert.status]}`}>
                      {selectedAlert.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Metric:</span>
                    <span className="ml-2 font-medium">{selectedAlert.metricName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Value:</span>
                    <span className="ml-2 font-medium">{selectedAlert.currentValue}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Threshold:</span>
                    <span className="ml-2 font-medium">{selectedAlert.thresholdValue}</span>
                  </div>
                  {selectedAlert.changePercent !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Change:</span>
                      <span className="ml-2 font-medium text-red-600">
                        -{selectedAlert.changePercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Suggested Actions */}
                {selectedAlert.suggestedActions && selectedAlert.suggestedActions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Suggested Actions</h4>
                    <ul className="space-y-2">
                      {selectedAlert.suggestedActions.map((action, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm p-2 bg-muted rounded-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          {action.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resolution Input */}
                {selectedAlert.status !== "resolved" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resolution Notes</label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe actions taken to resolve this alert..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                {selectedAlert.status === "new" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    disabled={acknowledgeAlert.isPending}
                  >
                    {acknowledgeAlert.isPending ? "..." : "Acknowledge"}
                  </Button>
                )}
                {selectedAlert.status !== "resolved" && (
                  <Button
                    onClick={handleResolve}
                    disabled={!resolution || resolveAlert.isPending}
                  >
                    {resolveAlert.isPending ? "Resolving..." : "Mark Resolved"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
