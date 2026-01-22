'use client';

import { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  ChevronRight,
  Clock,
  Activity,
  Sparkles,
  CheckCircle,
  Settings,
  BarChart3,
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
import { useLabEquipmentRisk, type EquipmentAtRisk, type InsightSeverity } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface EquipmentRiskAlertProps {
  tenantId: string;
  labId?: string;
  minRiskScore?: number;
  onEquipmentClick?: (equipmentId: string) => void;
  className?: string;
}

const severityConfig: Record<InsightSeverity, {
  bgColor: string;
  textColor: string;
  badgeColor: string;
  borderColor: string;
}> = {
  critical: {
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
};

export function EquipmentRiskAlert({
  tenantId,
  labId,
  minRiskScore = 50,
  onEquipmentClick,
  className,
}: EquipmentRiskAlertProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentAtRisk | null>(null);

  const { data, isLoading, error } = useLabEquipmentRisk(tenantId, labId, minRiskScore);

  if (isLoading) {
    return <EquipmentRiskAlertSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const { totalEquipment, atRiskCount, equipmentAtRisk, labEfficiency, aiSummary } = data;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600 dark:text-red-400';
    if (risk >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getRiskBg = (risk: number) => {
    if (risk >= 70) return '[&>div]:bg-red-500';
    if (risk >= 40) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-500';
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
                <Wrench className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Equipment Risk Predictor
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Predictive maintenance alerts
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalEquipment}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {atRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalEquipment - atRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {equipmentAtRisk.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 inline-flex mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-green-700 dark:text-green-300">
                All Equipment Healthy
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No equipment currently shows {minRiskScore}%+ failure risk.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {equipmentAtRisk.slice(0, 5).map((equipment) => {
                const config = severityConfig[equipment.riskLevel];

                return (
                  <div
                    key={equipment.equipmentId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                      config.borderColor,
                      config.bgColor
                    )}
                    onClick={() => setSelectedEquipment(equipment)}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      equipment.failureProbability >= 70 ? 'bg-red-100 dark:bg-red-900' :
                      equipment.failureProbability >= 40 ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-green-100 dark:bg-green-900'
                    )}>
                      <Settings className={cn(
                        'h-5 w-5',
                        getRiskColor(equipment.failureProbability)
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {equipment.name}
                        </p>
                        <Badge variant="outline" className={cn('text-xs border-0', config.badgeColor)}>
                          {equipment.failureProbability}% risk
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {equipment.labName} • {equipment.station}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}

              {equipmentAtRisk.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* View all */}}
                >
                  View all {equipmentAtRisk.length} at-risk equipment
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Lab Efficiency */}
          {labEfficiency.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Lab Utilization
              </h4>
              <div className="space-y-2">
                {labEfficiency.slice(0, 3).map((lab) => (
                  <div key={lab.labId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{lab.labName}</span>
                      <span className={cn(
                        'font-medium',
                        lab.utilization < 50 ? 'text-yellow-600' :
                        lab.utilization > 90 ? 'text-red-600' :
                        'text-green-600'
                      )}>
                        {lab.utilization}%
                      </span>
                    </div>
                    <Progress
                      value={lab.utilization}
                      className={cn('h-1.5', {
                        '[&>div]:bg-yellow-500': lab.utilization < 50,
                        '[&>div]:bg-green-500': lab.utilization >= 50 && lab.utilization <= 90,
                        '[&>div]:bg-red-500': lab.utilization > 90,
                      })}
                    />
                    {lab.recommendation && (
                      <p className="text-xs text-muted-foreground italic">{lab.recommendation}</p>
                    )}
                  </div>
                ))}
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

      {/* Equipment Details Dialog */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="max-w-md">
          {selectedEquipment && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-3 rounded-lg',
                    selectedEquipment.failureProbability >= 70 ? 'bg-red-100 dark:bg-red-900' :
                    selectedEquipment.failureProbability >= 40 ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-green-100 dark:bg-green-900'
                  )}>
                    <Settings className={cn(
                      'h-6 w-6',
                      getRiskColor(selectedEquipment.failureProbability)
                    )} />
                  </div>
                  <div>
                    <DialogTitle>{selectedEquipment.name}</DialogTitle>
                    <DialogDescription>
                      {selectedEquipment.labName} • {selectedEquipment.station}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Failure Probability */}
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Failure Probability</p>
                  <p className={cn(
                    'text-4xl font-bold',
                    getRiskColor(selectedEquipment.failureProbability)
                  )}>
                    {selectedEquipment.failureProbability}%
                  </p>
                  <Progress
                    value={selectedEquipment.failureProbability}
                    className={cn('h-2 mt-2', getRiskBg(selectedEquipment.failureProbability))}
                  />
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg border text-center">
                    <p className="text-lg font-bold">{selectedEquipment.usageStats.hoursUsed}</p>
                    <p className="text-xs text-muted-foreground">Hours Used</p>
                  </div>
                  <div className="p-2 rounded-lg border text-center">
                    <p className="text-lg font-bold">{selectedEquipment.usageStats.usageVsAverage}%</p>
                    <p className="text-xs text-muted-foreground">vs Average</p>
                  </div>
                  <div className="p-2 rounded-lg border text-center">
                    <p className="text-lg font-bold">{selectedEquipment.maintenanceHistory.totalIssues}</p>
                    <p className="text-xs text-muted-foreground">Issues</p>
                  </div>
                </div>

                {/* Maintenance History */}
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Maintenance History</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Maintenance</span>
                    <span>
                      {selectedEquipment.maintenanceHistory.lastMaintenanceDate || 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Days Since</span>
                    <span className={cn(
                      selectedEquipment.maintenanceHistory.daysSinceLastMaintenance > 180
                        ? 'text-red-600'
                        : ''
                    )}>
                      {selectedEquipment.maintenanceHistory.daysSinceLastMaintenance} days
                    </span>
                  </div>
                </div>

                {/* Risk Factors */}
                {selectedEquipment.riskFactors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Risk Factors
                    </h4>
                    <div className="space-y-2">
                      {selectedEquipment.riskFactors.map((factor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded bg-red-50 dark:bg-red-950"
                        >
                          <span className="text-sm">{factor.description}</span>
                          <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900">
                            +{factor.weight}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated Replacement Cost */}
                {selectedEquipment.estimatedReplacementCost && (
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-sm">Est. Replacement Cost</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(selectedEquipment.estimatedReplacementCost)}
                    </span>
                  </div>
                )}

                {/* Recommended Action */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recommended Action</h4>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">{selectedEquipment.recommendedAction}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  onClick={() => {
                    onEquipmentClick?.(selectedEquipment.equipmentId);
                    setSelectedEquipment(null);
                  }}
                >
                  Schedule Maintenance
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

function EquipmentRiskAlertSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-40 mt-1" />
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

export default EquipmentRiskAlert;
