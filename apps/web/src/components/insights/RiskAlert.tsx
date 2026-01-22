'use client';

import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type RiskSeverity = 'info' | 'warning' | 'critical';

interface RiskSignal {
  type: string;
  label: string;
  changePercent: number;
  description?: string;
}

interface RiskAlertProps {
  title: string;
  severity: RiskSeverity;
  summary: string;
  signals?: RiskSignal[];
  patternMatch?: number;
  onDismiss?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

const severityConfig: Record<
  RiskSeverity,
  {
    icon: typeof AlertTriangle;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-900',
    badgeText: 'text-red-700 dark:text-red-300',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900',
    badgeText: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-900',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
};

export function RiskAlert({
  title,
  severity,
  summary,
  signals,
  patternMatch,
  onDismiss,
  onViewDetails,
  className,
}: RiskAlertProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        config.bgColor,
        config.borderColor,
        'border transition-all hover:shadow-md',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {patternMatch !== undefined && patternMatch > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {patternMatch}% pattern match with historical issues
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(config.badgeBg, config.badgeText, 'border-0')}
            >
              {severity}
            </Badge>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{summary}</p>

        {signals && signals.length > 0 && (
          <div className="space-y-2 mb-3">
            {signals.map((signal, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-white/50 dark:bg-black/20"
              >
                <span className="text-sm font-medium">{signal.label}</span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    signal.changePercent < 0 ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  {signal.changePercent > 0 ? '+' : ''}
                  {signal.changePercent}%
                </span>
              </div>
            ))}
          </div>
        )}

        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={onViewDetails}
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface CompactRiskAlertProps {
  title: string;
  severity: RiskSeverity;
  value: string | number;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export function CompactRiskAlert({
  title,
  severity,
  value,
  description,
  onClick,
  className,
}: CompactRiskAlertProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
      onClick={onClick}
    >
      <Icon className={cn('h-5 w-5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-lg font-bold">{value}</p>
        <Badge
          variant="outline"
          className={cn('text-xs', config.badgeBg, config.badgeText, 'border-0')}
        >
          {severity}
        </Badge>
      </div>
    </div>
  );
}

export default RiskAlert;
