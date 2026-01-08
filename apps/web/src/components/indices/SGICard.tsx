'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SgiData,
  getScoreLevel,
  getScoreColor,
  getTrendColor,
  formatMonthYear,
} from '@/hooks/use-student-growth';

interface SGICardProps {
  data: SgiData | null;
  loading?: boolean;
  showBreakdown?: boolean;
}

export function SGICard({ data, loading, showBreakdown = true }: SGICardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Student Growth Index
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Student Growth Index
          </CardTitle>
          <CardDescription>Your holistic development score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No SGI data available yet.</p>
            <p className="text-sm mt-2">Your score will be calculated once sufficient data is collected.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const level = getScoreLevel(data.sgiScore);
  const scoreColor = getScoreColor(data.sgiScore);
  const trendColor = getTrendColor(data.sgiTrend);

  const TrendIcon = data.sgiTrend === 'improving'
    ? TrendingUp
    : data.sgiTrend === 'declining'
      ? TrendingDown
      : Minus;

  const levelLabels: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    'needs-improvement': 'Needs Work',
    critical: 'Critical',
  };

  const levelColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    average: 'bg-yellow-100 text-yellow-800',
    'needs-improvement': 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Student Growth Index
            </CardTitle>
            <CardDescription>
              {formatMonthYear(data.month, data.year)} Assessment
            </CardDescription>
          </div>
          <Badge className={levelColors[level]}>{levelLabels[level]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={cn('text-5xl font-bold', scoreColor)}>
              {data.sgiScore.toFixed(0)}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <div className={cn('flex items-center gap-1', trendColor)}>
            <TrendIcon className="h-5 w-5" />
            <span className="text-sm font-medium capitalize">{data.sgiTrend}</span>
            {data.trendDelta !== 0 && (
              <span className="text-xs">
                ({data.trendDelta > 0 ? '+' : ''}{data.trendDelta.toFixed(1)})
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress value={data.sgiScore} className="h-3" />
        </div>

        {/* Component Breakdown */}
        {showBreakdown && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <ScoreComponent
              label="Academic"
              score={data.academicScore}
              weight={40}
              color="text-blue-600"
            />
            <ScoreComponent
              label="Engagement"
              score={data.engagementScore}
              weight={30}
              color="text-green-600"
            />
            <ScoreComponent
              label="Skills"
              score={data.skillsScore}
              weight={20}
              color="text-purple-600"
            />
            <ScoreComponent
              label="Behavioral"
              score={data.behavioralScore}
              weight={10}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Data Completeness */}
        {data.dataCompleteness < 1 && (
          <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>
              Data completeness: {(data.dataCompleteness * 100).toFixed(0)}% -
              Score may improve with more data
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ScoreComponentProps {
  label: string;
  score: number;
  weight: number;
  color: string;
}

function ScoreComponent({ label, score, weight, color }: ScoreComponentProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-medium', color)}>{score.toFixed(0)}</span>
      </div>
      <Progress value={score} className="h-1.5" />
      <span className="text-xs text-muted-foreground">{weight}% weight</span>
    </div>
  );
}

export default SGICard;
