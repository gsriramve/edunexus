'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Star, MessageSquare, Calendar } from 'lucide-react';
import type { FeedbackEntry } from '@/hooks/use-feedback';

interface FeedbackHistoryProps {
  entries: FeedbackEntry[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}

const ratingLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Poor', color: 'text-red-500' },
  2: { label: 'Below Avg', color: 'text-orange-500' },
  3: { label: 'Average', color: 'text-yellow-500' },
  4: { label: 'Good', color: 'text-blue-500' },
  5: { label: 'Excellent', color: 'text-green-500' },
};

export function FeedbackHistory({
  entries,
  isLoading,
  emptyMessage = 'No feedback submitted yet',
}: FeedbackHistoryProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const calculateAverageRating = (entry: FeedbackEntry): number | null => {
    const ratings = [
      entry.academicRating,
      entry.participationRating,
      entry.teamworkRating,
      entry.communicationRating,
      entry.leadershipRating,
      entry.punctualityRating,
    ].filter((r): r is number => r !== null && r !== undefined);

    if (ratings.length === 0) return null;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  };

  const getRatingBadge = (rating: number | null) => {
    if (!rating) return null;
    const rounded = Math.round(rating);
    const info = ratingLabels[rounded] || ratingLabels[3];
    return (
      <Badge variant="outline" className={info.color}>
        <Star className="h-3 w-3 mr-1 fill-current" />
        {rating.toFixed(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Feedback Yet</h3>
          <p className="text-muted-foreground text-center">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const avgRating = calculateAverageRating(entry);
        return (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {getInitials(entry.targetStudentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {entry.targetStudentName || 'Unknown Student'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {entry.submittedAt
                        ? new Date(entry.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Date unknown'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRatingBadge(avgRating)}
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Submitted
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Ratings Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                {[
                  { key: 'academicRating', label: 'Academic' },
                  { key: 'participationRating', label: 'Participation' },
                  { key: 'teamworkRating', label: 'Teamwork' },
                  { key: 'communicationRating', label: 'Communication' },
                  { key: 'leadershipRating', label: 'Leadership' },
                  { key: 'punctualityRating', label: 'Punctuality' },
                ].map(({ key, label }) => {
                  const rating = entry[key as keyof FeedbackEntry] as number | undefined;
                  return (
                    <div
                      key={key}
                      className="text-center p-2 rounded-md bg-muted/50"
                    >
                      <p className="text-xs text-muted-foreground truncate">{label}</p>
                      <p className="font-medium">
                        {rating !== undefined && rating !== null ? (
                          <span className={ratingLabels[rating]?.color || ''}>
                            {rating}/5
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Text feedback */}
              {(entry.strengths || entry.improvements) && (
                <div className="grid gap-3 md:grid-cols-2 pt-3 border-t">
                  {entry.strengths && (
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1">Strengths</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.strengths}
                      </p>
                    </div>
                  )}
                  {entry.improvements && (
                    <div>
                      <p className="text-xs font-medium text-orange-600 mb-1">Areas for Improvement</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.improvements}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default FeedbackHistory;
