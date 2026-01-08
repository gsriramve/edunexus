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
import {
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronRight,
} from 'lucide-react';

interface Deadline {
  type: 'goal' | 'action';
  title: string;
  deadline: string;
  id?: string;
}

interface DeadlineListProps {
  deadlines: Deadline[];
  onViewItem?: (type: string, id: string) => void;
  maxVisible?: number;
}

export function DeadlineList({ deadlines, onViewItem, maxVisible = 5 }: DeadlineListProps) {
  // Sort by deadline (closest first)
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const displayDeadlines = sortedDeadlines.slice(0, maxVisible);

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'text-red-500', bg: 'bg-red-50' };
    }
    if (diffDays === 0) {
      return { status: 'today', label: 'Today', color: 'text-orange-500', bg: 'bg-orange-50' };
    }
    if (diffDays === 1) {
      return { status: 'tomorrow', label: 'Tomorrow', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    }
    if (diffDays <= 3) {
      return { status: 'soon', label: `${diffDays} days`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
    if (diffDays <= 7) {
      return { status: 'week', label: `${diffDays} days`, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
    return { status: 'later', label: `${diffDays} days`, color: 'text-muted-foreground', bg: 'bg-muted/50' };
  };

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No upcoming deadlines</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by urgency
  const overdue = sortedDeadlines.filter(d => getDeadlineStatus(d.deadline).status === 'overdue');
  const urgent = sortedDeadlines.filter(d =>
    ['today', 'tomorrow', 'soon'].includes(getDeadlineStatus(d.deadline).status)
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Deadlines
            {overdue.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {overdue.length} overdue
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline">{deadlines.length} total</Badge>
        </div>
        {urgent.length > 0 && (
          <CardDescription className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            {urgent.length} deadline{urgent.length !== 1 ? 's' : ''} within 3 days
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {displayDeadlines.map((deadline, index) => {
            const status = getDeadlineStatus(deadline.deadline);

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${status.bg} transition-colors hover:shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`shrink-0 ${status.color}`}>
                    {deadline.type === 'goal' ? (
                      <Target className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deadline.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(deadline.deadline).toLocaleDateString()}
                      <Badge
                        variant={status.status === 'overdue' ? 'destructive' : 'outline'}
                        className="text-[10px] h-4 px-1"
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {onViewItem && deadline.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewItem(deadline.type, deadline.id!)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}

          {deadlines.length > maxVisible && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{deadlines.length - maxVisible} more deadline{deadlines.length - maxVisible !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DeadlineList;
