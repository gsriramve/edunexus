'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CriData,
  getCriLevel,
  getCriLevelLabel,
  getScoreColor,
  getProbabilityColor,
  getSalaryBandLabel,
  getSalaryBandColor,
  formatAssessmentDate,
  getReadinessStatus,
} from '@/hooks/use-career-readiness';

interface CRICardProps {
  data: CriData | null;
  loading?: boolean;
  showBreakdown?: boolean;
}

export function CRICard({ data, loading, showBreakdown = true }: CRICardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Career Readiness Index
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
            <Target className="h-5 w-5" />
            Career Readiness Index
          </CardTitle>
          <CardDescription>Your placement readiness score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No CRI data available yet.</p>
            <p className="text-sm mt-2">Complete activities and assessments to generate your CRI.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const level = getCriLevel(data.criScore);
  const levelLabel = getCriLevelLabel(level);
  const scoreColor = getScoreColor(data.criScore);
  const readinessStatus = getReadinessStatus(data);

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
              <Target className="h-5 w-5 text-indigo-500" />
              Career Readiness Index
            </CardTitle>
            <CardDescription>
              Assessment: {formatAssessmentDate(data.assessmentDate)}
            </CardDescription>
          </div>
          <Badge className={levelColors[level]}>{levelLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={cn('text-5xl font-bold', scoreColor)}>
              {data.criScore.toFixed(0)}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <div className="text-right">
            <div className={cn('flex items-center gap-1', readinessStatus.color)}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{readinessStatus.message}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress value={data.criScore} className="h-3" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          {/* Placement Probability */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className={cn('text-2xl font-bold', getProbabilityColor(data.placementProbability))}>
              {Math.round(data.placementProbability * 100)}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">Placement Probability</p>
          </div>

          {/* Salary Band */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
            </div>
            <Badge className={getSalaryBandColor(data.salaryBand)}>
              {getSalaryBandLabel(data.salaryBand)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Expected Package</p>
          </div>

          {/* Confidence */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold">
              {Math.round(data.confidenceScore * 100)}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">Data Confidence</p>
          </div>
        </div>

        {/* Component Breakdown */}
        {showBreakdown && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <ScoreComponent
              label="Resume"
              score={data.resumeScore}
              weight={25}
              color="text-blue-600"
            />
            <ScoreComponent
              label="Interview"
              score={data.interviewScore}
              weight={25}
              color="text-green-600"
            />
            <ScoreComponent
              label="Skill-Role Fit"
              score={data.skillRoleFitScore}
              weight={25}
              color="text-purple-600"
            />
            <ScoreComponent
              label="Industry Exposure"
              score={data.industryExposureScore}
              weight={25}
              color="text-orange-600"
            />
          </div>
        )}

        {/* Confidence Warning */}
        {data.confidenceScore < 0.7 && (
          <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>
              Data completeness: {(data.confidenceScore * 100).toFixed(0)}% -
              Score may change with more data
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

export default CRICard;
