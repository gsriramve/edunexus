'use client';

import { useState } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  ChevronRight,
  Star,
  Briefcase,
  MessageSquare,
  Sparkles,
  Trophy,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlumniImpactStory, type MenteeOutcome } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface AlumniImpactStoryProps {
  tenantId: string;
  alumniId: string;
  onMenteeClick?: (studentId: string) => void;
  className?: string;
}

export function AlumniImpactStory({
  tenantId,
  alumniId,
  onMenteeClick,
  className,
}: AlumniImpactStoryProps) {
  const [showAllMentees, setShowAllMentees] = useState(false);

  const { data, isLoading, error } = useAlumniImpactStory(tenantId, alumniId);

  if (isLoading) {
    return <AlumniImpactStorySkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const {
    alumniName,
    graduationYear,
    currentRole,
    company,
    totalMentees,
    placedMentees,
    placementRate,
    batchAverage,
    menteeOutcomes,
    contributions,
    testimonials,
    networkStats,
    rank,
    totalAlumni,
    aiNarrative,
  } = data;

  const getStatusBadge = (status: MenteeOutcome['status']) => {
    switch (status) {
      case 'placed':
        return <Badge className="bg-green-500">Placed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'graduated':
        return <Badge variant="secondary">Graduated</Badge>;
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Your Impact Story
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Mentorship outcomes and contributions
                </CardDescription>
              </div>
            </div>
            {rank > 0 && (
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                Rank #{rank} of {totalAlumni}
              </Badge>
            )}
          </div>

          {/* Impact Score */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Mentee Placement Rate</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-lg font-bold',
                  placementRate > batchAverage ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                )}>
                  {placementRate}%
                </span>
                {placementRate > batchAverage && (
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                    +{placementRate - batchAverage}% vs batch
                  </Badge>
                )}
              </div>
            </div>
            <Progress
              value={placementRate}
              className={cn('h-2', {
                '[&>div]:bg-green-500': placementRate > batchAverage,
                '[&>div]:bg-yellow-500': placementRate <= batchAverage && placementRate > 0,
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {placedMentees} of {totalMentees} mentees placed (batch avg: {batchAverage}%)
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{totalMentees}</p>
              <p className="text-xs text-muted-foreground">Mentees</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{placedMentees}</p>
              <p className="text-xs text-muted-foreground">Placed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{networkStats.referralsMade}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
          </div>

          {/* Mentee Outcomes */}
          {menteeOutcomes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mentee Outcomes
              </h4>
              <div className="space-y-2">
                {menteeOutcomes.slice(0, showAllMentees ? menteeOutcomes.length : 3).map((mentee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {mentee.menteeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{mentee.menteeName}</p>
                        {mentee.company && (
                          <p className="text-xs text-muted-foreground">
                            {mentee.role} at {mentee.company}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(mentee.status)}
                  </div>
                ))}
                {menteeOutcomes.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowAllMentees(!showAllMentees)}
                  >
                    {showAllMentees ? 'Show less' : `+${menteeOutcomes.length - 3} more mentees`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Contributions */}
          {contributions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Contributions
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {contributions.map((contrib, index) => (
                  <div key={index} className="p-2 rounded bg-muted/50 text-center">
                    <p className="text-lg font-bold">{contrib.count}</p>
                    <p className="text-xs text-muted-foreground">{contrib.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          {testimonials.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm italic">&quot;{testimonials[0].text}&quot;</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    — {testimonials[0].from}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Narrative */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{aiNarrative}</p>
            </div>
          </div>

          {/* Network Stats */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Network Impact</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="font-medium">{networkStats.batchConnections}</p>
                <p className="text-muted-foreground">Batch Connections</p>
              </div>
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="font-medium">{networkStats.hiringCompanies}</p>
                <p className="text-muted-foreground">Hiring Companies</p>
              </div>
              <div className="p-2 rounded bg-muted/50 text-center">
                <p className="font-medium">{networkStats.referralsMade}</p>
                <p className="text-muted-foreground">Referrals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function AlumniImpactStorySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48 mt-1" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full mt-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AlumniImpactStory;
