'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Calendar,
  UserX,
  Activity,
  MessageSquare,
  User,
  XCircle,
} from 'lucide-react';
import type { Alert } from '@/hooks/use-ai-guidance';

interface AlertHistoryProps {
  alerts: Alert[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
  onAlertClick?: (alert: Alert) => void;
}

const alertTypeLabels: Record<string, string> = {
  attendance_drop: 'Attendance Drop',
  grade_decline: 'Grade Decline',
  activity_drop: 'Activity Drop',
  feedback_concern: 'Feedback Concern',
};

const alertTypeIcons: Record<string, React.ReactNode> = {
  attendance_drop: <UserX className="h-4 w-4" />,
  grade_decline: <TrendingDown className="h-4 w-4" />,
  activity_drop: <Activity className="h-4 w-4" />,
  feedback_concern: <MessageSquare className="h-4 w-4" />,
};

const severityConfig: Record<string, { bg: string; text: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

export function AlertHistory({
  alerts,
  isLoading,
  emptyMessage = 'No resolved alerts',
  onAlertClick,
}: AlertHistoryProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">No Resolved Alerts</h3>
          <p className="text-muted-foreground text-center">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const severity = severityConfig[alert.severity] || severityConfig.info;
        const isResolved = alert.status === 'resolved';
        const isFalsePositive = alert.status === 'false_positive';

        return (
          <Card
            key={alert.id}
            className={`${onAlertClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
            onClick={() => onAlertClick?.(alert)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isResolved ? 'bg-green-100 text-green-600' : isFalsePositive ? 'bg-gray-100 text-gray-600' : severity.bg + ' ' + severity.text}`}>
                    {isResolved ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isFalsePositive ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      alertTypeIcons[alert.alertType] || <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(alert.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-base">
                        {alert.studentName || 'Unknown Student'}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {alertTypeLabels[alert.alertType] || alert.alertType}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`${severity.bg} ${severity.text} border-0`}>
                    {alert.severity}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${isResolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0 text-xs`}
                  >
                    {isResolved ? 'Resolved' : 'False Positive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Alert metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">{alert.metricName}</p>
                  <p className="font-medium">{alert.currentValue}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Threshold</p>
                  <p className="font-medium">{alert.thresholdValue}</p>
                </div>
                {alert.changePercent !== undefined && alert.changePercent !== null && (
                  <div className="text-center p-2 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className="font-medium text-red-600">-{Math.abs(alert.changePercent)}%</p>
                  </div>
                )}
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-sm">{formatDate(alert.createdAt)}</p>
                </div>
              </div>

              {/* Resolution info */}
              {alert.resolution && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-green-700">Resolution:</span>
                        {alert.resolvedBy && (
                          <span className="text-green-600 text-xs">by {alert.resolvedBy}</span>
                        )}
                      </div>
                      <p className="text-sm text-green-700 mt-1">{alert.resolution}</p>
                      {alert.resolvedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          {formatDate(alert.resolvedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default AlertHistory;
