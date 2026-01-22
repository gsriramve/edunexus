'use client';

import { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  ChevronRight,
  Award,
  GraduationCap,
  Sparkles,
  Target,
  Building2,
  IndianRupee,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStudentCareerPath, type CareerPath, type AlumniOutcome } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface CareerPathVisualizerProps {
  tenantId: string;
  studentId: string;
  onAlumniClick?: (alumniId: string) => void;
  className?: string;
}

export function CareerPathVisualizer({
  tenantId,
  studentId,
  onAlumniClick,
  className,
}: CareerPathVisualizerProps) {
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniOutcome | null>(null);
  const [showAllSkillGaps, setShowAllSkillGaps] = useState(false);

  const { data, isLoading, error } = useStudentCareerPath(tenantId, studentId);

  if (isLoading) {
    return <CareerPathVisualizerSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const { careerReadiness, topCareerPaths, skillGaps, alumniLikeYou, recommendations, aiInsight } = data;

  const formatSalary = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getReadinessBg = (score: number) => {
    if (score >= 80) return '[&>div]:bg-green-500';
    if (score >= 60) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Career Path Visualizer
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Based on alumni with similar profiles
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Career Readiness Score */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Career Readiness</span>
              <span className={cn('text-lg font-bold', getReadinessColor(careerReadiness))}>
                {careerReadiness}%
              </span>
            </div>
            <Progress
              value={careerReadiness}
              className={cn('h-2', getReadinessBg(careerReadiness))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {careerReadiness >= 80 ? 'Excellent! You\'re well-prepared for placements.' :
               careerReadiness >= 60 ? 'Good progress. Focus on skill gaps to improve.' :
               'Needs attention. Work on recommended skills.'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Top Career Paths */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Top Career Paths for You
            </h4>
            <div className="space-y-2">
              {topCareerPaths.slice(0, 3).map((path, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{path.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {path.matchPercentage}% match • {path.alumniCount} alumni
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatSalary(path.avgSalary)}
                    </p>
                    <p className="text-xs text-muted-foreground">avg salary</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          {skillGaps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Skill Gaps to Address
              </h4>
              <div className="space-y-2">
                {skillGaps.slice(0, showAllSkillGaps ? skillGaps.length : 3).map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{gap.skill}</span>
                      <Badge variant="outline" className="text-xs">
                        {gap.importance}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {gap.hoursToLearn} hrs to learn
                      </p>
                    </div>
                  </div>
                ))}
                {skillGaps.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowAllSkillGaps(!showAllSkillGaps)}
                  >
                    {showAllSkillGaps ? 'Show less' : `+${skillGaps.length - 3} more skills`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Alumni Like You */}
          {alumniLikeYou.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Alumni With Similar Profiles
              </h4>
              <div className="space-y-2">
                {alumniLikeYou.slice(0, 3).map((alumni) => (
                  <div
                    key={alumni.alumniId}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm hover:bg-muted/50"
                    onClick={() => setSelectedAlumni(alumni)}
                  >
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                      <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alumni.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alumni.currentRole} at {alumni.company}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {alumni.similarityScore}% similar
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Recommendation */}
          {recommendations.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{recommendations[0].title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recommendations[0].description}
                  </p>
                  {recommendations[0].impact && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Impact: {recommendations[0].impact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{aiInsight}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Details Dialog */}
      <Dialog open={!!selectedAlumni} onOpenChange={() => setSelectedAlumni(null)}>
        <DialogContent className="max-w-md">
          {selectedAlumni && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <DialogTitle>{selectedAlumni.name}</DialogTitle>
                    <DialogDescription>
                      Batch of {selectedAlumni.graduationYear}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Similarity Score */}
                <div className="text-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                  <p className="text-sm text-muted-foreground mb-1">Profile Similarity</p>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedAlumni.similarityScore}%
                  </p>
                  <Progress
                    value={selectedAlumni.similarityScore}
                    className="h-2 mt-2 [&>div]:bg-indigo-500"
                  />
                </div>

                {/* Current Position */}
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Position</span>
                  </div>
                  <p className="text-lg font-bold">{selectedAlumni.currentRole}</p>
                  <p className="text-sm text-muted-foreground">{selectedAlumni.company}</p>
                </div>

                {/* Salary Range */}
                {selectedAlumni.salaryRange && (
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Salary Range</span>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatSalary(selectedAlumni.salaryRange.min)} - {formatSalary(selectedAlumni.salaryRange.max)}
                    </p>
                  </div>
                )}

                {/* Career Path */}
                {selectedAlumni.careerPath && selectedAlumni.careerPath.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Career Journey</h4>
                    <div className="space-y-2 relative">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-muted" />
                      {selectedAlumni.careerPath.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 relative">
                          <div className={cn(
                            'w-4 h-4 rounded-full border-2 shrink-0 z-10',
                            index === 0
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'bg-background border-muted-foreground'
                          )} />
                          <div className="pb-2">
                            <p className="text-sm font-medium">{step.role}</p>
                            <p className="text-xs text-muted-foreground">
                              {step.company} • {step.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Skills */}
                {selectedAlumni.keySkills && selectedAlumni.keySkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumni.keySkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advice */}
                {selectedAlumni.advice && (
                  <div className="p-3 rounded-lg bg-muted/50 italic">
                    <p className="text-sm">&quot;{selectedAlumni.advice}&quot;</p>
                  </div>
                )}

                {/* Connect Button */}
                <Button
                  className="w-full"
                  onClick={() => {
                    onAlumniClick?.(selectedAlumni.alumniId);
                    setSelectedAlumni(null);
                  }}
                >
                  Connect with {selectedAlumni.name.split(' ')[0]}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CareerPathVisualizerSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-48 mt-1" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full mt-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export default CareerPathVisualizer;
