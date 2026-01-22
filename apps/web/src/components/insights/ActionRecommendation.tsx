'use client';

import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ActionItem {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  context?: string;
  completed?: boolean;
}

interface ActionRecommendationProps {
  title?: string;
  actions: ActionItem[];
  onActionClick?: (action: ActionItem) => void;
  onMarkComplete?: (actionId: string) => void;
  showPriority?: boolean;
  compact?: boolean;
  className?: string;
}

const priorityConfig = {
  high: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    dot: 'bg-red-500',
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  low: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    dot: 'bg-green-500',
  },
};

export function ActionRecommendation({
  title = 'Recommended Actions',
  actions,
  onActionClick,
  onMarkComplete,
  showPriority = true,
  compact = false,
  className,
}: ActionRecommendationProps) {
  if (actions.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {actions.map((action) => (
          <CompactActionItem
            key={action.id}
            action={action}
            onClick={() => onActionClick?.(action)}
            onComplete={() => onMarkComplete?.(action.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <ActionItemCard
            key={action.id}
            action={action}
            showPriority={showPriority}
            onClick={() => onActionClick?.(action)}
            onComplete={() => onMarkComplete?.(action.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface ActionItemCardProps {
  action: ActionItem;
  showPriority: boolean;
  onClick?: () => void;
  onComplete?: () => void;
}

function ActionItemCard({
  action,
  showPriority,
  onClick,
  onComplete,
}: ActionItemCardProps) {
  const config = priorityConfig[action.priority];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        action.completed
          ? 'bg-muted/50 opacity-60'
          : 'hover:bg-muted/50 cursor-pointer',
      )}
      onClick={onClick}
    >
      <button
        className="mt-0.5 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onComplete?.();
        }}
      >
        {action.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            action.completed && 'line-through text-muted-foreground'
          )}
        >
          {action.action}
        </p>
        {action.context && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {action.context}
          </p>
        )}
        {action.deadline && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {action.deadline}
            </span>
          </div>
        )}
      </div>

      {showPriority && (
        <Badge className={cn('shrink-0 border-0', config.badge)}>
          {action.priority}
        </Badge>
      )}
    </div>
  );
}

interface CompactActionItemProps {
  action: ActionItem;
  onClick?: () => void;
  onComplete?: () => void;
}

function CompactActionItem({ action, onClick, onComplete }: CompactActionItemProps) {
  const config = priorityConfig[action.priority];

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-2 px-3 rounded-md border cursor-pointer transition-all',
        action.completed
          ? 'bg-muted/30 opacity-60'
          : 'hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
      <span
        className={cn(
          'text-sm flex-1 truncate',
          action.completed && 'line-through text-muted-foreground'
        )}
      >
        {action.action}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}

interface ActionListProps {
  actions: ActionItem[];
  limit?: number;
  onViewAll?: () => void;
}

export function ActionList({ actions, limit = 3, onViewAll }: ActionListProps) {
  const displayActions = actions.slice(0, limit);
  const remaining = actions.length - limit;

  return (
    <div className="space-y-2">
      {displayActions.map((action) => (
        <div
          key={action.id}
          className="flex items-start gap-2 text-sm"
        >
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
              priorityConfig[action.priority].dot
            )}
          />
          <span className="text-muted-foreground">{action.action}</span>
        </div>
      ))}
      {remaining > 0 && onViewAll && (
        <Button variant="link" size="sm" className="p-0 h-auto" onClick={onViewAll}>
          +{remaining} more action{remaining > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}

export default ActionRecommendation;
