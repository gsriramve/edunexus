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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Plus,
  BookOpen,
  Briefcase,
  Award,
  Trophy,
  Heart,
  Target,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { GoalSuggestion, GoalCategory } from '@/hooks/use-ai-guidance';

interface GoalSuggestionsProps {
  suggestions: GoalSuggestion[] | undefined;
  isLoading: boolean;
  onAcceptSuggestion: (suggestion: GoalSuggestion) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function GoalSuggestions({
  suggestions,
  isLoading,
  onAcceptSuggestion,
  onRefresh,
  isRefreshing,
}: GoalSuggestionsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case GoalCategory.CAREER:
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case GoalCategory.SKILL:
        return <Award className="h-4 w-4 text-yellow-500" />;
      case GoalCategory.EXTRACURRICULAR:
        return <Trophy className="h-4 w-4 text-green-500" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI-Suggested Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI-Suggested Goals
          </CardTitle>
          <CardDescription>
            Personalized goals based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-indigo-400" />
            <p className="text-muted-foreground text-sm">
              No suggestions available right now.
            </p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Get Suggestions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              AI-Suggested Goals
            </CardTitle>
            <CardDescription>
              Based on your profile and progress
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getCategoryColor(suggestion.category)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="shrink-0 mt-0.5">
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                        {suggestion.category}
                      </Badge>
                      {suggestion.targetValue && suggestion.unit && (
                        <span className="text-[10px] text-muted-foreground">
                          Target: {suggestion.targetValue} {suggestion.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={() => onAcceptSuggestion(suggestion)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default GoalSuggestions;
