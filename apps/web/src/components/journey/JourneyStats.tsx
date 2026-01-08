'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Award,
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import type { JourneyStats as JourneyStatsType } from '@/hooks/use-student-journey';

interface JourneyStatsProps {
  stats: JourneyStatsType | undefined;
  isLoading: boolean;
}

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-yellow-500" />;
  }
};

const getTrendColor = (trend?: string) => {
  switch (trend) {
    case 'improving':
      return 'text-green-500';
    case 'declining':
      return 'text-red-500';
    default:
      return 'text-yellow-500';
  }
};

export function JourneyStats({ stats, isLoading }: JourneyStatsProps) {
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

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Current CGPA */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Current CGPA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {stats.currentCgpa?.toFixed(2) || 'N/A'}
            </span>
            {getTrendIcon(stats.cgpaTrend)}
          </div>
          {stats.cgpaTrend && (
            <p className={`text-xs ${getTrendColor(stats.cgpaTrend)} capitalize`}>
              {stats.cgpaTrend}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Milestones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award className="h-4 w-4" />
            Total Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.totalMilestones}</span>
          </div>
          {stats.milestonesByCategory && (
            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
              {stats.milestonesByCategory.academic && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {stats.milestonesByCategory.academic}
                </span>
              )}
              {stats.milestonesByCategory.career && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {stats.milestonesByCategory.career}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.totalAchievements}</span>
          </div>
          {stats.highestSgi && (
            <p className="text-xs text-muted-foreground">
              Best SGI: {Math.round(stats.highestSgi)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Events Attended */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Events & Clubs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.totalEventsAttended}</span>
            <span className="text-sm text-muted-foreground">events</span>
          </div>
          {stats.totalClubsJoined > 0 && (
            <p className="text-xs text-muted-foreground">
              {stats.totalClubsJoined} clubs joined
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default JourneyStats;
