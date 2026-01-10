"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Users,
  Award,
  Heart,
  Info,
  ChevronRight,
  Target,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId, useStudentSgi, useCalculateSgi, type SgiData } from "@/hooks/use-api";
import { useUser } from "@clerk/nextjs";
import { SGITrendChart } from "@/components/indices";

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case "declining":
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <Minus className="h-5 w-5 text-yellow-500" />;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "improving":
      return "text-green-600 bg-green-50";
    case "declining":
      return "text-red-600 bg-red-50";
    default:
      return "text-yellow-600 bg-yellow-50";
  }
};

const getComponentIcon = (component: string) => {
  switch (component) {
    case "academic":
      return <BookOpen className="h-5 w-5" />;
    case "engagement":
      return <Users className="h-5 w-5" />;
    case "skills":
      return <Award className="h-5 w-5" />;
    case "behavioral":
      return <Heart className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

// Component weights (default)
const componentWeights = {
  academic: 40,
  engagement: 30,
  skills: 20,
  behavioral: 10,
};

// Sample SGI data for demo purposes
const sampleSgiData: SgiData = {
  id: 'sample-sgi',
  studentId: 'sample-student',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  sgiScore: 78.5,
  sgiTrend: 'improving',
  trendDelta: 3.3,
  academicScore: 82,
  engagementScore: 75,
  skillsScore: 72,
  behavioralScore: 85,
  academicBreakdown: {
    cgpaTrend: 8.2,
    examImprovement: 85,
    assignments: 79,
  },
  engagementBreakdown: {
    clubActivity: 70,
    eventsAttended: 78,
    attendanceRate: 88,
  },
  skillsBreakdown: {
    certifications: 75,
    projects: 68,
    internships: 82,
  },
  behavioralBreakdown: {
    feedbackScore: 90,
    punctuality: 85,
    discipline: 82,
  },
  insightsSummary: 'Strong academic performance with room for improvement in skills development.',
  recommendations: [
    { category: 'Skills', action: 'Focus on improving communication skills through presentations', priority: 'high' },
    { category: 'Skills', action: 'Participate in more hackathons to boost technical skills', priority: 'medium' },
    { category: 'Engagement', action: 'Consider joining a leadership role in a student club', priority: 'medium' },
  ],
  dataCompleteness: 92,
  calculatedAt: new Date().toISOString(),
};

const sampleSgiHistory: SgiData[] = [
  { ...sampleSgiData, month: new Date().getMonth() + 1, sgiScore: 78.5 },
  { ...sampleSgiData, month: new Date().getMonth(), sgiScore: 75.2 },
  { ...sampleSgiData, month: new Date().getMonth() - 1, sgiScore: 72.8 },
  { ...sampleSgiData, month: new Date().getMonth() - 2, sgiScore: 70.5 },
];

export default function StudentGrowthPage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const tenantId = useTenantId();
  const { user } = useUser();

  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || "",
    user?.id || ""
  );

  const { data: sgiData, isLoading: sgiLoading, refetch: refetchSgi } = useStudentSgi(
    tenantId || "",
    student?.id || ""
  );

  const calculateSgi = useCalculateSgi(tenantId || "");

  const isLoading = studentLoading || sgiLoading;

  // Get the latest SGI data - use sample data if no real data available
  const realSgi: SgiData | null = sgiData && "latest" in sgiData ? sgiData.latest : (sgiData as SgiData | null);
  const realHistory = sgiData && "history" in sgiData ? sgiData.history : [];

  // Use sample data if no real data is available (for demo purposes)
  const sgi: SgiData = realSgi || sampleSgiData;
  const sgiHistory = realHistory.length > 0 ? realHistory : sampleSgiHistory;
  const isUsingDemoData = !realSgi;

  // Previous score from history
  const previousSgi = sgiHistory.length > 1 ? sgiHistory[1]?.sgiScore : undefined;

  const handleRecalculate = () => {
    if (student?.id) {
      const now = new Date();
      calculateSgi.mutate({
        studentId: student.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }


  // Build components data from SGI
  const components = {
    academic: {
      score: sgi.academicScore,
      weight: componentWeights.academic,
      breakdown: sgi.academicBreakdown || {},
    },
    engagement: {
      score: sgi.engagementScore,
      weight: componentWeights.engagement,
      breakdown: sgi.engagementBreakdown || {},
    },
    skills: {
      score: sgi.skillsScore,
      weight: componentWeights.skills,
      breakdown: sgi.skillsBreakdown || {},
    },
    behavioral: {
      score: sgi.behavioralScore,
      weight: componentWeights.behavioral,
      breakdown: sgi.behavioralBreakdown || {},
    },
  };

  // Parse recommendations
  const recommendations = Array.isArray(sgi.recommendations)
    ? sgi.recommendations
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Growth Index</h1>
          <p className="text-muted-foreground">
            Track your holistic development with the Student Growth Index (SGI)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isUsingDemoData && (
            <Badge variant="secondary" className="text-xs">
              Sample Data
            </Badge>
          )}
          <Badge variant="outline" className="text-sm">
            {new Date(0, sgi.month - 1).toLocaleString('default', { month: 'long' })} {sgi.year}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={calculateSgi.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${calculateSgi.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main SGI Score Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Student Growth Index (SGI)</CardTitle>
              <CardDescription>
                Your overall growth score based on academics, engagement, skills, and behavior
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    SGI measures your growth across 4 dimensions: Academic (40%),
                    Engagement (30%), Skills (20%), and Behavioral (10%).
                    It focuses on improvement over time, not just absolute scores.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-4xl font-bold ${getScoreColor(sgi.sgiScore)}`}>
                    {Math.round(sgi.sgiScore)}
                  </span>
                  <span className="text-muted-foreground text-sm block">/100</span>
                </div>
              </div>
            </div>

            {/* Trend and Delta */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                {getTrendIcon(sgi.sgiTrend)}
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTrendColor(sgi.sgiTrend)}`}>
                  {sgi.sgiTrend === "improving" ? "+" : sgi.sgiTrend === "declining" ? "" : ""}
                  {sgi.trendDelta > 0 ? "+" : ""}{sgi.trendDelta.toFixed(1)} points from last month
                </span>
              </div>

              {previousSgi !== undefined && (
                <p className="text-sm text-muted-foreground mb-4">
                  Previous score: {Math.round(previousSgi)}
                </p>
              )}

              {sgi.dataCompleteness !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Data completeness:</span>
                  <Progress value={sgi.dataCompleteness * 100} className="w-24 h-2" />
                  <span className="text-xs text-muted-foreground">{Math.round(sgi.dataCompleteness * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(components).map(([key, component]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedComponent === key ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedComponent(selectedComponent === key ? null : key)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getComponentIcon(key)}
                  <CardTitle className="text-sm capitalize">{key}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {component.weight}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(component.score)}`}>
                    {Math.round(component.score)}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                    selectedComponent === key ? "rotate-90" : ""
                  }`} />
                </div>
                <Progress
                  value={component.score}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Component Details */}
      {selectedComponent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getComponentIcon(selectedComponent)}
              {selectedComponent} Breakdown
            </CardTitle>
            <CardDescription>
              Detailed metrics contributing to your {selectedComponent} score
            </CardDescription>
          </CardHeader>
          <CardContent>
            {components[selectedComponent as keyof typeof components].breakdown &&
            Object.keys(components[selectedComponent as keyof typeof components].breakdown).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(components[selectedComponent as keyof typeof components].breakdown).map(([metric, value]) => (
                  <div key={metric} className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="font-medium">
                      {typeof value === 'number' ? value.toFixed(1) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No detailed breakdown available for this component.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {sgi.insightsSummary && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{sgi.insightsSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
            <CardDescription>
              Personalized recommendations to improve your growth index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Badge
                    variant={rec.priority === "high" ? "destructive" : "secondary"}
                    className="shrink-0"
                  >
                    {rec.priority || "medium"}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{rec.action || rec.title || rec}</p>
                    {rec.category && (
                      <p className="text-sm text-muted-foreground capitalize">{rec.category}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SGI Trend Chart */}
      {sgiHistory.length > 0 && (
        <SGITrendChart
          history={sgiHistory.map(item => ({
            ...item,
            sgiTrend: item.sgiTrend as 'improving' | 'stable' | 'declining',
            academicBreakdown: item.academicBreakdown || null,
            engagementBreakdown: item.engagementBreakdown || null,
            skillsBreakdown: item.skillsBreakdown || null,
            behavioralBreakdown: item.behavioralBreakdown || null,
            recommendations: item.recommendations || null,
            calculatedAt: String(item.calculatedAt || new Date().toISOString()),
          }))}
        />
      )}

      {/* SGI History Cards */}
      {sgiHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Scores</CardTitle>
            <CardDescription>Quick view of your recent assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sgiHistory.slice(0, 6).map((item: SgiData, index: number) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 p-4 rounded-lg border ${
                    index === 0 ? "bg-primary/5 border-primary" : "bg-card"
                  }`}
                >
                  <p className="text-sm text-muted-foreground">
                    {new Date(0, item.month - 1).toLocaleString('default', { month: 'short' })} {item.year}
                  </p>
                  <p className={`text-2xl font-bold ${getScoreColor(item.sgiScore)}`}>
                    {Math.round(item.sgiScore)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(item.sgiTrend)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.sgiTrend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
