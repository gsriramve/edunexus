'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Lightbulb,
  CheckCircle2,
  ThumbsUp,
  Target,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { GuidanceStats as GuidanceStatsType, AlertStats as AlertStatsType } from '@/hooks/use-ai-guidance';

interface GuidanceStatsProps {
  guidanceStats?: GuidanceStatsType | null;
  alertStats?: AlertStatsType | null;
  loading?: boolean;
}

export function GuidanceStats({ guidanceStats, alertStats, loading }: GuidanceStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Guidance',
      value: guidanceStats?.activeGuidance || 0,
      total: guidanceStats?.totalGuidance || 0,
      icon: Lightbulb,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      description: 'Active recommendations',
    },
    {
      title: 'Completed',
      value: guidanceStats?.completedGuidance || 0,
      total: guidanceStats?.totalGuidance || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      description: 'Guidance completed',
    },
    {
      title: 'Helpful Rate',
      value: Math.round((guidanceStats?.helpfulRate || 0) * 100),
      suffix: '%',
      icon: ThumbsUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      description: `${guidanceStats?.helpfulCount || 0} marked helpful`,
    },
    {
      title: 'Active Alerts',
      value: alertStats?.unresolvedAlerts || 0,
      total: alertStats?.totalAlerts || 0,
      icon: AlertTriangle,
      color: alertStats?.criticalAlerts && alertStats.criticalAlerts > 0 ? 'text-red-500' : 'text-yellow-500',
      bgColor:
        alertStats?.criticalAlerts && alertStats.criticalAlerts > 0
          ? 'bg-red-50 dark:bg-red-950/30'
          : 'bg-yellow-50 dark:bg-yellow-950/30',
      description: alertStats?.criticalAlerts ? `${alertStats.criticalAlerts} critical` : 'No critical alerts',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold">
                    {stat.value}
                    {stat.suffix}
                  </p>
                  {stat.total !== undefined && stat.total > 0 && !stat.suffix && (
                    <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface GuidanceDashboardStatsProps {
  activeGuidanceCount: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  guidanceCompletionRate: number;
  alertsCount: number;
  loading?: boolean;
}

export function GuidanceDashboardStats({
  activeGuidanceCount,
  activeGoalsCount,
  completedGoalsCount,
  guidanceCompletionRate,
  alertsCount,
  loading,
}: GuidanceDashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Recommendations',
      value: activeGuidanceCount,
      icon: Lightbulb,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'Active Goals',
      value: activeGoalsCount,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Goals Completed',
      value: completedGoalsCount,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(guidanceCompletionRate)}%`,
      icon: TrendingUp,
      color: guidanceCompletionRate >= 70 ? 'text-green-500' : guidanceCompletionRate >= 40 ? 'text-yellow-500' : 'text-red-500',
      bgColor:
        guidanceCompletionRate >= 70
          ? 'bg-green-100 dark:bg-green-900/30'
          : guidanceCompletionRate >= 40
            ? 'bg-yellow-100 dark:bg-yellow-900/30'
            : 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Alerts',
      value: alertsCount,
      icon: AlertTriangle,
      color: alertsCount > 0 ? 'text-red-500' : 'text-green-500',
      bgColor: alertsCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default GuidanceStats;
