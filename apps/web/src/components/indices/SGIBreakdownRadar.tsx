'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SgiData } from '@/hooks/use-student-growth';

interface SGIBreakdownRadarProps {
  data: SgiData | null;
  loading?: boolean;
}

export function SGIBreakdownRadar({ data, loading }: SGIBreakdownRadarProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Score Breakdown
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
            Score Breakdown
          </CardTitle>
          <CardDescription>Component-wise analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            <p>No data available for breakdown visualization.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component scores
  const mainData = [
    { subject: 'Academic', score: data.academicScore, fullMark: 100 },
    { subject: 'Engagement', score: data.engagementScore, fullMark: 100 },
    { subject: 'Skills', score: data.skillsScore, fullMark: 100 },
    { subject: 'Behavioral', score: data.behavioralScore, fullMark: 100 },
  ];

  // Detailed breakdown if available
  const hasDetailedBreakdown = data.academicBreakdown || data.engagementBreakdown ||
    data.skillsBreakdown || data.behavioralBreakdown;

  const detailedData = hasDetailedBreakdown
    ? [
        ...(data.academicBreakdown
          ? [
              { subject: 'CGPA Trend', score: data.academicBreakdown.cgpaTrend, fullMark: 100 },
              { subject: 'Exam Progress', score: data.academicBreakdown.examImprovement, fullMark: 100 },
              { subject: 'Assignments', score: data.academicBreakdown.assignments, fullMark: 100 },
            ]
          : []),
        ...(data.engagementBreakdown
          ? [
              { subject: 'Club Activity', score: data.engagementBreakdown.clubActivity, fullMark: 100 },
              { subject: 'Events', score: data.engagementBreakdown.eventsAttended, fullMark: 100 },
              { subject: 'Attendance', score: data.engagementBreakdown.attendanceRate, fullMark: 100 },
            ]
          : []),
        ...(data.skillsBreakdown
          ? [
              { subject: 'Certifications', score: data.skillsBreakdown.certifications, fullMark: 100 },
              { subject: 'Projects', score: data.skillsBreakdown.projects, fullMark: 100 },
              { subject: 'Internships', score: data.skillsBreakdown.internships, fullMark: 100 },
            ]
          : []),
        ...(data.behavioralBreakdown
          ? [
              { subject: 'Feedback', score: data.behavioralBreakdown.feedbackScore, fullMark: 100 },
              { subject: 'Punctuality', score: data.behavioralBreakdown.punctuality, fullMark: 100 },
              { subject: 'Discipline', score: data.behavioralBreakdown.discipline, fullMark: 100 },
            ]
          : []),
      ]
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          Score Breakdown
        </CardTitle>
        <CardDescription>Component-wise analysis of your growth index</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Components Radar */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mainData}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Component Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <ComponentDetail
            title="Academic"
            score={data.academicScore}
            weight="40%"
            color="blue"
            details={data.academicBreakdown as { [key: string]: number } | null}
          />
          <ComponentDetail
            title="Engagement"
            score={data.engagementScore}
            weight="30%"
            color="green"
            details={data.engagementBreakdown as { [key: string]: number } | null}
          />
          <ComponentDetail
            title="Skills"
            score={data.skillsScore}
            weight="20%"
            color="purple"
            details={data.skillsBreakdown as { [key: string]: number } | null}
          />
          <ComponentDetail
            title="Behavioral"
            score={data.behavioralScore}
            weight="10%"
            color="orange"
            details={data.behavioralBreakdown as { [key: string]: number } | null}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ComponentDetailProps {
  title: string;
  score: number;
  weight: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  details: { [key: string]: number } | null;
}

function ComponentDetail({ title, score, weight, color, details }: ComponentDetailProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
  };

  return (
    <div className={`p-3 border-l-4 ${borderColors[color]} bg-muted/30 rounded-r-lg`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className={`text-lg font-bold ${colorClasses[color].split(' ')[0]}`}>
          {score.toFixed(0)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">Weight: {weight}</p>
      {details && (
        <div className="space-y-1 text-xs">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-medium">{value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SGIBreakdownRadar;
