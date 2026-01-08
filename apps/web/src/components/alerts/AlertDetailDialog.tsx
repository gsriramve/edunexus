'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  TrendingDown,
  Calendar,
  UserX,
  Activity,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  FileText,
} from 'lucide-react';
import type { Alert } from '@/hooks/use-ai-guidance';

interface AlertDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string, resolution: string) => void;
  isAcknowledging?: boolean;
  isResolving?: boolean;
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

const severityConfig: Record<string, { bg: string; text: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-red-100', text: 'text-red-700' },
  acknowledged: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  false_positive: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function AlertDetailDialog({
  open,
  onOpenChange,
  alert,
  onAcknowledge,
  onResolve,
  isAcknowledging,
  isResolving,
}: AlertDetailDialogProps) {
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    if (open) {
      setResolution('');
    }
  }, [open]);

  if (!alert) return null;

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleResolve = () => {
    if (resolution.trim()) {
      onResolve(alert.id, resolution.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${severity.bg} ${severity.text}`}>
              {alertTypeIcons[alert.alertType] || <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {alertTypeLabels[alert.alertType] || alert.alertType}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(alert.studentName)}
                  </AvatarFallback>
                </Avatar>
                {alert.studentName || 'Unknown Student'}
                {alert.departmentName && (
                  <span className="text-muted-foreground">({alert.departmentName})</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <Badge className={`${severity.bg} ${severity.text} border-0`}>
              {alert.severity}
            </Badge>
            <Badge variant="outline" className={`${status.bg} ${status.text} border-0`}>
              {alert.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Alert Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Metric</p>
              <p className="font-medium">{alert.metricName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="font-medium text-red-600">{alert.currentValue}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Threshold</p>
              <p className="font-medium">{alert.thresholdValue}</p>
            </div>
            {alert.changePercent !== undefined && alert.changePercent !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Change</p>
                <p className="font-medium text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  -{Math.abs(alert.changePercent)}%
                </p>
              </div>
            )}
            {alert.timeframe && (
              <div>
                <p className="text-xs text-muted-foreground">Timeframe</p>
                <p className="font-medium">{alert.timeframe}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-medium text-sm">{formatDate(alert.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          {alert.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            </div>
          )}

          {/* Suggested Actions */}
          {alert.suggestedActions && alert.suggestedActions.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Suggested Actions</Label>
              <ul className="mt-2 space-y-2">
                {alert.suggestedActions.map((action, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm p-3 bg-blue-50 rounded-lg"
                  >
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{action.action}</p>
                      {action.priority && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {action.priority} priority
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acknowledgment Info */}
          {alert.acknowledgedBy && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-700">
                  Acknowledged by {alert.acknowledgedBy}
                </span>
              </div>
              {alert.acknowledgedAt && (
                <p className="text-xs text-yellow-600 mt-1">
                  {formatDate(alert.acknowledgedAt)}
                </p>
              )}
            </div>
          )}

          {/* Resolution Info (if resolved) */}
          {alert.status === 'resolved' && alert.resolution && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">Resolved</span>
                {alert.resolvedAt && (
                  <span className="text-xs text-green-600">
                    on {formatDate(alert.resolvedAt)}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-700">{alert.resolution}</p>
            </div>
          )}

          {/* Resolution Input (if not resolved) */}
          {alert.status !== 'resolved' && alert.status !== 'false_positive' && (
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Notes</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe the actions taken to address this alert..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Add notes about how this alert was addressed before marking as resolved.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {alert.status === 'new' && (
            <Button
              variant="secondary"
              onClick={() => onAcknowledge(alert.id)}
              disabled={isAcknowledging}
            >
              {isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </Button>
          )}
          {alert.status !== 'resolved' && alert.status !== 'false_positive' && (
            <Button
              onClick={handleResolve}
              disabled={!resolution.trim() || isResolving}
            >
              {isResolving ? (
                'Resolving...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Resolved
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AlertDetailDialog;
