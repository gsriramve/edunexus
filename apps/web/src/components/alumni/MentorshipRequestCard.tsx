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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Handshake,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Mentorship } from '@/hooks/use-alumni';

interface MentorshipRequestCardProps {
  request: Mentorship;
  onAccept: () => void;
  onDecline: () => void;
  isProcessing?: boolean;
}

const focusAreaLabels: Record<string, string> = {
  career_guidance: 'Career Guidance',
  technical: 'Technical Skills',
  interview_prep: 'Interview Preparation',
  resume_review: 'Resume Review',
  higher_studies: 'Higher Studies',
  entrepreneurship: 'Entrepreneurship',
  general: 'General Guidance',
};

export function MentorshipRequestCard({
  request,
  onAccept,
  onDecline,
  isProcessing,
}: MentorshipRequestCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const studentName = request.student?.user?.name || 'Student';
  const departmentName = request.student?.department?.name || 'Unknown Department';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(studentName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{studentName}</CardTitle>
              <CardDescription>{departmentName}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Focus Area</p>
          <Badge variant="secondary">
            {focusAreaLabels[request.focusArea] || request.focusArea}
          </Badge>
        </div>

        {request.requestMessage && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Message</p>
            <p className="text-sm bg-muted p-3 rounded-lg">
              "{request.requestMessage}"
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={onAccept}
            disabled={isProcessing}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDecline}
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorshipRequestCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorshipRequestsEmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Handshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No pending mentorship requests</p>
    </div>
  );
}

export default MentorshipRequestCard;
