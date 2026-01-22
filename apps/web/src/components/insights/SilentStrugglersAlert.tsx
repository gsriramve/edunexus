'use client';

import { useState } from 'react';
import {
  Users,
  AlertTriangle,
  TrendingDown,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useHODSilentStrugglers, type SilentStruggler } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface SilentStrugglersAlertProps {
  tenantId: string;
  departmentId: string;
  limit?: number;
  onStudentClick?: (studentId: string) => void;
  className?: string;
}

export function SilentStrugglersAlert({
  tenantId,
  departmentId,
  limit = 10,
  onStudentClick,
  className,
}: SilentStrugglersAlertProps) {
  const [selectedStudent, setSelectedStudent] = useState<SilentStruggler | null>(null);

  const { data, isLoading, error } = useHODSilentStrugglers(tenantId, departmentId, limit);

  if (isLoading) {
    return <SilentStrugglersAlertSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const { students, totalIdentified, aiInsight, commonPatterns, departmentName } = data;

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Silent Strugglers
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Students with good attendance but declining grades
                </CardDescription>
              </div>
            </div>
            {totalIdentified > 0 && (
              <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                {totalIdentified} identified
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 inline-flex mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-green-700 dark:text-green-300">
                No Silent Strugglers Detected
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                All students with good attendance are also performing well academically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-950/30 cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => setSelectedStudent(student)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                      {student.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {student.studentName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Sem {student.semester}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="text-green-600 dark:text-green-400">
                        {student.attendance}% attendance
                      </span>
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Grades declining
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}

              {students.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* View all */}}
                >
                  View all {students.length} students
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Common Patterns */}
          {commonPatterns.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Common Patterns</h4>
              <div className="space-y-2">
                {commonPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-muted-foreground">
                      {pattern.pattern} ({pattern.count} students)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{aiInsight}</p>
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
                    <AvatarFallback className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                      {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedStudent.studentName}</DialogTitle>
                    <DialogDescription>
                      {selectedStudent.rollNo} • Semester {selectedStudent.semester}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Paradox Highlight */}
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    The Silent Struggler Paradox
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedStudent.attendance}% attendance (above threshold) but grades are consistently declining.
                    This student goes unnoticed by traditional monitoring.
                  </p>
                </div>

                {/* Recent Exam Scores */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Recent Exam Trend
                  </h4>
                  <div className="space-y-2">
                    {selectedStudent.recentExamScores.map((exam, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded bg-muted/50"
                      >
                        <span className="text-sm">{exam.exam}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{exam.score}%</span>
                          {exam.change !== 0 && (
                            <span className={cn(
                              'text-xs',
                              exam.change < 0 ? 'text-red-600' : 'text-green-600'
                            )}>
                              {exam.change > 0 ? '+' : ''}{exam.change}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Possible Causes */}
                {selectedStudent.possibleCauses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Possible Causes</h4>
                    <ul className="space-y-1">
                      {selectedStudent.possibleCauses.map((cause, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Intervention */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recommended Intervention</h4>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">{selectedStudent.recommendedIntervention}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Pattern detected for {selectedStudent.daysInPattern} days
                </p>

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

function SilentStrugglersAlertSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56 mt-1" />
          </div>
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

export default SilentStrugglersAlert;
