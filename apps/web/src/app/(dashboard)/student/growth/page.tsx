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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Placeholder data - will be replaced with API calls
const mockSGIData = {
  currentScore: 72,
  previousScore: 68,
  trend: "improving" as const,
  trendDelta: 4,
  month: "January",
  year: 2026,
  dataCompleteness: 0.85,
  components: {
    academic: {
      score: 75,
      weight: 40,
      breakdown: {
        cgpaTrend: "+0.3 this semester",
        examImprovement: "12% better than last exam",
        assignments: "85% completion rate",
      },
    },
    engagement: {
      score: 68,
      weight: 30,
      breakdown: {
        clubActivity: "Active in 2 clubs",
        eventsAttended: "5 events this month",
        attendanceRate: "92% attendance",
      },
    },
    skills: {
      score: 70,
      weight: 20,
      breakdown: {
        certifications: "2 new certifications",
        projects: "1 ongoing project",
        internships: "No internship yet",
      },
    },
    behavioral: {
      score: 78,
      weight: 10,
      breakdown: {
        feedbackScore: "4.2/5 from peers",
        punctuality: "95% on-time",
        discipline: "No incidents",
      },
    },
  },
  insights: "Your SGI improved by 4 points this month! Academic performance is your strongest area. Consider joining more skill-building activities to boost your overall growth.",
  recommendations: [
    { category: "skills", action: "Complete an online certification in your field", priority: "high" },
    { category: "engagement", action: "Participate in the upcoming tech fest", priority: "medium" },
    { category: "career", action: "Apply for summer internship programs", priority: "high" },
  ],
};

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

const getProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

export default function StudentGrowthPage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const data = mockSGIData;

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
        <Badge variant="outline" className="text-sm">
          {data.month} {data.year}
        </Badge>
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
                  <span className={`text-4xl font-bold ${getScoreColor(data.currentScore)}`}>
                    {data.currentScore}
                  </span>
                  <span className="text-muted-foreground text-sm block">/100</span>
                </div>
              </div>
            </div>

            {/* Trend and Delta */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                {getTrendIcon(data.trend)}
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTrendColor(data.trend)}`}>
                  {data.trend === "improving" ? "+" : data.trend === "declining" ? "-" : ""}
                  {Math.abs(data.trendDelta)} points from last month
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Previous score: {data.previousScore}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Data completeness:</span>
                <Progress value={data.dataCompleteness * 100} className="w-24 h-2" />
                <span className="text-xs text-muted-foreground">{Math.round(data.dataCompleteness * 100)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.components).map(([key, component]) => (
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
                    {component.score}
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
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(data.components[selectedComponent as keyof typeof data.components].breakdown).map(([metric, value]) => (
                <div key={metric} className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{data.insights}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
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
            {data.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Badge
                  variant={rec.priority === "high" ? "destructive" : "secondary"}
                  className="shrink-0"
                >
                  {rec.priority}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">{rec.action}</p>
                  <p className="text-sm text-muted-foreground capitalize">{rec.category}</p>
                </div>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
