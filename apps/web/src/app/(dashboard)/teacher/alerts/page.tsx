'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Bell,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useTenantId } from '@/hooks/use-tenant';
import {
  useAlerts,
  useAlertStats,
  useAcknowledgeAlert,
  useResolveAlert,
  useRunAlertDetection,
  type Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from '@/hooks/use-ai-guidance';
import {
  AlertStatsRow,
  AlertCard,
  AlertDetailDialog,
  AlertHistory,
} from '@/components/alerts';

const alertTypeLabels: Record<string, string> = {
  attendance_drop: 'Attendance Drop',
  grade_decline: 'Grade Decline',
  activity_drop: 'Activity Drop',
  feedback_concern: 'Feedback Concern',
};

export default function TeacherAlertsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const tenantId = useTenantId();

  // Active alerts query
  const {
    data: activeAlertsData,
    isLoading: activeLoading,
    refetch: refetchActive,
  } = useAlerts(tenantId || '', {
    unresolvedOnly: true,
    severity: severityFilter !== 'all' ? (severityFilter as AlertSeverity) : undefined,
    alertType: typeFilter !== 'all' ? (typeFilter as AlertType) : undefined,
    limit: 50,
  });

  // Resolved alerts query
  const {
    data: resolvedAlertsData,
    isLoading: resolvedLoading,
    refetch: refetchResolved,
  } = useAlerts(tenantId || '', {
    status: AlertStatus.RESOLVED,
    limit: 50,
  });

  const { data: stats, isLoading: statsLoading } = useAlertStats(tenantId || '');

  const acknowledgeAlert = useAcknowledgeAlert(tenantId || '');
  const resolveAlert = useResolveAlert(tenantId || '');
  const runDetection = useRunAlertDetection(tenantId || '');

  const isLoading = activeLoading || statsLoading;
  const activeAlerts = activeAlertsData?.data || [];
  const resolvedAlerts = resolvedAlertsData?.data || [];

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert.mutate(alertId, {
      onSuccess: () => {
        toast.success('Alert acknowledged');
        refetchActive();
        setDialogOpen(false);
        setSelectedAlert(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to acknowledge alert');
      },
    });
  };

  const handleResolve = (alertId: string, resolution: string) => {
    resolveAlert.mutate(
      { id: alertId, resolution },
      {
        onSuccess: () => {
          toast.success('Alert resolved');
          refetchActive();
          refetchResolved();
          setDialogOpen(false);
          setSelectedAlert(null);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to resolve alert');
        },
      }
    );
  };

  const handleRefresh = () => {
    refetchActive();
    refetchResolved();
    toast.success('Refreshed');
  };

  const handleRunDetection = () => {
    runDetection.mutate(
      {},
      {
        onSuccess: (result) => {
          toast.success(`Detection complete: ${result.detected} alerts detected, ${result.saved} new alerts saved`);
          refetchActive();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to run detection');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and respond to student disengagement alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunDetection}
            disabled={runDetection.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            {runDetection.isPending ? 'Running...' : 'Run Detection'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <AlertStatsRow stats={stats} isLoading={statsLoading} />

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
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts */}
        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length > 0 ? (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => handleAlertClick(alert)}
                />
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

        {/* Resolved Alerts */}
        <TabsContent value="resolved" className="space-y-4">
          <AlertHistory
            alerts={resolvedAlerts}
            isLoading={resolvedLoading}
            emptyMessage="No alerts have been resolved yet"
            onAlertClick={handleAlertClick}
          />
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <AlertDetailDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedAlert(null);
        }}
        alert={selectedAlert}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        isAcknowledging={acknowledgeAlert.isPending}
        isResolving={resolveAlert.isPending}
      />
    </div>
  );
}
