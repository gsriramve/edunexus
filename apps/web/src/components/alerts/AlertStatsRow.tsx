'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { AlertStats } from '@/hooks/use-ai-guidance';

interface AlertStatsRowProps {
  stats: AlertStats | undefined;
  isLoading: boolean;
}

export function AlertStatsRow({ stats, isLoading }: AlertStatsRowProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const resolvedCount = (stats?.totalAlerts || 0) - (stats?.unresolvedAlerts || 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Unresolved Alerts */}
      <Card className={stats?.unresolvedAlerts ? 'border-red-200' : ''}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Unresolved Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${stats?.unresolvedAlerts ? 'text-red-600' : ''}`}>
              {stats?.unresolvedAlerts || 0}
            </span>
            {(stats?.unresolvedAlerts || 0) > 0 && (
              <span className="text-xs text-red-500">needs attention</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card className={stats?.criticalAlerts ? 'border-red-200' : ''}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Critical
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${stats?.criticalAlerts ? 'text-red-600' : ''}`}>
              {stats?.criticalAlerts || 0}
            </span>
            {(stats?.criticalAlerts || 0) > 0 && (
              <span className="text-xs text-red-500">urgent</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Total Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {stats?.totalAlerts || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Resolved */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Resolved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">
              {resolvedCount}
            </span>
            {stats?.totalAlerts && stats.totalAlerts > 0 && (
              <span className="text-xs text-muted-foreground">
                ({Math.round((resolvedCount / stats.totalAlerts) * 100)}%)
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AlertStatsRow;
