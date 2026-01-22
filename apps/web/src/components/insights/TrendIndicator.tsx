'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrendDirection = 'up' | 'down' | 'stable';

interface TrendIndicatorProps {
  direction: TrendDirection;
  value?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  invertColors?: boolean; // For metrics where down is good (like cost)
  className?: string;
}

export function TrendIndicator({
  direction,
  value,
  label,
  size = 'md',
  showValue = true,
  invertColors = false,
  className,
}: TrendIndicatorProps) {
  const sizeConfig = {
    sm: { icon: 'h-3 w-3', text: 'text-xs', gap: 'gap-0.5' },
    md: { icon: 'h-4 w-4', text: 'text-sm', gap: 'gap-1' },
    lg: { icon: 'h-5 w-5', text: 'text-base', gap: 'gap-1.5' },
  };

  const getColor = () => {
    if (direction === 'stable') return 'text-muted-foreground';
    const isPositive = invertColors ? direction === 'down' : direction === 'up';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getBgColor = () => {
    if (direction === 'stable') return 'bg-muted/50';
    const isPositive = invertColors ? direction === 'down' : direction === 'up';
    return isPositive ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950';
  };

  const Icon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5',
        sizeConfig[size].gap,
        getBgColor(),
        getColor(),
        className
      )}
    >
      <Icon className={sizeConfig[size].icon} />
      {showValue && value !== undefined && (
        <span className={cn('font-medium', sizeConfig[size].text)}>
          {Math.abs(value)}%
        </span>
      )}
      {label && (
        <span className={cn(sizeConfig[size].text, 'text-muted-foreground')}>
          {label}
        </span>
      )}
    </div>
  );
}

interface TrendBadgeProps {
  current: number;
  previous: number;
  unit?: string;
  timeframe?: string;
  invertColors?: boolean;
  className?: string;
}

export function TrendBadge({
  current,
  previous,
  unit = '',
  timeframe = 'vs last period',
  invertColors = false,
  className,
}: TrendBadgeProps) {
  const changePercent =
    previous !== 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  const direction: TrendDirection =
    changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-2xl font-bold">
        {current}
        {unit}
      </span>
      <div className="flex flex-col">
        <TrendIndicator
          direction={direction}
          value={Math.abs(changePercent)}
          invertColors={invertColors}
          size="sm"
        />
        <span className="text-xs text-muted-foreground">{timeframe}</span>
      </div>
    </div>
  );
}

export default TrendIndicator;
