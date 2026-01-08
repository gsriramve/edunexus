'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Lightbulb,
  Clock,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Target,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import {
  ActionPlanItem,
  getImpactColor,
  sortActionsByImpact,
} from '@/hooks/use-career-readiness';

interface CRIActionPlanProps {
  actionPlan: ActionPlanItem[] | null;
  loading?: boolean;
}

export function CRIActionPlan({ actionPlan, loading }: CRIActionPlanProps) {
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Action Plan
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!actionPlan || actionPlan.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Action Plan
          </CardTitle>
          <CardDescription>Your personalized improvement roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium text-foreground">You&apos;re on track!</p>
            <p className="text-sm mt-2">No specific actions needed at this time. Keep up the great work!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedActions = sortActionsByImpact(actionPlan);
  const completedCount = completedActions.size;
  const totalActions = sortedActions.length;
  const progressPercentage = (completedCount / totalActions) * 100;

  const toggleAction = (index: number) => {
    setCompletedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('resume')) return Briefcase;
    if (lowerAction.includes('course') || lowerAction.includes('learn')) return BookOpen;
    if (lowerAction.includes('interview') || lowerAction.includes('practice')) return Target;
    return ArrowRight;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Action Plan
            </CardTitle>
            <CardDescription>
              {completedCount} of {totalActions} actions completed
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedActions.map((action, index) => {
          const Icon = getActionIcon(action.action);
          const isCompleted = completedActions.has(index);

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                isCompleted ? 'bg-muted/50 opacity-60' : 'bg-card hover:bg-muted/30'
              }`}
            >
              {/* Checkbox */}
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => toggleAction(index)}
                className="mt-1"
              />

              {/* Step Number */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                    {action.action}
                  </h4>
                  <Badge variant="outline" className={getImpactColor(action.impact)}>
                    {action.impact} impact
                  </Badge>
                </div>

                {action.deadline && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{action.deadline}</span>
                  </div>
                )}

                {action.category && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {action.category}
                  </Badge>
                )}
              </div>

              {/* Action Icon */}
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          );
        })}

        {/* Motivation Message */}
        {completedCount === totalActions && totalActions > 0 && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-700 dark:text-green-400">
                Congratulations! You&apos;ve completed all action items!
              </p>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">
              Recalculate your CRI to see your improved score.
            </p>
          </div>
        )}

        {completedCount > 0 && completedCount < totalActions && (
          <p className="text-center text-sm text-muted-foreground pt-2">
            Keep going! {totalActions - completedCount} more actions to complete.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default CRIActionPlan;
