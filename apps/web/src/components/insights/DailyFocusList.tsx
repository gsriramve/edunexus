'use client';

import { useState } from 'react';
import {
  Users,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  ChevronRight,
  UserX,
  BookOpen,
  Activity,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTeacherDailyFocus, type AtRiskStudent, type InsightSeverity } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface DailyFocusListProps {
  tenantId: string;
  subjectId?: string;
  limit?: number;
  onStudentClick?: (studentId: string) => void;
  className?: string;
}

const riskTypeIcons: Record<string, typeof AlertTriangle> = {
  attendance: UserX,
  grades: TrendingDown,
  engagement: Activity,
  behavioral: MessageSquare,
};

const riskTypeLabels: Record<string, string> = {
  attendance: 'Attendance',
  grades: 'Grades',
  engagement: 'Engagement',
  behavioral: 'Behavioral',
};

const severityConfig: Record<InsightSeverity, {
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
}> = {
  critical: {
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
};

export function DailyFocusList({
  tenantId,
  subjectId,
  limit = 5,
  onStudentClick,
  className,
}: DailyFocusListProps) {
  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);

  const { data, isLoading, error } = useTeacherDailyFocus(tenantId, subjectId, limit);

  if (isLoading) {
    return <DailyFocusListSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const { priorityStudents, totalStudentsMonitored, quickStats, aiSummary } = data;

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Students Needing Attention Today
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {priorityStudents.length} of {totalStudentsMonitored} students flagged
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
            {quickStats.criticalCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm">
                  <span className="font-semibold text-red-600">{quickStats.criticalCount}</span>
                  {' '}critical
                </span>
              </div>
            )}
            {quickStats.warningCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm">
                  <span className="font-semibold text-yellow-600">{quickStats.warningCount}</span>
                  {' '}warning
                </span>
              </div>
            )}
            {quickStats.improvedCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">
                  <span className="font-semibold text-green-600">{quickStats.improvedCount}</span>
                  {' '}improved
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {priorityStudents.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 inline-flex mb-3">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-green-700 dark:text-green-300">
                All Students On Track!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No students need immediate attention today.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityStudents.map((student) => {
                const config = severityConfig[student.severity];
                const Icon = riskTypeIcons[student.riskType] || AlertCircle;

                return (
                  <div
                    key={student.studentId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                      config.borderColor,
                      student.severity === 'critical' ? config.bgColor : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {student.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {student.studentName}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn('text-xs shrink-0', config.badgeColor, 'border-0')}
                        >
                          {student.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.primaryConcern}
                      </p>
                      {student.streakInfo && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {student.streakInfo}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn('p-1.5 rounded', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.textColor)} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{aiSummary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-md">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedStudent.studentName}</DialogTitle>
                    <DialogDescription>
                      {selectedStudent.rollNo} • {riskTypeLabels[selectedStudent.riskType]} concern
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Primary Concern */}
                <div className={cn(
                  'p-3 rounded-lg',
                  severityConfig[selectedStudent.severity].bgColor,
                  severityConfig[selectedStudent.severity].borderColor,
                  'border'
                )}>
                  <p className="text-sm font-medium">{selectedStudent.primaryConcern}</p>
                  {selectedStudent.streakInfo && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {selectedStudent.streakInfo}
                    </p>
                  )}
                </div>

                {/* Signals */}
                {selectedStudent.signals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Deviation from Baseline</h4>
                    <div className="space-y-2">
                      {selectedStudent.signals.map((signal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded bg-muted/50"
                        >
                          <div>
                            <p className="text-sm font-medium capitalize">{signal.metric.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">{signal.context}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">
                              -{signal.deviation}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {signal.current}% (baseline: {signal.baseline}%)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Action */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recommended Action</h4>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">{selectedStudent.recommendedAction}</p>
                  </div>
                </div>

                {/* Last Interaction */}
                {selectedStudent.lastInteraction && (
                  <p className="text-xs text-muted-foreground text-center">
                    {selectedStudent.lastInteraction}
                  </p>
                )}

                {/* Action Button */}
                <Button
                  className="w-full"
                  onClick={() => {
                    onStudentClick?.(selectedStudent.studentId);
                    setSelectedStudent(null);
                  }}
                >
                  View Student Profile
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

function DailyFocusListSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32 mt-1" />
          </div>
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyFocusList;
