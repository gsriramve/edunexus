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
import {
  Brain,
  Lightbulb,
  BookOpen,
  Briefcase,
  Users,
  Heart,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';
import { Guidance, GuidancePriority, GuidanceCategory } from '@/hooks/use-ai-guidance';

interface GuidanceCardProps {
  guidance: Guidance;
  onFeedback?: (id: string, helpful: boolean) => void;
  onMarkComplete?: (id: string) => void;
  compact?: boolean;
}

export function GuidanceCard({ guidance, onFeedback, onMarkComplete, compact }: GuidanceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GuidanceCategory.ACADEMIC:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case GuidanceCategory.CAREER:
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case GuidanceCategory.ENGAGEMENT:
        return <Users className="h-5 w-5 text-green-500" />;
      case GuidanceCategory.SKILL:
        return <Award className="h-5 w-5 text-yellow-500" />;
      case GuidanceCategory.BEHAVIORAL:
        return <Heart className="h-5 w-5 text-pink-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case GuidancePriority.URGENT:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case GuidancePriority.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
      case GuidancePriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case GuidanceCategory.ACADEMIC:
        return 'border-l-blue-500';
      case GuidanceCategory.CAREER:
        return 'border-l-purple-500';
      case GuidanceCategory.ENGAGEMENT:
        return 'border-l-green-500';
      case GuidanceCategory.SKILL:
        return 'border-l-yellow-500';
      case GuidanceCategory.BEHAVIORAL:
        return 'border-l-pink-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const isExpired = guidance.expiresAt && new Date(guidance.expiresAt) < new Date();
  const daysUntilExpiry = guidance.expiresAt
    ? Math.ceil((new Date(guidance.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (compact) {
    return (
      <div
        className={`p-4 rounded-lg border border-l-4 bg-card hover:shadow-md transition-shadow cursor-pointer ${getCategoryColor(guidance.category)}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {getCategoryIcon(guidance.category)}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium truncate">{guidance.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {guidance.description}
              </p>
            </div>
          </div>
          <Badge className={`shrink-0 ${getPriorityColor(guidance.priority)}`}>
            {guidance.priority}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-l-4 ${getCategoryColor(guidance.category)} ${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="shrink-0 mt-0.5">{getCategoryIcon(guidance.category)}</div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base">{guidance.title}</CardTitle>
              <CardDescription className="mt-1">{guidance.description}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge className={getPriorityColor(guidance.priority)}>
              {guidance.priority} priority
            </Badge>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* AI Confidence */}
          {guidance.confidenceScore && (
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-indigo-500" />
              <span className="text-muted-foreground">AI Confidence:</span>
              <div className="flex items-center gap-1">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${guidance.confidenceScore * 100}%` }}
                  />
                </div>
                <span className="font-medium text-xs">
                  {Math.round(guidance.confidenceScore * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Trigger Reason */}
          {guidance.triggerReason && (
            <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
              <Target className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{guidance.triggerReason}</span>
            </div>
          )}

          {/* Action Items - Expandable */}
          {guidance.actionItems && guidance.actionItems.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-muted/50"
                onClick={() => setExpanded(!expanded)}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Action Items ({guidance.actionItems.length})
                </span>
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expanded && (
                <ul className="mt-2 space-y-2 pl-2">
                  {guidance.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="shrink-0 mt-1">
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.action}
                        </span>
                        {item.deadline && (
                          <span className="text-xs text-muted-foreground ml-2">
                            Due: {new Date(item.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Resources */}
          {guidance.resources && guidance.resources.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Resources
              </h5>
              <div className="flex flex-wrap gap-2">
                {guidance.resources.map((resource, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!resource.url}
                  >
                    <a
                      href={resource.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      {resource.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Footer: Expiry and Feedback */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {daysUntilExpiry <= 7 ? (
                    <span className="text-orange-500">
                      Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span>
                      Expires: {new Date(guidance.expiresAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              {guidance.viewedAt && (
                <span className="text-xs text-muted-foreground">
                  Viewed: {new Date(guidance.viewedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {guidance.status === 'active' && onMarkComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkComplete(guidance.id)}
                  className="h-8"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              )}

              {guidance.wasHelpful === undefined && onFeedback && (
                <>
                  <span className="text-xs text-muted-foreground">Helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onFeedback(guidance.id, true)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onFeedback(guidance.id, false)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}

              {guidance.wasHelpful !== undefined && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {guidance.wasHelpful ? (
                    <>
                      <ThumbsUp className="h-3 w-3 text-green-500" />
                      Marked helpful
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-3 w-3 text-red-500" />
                      Not helpful
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GuidanceCard;
