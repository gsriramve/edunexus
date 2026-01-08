'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Target,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Users,
  Heart,
  Award,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Goal, GoalCategory, GoalStatus } from '@/hooks/use-ai-guidance';

interface MonthlyPlanCardProps {
  month: string;
  year: number;
  goals: Goal[];
  onViewGoal?: (goalId: string) => void;
  onViewAllGoals?: () => void;
}

export function MonthlyPlanCard({
  month,
  year,
  goals,
  onViewGoal,
  onViewAllGoals,
}: MonthlyPlanCardProps) {
  // Calculate overall progress
  const activeGoals = goals.filter(
    (g) => g.status === GoalStatus.ACTIVE || g.status === GoalStatus.COMPLETED
  );
  const completedGoals = goals.filter((g) => g.status === GoalStatus.COMPLETED);
  const overallProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
      : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case GoalCategory.CAREER:
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case GoalCategory.SKILL:
        return <Award className="h-4 w-4 text-yellow-500" />;
      case GoalCategory.EXTRACURRICULAR:
        return <Users className="h-4 w-4 text-green-500" />;
      case GoalCategory.PERSONAL:
        return <Heart className="h-4 w-4 text-pink-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30';
      case GoalCategory.CAREER:
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950/30';
      case GoalCategory.SKILL:
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30';
      case GoalCategory.EXTRACURRICULAR:
        return 'bg-green-50 border-green-200 dark:bg-green-950/30';
      case GoalCategory.PERSONAL:
        return 'bg-pink-50 border-pink-200 dark:bg-pink-950/30';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-950/30';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Group goals by category
  const goalsByCategory = activeGoals.reduce(
    (acc, goal) => {
      const category = goal.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(goal);
      return acc;
    },
    {} as Record<string, Goal[]>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Monthly Plan: {month} {year}
            </CardTitle>
            <CardDescription className="mt-1">
              {completedGoals.length} of {activeGoals.length} goals completed
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`text-lg font-bold ${
              overallProgress >= 75
                ? 'border-green-500 text-green-600'
                : overallProgress >= 50
                  ? 'border-blue-500 text-blue-600'
                  : overallProgress >= 25
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-red-500 text-red-600'
            }`}
          >
            {overallProgress}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress
            value={overallProgress}
            className={`h-3 [&>div]:${getProgressColor(overallProgress)}`}
          />
        </div>

        {/* Goals Grid */}
        {activeGoals.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {activeGoals.slice(0, 4).map((goal) => (
              <GoalProgressItem
                key={goal.id}
                goal={goal}
                onClick={() => onViewGoal?.(goal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No goals set for this month</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={onViewAllGoals}>
              Set Goals
            </Button>
          </div>
        )}

        {/* Category Summary */}
        {Object.keys(goalsByCategory).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {Object.entries(goalsByCategory).map(([category, categoryGoals]) => {
              const categoryProgress = Math.round(
                categoryGoals.reduce((sum, g) => sum + g.progress, 0) / categoryGoals.length
              );
              return (
                <div
                  key={category}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getCategoryColor(category)}`}
                >
                  {getCategoryIcon(category)}
                  <span className="text-xs font-medium capitalize">{category}</span>
                  <Badge variant="secondary" className="text-xs h-5">
                    {categoryProgress}%
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        {activeGoals.length > 4 && onViewAllGoals && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewAllGoals}
          >
            View all {activeGoals.length} goals
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface GoalProgressItemProps {
  goal: Goal;
  onClick?: () => void;
}

function GoalProgressItem({ goal, onClick }: GoalProgressItemProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case GoalCategory.CAREER:
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case GoalCategory.SKILL:
        return <Award className="h-4 w-4 text-yellow-500" />;
      case GoalCategory.EXTRACURRICULAR:
        return <Users className="h-4 w-4 text-green-500" />;
      case GoalCategory.PERSONAL:
        return <Heart className="h-4 w-4 text-pink-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const isCompleted = goal.status === GoalStatus.COMPLETED;
  const isOverdue =
    goal.targetDate && new Date(goal.targetDate) < new Date() && !isCompleted;

  return (
    <div
      className={`p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${
        isCompleted ? 'opacity-75' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="shrink-0 mt-0.5">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            getCategoryIcon(goal.category)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
          >
            {goal.title}
          </h4>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-2">
            <Progress value={goal.progress} className="h-1.5 flex-1" />
            <span className="text-xs font-medium text-muted-foreground">
              {goal.progress}%
            </span>
          </div>

          {/* Target value if available */}
          {goal.targetValue !== undefined && goal.currentValue !== undefined && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {goal.currentValue}/{goal.targetValue}
              {goal.unit && ` ${goal.unit}`}
            </div>
          )}

          {/* Due date */}
          {goal.targetDate && !isCompleted && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs ${
                isOverdue ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Clock className="h-3 w-3" />
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {new Date(goal.targetDate).toLocaleDateString()}
            </div>
          )}

          {/* AI/Mentor badges */}
          <div className="flex gap-1 mt-1">
            {goal.isAiSuggested && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                AI
              </Badge>
            )}
            {goal.isMentorAssigned && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                Mentor
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyPlanCard;
