'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, AlertTriangle, GraduationCap, BookOpen } from 'lucide-react';
import type { PendingFeedback } from '@/hooks/use-feedback';

interface StudentFeedbackCardProps {
  feedback: PendingFeedback;
  onClick: () => void;
}

export function StudentFeedbackCard({ feedback, onClick }: StudentFeedbackCardProps) {
  const dueDate = new Date(feedback.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getDueBadge = () => {
    if (feedback.isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntilDue <= 2) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          Due Soon
        </Badge>
      );
    }
    return null;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all hover:border-primary/50 ${
        feedback.isOverdue ? 'border-red-200 bg-red-50/30' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(feedback.targetStudentName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {feedback.targetStudentName || 'Unknown Student'}
            </CardTitle>
            <CardDescription className="truncate">
              {feedback.cycleName}
            </CardDescription>
          </div>
          {getDueBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Due: {dueDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {feedback.isOverdue && (
            <div className="flex items-center gap-1 text-red-500 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>{Math.abs(daysUntilDue)} days overdue</span>
            </div>
          )}
          {!feedback.isOverdue && daysUntilDue >= 0 && (
            <div className="text-xs text-muted-foreground">
              {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentFeedbackCard;
