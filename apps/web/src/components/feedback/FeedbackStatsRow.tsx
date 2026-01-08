'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { FeedbackStats } from '@/hooks/use-feedback';

interface FeedbackStatsRowProps {
  stats: FeedbackStats | undefined;
  pendingCount: number;
  overdueCount: number;
  isLoading: boolean;
}

export function FeedbackStatsRow({
  stats,
  pendingCount,
  overdueCount,
  isLoading,
}: FeedbackStatsRowProps) {
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Pending */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="text-xs text-muted-foreground">to submit</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className={overdueCount > 0 ? 'border-red-200' : ''}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : ''}`}>
              {overdueCount}
            </span>
            {overdueCount > 0 && (
              <span className="text-xs text-red-500">needs attention</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">
              {stats?.completedFeedback || 0}
            </span>
            {stats?.averageResponseRate && (
              <span className="text-xs text-muted-foreground">
                ({Math.round(stats.averageResponseRate)}% rate)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Cycles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Active Cycles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats?.activeCycles || 0}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FeedbackStatsRow;
