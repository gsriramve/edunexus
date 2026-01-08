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
import {
  AlertTriangle,
  TrendingDown,
  Calendar,
  UserX,
  Activity,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import type { Alert } from '@/hooks/use-ai-guidance';

interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
}

const alertTypeLabels: Record<string, string> = {
  attendance_drop: 'Attendance Drop',
  grade_decline: 'Grade Decline',
  activity_drop: 'Activity Drop',
  feedback_concern: 'Feedback Concern',
};

const alertTypeIcons: Record<string, React.ReactNode> = {
  attendance_drop: <UserX className="h-5 w-5" />,
  grade_decline: <TrendingDown className="h-5 w-5" />,
  activity_drop: <Activity className="h-5 w-5" />,
  feedback_concern: <MessageSquare className="h-5 w-5" />,
};

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-red-100', text: 'text-red-700' },
  acknowledged: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  false_positive: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const severity = severityConfig[alert.severity] || severityConfig.info;
  const status = statusConfig[alert.status] || statusConfig.new;

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

  const daysAgo = Math.floor(
    (Date.now() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all hover:border-primary/50 ${
        alert.severity === 'critical' ? severity.border : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${severity.bg} ${severity.text}`}>
              {alertTypeIcons[alert.alertType] || <AlertTriangle className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(alert.studentName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-base truncate">
                  {alert.studentName || 'Unknown Student'}
                </CardTitle>
              </div>
              <CardDescription className="truncate">
                {alertTypeLabels[alert.alertType] || alert.alertType}
                {alert.departmentName && ` - ${alert.departmentName}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${severity.bg} ${severity.text} border-0`}>
              {alert.severity}
            </Badge>
            <Badge variant="outline" className={`${status.bg} ${status.text} border-0 text-xs`}>
              {alert.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {/* Metric Info */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">{alert.metricName}:</span>
            <span className="font-medium">{alert.currentValue}</span>
            <span className="text-muted-foreground">/ {alert.thresholdValue}</span>
          </div>

          {/* Change Percent */}
          {alert.changePercent !== undefined && alert.changePercent !== null && (
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium">{Math.abs(alert.changePercent)}% drop</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {daysAgo === 0
                ? 'Today'
                : daysAgo === 1
                ? 'Yesterday'
                : `${daysAgo} days ago`}
            </span>
          </div>
        </div>

        {/* Quick action hints */}
        {alert.suggestedActions && alert.suggestedActions.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              {alert.suggestedActions.length} suggested action{alert.suggestedActions.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertCard;
