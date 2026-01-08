'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  BarChart3,
  BookOpen,
  Clock,
  Star,
  ArrowUpRight,
  Sparkles,
  Minus,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  useStudentInsightsDashboard,
  PerformanceStats,
  SubjectPerformance,
  AIRecommendation,
  LearningPattern,
} from '@/hooks/use-student-insights';

// TODO: Get from auth context
const STUDENT_ID = 'current-student';

function StatsSkeletons() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContentSkeletons() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
}

interface QuickStatsProps {
  stats: PerformanceStats;
}

function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{stats.performanceScore}%</span>
            <TrendIcon trend={stats.trend} />
          </div>
          <p className="text-xs text-muted-foreground">
            CGPA: {stats.cgpa} | SGPA: {stats.sgpa}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Attendance Health</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.attendanceHealth}%</div>
          <p className="text-xs text-muted-foreground">Based on attendance patterns</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.studyHours}h</div>
          <p className="text-xs text-muted-foreground">This week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Rank Prediction</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            #{stats.rankPrediction}
            <span className="text-sm font-normal text-muted-foreground">
              /{stats.totalStudents}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Expected class rank</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface RecommendationsCardProps {
  recommendations: AIRecommendation[];
}

function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  const getIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'focus':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'timing':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'attendance':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
    }
  };

  const getPriorityColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-amber-200 bg-amber-50';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          AI Recommendations
        </CardTitle>
        <CardDescription>Personalized suggestions to improve your performance</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${getPriorityColor(rec.priority)}`}
              >
                {getIcon(rec.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              AI recommendations will appear here once we have enough data about your academic
              performance and learning patterns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SubjectPerformanceCardProps {
  subjects: SubjectPerformance[];
}

function SubjectPerformanceCard({ subjects }: SubjectPerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Subject Performance
        </CardTitle>
        <CardDescription>Performance breakdown by subject</CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length > 0 ? (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.subjectId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{subject.subjectName}</span>
                    <TrendIcon trend={subject.trend} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {subject.grade}
                    </Badge>
                    <span className="text-muted-foreground">{subject.percentage}%</span>
                  </div>
                </div>
                <Progress
                  value={subject.percentage}
                  className={`h-2 ${subject.percentage >= 60 ? '' : 'bg-red-100'}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Attendance: {subject.attendance}%</span>
                  <span>
                    {subject.marks}/{subject.maxMarks} marks
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Subject-wise analysis will be available once exam results are published.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LearningPatternsCardProps {
  patterns: LearningPattern;
}

function LearningPatternsCard({ patterns }: LearningPatternsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Patterns</CardTitle>
        <CardDescription>Understand your study habits and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Peak Study Hours</p>
              <p className="text-sm text-muted-foreground">{patterns.peakHours.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Avg Session Duration</p>
              <p className="text-sm text-muted-foreground">{patterns.averageSessionDuration} min</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Consistency Score</p>
            <Progress value={patterns.consistencyScore} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{patterns.consistencyScore}%</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-green-600">Strong Subjects</p>
              <div className="flex flex-wrap gap-1">
                {patterns.strongSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="bg-green-100 text-green-700">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-orange-600">Needs Improvement</p>
              <div className="flex flex-wrap gap-1">
                {patterns.weakSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="bg-orange-100 text-orange-700">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Improvement Areas</p>
            <ul className="space-y-1">
              {patterns.improvementAreas.map((area, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <Button variant="outline" className="w-full">
            View Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const { data, isLoading, error } = useStudentInsightsDashboard(STUDENT_ID);

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Failed to load insights data</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    performanceScore: 0,
    attendanceHealth: 0,
    studyHours: 0,
    rankPrediction: 0,
    totalStudents: 0,
    cgpa: 0,
    sgpa: 0,
    trend: 'stable' as const,
  };
  const subjectPerformance = data?.subjectPerformance || [];
  const recommendations = data?.recommendations || [];
  const learningPatterns = data?.learningPatterns || {
    peakHours: [],
    averageSessionDuration: 0,
    consistencyScore: 0,
    strongSubjects: [],
    weakSubjects: [],
    improvementAreas: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            Personalized learning analytics and recommendations
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="rounded-full bg-purple-100 p-3">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">Personalized Insights</h3>
            <p className="text-sm text-purple-700">
              Our AI analyzes your academic performance, attendance patterns, and learning behavior
              to provide personalized recommendations for improvement.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <StatsSkeletons /> : <QuickStats stats={stats} />}

      {isLoading ? (
        <ContentSkeletons />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <RecommendationsCard recommendations={recommendations} />
          <SubjectPerformanceCard subjects={subjectPerformance} />
        </div>
      )}

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ) : (
        <LearningPatternsCard patterns={learningPatterns} />
      )}
    </div>
  );
}
