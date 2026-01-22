'use client';

import { useState } from 'react';
import {
  CreditCard,
  AlertTriangle,
  TrendingDown,
  ChevronRight,
  Phone,
  MessageSquare,
  DollarSign,
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
import { useAdminFeeRisk, type FeeRiskStudent, type InsightSeverity } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface FeeRiskPredictorProps {
  tenantId: string;
  minRiskScore?: number;
  limit?: number;
  departmentId?: string;
  onStudentClick?: (studentId: string) => void;
  className?: string;
}

const severityConfig: Record<InsightSeverity, {
  bgColor: string;
  textColor: string;
  badgeColor: string;
}> = {
  critical: {
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
};

export function FeeRiskPredictor({
  tenantId,
  minRiskScore = 50,
  limit = 10,
  departmentId,
  onStudentClick,
  className,
}: FeeRiskPredictorProps) {
  const [selectedStudent, setSelectedStudent] = useState<FeeRiskStudent | null>(null);

  const { data, isLoading, error } = useAdminFeeRisk(tenantId, minRiskScore, limit, departmentId);

  if (isLoading) {
    return <FeeRiskPredictorSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const { students, atRiskCount, totalAtRiskAmount, totalStudentsAnalyzed, collectionInsights, aiSummary } = data;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Fee Default Predictor
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Students with high default probability
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {atRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalAtRiskAmount)}
              </p>
              <p className="text-xs text-muted-foreground">At Risk Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {totalStudentsAnalyzed}
              </p>
              <p className="text-xs text-muted-foreground">Analyzed</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 inline-flex mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-green-700 dark:text-green-300">
                Fee Collection On Track
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No students currently meet the risk threshold of {minRiskScore}%.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => {
                const config = severityConfig[student.riskLevel];

                return (
                  <div
                    key={student.studentId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                      student.riskLevel === 'critical' ? 'border-red-200 dark:border-red-800' : 'border-yellow-200 dark:border-yellow-800',
                      config.bgColor
                    )}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn('text-sm', config.badgeColor)}>
                        {student.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {student.studentName}
                        </p>
                        <Badge variant="outline" className={cn('text-xs border-0', config.badgeColor)}>
                          {student.defaultProbability}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.department} • Due: {formatCurrency(student.currentDue)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={cn('text-lg font-bold', config.textColor)}>
                          {formatCurrency(student.currentDue)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}

              {students.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* View all */}}
                >
                  View all {students.length} at-risk students
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Collection Insights */}
          {collectionInsights && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Collection Insights</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-muted/50 text-center">
                  <p className="font-medium">{collectionInsights.bestDay}</p>
                  <p className="text-muted-foreground">Best Day</p>
                </div>
                <div className="p-2 rounded bg-muted/50 text-center">
                  <p className="font-medium">{collectionInsights.bestChannel}</p>
                  <p className="text-muted-foreground">Best Channel</p>
                </div>
                <div className="p-2 rounded bg-muted/50 text-center">
                  <p className="font-medium">{collectionInsights.avgResponseRate}%</p>
                  <p className="text-muted-foreground">Response Rate</p>
                </div>
              </div>
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
                    <AvatarFallback className={severityConfig[selectedStudent.riskLevel].badgeColor}>
                      {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedStudent.studentName}</DialogTitle>
                    <DialogDescription>
                      {selectedStudent.rollNo} • {selectedStudent.department}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Risk Score */}
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Default Probability</p>
                  <p className={cn(
                    'text-4xl font-bold',
                    severityConfig[selectedStudent.riskLevel].textColor
                  )}>
                    {selectedStudent.defaultProbability}%
                  </p>
                  <Progress
                    value={selectedStudent.defaultProbability}
                    className={cn('h-2 mt-2', {
                      '[&>div]:bg-red-500': selectedStudent.defaultProbability > 70,
                      '[&>div]:bg-yellow-500': selectedStudent.defaultProbability > 50 && selectedStudent.defaultProbability <= 70,
                      '[&>div]:bg-green-500': selectedStudent.defaultProbability <= 50,
                    })}
                  />
                </div>

                {/* Amount Due */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Current Due</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(selectedStudent.currentDue)}
                  </span>
                </div>

                {/* Risk Signals */}
                {selectedStudent.riskSignals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Risk Signals</h4>
                    <div className="space-y-2">
                      {selectedStudent.riskSignals.map((signal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded bg-muted/50"
                        >
                          <span className="text-sm">{signal.description}</span>
                          <Badge variant="outline" className="text-xs">
                            +{signal.weight}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Payment History</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg border text-center">
                      <p className="text-lg font-bold text-red-600">
                        {selectedStudent.paymentHistory.missedPayments}
                      </p>
                      <p className="text-xs text-muted-foreground">Missed</p>
                    </div>
                    <div className="p-2 rounded-lg border text-center">
                      <p className="text-lg font-bold text-yellow-600">
                        {selectedStudent.paymentHistory.partialPayments}
                      </p>
                      <p className="text-xs text-muted-foreground">Partial</p>
                    </div>
                    <div className="p-2 rounded-lg border text-center">
                      <p className="text-lg font-bold">
                        {selectedStudent.paymentHistory.avgDaysLate || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Days Late</p>
                    </div>
                  </div>
                </div>

                {/* Recommended Action */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recommended Action</h4>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">{selectedStudent.recommendedAction}</p>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    SMS
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      onStudentClick?.(selectedStudent.studentId);
                      setSelectedStudent(null);
                    }}
                  >
                    Profile
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FeeRiskPredictorSkeleton() {
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
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
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

export default FeeRiskPredictor;
