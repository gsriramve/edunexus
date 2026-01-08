'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Bell,
  TrendingDown,
  Activity,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Alert, AlertType, AlertSeverity, AlertStatus } from '@/hooks/use-ai-guidance';

interface AlertBannerProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  maxVisible?: number;
}

export function AlertBanner({
  alerts,
  onAcknowledge,
  onDismiss,
  onViewDetails,
  maxVisible = 3,
}: AlertBannerProps) {
  const unresolvedAlerts = alerts.filter(
    (a) => a.status === AlertStatus.NEW || a.status === AlertStatus.ACKNOWLEDGED
  );

  if (unresolvedAlerts.length === 0) {
    return null;
  }

  const criticalAlerts = unresolvedAlerts.filter((a) => a.severity === AlertSeverity.CRITICAL);
  const warningAlerts = unresolvedAlerts.filter((a) => a.severity === AlertSeverity.WARNING);
  const infoAlerts = unresolvedAlerts.filter((a) => a.severity === AlertSeverity.INFO);

  const displayAlerts = unresolvedAlerts.slice(0, maxVisible);
  const remainingCount = unresolvedAlerts.length - maxVisible;

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case AlertType.ATTENDANCE_DROP:
        return <TrendingDown className="h-5 w-5" />;
      case AlertType.GRADE_DECLINE:
        return <TrendingDown className="h-5 w-5" />;
      case AlertType.ACTIVITY_DROP:
        return <Activity className="h-5 w-5" />;
      case AlertType.FEEDBACK_CONCERN:
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return {
          card: 'border-red-200 bg-red-50 dark:bg-red-950/20',
          icon: 'text-red-600',
          border: 'border-l-red-500',
          badge: 'bg-red-500 text-white hover:bg-red-600',
        };
      case AlertSeverity.WARNING:
        return {
          card: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20',
          icon: 'text-yellow-600',
          border: 'border-l-yellow-500',
          badge: 'bg-yellow-500 text-white hover:bg-yellow-600',
        };
      default:
        return {
          card: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
          icon: 'text-blue-600',
          border: 'border-l-blue-500',
          badge: 'bg-blue-500 text-white hover:bg-blue-600',
        };
    }
  };

  const getAlertTypeName = (type: string) => {
    switch (type) {
      case AlertType.ATTENDANCE_DROP:
        return 'Attendance';
      case AlertType.GRADE_DECLINE:
        return 'Grades';
      case AlertType.ACTIVITY_DROP:
        return 'Activity';
      case AlertType.FEEDBACK_CONCERN:
        return 'Feedback';
      default:
        return 'Alert';
    }
  };

  // Summary banner when there are critical alerts
  if (criticalAlerts.length > 0) {
    return (
      <Card className="border-red-300 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            Critical Attention Required
            <Badge variant="destructive" className="ml-2">
              {criticalAlerts.length} critical
            </Badge>
            {warningAlerts.length > 0 && (
              <Badge className="bg-yellow-500">{warningAlerts.length} warning</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
                onDismiss={onDismiss}
                onViewDetails={onViewDetails}
              />
            ))}

            {remainingCount > 0 && (
              <Button
                variant="outline"
                className="w-full border-red-200 hover:bg-red-100"
                onClick={() => onViewDetails?.('all')}
              >
                View {remainingCount} more alert{remainingCount !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard banner for warnings/info
  return (
    <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-yellow-600" />
          <span>Attention Required</span>
          <Badge variant="outline" className="ml-2">
            {unresolvedAlerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
              onViewDetails={onViewDetails}
            />
          ))}

          {remainingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewDetails?.('all')}
            >
              View {remainingCount} more alert{remainingCount !== 1 ? 's' : ''}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge, onDismiss, onViewDetails }: AlertItemProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return {
          border: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
          icon: 'text-red-500',
          text: 'text-red-700 dark:text-red-400',
        };
      case AlertSeverity.WARNING:
        return {
          border: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20',
          icon: 'text-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-400',
        };
      default:
        return {
          border: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
          icon: 'text-blue-500',
          text: 'text-blue-700 dark:text-blue-400',
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  // Calculate metric progress
  const metricProgress =
    alert.thresholdValue > 0
      ? Math.min(100, (alert.currentValue / alert.thresholdValue) * 100)
      : 0;

  const isBelow = alert.currentValue < alert.thresholdValue;

  return (
    <div className={`p-3 rounded-lg border-l-4 ${styles.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`shrink-0 mt-0.5 ${styles.icon}`}>
            {alert.severity === AlertSeverity.CRITICAL ? (
              <XCircle className="h-5 w-5" />
            ) : alert.severity === AlertSeverity.WARNING ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium ${styles.text}`}>
              {alert.metricName}: {alert.currentValue}
              {isBelow ? ' (Below ' : ' (Above '}
              threshold: {alert.thresholdValue})
            </h4>
            {alert.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
            )}

            {/* Metric visualization */}
            <div className="flex items-center gap-2 mt-2">
              <Progress
                value={metricProgress}
                className={`h-2 flex-1 ${
                  isBelow && alert.severity === AlertSeverity.CRITICAL
                    ? '[&>div]:bg-red-500'
                    : isBelow
                      ? '[&>div]:bg-yellow-500'
                      : '[&>div]:bg-green-500'
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {alert.changePercent !== undefined && (
                  <span className={alert.changePercent < 0 ? 'text-red-500' : 'text-green-500'}>
                    {alert.changePercent > 0 ? '+' : ''}
                    {alert.changePercent.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>

            {/* Suggested actions preview */}
            {alert.suggestedActions && alert.suggestedActions.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {alert.suggestedActions[0].action}
                {alert.suggestedActions.length > 1 && (
                  <span className="ml-1">+{alert.suggestedActions.length - 1} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {alert.status === AlertStatus.NEW && onAcknowledge && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onViewDetails(alert.id)}
            >
              Details
            </Button>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {new Date(alert.createdAt).toLocaleDateString()}
        {alert.acknowledgedAt && (
          <span className="ml-2">
            <CheckCircle2 className="h-3 w-3 inline mr-1" />
            Acknowledged
          </span>
        )}
      </div>
    </div>
  );
}

export default AlertBanner;
