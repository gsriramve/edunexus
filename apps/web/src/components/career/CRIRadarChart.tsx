'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, FileText, Users, GraduationCap, Building2 } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CriData, getScoreColor } from '@/hooks/use-career-readiness';

interface CRIRadarChartProps {
  data: CriData | null;
  loading?: boolean;
}

export function CRIRadarChart({ data, loading }: CRIRadarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Component Analysis
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Component Analysis
          </CardTitle>
          <CardDescription>CRI component breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            <p>No data available for component analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Radar chart data
  const chartData = [
    { subject: 'Resume', score: data.resumeScore, fullMark: 100 },
    { subject: 'Interview', score: data.interviewScore, fullMark: 100 },
    { subject: 'Skill-Role Fit', score: data.skillRoleFitScore, fullMark: 100 },
    { subject: 'Industry Exposure', score: data.industryExposureScore, fullMark: 100 },
  ];

  // Component details with icons
  const components: {
    key: string;
    label: string;
    score: number;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'purple' | 'orange';
    description: string;
  }[] = [
    {
      key: 'resume',
      label: 'Resume',
      score: data.resumeScore,
      icon: FileText,
      color: 'blue',
      description: 'Resume quality, skills listed, projects, certifications',
    },
    {
      key: 'interview',
      label: 'Interview',
      score: data.interviewScore,
      icon: Users,
      color: 'green',
      description: 'Mock interviews, communication, leadership',
    },
    {
      key: 'skillFit',
      label: 'Skill-Role Fit',
      score: data.skillRoleFitScore,
      icon: GraduationCap,
      color: 'purple',
      description: 'Skills matching target job roles',
    },
    {
      key: 'exposure',
      label: 'Industry Exposure',
      score: data.industryExposureScore,
      icon: Building2,
      color: 'orange',
      description: 'Internships, industry projects, events',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-indigo-500" />
          Component Analysis
        </CardTitle>
        <CardDescription>Your CRI scores across four key dimensions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Component Details Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {components.map((comp) => (
            <ComponentDetail
              key={comp.key}
              label={comp.label}
              score={comp.score}
              icon={comp.icon}
              color={comp.color}
              description={comp.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ComponentDetailProps {
  label: string;
  score: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
}

function ComponentDetail({ label, score, icon: Icon, color, description }: ComponentDetailProps) {
  const colorClasses = {
    blue: 'text-blue-600 border-l-blue-500',
    green: 'text-green-600 border-l-green-500',
    purple: 'text-purple-600 border-l-purple-500',
    orange: 'text-orange-600 border-l-orange-500',
  };

  const iconBgClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className={`p-3 border-l-4 ${colorClasses[color]} bg-muted/30 rounded-r-lg`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${iconBgClasses[color]}`}>
          <Icon className={`h-4 w-4 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{label}</h4>
        </div>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score.toFixed(0)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default CRIRadarChart;
