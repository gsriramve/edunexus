'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useParentEarlyWarning, type EarlyWarningResponse, type InsightSeverity } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface ParentEarlyWarningProps {
  tenantId: string;
  studentId: string;
  studentName?: string;
  onContactTeacher?: () => void;
  className?: string;
}

const severityConfig: Record<InsightSeverity, {
  icon: typeof AlertTriangle;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
}> = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  info: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-600 dark:text-green-400',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
};

export function ParentEarlyWarning({
  tenantId,
  studentId,
  studentName,
  onContactTeacher,
  className,
}: ParentEarlyWarningProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const { data, isLoading, error } = useParentEarlyWarning(tenantId, studentId);

  if (isLoading) {
    return <ParentEarlyWarningSkeleton />;
  }

  if (error) {
    return null; // Silently fail - don't show errors for insight widgets
  }

  if (!data || !data.hasWarning || isDismissed) {
    // Show positive state when no warnings
    if (data && !data.hasWarning) {
      return (
        <Card className={cn('border-green-200 dark:border-green-800', className)}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  All Looking Good!
                </p>
                <p className="text-sm text-muted-foreground">
                  {studentName || 'Your child'} is on track with no concerning patterns detected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const config = severityConfig[data.overallRiskLevel];
  const Icon = config.icon;

  return (
    <>
      <Card
        className={cn(
          'border transition-all hover:shadow-md',
          config.borderColor,
          config.bgColor,
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', config.bgColor)}>
                <Icon className={cn('h-5 w-5', config.textColor)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    Early Warning Alert
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          This AI-powered alert identifies patterns that may affect your child's academic performance.
                          Early intervention can help address these concerns.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>
                  {data.patternMatchPercent}% pattern match with past cases
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('border-0', config.badgeColor)}>
                {data.overallRiskLevel}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary */}
          <p className="text-sm mb-4">{data.summary}</p>

          {/* Risk Score Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Risk Level</span>
              <span className="font-medium">{data.riskScore}/100</span>
            </div>
            <Progress
              value={data.riskScore}
              className={cn('h-2', {
                '[&>div]:bg-red-500': data.riskScore > 60,
                '[&>div]:bg-yellow-500': data.riskScore > 30 && data.riskScore <= 60,
                '[&>div]:bg-green-500': data.riskScore <= 30,
              })}
            />
          </div>

          {/* Signals Preview */}
          {data.signals.length > 0 && (
            <div className="space-y-2 mb-4">
              {data.signals.slice(0, 2).map((signal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded bg-white/50 dark:bg-black/20"
                >
                  <span className="text-sm font-medium">{signal.label}</span>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      {Math.abs(signal.changePercent)}% drop
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            {onContactTeacher && (
              <Button size="sm" onClick={onContactTeacher}>
                <MessageCircle className="mr-1 h-4 w-4" />
                Contact Teacher
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className={cn('h-5 w-5', config.textColor)} />
              Early Warning Details
            </DialogTitle>
            <DialogDescription>
              Understanding the signals and recommended actions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Historical Context */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">{data.historicalContext}</p>
            </div>

            {/* All Signals */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Warning Signals</h4>
              <div className="space-y-2">
                {data.signals.map((signal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{signal.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {signal.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        {signal.changePercent > 0 ? '+' : ''}
                        {signal.changePercent}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {signal.currentValue} (was {signal.previousValue})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {data.recommendations.map((rec, index) => (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                        {
                          'bg-red-500': rec.priority === 'high',
                          'bg-yellow-500': rec.priority === 'medium',
                          'bg-green-500': rec.priority === 'low',
                        }
                      )}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rec.action}</p>
                      {rec.context && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rec.context}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ParentEarlyWarningSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-2 w-full mt-4" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ParentEarlyWarning;
