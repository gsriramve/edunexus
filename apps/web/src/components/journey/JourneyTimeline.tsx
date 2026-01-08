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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  Trophy,
  Calendar,
  Star,
  Target,
  Users,
  CheckCircle2,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { TimelineItem, MilestoneCategory, MilestoneType } from '@/hooks/use-student-journey';

interface JourneyTimelineProps {
  timeline: TimelineItem[] | undefined;
  isLoading: boolean;
  onCategoryFilter?: (category: string) => void;
  categoryFilter?: string;
  showHeader?: boolean;
  maxItems?: number;
  expandable?: boolean;
}

const categoryIcons: Record<string, any> = {
  academic: BookOpen,
  career: Briefcase,
  extracurricular: Trophy,
  achievement: Award,
  administrative: GraduationCap,
  skill: Star,
  personal: Users,
};

const milestoneTypeIcons: Record<string, any> = {
  admission: GraduationCap,
  semester_start: Calendar,
  semester_end: CheckCircle2,
  exam_result: BookOpen,
  exam: BookOpen,
  backlog_cleared: CheckCircle2,
  dean_list: Star,
  award: Award,
  achievement: Award,
  certification: Award,
  internship_start: Briefcase,
  internship_end: Briefcase,
  internship: Briefcase,
  project_completion: Target,
  project: Target,
  club_leadership: Users,
  club_joined: Users,
  leadership_role: Users,
  event_participation: Trophy,
  competition: Trophy,
  workshop: BookOpen,
  placement_offer: Briefcase,
  placement_accepted: CheckCircle2,
  placement: Briefcase,
  graduation: GraduationCap,
  scholarship: Award,
  custom: Star,
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'academic':
      return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
    case 'career':
      return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20';
    case 'extracurricular':
      return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
    case 'achievement':
      return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
    case 'administrative':
      return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/20';
    case 'skill':
      return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20';
    case 'personal':
      return 'border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/20';
    default:
      return 'border-l-primary bg-muted/50';
  }
};

const getCategoryBadgeColor = (category?: string) => {
  switch (category) {
    case 'academic':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'career':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'extracurricular':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'achievement':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'administrative':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    case 'skill':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'personal':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
    default:
      return '';
  }
};

export function JourneyTimeline({
  timeline,
  isLoading,
  onCategoryFilter,
  categoryFilter = 'all',
  showHeader = true,
  maxItems,
  expandable = true,
}: JourneyTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayItems = maxItems && !expanded
    ? timeline?.slice(0, maxItems)
    : timeline;

  const hasMore = maxItems && timeline && timeline.length > maxItems;

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Journey Timeline</CardTitle>
              <CardDescription>
                Your milestones and achievements
              </CardDescription>
            </div>
            {onCategoryFilter && (
              <Select value={categoryFilter} onValueChange={onCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="extracurricular">Extracurricular</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {displayItems && displayItems.length > 0 ? (
          <>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {displayItems.map((item, index) => {
                  const Icon = item.milestoneType
                    ? milestoneTypeIcons[item.milestoneType] || Star
                    : item.category
                    ? categoryIcons[item.category] || Star
                    : Calendar;

                  return (
                    <div
                      key={item.id}
                      className={`relative pl-10 ${index === 0 ? 'pt-0' : ''}`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          item.isPositive !== false
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div
                        className={`p-4 rounded-lg border-l-4 ${getCategoryColor(item.category)}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium">{item.title}</h4>
                              {item.category && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs capitalize ${getCategoryBadgeColor(item.category)}`}
                                >
                                  {item.category}
                                </Badge>
                              )}
                              {item.type === 'snapshot' && (
                                <Badge variant="secondary" className="text-xs">
                                  Semester End
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                              {item.academicYear && (
                                <span>AY: {item.academicYear}</span>
                              )}
                              {item.semester && (
                                <span>Sem {item.semester}</span>
                              )}
                            </div>
                          </div>

                          {/* Snapshot data if available */}
                          {item.snapshotData && (
                            <div className="text-right text-sm shrink-0">
                              {item.snapshotData.cgpa && (
                                <div>
                                  <span className="text-muted-foreground">CGPA: </span>
                                  <span className="font-medium">
                                    {item.snapshotData.cgpa.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {item.snapshotData.sgiScore && (
                                <div>
                                  <span className="text-muted-foreground">SGI: </span>
                                  <span className="font-medium">
                                    {Math.round(item.snapshotData.sgiScore)}
                                  </span>
                                </div>
                              )}
                              {item.snapshotData.criScore && (
                                <div>
                                  <span className="text-muted-foreground">CRI: </span>
                                  <span className="font-medium">
                                    {Math.round(item.snapshotData.criScore)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expand/Collapse button */}
            {expandable && hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show {timeline!.length - maxItems} More
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>No milestones recorded yet.</p>
            <p className="text-sm">
              Your journey will be populated as you progress through your academics.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default JourneyTimeline;
