'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { Goal } from '@/hooks/use-ai-guidance';

interface ProgressUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onUpdate: (goalId: string, progress: number, currentValue?: number) => void;
  isLoading?: boolean;
}

export function ProgressUpdateDialog({
  open,
  onOpenChange,
  goal,
  onUpdate,
  isLoading,
}: ProgressUpdateDialogProps) {
  const [progress, setProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    if (goal) {
      setProgress(goal.progress);
      setCurrentValue(goal.currentValue?.toString() || '');
    }
  }, [goal, open]);

  if (!goal) return null;

  const hasTargetValue = goal.targetValue !== undefined && goal.targetValue > 0;

  const handleProgressChange = (value: number) => {
    setProgress(value);
    // If there's a target value, calculate the current value based on progress
    if (hasTargetValue && goal.targetValue) {
      const calculatedValue = Math.round((value / 100) * goal.targetValue);
      setCurrentValue(calculatedValue.toString());
    }
  };

  const handleCurrentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentValue(value);
    // Calculate progress based on current value
    if (hasTargetValue && goal.targetValue && value) {
      const numValue = parseFloat(value);
      const calculatedProgress = Math.min(100, Math.round((numValue / goal.targetValue) * 100));
      setProgress(calculatedProgress);
    }
  };

  const handleSubmit = () => {
    const newCurrentValue = currentValue ? parseFloat(currentValue) : undefined;
    onUpdate(goal.id, progress, newCurrentValue);
  };

  const isComplete = progress >= 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Update Progress
          </DialogTitle>
          <DialogDescription>{goal.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <span className={`text-2xl font-bold ${isComplete ? 'text-green-500' : ''}`}>
                {progress}%
              </span>
            </div>

            <input
              type="range"
              value={progress}
              onChange={(e) => handleProgressChange(parseInt(e.target.value))}
              min={0}
              max={100}
              step={5}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <Progress
              value={progress}
              className={`h-3 ${isComplete ? '[&>div]:bg-green-500' : ''}`}
            />
          </div>

          {/* Current Value Input (if target value exists) */}
          {hasTargetValue && (
            <div className="space-y-2">
              <Label htmlFor="currentValue">
                Current Value
                {goal.unit && <span className="text-muted-foreground"> ({goal.unit})</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="currentValue"
                  type="number"
                  value={currentValue}
                  onChange={handleCurrentValueChange}
                  min="0"
                  max={goal.targetValue}
                  step="any"
                  className="flex-1"
                />
                <span className="text-muted-foreground">/ {goal.targetValue}</span>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isComplete && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Goal Complete!</p>
                <p className="text-xs">This goal will be marked as completed.</p>
              </div>
            </div>
          )}

          {/* Quick Progress Buttons */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Update</Label>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={progress === value ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleProgressChange(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : isComplete ? 'Mark Complete' : 'Update Progress'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProgressUpdateDialog;
