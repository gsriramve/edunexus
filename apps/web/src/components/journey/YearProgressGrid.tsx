'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
} from 'lucide-react';
import type { YearOverYearProgress, YearProgress } from '@/hooks/use-student-journey';

interface YearProgressGridProps {
  progress: YearOverYearProgress | undefined;
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

const getTrendBadgeColor = (trend?: string) => {
  switch (trend) {
    case 'improving':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'declining':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
};

const getYearLabel = (index: number, total: number): string => {
  if (total <= 1) return 'Current Year';

  switch (index) {
    case 0:
      return 'First Year';
    case 1:
      return 'Second Year';
    case 2:
      return 'Third Year';
    case 3:
      return 'Final Year';
    default:
      return `Year ${index + 1}`;
  }
};

export function YearProgressGrid({ progress, isLoading }: YearProgressGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress || !progress.years || progress.years.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Year-over-Year Progress
            </CardTitle>
            <CardDescription>
              Your academic journey across different years
            </CardDescription>
          </div>
          {progress.overallTrend && (
            <Badge className={`${getTrendBadgeColor(progress.overallTrend)} capitalize`}>
              {getTrendIcon(progress.overallTrend)}
              <span className="ml-1">{progress.overallTrend}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {progress.years.map((year, index) => (
            <YearCard
              key={year.academicYear}
              year={year}
              label={getYearLabel(index, progress.years.length)}
              isLatest={index === progress.years.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface YearCardProps {
  year: YearProgress;
  label: string;
  isLatest?: boolean;
}

function YearCard({ year, label, isLatest }: YearCardProps) {
  const cgpaProgress = year.endCgpa ? (year.endCgpa / 10) * 100 : 0;
  const sgiProgress = year.endSgi || 0;

  return (
    <div
      className={`p-4 rounded-lg border bg-card ${
        isLatest ? 'ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-sm">{year.academicYear}</h4>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        {getTrendIcon(year.trend)}
      </div>

      <div className="space-y-3">
        {/* CGPA */}
        {year.endCgpa && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">CGPA</span>
              <span className="font-medium">{year.endCgpa.toFixed(2)}</span>
            </div>
            <Progress value={cgpaProgress} className="h-1.5" />
          </div>
        )}

        {/* SGI */}
        {year.endSgi && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">SGI</span>
              <span className="font-medium">{Math.round(year.endSgi)}</span>
            </div>
            <Progress value={sgiProgress} className="h-1.5" />
          </div>
        )}

        {/* CRI */}
        {year.endCri && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">CRI</span>
              <span className="font-medium">{Math.round(year.endCri)}</span>
            </div>
            <Progress value={year.endCri} className="h-1.5" />
          </div>
        )}

        {/* Milestones & Achievements */}
        <div className="flex justify-between items-center pt-2 border-t text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Award className="h-3 w-3" />
            <span>{year.milestonesCount} milestones</span>
          </div>
          {year.achievementsCount > 0 && (
            <span className="text-muted-foreground">
              {year.achievementsCount} achievements
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default YearProgressGrid;
