'use client';

import { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Users,
  Activity,
  Sparkles,
  CheckCircle,
  XCircle,
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
import { usePlatformTenantHealth, type TenantHealth, type InsightSeverity } from '@/hooks/use-insights';
import { cn } from '@/lib/utils';

interface TenantHealthCardProps {
  limit?: number;
  onTenantClick?: (tenantId: string) => void;
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

export function TenantHealthCard({
  limit = 10,
  onTenantClick,
  className,
}: TenantHealthCardProps) {
  const [selectedTenant, setSelectedTenant] = useState<TenantHealth | null>(null);

  const { data, isLoading, error } = usePlatformTenantHealth(limit);

  if (isLoading) {
    return <TenantHealthCardSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const { tenants, atRiskCount, healthyCount, totalMRR, aiSummary, successPatterns } = data;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600 dark:text-red-400';
    if (risk >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getChurnRiskBg = (risk: number) => {
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
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Tenant Health Monitor
                  <Badge variant="secondary" className="font-normal">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Churn risk analysis and tenant engagement
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {atRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {healthyCount}
              </p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatCurrency(totalMRR)}
              </p>
              <p className="text-xs text-muted-foreground">Total MRR</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {tenants.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 inline-flex mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-green-700 dark:text-green-300">
                All Tenants Healthy
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No tenants currently showing churn risk signals.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.slice(0, 5).map((tenant) => {
                const config = severityConfig[tenant.riskLevel];

                return (
                  <div
                    key={tenant.tenantId}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                      config.borderColor,
                      config.bgColor
                    )}
                    onClick={() => setSelectedTenant(tenant)}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      tenant.churnRisk >= 70 ? 'bg-red-100 dark:bg-red-900' :
                      tenant.churnRisk >= 40 ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-green-100 dark:bg-green-900'
                    )}>
                      <Building2 className={cn(
                        'h-5 w-5',
                        getChurnRiskColor(tenant.churnRisk)
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {tenant.tenantName}
                        </p>
                        <Badge variant="outline" className={cn('text-xs border-0', config.badgeColor)}>
                          {tenant.churnRisk}% risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tenant.activeUsers} users
                        </span>
                        <span className="flex items-center gap-1">
                          {tenant.loginTrend < 0 ? (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          ) : (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          )}
                          {Math.abs(tenant.loginTrend)}% logins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {formatCurrency(tenant.mrr)}
                        </p>
                        <p className="text-xs text-muted-foreground">MRR</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}

              {tenants.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {/* View all */}}
                >
                  View all {tenants.length} tenants
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Success Patterns */}
          {successPatterns && successPatterns.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Success Patterns</h4>
              <div className="space-y-2">
                {successPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">
                      {pattern.pattern} ({pattern.adoptionRate}% adoption)
                    </span>
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

      {/* Tenant Details Dialog */}
      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent className="max-w-md">
          {selectedTenant && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-3 rounded-lg',
                    selectedTenant.churnRisk >= 70 ? 'bg-red-100 dark:bg-red-900' :
                    selectedTenant.churnRisk >= 40 ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-green-100 dark:bg-green-900'
                  )}>
                    <Building2 className={cn(
                      'h-6 w-6',
                      getChurnRiskColor(selectedTenant.churnRisk)
                    )} />
                  </div>
                  <div>
                    <DialogTitle>{selectedTenant.tenantName}</DialogTitle>
                    <DialogDescription>
                      {selectedTenant.plan} Plan • Since {new Date(selectedTenant.createdAt).toLocaleDateString()}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Churn Risk Score */}
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Churn Risk</p>
                  <p className={cn(
                    'text-4xl font-bold',
                    getChurnRiskColor(selectedTenant.churnRisk)
                  )}>
                    {selectedTenant.churnRisk}%
                  </p>
                  <Progress
                    value={selectedTenant.churnRisk}
                    className={cn('h-2 mt-2', getChurnRiskBg(selectedTenant.churnRisk))}
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-2xl font-bold">{selectedTenant.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-2xl font-bold">{selectedTenant.featuresUsed}</p>
                    <p className="text-xs text-muted-foreground">Features Used</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <div className="flex items-center justify-center gap-1">
                      {selectedTenant.loginTrend < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      <p className={cn(
                        'text-2xl font-bold',
                        selectedTenant.loginTrend < 0 ? 'text-red-600' : 'text-green-600'
                      )}>
                        {Math.abs(selectedTenant.loginTrend)}%
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">Login Trend</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-2xl font-bold">{formatCurrency(selectedTenant.mrr)}</p>
                    <p className="text-xs text-muted-foreground">MRR</p>
                  </div>
                </div>

                {/* Risk Signals */}
                {selectedTenant.riskSignals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Risk Signals
                    </h4>
                    <div className="space-y-2">
                      {selectedTenant.riskSignals.map((signal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 rounded bg-red-50 dark:bg-red-950"
                        >
                          <span className="text-sm">{signal.description}</span>
                          <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900">
                            +{signal.weight}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Action */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recommended Action</h4>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">{selectedTenant.recommendedAction}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  onClick={() => {
                    onTenantClick?.(selectedTenant.tenantId);
                    setSelectedTenant(null);
                  }}
                >
                  View Tenant Details
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

function TenantHealthCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-52 mt-1" />
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

export default TenantHealthCard;
