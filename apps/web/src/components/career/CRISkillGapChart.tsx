'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  SkillGap,
  getPriorityColor,
  calculateGapPercentage,
  getSkillGapRecommendation,
  sortSkillGapsByPriority,
} from '@/hooks/use-career-readiness';

interface CRISkillGapChartProps {
  skillGaps: SkillGap[] | null;
  loading?: boolean;
}

export function CRISkillGapChart({ skillGaps, loading }: CRISkillGapChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Skill Gap Analysis
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!skillGaps || skillGaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Skill Gap Analysis
          </CardTitle>
          <CardDescription>Your skills vs industry requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium text-foreground">No significant skill gaps identified!</p>
            <p className="text-sm mt-2">Keep building your skills to maintain your competitive edge.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedGaps = sortSkillGapsByPriority(skillGaps);

  // Prepare chart data
  const chartData = sortedGaps.map((gap) => ({
    name: gap.skill,
    current: gap.currentLevel,
    required: gap.requiredLevel,
    gap: gap.requiredLevel - gap.currentLevel,
    priority: gap.priority,
  }));

  // Priority colors for bars
  const getPriorityBarColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>
          {sortedGaps.filter((g) => g.priority === 'high').length} high priority gaps to address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                width={75}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  const nameStr = name === 'current' ? 'Your Level' : name === 'required' ? 'Required' : 'Gap';
                  return [`${numValue}%`, nameStr];
                }}
              />
              <ReferenceLine x={70} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Target', fontSize: 10 }} />

              {/* Current Level */}
              <Bar dataKey="current" name="Your Level" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>

              {/* Gap (stacked) */}
              <Bar dataKey="gap" name="Gap" stackId="a" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-gap-${index}`} fill={getPriorityBarColor(entry.priority)} fillOpacity={0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Your Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/50" />
            <span>High Priority Gap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500/50" />
            <span>Medium Priority Gap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/50" />
            <span>Low Priority Gap</span>
          </div>
        </div>

        {/* Detailed Gaps List */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Improvement Recommendations
          </h4>
          {sortedGaps.slice(0, 4).map((gap, index) => (
            <SkillGapItem key={index} gap={gap} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SkillGapItemProps {
  gap: SkillGap;
}

function SkillGapItem({ gap }: SkillGapItemProps) {
  const gapPercentage = calculateGapPercentage(gap.currentLevel, gap.requiredLevel);
  const recommendation = getSkillGapRecommendation(gap);

  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">{gap.skill}</h5>
          <Badge variant="outline" className={getPriorityColor(gap.priority)}>
            {gap.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{gap.currentLevel}</span>
          <TrendingUp className="h-3 w-3" />
          <span className="font-medium">{gap.requiredLevel}</span>
        </div>
      </div>

      {/* Progress showing current vs required */}
      <div className="relative mb-2">
        <Progress value={gap.currentLevel} className="h-2" />
        <div
          className="absolute top-0 h-2 w-0.5 bg-green-500"
          style={{ left: `${gap.requiredLevel}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{recommendation}</p>
    </div>
  );
}

export default CRISkillGapChart;
