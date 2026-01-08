'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SgiData, formatMonthYear } from '@/hooks/use-student-growth';

interface SGITrendChartProps {
  history: SgiData[];
  loading?: boolean;
}

export function SGITrendChart({ history, loading }: SGITrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Trend
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Trend
          </CardTitle>
          <CardDescription>Your SGI score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Not enough data to show trend. Check back after next month&apos;s assessment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort history by date and format for chart
  const chartData = [...history]
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .map((item) => ({
      name: formatMonthYear(item.month, item.year),
      sgi: item.sgiScore,
      academic: item.academicScore,
      engagement: item.engagementScore,
      skills: item.skillsScore,
      behavioral: item.behavioralScore,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Growth Trend
        </CardTitle>
        <CardDescription>Your SGI score progression over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              {/* Reference lines for score levels */}
              <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="5 5" />
              <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="5 5" />
              <ReferenceLine y={40} stroke="#eab308" strokeDasharray="5 5" />

              {/* Main SGI line */}
              <Line
                type="monotone"
                dataKey="sgi"
                name="Overall SGI"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />

              {/* Component lines (dashed) */}
              <Line
                type="monotone"
                dataKey="academic"
                name="Academic"
                stroke="#3b82f6"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                name="Engagement"
                stroke="#22c55e"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-purple-500 rounded" />
            <span>Overall SGI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded border-dashed" style={{ borderTop: '2px dashed #3b82f6' }} />
            <span className="text-muted-foreground">Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded border-dashed" style={{ borderTop: '2px dashed #22c55e' }} />
            <span className="text-muted-foreground">Engagement</span>
          </div>
        </div>

        {/* Score level guide */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            80+: Excellent
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            60-79: Good
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            40-59: Average
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default SGITrendChart;
