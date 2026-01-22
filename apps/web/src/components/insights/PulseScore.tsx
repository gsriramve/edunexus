'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PulseScoreProps {
  score: number;
  previousScore?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const gradeColors: Record<string, { ring: string; text: string; bg: string }> = {
  A: {
    ring: 'stroke-green-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950',
  },
  B: {
    ring: 'stroke-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  C: {
    ring: 'stroke-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
  },
  D: {
    ring: 'stroke-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950',
  },
  F: {
    ring: 'stroke-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950',
  },
};

function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function PulseScore({
  score,
  previousScore,
  grade,
  label = 'Health Score',
  sublabel,
  size = 'md',
  animated = true,
  className,
}: PulseScoreProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const actualGrade = grade || getGradeFromScore(score);
  const colors = gradeColors[actualGrade];

  const sizeConfig = {
    sm: { size: 120, stroke: 8, scoreSize: 'text-2xl', gradeSize: 'text-sm' },
    md: { size: 160, stroke: 10, scoreSize: 'text-4xl', gradeSize: 'text-base' },
    lg: { size: 200, stroke: 12, scoreSize: 'text-5xl', gradeSize: 'text-lg' },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2 - 10;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;

  // Animate score on mount
  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, Math.round(increment * step));
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animated]);

  // Calculate trend
  const trend =
    previousScore !== undefined
      ? score > previousScore
        ? 'up'
        : score < previousScore
          ? 'down'
          : 'stable'
      : undefined;

  const trendDelta =
    previousScore !== undefined
      ? Math.round(((score - previousScore) / Math.max(previousScore, 1)) * 100)
      : undefined;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Circular progress with pulse animation */}
      <div
        className="relative"
        style={{ width: config.size, height: config.size }}
      >
        {/* Background pulse effect */}
        {animated && (
          <div
            className={cn(
              'absolute inset-2 rounded-full animate-pulse',
              colors.bg
            )}
          />
        )}

        <svg
          className="transform -rotate-90"
          width={config.size}
          height={config.size}
        >
          {/* Background track */}
          <circle
            className="stroke-muted"
            strokeWidth={config.stroke}
            fill="none"
            r={radius}
            cx={config.size / 2}
            cy={config.size / 2}
          />
          {/* Progress arc */}
          <circle
            className={cn(
              'transition-all duration-1000 ease-out',
              colors.ring
            )}
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

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', config.scoreSize, colors.text)}>
            {displayScore}
          </span>
          <span
            className={cn(
              'font-semibold px-2 py-0.5 rounded',
              config.gradeSize,
              colors.bg,
              colors.text
            )}
          >
            Grade {actualGrade}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center mt-3">
        <p className="text-sm font-medium flex items-center gap-1.5 justify-center">
          <Activity className={cn('h-4 w-4', colors.text)} />
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
        )}
      </div>

      {/* Trend indicator */}
      {trend && trendDelta !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-sm',
            trend === 'up'
              ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
              : trend === 'down'
                ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
          <span className="font-medium">
            {trendDelta > 0 ? '+' : ''}
            {trendDelta}%
          </span>
          <span className="text-xs opacity-80">vs last month</span>
        </div>
      )}
    </div>
  );
}

interface MiniPulseProps {
  score: number;
  label?: string;
  size?: number;
  className?: string;
}

export function MiniPulse({ score, label, size = 40, className }: MiniPulseProps) {
  const grade = getGradeFromScore(score);
  const colors = gradeColors[grade];
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="stroke-muted"
            strokeWidth={3}
            fill="none"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={colors.ring}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xs font-bold', colors.text)}>{score}</span>
        </div>
      </div>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

export default PulseScore;
