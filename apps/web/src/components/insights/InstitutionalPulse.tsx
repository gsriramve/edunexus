'use client';

import { useState } from 'react';
import {
  Activity,
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Sparkles,
  Target,
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
import { PulseScore } from './PulseScore';
import { usePrincipalPulse, type DepartmentHealth, type RootCause, type TrendDirection } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface InstitutionalPulseProps {
  tenantId: string;
  departmentId?: string;
  onViewDepartment?: (departmentId: string) => void;
  className?: string;
}

const trendIcons: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColors: Record<TrendDirection, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  stable: 'text-muted-foreground',
};

export function InstitutionalPulse({
  tenantId,
  departmentId,
  onViewDepartment,
  className,
}: InstitutionalPulseProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data, isLoading, error } = usePrincipalPulse(tenantId, departmentId);

  if (isLoading) {
    return <InstitutionalPulseSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const {
    overallScore,
    trend,
    grade,
    departmentHealth,
    keyMetrics,
    rootCauses,
    aiAnalysis,
    recommendations,
  } = data;

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Institutional Pulse
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Real-time health score across all departments
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Main Score */}
          <div className="flex items-center justify-between mb-6">
            <PulseScore
              score={overallScore}
              previousScore={trend.previousValue}
              grade={grade}
              size="md"
            />

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Students"
                value={keyMetrics.totalStudents.toLocaleString()}
                icon={Users}
              />
              <MetricCard
                label="At Risk"
                value={`${keyMetrics.atRiskPercent}%`}
                icon={AlertTriangle}
                alert={keyMetrics.atRiskPercent > 10}
              />
              <MetricCard
                label="Attendance"
                value={`${keyMetrics.avgAttendance}%`}
                icon={Target}
                alert={keyMetrics.avgAttendance < 75}
              />
              <MetricCard
                label="Critical"
                value={keyMetrics.criticalAlerts.toString()}
                icon={AlertTriangle}
                alert={keyMetrics.criticalAlerts > 0}
              />
            </div>
          </div>

          {/* Department Overview */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Department Health
            </h4>
            <div className="space-y-2">
              {departmentHealth.slice(0, 4).map((dept) => (
                <DepartmentHealthBar
                  key={dept.departmentId}
                  department={dept}
                  onClick={() => onViewDepartment?.(dept.departmentId)}
                />
              ))}
            </div>
            {departmentHealth.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => setShowDetails(true)}
              >
                View all {departmentHealth.length} departments
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Root Causes Preview */}
          {rootCauses.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/30 border border-yellow-200/50 dark:border-yellow-800/50">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4" />
                Key Concerns
              </h4>
              <ul className="space-y-1">
                {rootCauses.slice(0, 2).map((cause, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      cause.impact === 'high' ? 'bg-red-500' :
                      cause.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    )} />
                    {cause.factor}: {cause.affectedCount} affected
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Analysis */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{aiAnalysis}</p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowDetails(true)}
          >
            View Full Analysis
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Institutional Pulse Analysis
            </DialogTitle>
            <DialogDescription>
              Comprehensive health overview and recommendations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* All Departments */}
            <div>
              <h4 className="text-sm font-semibold mb-3">All Departments</h4>
              <div className="space-y-2">
                {departmentHealth.map((dept) => (
                  <DepartmentHealthBar
                    key={dept.departmentId}
                    department={dept}
                    expanded
                    onClick={() => {
                      onViewDepartment?.(dept.departmentId);
                      setShowDetails(false);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Root Causes */}
            {rootCauses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Root Cause Analysis</h4>
                <div className="space-y-3">
                  {rootCauses.map((cause, index) => (
                    <RootCauseCard key={index} cause={cause} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Recommended Actions</h4>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rec.action}</p>
                        {rec.context && (
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.context}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: typeof Users;
  alert?: boolean;
}

function MetricCard({ label, value, icon: Icon, alert }: MetricCardProps) {
  return (
    <div className={cn(
      'p-2 rounded-lg border text-center',
      alert ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'bg-muted/50'
    )}>
      <Icon className={cn('h-4 w-4 mx-auto mb-1', alert ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')} />
      <p className={cn('text-lg font-bold', alert ? 'text-red-600 dark:text-red-400' : '')}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface DepartmentHealthBarProps {
  department: DepartmentHealth;
  expanded?: boolean;
  onClick?: () => void;
}

function DepartmentHealthBar({ department, expanded, onClick }: DepartmentHealthBarProps) {
  const TrendIcon = trendIcons[department.trend];

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm',
        department.healthScore < 60 ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/30' : ''
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {department.departmentCode}
          </Badge>
          <span className="text-sm font-medium">{department.departmentName}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={cn('h-4 w-4', trendColors[department.trend])} />
          <span className={cn(
            'text-sm font-bold',
            department.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
            department.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
          )}>
            {department.healthScore}
          </span>
        </div>
      </div>

      <Progress
        value={department.healthScore}
        className={cn('h-1.5', {
          '[&>div]:bg-green-500': department.healthScore >= 80,
          '[&>div]:bg-yellow-500': department.healthScore >= 60 && department.healthScore < 80,
          '[&>div]:bg-red-500': department.healthScore < 60,
        })}
      />

      {expanded && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Students:</span>{' '}
            <span className="font-medium">{department.studentCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Attendance:</span>{' '}
            <span className={cn('font-medium', department.avgAttendance < 75 ? 'text-red-600' : '')}>
              {department.avgAttendance}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">At Risk:</span>{' '}
            <span className={cn('font-medium', department.atRiskCount > 0 ? 'text-red-600' : '')}>
              {department.atRiskCount}
            </span>
          </div>
        </div>
      )}

      {department.topConcerns.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {department.topConcerns.slice(0, 2).map((concern, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              {concern}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface RootCauseCardProps {
  cause: RootCause;
}

function RootCauseCard({ cause }: RootCauseCardProps) {
  return (
    <div className={cn(
      'p-3 rounded-lg border',
      cause.impact === 'high' ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/30' :
      cause.impact === 'medium' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/30 dark:bg-yellow-950/30' :
      'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/30'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            cause.impact === 'high' ? 'bg-red-500' :
            cause.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          )} />
          <span className="font-medium text-sm">{cause.factor}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {cause.affectedCount} affected
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{cause.description}</p>
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Suggested:</span> {cause.suggestedAction}
        </p>
      </div>
    </div>
  );
}

function InstitutionalPulseSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-40 w-40 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-24" />
            ))}
          </div>
        </div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default InstitutionalPulse;
