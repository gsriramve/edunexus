'use client';

import { useState } from 'react';
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
  Target,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Briefcase,
  Users,
  Heart,
  Award,
  Sparkles,
  User,
} from 'lucide-react';
import { Goal, GoalCategory, GoalStatus, Milestone } from '@/hooks/use-ai-guidance';

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress?: (goalId: string, progress: number, currentValue?: number) => void;
  onComplete?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  onMilestoneComplete?: (goalId: string, milestoneIndex: number) => void;
  compact?: boolean;
}

export function GoalCard({
  goal,
  onUpdateProgress,
  onComplete,
  onDelete,
  onEdit,
  onMilestoneComplete,
  compact,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [localProgress, setLocalProgress] = useState(goal.progress);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case GoalCategory.CAREER:
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case GoalCategory.SKILL:
        return <Award className="h-5 w-5 text-yellow-500" />;
      case GoalCategory.EXTRACURRICULAR:
        return <Users className="h-5 w-5 text-green-500" />;
      case GoalCategory.PERSONAL:
        return <Heart className="h-5 w-5 text-pink-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return 'border-l-blue-500';
      case GoalCategory.CAREER:
        return 'border-l-purple-500';
      case GoalCategory.SKILL:
        return 'border-l-yellow-500';
      case GoalCategory.EXTRACURRICULAR:
        return 'border-l-green-500';
      case GoalCategory.PERSONAL:
        return 'border-l-pink-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case GoalStatus.OVERDUE:
        return <Badge variant="destructive">Overdue</Badge>;
      case GoalStatus.ABANDONED:
        return <Badge variant="secondary">Abandoned</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  const isCompleted = goal.status === GoalStatus.COMPLETED;
  const isOverdue =
    goal.targetDate && new Date(goal.targetDate) < new Date() && !isCompleted;

  const daysRemaining = goal.targetDate
    ? Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // Calculate milestones progress
  const completedMilestones = goal.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;

  if (compact) {
    return (
      <div
        className={`p-4 rounded-lg border border-l-4 bg-card hover:shadow-md transition-shadow ${getCategoryColor(goal.category)} ${isCompleted ? 'opacity-70' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              getCategoryIcon(goal.category)
            )}
            <div className="min-w-0 flex-1">
              <h4
                className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
              >
                {goal.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={goal.progress} className="h-2 flex-1" />
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`border-l-4 ${getCategoryColor(goal.category)} ${isCompleted ? 'opacity-80' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="shrink-0 mt-0.5">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                getCategoryIcon(goal.category)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle
                className={`text-base ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
              >
                {goal.title}
              </CardTitle>
              {goal.description && (
                <CardDescription className="mt-1">{goal.description}</CardDescription>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {getStatusBadge(goal.status)}

            {/* Source badges */}
            <div className="flex gap-1">
              {goal.isAiSuggested && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              )}
              {goal.isMentorAssigned && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Mentor
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress
            value={goal.progress}
            className={`h-3 ${goal.progress >= 100 ? '[&>div]:bg-green-500' : ''}`}
          />
        </div>

        {/* Target Value */}
        {goal.targetValue !== undefined && goal.currentValue !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">
              {goal.currentValue} / {goal.targetValue}
              {goal.unit && ` ${goal.unit}`}
            </span>
            <span className="text-xs text-muted-foreground">
              ({Math.round((goal.currentValue / goal.targetValue) * 100)}%)
            </span>
          </div>
        )}

        {/* Due Date */}
        {goal.targetDate && (
          <div
            className={`flex items-center gap-2 text-sm ${
              isOverdue ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
            {daysRemaining !== null && daysRemaining > 0 && !isCompleted && (
              <Badge variant="outline" className="text-xs">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
              </Badge>
            )}
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
        )}

        {/* Milestones - Expandable */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between hover:bg-muted/50"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Milestones ({completedMilestones}/{totalMilestones})
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expanded && (
              <ul className="mt-2 space-y-2 pl-2">
                {goal.milestones.map((milestone, index) => (
                  <MilestoneItem
                    key={index}
                    milestone={milestone}
                    onComplete={
                      onMilestoneComplete && !milestone.completed
                        ? () => onMilestoneComplete(goal.id, index)
                        : undefined
                    }
                  />
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Created: {new Date(goal.createdAt).toLocaleDateString()}
            {goal.completedAt && (
              <span className="ml-2">
                <CheckCircle2 className="h-3 w-3 inline mr-1 text-green-500" />
                Completed: {new Date(goal.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && goal.progress < 100 && onComplete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onComplete(goal.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(goal.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MilestoneItemProps {
  milestone: Milestone;
  onComplete?: () => void;
}

function MilestoneItem({ milestone, onComplete }: MilestoneItemProps) {
  const isOverdue =
    milestone.targetDate &&
    new Date(milestone.targetDate) < new Date() &&
    !milestone.completed;

  return (
    <li className="flex items-start gap-2 text-sm">
      <button
        className="shrink-0 mt-1"
        onClick={onComplete}
        disabled={milestone.completed || !onComplete}
      >
        {milestone.completed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <div
            className={`h-4 w-4 rounded-full border-2 ${
              isOverdue
                ? 'border-red-400 hover:bg-red-100'
                : 'border-muted-foreground/30 hover:bg-muted'
            } transition-colors ${onComplete ? 'cursor-pointer' : ''}`}
          />
        )}
      </button>
      <div className="flex-1">
        <span
          className={milestone.completed ? 'line-through text-muted-foreground' : ''}
        >
          {milestone.title}
        </span>
        {milestone.targetDate && (
          <span
            className={`text-xs ml-2 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            Due: {new Date(milestone.targetDate).toLocaleDateString()}
          </span>
        )}
        {milestone.completedAt && (
          <span className="text-xs text-green-600 ml-2">
            Completed: {new Date(milestone.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </li>
  );
}

export default GoalCard;
