'use client';

import { ReactNode } from 'react';
import {
  Lightbulb,
  Brain,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type InsightType = 'discovery' | 'prediction' | 'recommendation' | 'alert';

interface AhaCardProps {
  title: string;
  subtitle?: string;
  type?: InsightType;
  score?: number;
  scoreLabel?: string;
  children: ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }[];
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
  aiPowered?: boolean;
}

const typeConfig: Record<
  InsightType,
  {
    icon: typeof Lightbulb;
    gradient: string;
    accent: string;
  }
> = {
  discovery: {
    icon: Lightbulb,
    gradient: 'from-amber-500/10 to-yellow-500/10',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  prediction: {
    icon: Brain,
    gradient: 'from-purple-500/10 to-indigo-500/10',
    accent: 'text-purple-600 dark:text-purple-400',
  },
  recommendation: {
    icon: Sparkles,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  alert: {
    icon: Lightbulb,
    gradient: 'from-red-500/10 to-orange-500/10',
    accent: 'text-red-600 dark:text-red-400',
  },
};

export function AhaCard({
  title,
  subtitle,
  type = 'discovery',
  score,
  scoreLabel,
  children,
  actions,
  badge,
  badgeVariant = 'secondary',
  icon,
  isLoading = false,
  className,
  aiPowered = true,
}: AhaCardProps) {
  const config = typeConfig[type];
  const Icon = icon ? null : config.icon;

  if (isLoading) {
    return <AhaCardSkeleton />;
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        className
      )}
    >
      {/* Gradient header accent */}
      <div
        className={cn(
          'h-1 bg-gradient-to-r',
          config.gradient.replace('/10', '')
        )}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg bg-gradient-to-br shrink-0',
                config.gradient
              )}
            >
              {icon || (Icon && <Icon className={cn('h-5 w-5', config.accent)} />)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{title}</CardTitle>
                {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
              </div>
              {subtitle && (
                <CardDescription className="mt-0.5">{subtitle}</CardDescription>
              )}
            </div>
          </div>

          {score !== undefined && (
            <div className="text-right">
              <p className={cn('text-2xl font-bold', config.accent)}>{score}</p>
              {scoreLabel && (
                <p className="text-xs text-muted-foreground">{scoreLabel}</p>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {children}

        {/* AI Powered indicator */}
        {aiPowered && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t">
            <Sparkles className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              AI-powered insight
            </span>
          </div>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className={index === 0 ? 'flex-1' : undefined}
              >
                {action.label}
                {index === 0 && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AhaCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-muted" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-12" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardContent>
    </Card>
  );
}

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'auto' | 'green' | 'blue' | 'purple';
  className?: string;
}

export function ScoreCircle({
  score,
  maxScore = 100,
  label,
  size = 'md',
  colorScheme = 'auto',
  className,
}: ScoreCircleProps) {
  const percentage = (score / maxScore) * 100;

  const sizeConfig = {
    sm: { size: 48, stroke: 4, fontSize: 'text-sm' },
    md: { size: 64, stroke: 6, fontSize: 'text-lg' },
    lg: { size: 80, stroke: 8, fontSize: 'text-2xl' },
  };

  const getColor = () => {
    if (colorScheme !== 'auto') {
      const colors = {
        green: 'stroke-green-500',
        blue: 'stroke-blue-500',
        purple: 'stroke-purple-500',
      };
      return colors[colorScheme];
    }
    if (percentage >= 80) return 'stroke-green-500';
    if (percentage >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          className="transform -rotate-90"
          width={config.size}
          height={config.size}
        >
          <circle
            className="stroke-muted"
            strokeWidth={config.stroke}
            fill="none"
            r={radius}
            cx={config.size / 2}
            cy={config.size / 2}
          />
          <circle
            className={cn('transition-all duration-500', getColor())}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            fill="none"
            r={radius}
            cx={config.size / 2}
            cy={config.size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', config.fontSize)}>{score}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  );
}

export default AhaCard;
