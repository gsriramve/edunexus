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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  GraduationCap,
  User,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useMyFeedbackSummary } from "@/hooks/use-student-feedback";

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-yellow-500" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 4.5) return "text-green-600";
  if (score >= 4.0) return "text-blue-600";
  if (score >= 3.0) return "text-yellow-600";
  return "text-red-600";
};

const getEvaluatorIcon = (type: string) => {
  switch (type) {
    case "faculty":
      return <GraduationCap className="h-5 w-5 text-blue-500" />;
    case "mentor":
      return <Users className="h-5 w-5 text-purple-500" />;
    case "peer":
      return <User className="h-5 w-5 text-green-500" />;
    case "self":
      return <Star className="h-5 w-5 text-yellow-500" />;
    default:
      return <MessageSquare className="h-5 w-5" />;
  }
};

export default function StudentFeedbackPage() {
  const [activeTab, setActiveTab] = useState("summary");

  const { data: feedbackData, isLoading } = useMyFeedbackSummary();

  // Use API data with defaults
  const data = feedbackData || {
    currentCycle: { name: 'Loading...', month: 1, year: 2026, status: 'active', startDate: '', endDate: '' },
    summary: {
      overallScore: 0,
      previousScore: 0,
      trend: 'stable',
      totalFeedbacks: 0,
      byType: {
        faculty: { count: 0, avgScore: 0 },
        mentor: { count: 0, avgScore: 0 },
        peer: { count: 0, avgScore: 0 },
        self: { count: 0, score: 0 },
      },
      topStrengths: [],
      areasForImprovement: [],
      categoryScores: {
        academic: 0,
        participation: 0,
        teamwork: 0,
        communication: 0,
        leadership: 0,
        punctuality: 0,
      },
    },
    history: [],
  };

  const categoryScores = data.summary.categoryScores;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Feedback</h1>
          <p className="text-muted-foreground">
            View feedback from faculty, mentors, and peers
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {data.currentCycle.name} Cycle
        </Badge>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Overall Feedback Score</CardTitle>
          <CardDescription>
            Aggregated score from all feedback sources this cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-4xl font-bold ${getScoreColor(data.summary.overallScore)}`}>
                    {data.summary.overallScore.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm block">/5.0</span>
                </div>
              </div>
            </div>

            {/* Trend and Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                {getTrendIcon(data.summary.trend)}
                <span className="text-sm font-medium">
                  {data.summary.trend === "improving" ? "+" : "-"}
                  {Math.abs(data.summary.overallScore - data.summary.previousScore).toFixed(1)} from last cycle
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                {Object.entries(data.summary.byType).map(([type, typeData]) => (
                  <div key={type} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      {getEvaluatorIcon(type)}
                      <span className="text-sm capitalize">{type}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">
                        {"avgScore" in typeData ? typeData.avgScore?.toFixed(1) : typeData.score?.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({typeData.count} {typeData.count === 1 ? "feedback" : "feedbacks"})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="categories">Category Scores</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                  Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.summary.topStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {data.summary.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category Scores Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category-wise Scores</CardTitle>
              <CardDescription>
                Detailed breakdown by feedback category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(categoryScores).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-medium">{category}</span>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}/5.0
                      </span>
                    </div>
                    <Progress value={(score / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback History</CardTitle>
              <CardDescription>
                Your feedback scores over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.history.map((item, index) => (
                  <div
                    key={item.month}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{item.month}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                        {item.score.toFixed(1)}
                      </span>
                      {index < data.history.length - 1 && (
                        <Badge
                          variant={item.score > data.history[index + 1].score ? "default" : "secondary"}
                        >
                          {item.score > data.history[index + 1].score ? "+" : ""}
                          {(item.score - data.history[index + 1].score).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
