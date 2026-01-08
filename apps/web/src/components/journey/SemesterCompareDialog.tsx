'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  GitCompare,
} from 'lucide-react';
import type { SemesterComparison } from '@/hooks/use-student-journey';

interface SemesterCompareDialogProps {
  snapshots: Array<{ academicYear: string; semester: number }>;
  comparison: SemesterComparison | undefined;
  isLoading: boolean;
  onCompare: (
    year1: string,
    sem1: number,
    year2: string,
    sem2: number
  ) => void;
}

const getTrendIcon = (value?: number) => {
  if (!value) return null;
  if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-yellow-500" />;
};

const getTrendColor = (value?: number) => {
  if (!value) return 'text-muted-foreground';
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-yellow-500';
};

const formatChange = (value?: number, suffix: string = '') => {
  if (value === undefined || value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}${suffix}`;
};

export function SemesterCompareDialog({
  snapshots,
  comparison,
  isLoading,
  onCompare,
}: SemesterCompareDialogProps) {
  const [open, setOpen] = useState(false);
  const [semester1, setSemester1] = useState<{ year: string; sem: number } | null>(null);
  const [semester2, setSemester2] = useState<{ year: string; sem: number } | null>(null);

  const handleCompare = () => {
    if (semester1 && semester2) {
      onCompare(semester1.year, semester1.sem, semester2.year, semester2.sem);
    }
  };

  const getSnapshotLabel = (year: string, sem: number) => `${year} - Sem ${sem}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitCompare className="h-4 w-4 mr-2" />
          Compare Semesters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Compare Semesters
          </DialogTitle>
          <DialogDescription>
            Compare your performance between two semesters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Semester Selection */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <Label>First Semester</Label>
              <Select
                value={semester1 ? `${semester1.year}-${semester1.sem}` : ''}
                onValueChange={(value) => {
                  const [year, sem] = value.split('-');
                  setSemester1({ year: year + '-' + sem.split('-')[0], sem: parseInt(sem.split('-')[1] || sem) });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {snapshots.map((s) => (
                    <SelectItem
                      key={`${s.academicYear}-${s.semester}`}
                      value={`${s.academicYear}-${s.semester}`}
                    >
                      {getSnapshotLabel(s.academicYear, s.semester)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mb-2" />

            <div className="space-y-2">
              <Label>Second Semester</Label>
              <Select
                value={semester2 ? `${semester2.year}-${semester2.sem}` : ''}
                onValueChange={(value) => {
                  const [year, sem] = value.split('-');
                  setSemester2({ year: year + '-' + sem.split('-')[0], sem: parseInt(sem.split('-')[1] || sem) });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {snapshots.map((s) => (
                    <SelectItem
                      key={`${s.academicYear}-${s.semester}`}
                      value={`${s.academicYear}-${s.semester}`}
                    >
                      {getSnapshotLabel(s.academicYear, s.semester)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={!semester1 || !semester2 || isLoading}
            className="w-full"
          >
            {isLoading ? 'Comparing...' : 'Compare'}
          </Button>

          {/* Comparison Results */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : comparison ? (
            <div className="space-y-4">
              {/* Overall Trend */}
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-sm text-muted-foreground">Overall Trend:</span>
                <Badge
                  className={`capitalize ${
                    comparison.trend === 'improving'
                      ? 'bg-green-100 text-green-700'
                      : comparison.trend === 'declining'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {comparison.trend}
                </Badge>
              </div>

              {/* Comparison Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Metric</th>
                      <th className="text-center p-3 font-medium">
                        {comparison.semester1.academicYear} - Sem {comparison.semester1.semester}
                      </th>
                      <th className="text-center p-3 font-medium">
                        {comparison.semester2.academicYear} - Sem {comparison.semester2.semester}
                      </th>
                      <th className="text-center p-3 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* CGPA */}
                    <tr className="border-t">
                      <td className="p-3 font-medium">CGPA</td>
                      <td className="text-center p-3">
                        {comparison.semester1.cgpa?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="text-center p-3">
                        {comparison.semester2.cgpa?.toFixed(2) || 'N/A'}
                      </td>
                      <td className={`text-center p-3 ${getTrendColor(comparison.changes.cgpaChange)}`}>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(comparison.changes.cgpaChange)}
                          {formatChange(comparison.changes.cgpaChange)}
                        </div>
                      </td>
                    </tr>

                    {/* SGPA */}
                    <tr className="border-t">
                      <td className="p-3 font-medium">SGPA</td>
                      <td className="text-center p-3">
                        {comparison.semester1.sgpa?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="text-center p-3">
                        {comparison.semester2.sgpa?.toFixed(2) || 'N/A'}
                      </td>
                      <td className={`text-center p-3 ${getTrendColor(comparison.changes.sgpaChange)}`}>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(comparison.changes.sgpaChange)}
                          {formatChange(comparison.changes.sgpaChange)}
                        </div>
                      </td>
                    </tr>

                    {/* Attendance */}
                    <tr className="border-t">
                      <td className="p-3 font-medium">Attendance</td>
                      <td className="text-center p-3">
                        {comparison.semester1.attendance?.toFixed(1) || 'N/A'}%
                      </td>
                      <td className="text-center p-3">
                        {comparison.semester2.attendance?.toFixed(1) || 'N/A'}%
                      </td>
                      <td className={`text-center p-3 ${getTrendColor(comparison.changes.attendanceChange)}`}>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(comparison.changes.attendanceChange)}
                          {formatChange(comparison.changes.attendanceChange, '%')}
                        </div>
                      </td>
                    </tr>

                    {/* SGI */}
                    <tr className="border-t">
                      <td className="p-3 font-medium">SGI Score</td>
                      <td className="text-center p-3">
                        {comparison.semester1.sgiScore?.toFixed(0) || 'N/A'}
                      </td>
                      <td className="text-center p-3">
                        {comparison.semester2.sgiScore?.toFixed(0) || 'N/A'}
                      </td>
                      <td className={`text-center p-3 ${getTrendColor(comparison.changes.sgiChange)}`}>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(comparison.changes.sgiChange)}
                          {formatChange(comparison.changes.sgiChange)}
                        </div>
                      </td>
                    </tr>

                    {/* CRI */}
                    <tr className="border-t">
                      <td className="p-3 font-medium">CRI Score</td>
                      <td className="text-center p-3">
                        {comparison.semester1.criScore?.toFixed(0) || 'N/A'}
                      </td>
                      <td className="text-center p-3">
                        {comparison.semester2.criScore?.toFixed(0) || 'N/A'}
                      </td>
                      <td className={`text-center p-3 ${getTrendColor(comparison.changes.criChange)}`}>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(comparison.changes.criChange)}
                          {formatChange(comparison.changes.criChange)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GitCompare className="h-12 w-12 mx-auto mb-2" />
              <p>Select two semesters to compare</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SemesterCompareDialog;
