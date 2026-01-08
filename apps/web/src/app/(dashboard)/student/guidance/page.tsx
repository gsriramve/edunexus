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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  Bell,
  BookOpen,
  Briefcase,
  Users,
  Heart,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useUser } from "@clerk/nextjs";

// Mock data - will be replaced with API hooks
const mockGuidanceData = {
  recommendations: [
    {
      id: "1",
      title: "Complete AWS Cloud Certification",
      description: "Based on your career goals in software development, an AWS certification would boost your CRI significantly.",
      category: "skill",
      priority: "high",
      confidenceScore: 0.89,
      actionItems: [
        "Register for AWS Cloud Practitioner exam",
        "Complete online course (estimated 20 hours)",
        "Practice with sample exams",
      ],
      resources: [
        { title: "AWS Free Tier", url: "#" },
        { title: "Cloud Practitioner Course", url: "#" },
      ],
      expiresAt: "2026-02-28",
      status: "active",
    },
    {
      id: "2",
      title: "Improve Interview Skills",
      description: "Your mock interview scores indicate room for improvement. Practice with our AI interview coach.",
      category: "career",
      priority: "high",
      confidenceScore: 0.85,
      actionItems: [
        "Complete 3 mock interviews this week",
        "Review common behavioral questions",
        "Practice STAR method responses",
      ],
      resources: [
        { title: "Interview Prep Guide", url: "#" },
        { title: "Mock Interview Portal", url: "#" },
      ],
      status: "active",
    },
    {
      id: "3",
      title: "Join Coding Club",
      description: "Your engagement score could improve. The coding club meets every Saturday and aligns with your interests.",
      category: "engagement",
      priority: "medium",
      confidenceScore: 0.78,
      actionItems: [
        "Attend this Saturday's session",
        "Complete the beginner project",
      ],
      status: "active",
    },
    {
      id: "4",
      title: "Focus on Data Structures",
      description: "Your algorithm skills need attention before placement season. Consider taking the advanced DS course.",
      category: "academic",
      priority: "medium",
      confidenceScore: 0.82,
      actionItems: [
        "Solve 5 LeetCode problems daily",
        "Review tree and graph algorithms",
      ],
      status: "active",
    },
  ],
  alerts: [
    {
      id: "a1",
      type: "attendance_drop",
      severity: "warning",
      title: "Attendance Below Threshold",
      message: "Your attendance in Computer Networks has dropped to 72%. Minimum required is 75%.",
      metricName: "Attendance",
      currentValue: 72,
      thresholdValue: 75,
      suggestedActions: ["Attend all remaining classes", "Meet with faculty for attendance regularization"],
      status: "new",
    },
    {
      id: "a2",
      type: "deadline",
      severity: "info",
      title: "Assignment Due Soon",
      message: "DBMS assignment submission deadline is in 2 days.",
      status: "new",
    },
  ],
  monthlyPlan: {
    month: "January 2026",
    goals: [
      { title: "Complete 2 certifications", progress: 50, category: "skill" },
      { title: "Maintain 90%+ attendance", progress: 85, category: "academic" },
      { title: "Attend 3 placement workshops", progress: 33, category: "career" },
      { title: "Participate in hackathon", progress: 0, category: "engagement" },
    ],
    overallProgress: 42,
  },
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "academic":
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case "career":
      return <Briefcase className="h-5 w-5 text-purple-500" />;
    case "engagement":
      return <Users className="h-5 w-5 text-green-500" />;
    case "skill":
      return <Award className="h-5 w-5 text-yellow-500" />;
    case "behavioral":
      return <Heart className="h-5 w-5 text-pink-500" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
    case "warning":
      return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
    default:
      return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
  }
};

export default function StudentGuidancePage() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const tenantId = useTenantId();
  const { user } = useUser();

  const isLoading = false;
  const data = mockGuidanceData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
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
          <h1 className="text-3xl font-bold tracking-tight">AI Guidance</h1>
          <p className="text-muted-foreground">
            Personalized recommendations and alerts to help you succeed
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Brain className="h-4 w-4 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Alerts Banner */}
      {data.alerts.filter(a => a.status === "new").length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Attention Required ({data.alerts.filter(a => a.status === "new").length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.filter(a => a.status === "new").map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Plan: {data.monthlyPlan.month}</CardTitle>
          <CardDescription>
            Your progress on this month's goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.monthlyPlan.goals.map((goal, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(goal.category)}
                  <span className="text-sm font-medium">{goal.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {data.recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(rec.category)}
                    <div>
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                      <CardDescription className="mt-1">{rec.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority} priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Confidence Score */}
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">AI Confidence:</span>
                    <span className="font-medium">{Math.round(rec.confidenceScore * 100)}%</span>
                  </div>

                  {/* Action Items */}
                  {rec.actionItems && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Action Items:</h5>
                      <ul className="space-y-1">
                        {rec.actionItems.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Resources */}
                  {rec.resources && rec.resources.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Resources:</h5>
                      <div className="flex flex-wrap gap-2">
                        {rec.resources.map((resource, index) => (
                          <Button key={index} variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              {resource.title}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expiry and Feedback */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    {rec.expiresAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Expires: {new Date(rec.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Was this helpful?</span>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {data.alerts.length > 0 ? (
            data.alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {alert.severity === "critical" ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : alert.severity === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Bell className="h-5 w-5 text-blue-500" />
                        )}
                        {alert.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{alert.message}</CardDescription>
                    </div>
                    <Badge variant={alert.status === "new" ? "default" : "secondary"}>
                      {alert.status}
                    </Badge>
                  </div>
                </CardHeader>
                {alert.suggestedActions && (
                  <CardContent>
                    <h5 className="text-sm font-medium mb-2">Suggested Actions:</h5>
                    <ul className="space-y-1">
                      {alert.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All Clear!</h3>
                <p className="text-muted-foreground">No alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
