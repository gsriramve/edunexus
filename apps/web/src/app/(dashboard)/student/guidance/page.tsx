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
  Bell,
  Target,
  RefreshCw,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTenantId } from "@/hooks/use-tenant";
import { useAuth } from "@/lib/auth";
import {
  useMyGuidanceDashboard,
  useMyGuidance,
  useMyGoals,
  useGenerateRecommendations,
  useUpdateGuidance,
  GuidanceCategory,
  GuidanceStatus,
  GoalStatus,
  type Guidance,
  type Goal,
} from "@/hooks/use-ai-guidance";
import { useStudentByUserId } from "@/hooks/use-api";
import {
  GuidanceCard,
  AlertBanner,
  MonthlyPlanCard,
  GoalCard,
  DeadlineList,
  GuidanceDashboardStats,
} from "@/components/guidance";

export default function StudentGuidancePage() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const tenantId = useTenantId();
  const { user } = useAuth();

  // Get student ID
  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || "",
    user?.id || ""
  );

  // Fetch guidance dashboard
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useMyGuidanceDashboard(
    tenantId || ""
  );

  // Fetch all guidance for filtering
  const { data: guidanceData, isLoading: guidanceLoading } = useMyGuidance(
    tenantId || "",
    {
      activeOnly: true,
      category: categoryFilter !== "all" ? categoryFilter as GuidanceCategory : undefined,
    }
  );

  // Fetch goals
  const { data: goalsData, isLoading: goalsLoading } = useMyGoals(
    tenantId || "",
    { status: GoalStatus.ACTIVE }
  );

  // Mutations
  const generateRecommendations = useGenerateRecommendations(tenantId || "");

  const isLoading = studentLoading || dashboardLoading || guidanceLoading || goalsLoading;

  // Get current month name
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  // Filter guidance by category if needed
  const filteredGuidance = guidanceData?.data || dashboard?.activeGuidance || [];
  const activeGoals = goalsData?.data || dashboard?.activeGoals || [];
  const alerts = dashboard?.alerts || [];

  const handleGenerateRecommendations = () => {
    if (student?.id) {
      generateRecommendations.mutate({
        studentId: student.id,
        includeCareer: true,
        includeAcademic: true,
        includeEngagement: true,
        includeSkills: true,
      });
    }
  };

  const handleFeedback = (id: string, helpful: boolean) => {
    // Would use useUpdateGuidance mutation
    console.log("Feedback:", id, helpful);
  };

  const handleMarkComplete = (id: string) => {
    // Would use useUpdateGuidance mutation
    console.log("Mark complete:", id);
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Brain className="h-4 w-4 mr-1" />
            AI-Powered
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateRecommendations}
            disabled={generateRecommendations.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generateRecommendations.isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <GuidanceDashboardStats
        activeGuidanceCount={dashboard?.activeGuidance?.length || 0}
        activeGoalsCount={dashboard?.activeGoals?.length || 0}
        completedGoalsCount={dashboard?.completedGoalsCount || 0}
        guidanceCompletionRate={dashboard?.guidanceCompletionRate || 0}
        alertsCount={alerts.length}
      />

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <AlertBanner
          alerts={alerts}
          onAcknowledge={(id) => console.log("Acknowledge:", id)}
          onViewDetails={(id) => console.log("View:", id)}
        />
      )}

      {/* Monthly Plan */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyPlanCard
            month={currentMonth}
            year={currentYear}
            goals={activeGoals}
            onViewGoal={(id) => console.log("View goal:", id)}
            onViewAllGoals={() => setActiveTab("goals")}
          />
        </div>
        <div>
          <DeadlineList
            deadlines={dashboard?.upcomingDeadlines || []}
            onViewItem={(type, id) => console.log("View item:", type, id)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recommendations
              {filteredGuidance.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredGuidance.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Goals
              {activeGoals.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeGoals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === "recommendations" && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={GuidanceCategory.ACADEMIC}>Academic</SelectItem>
                  <SelectItem value={GuidanceCategory.CAREER}>Career</SelectItem>
                  <SelectItem value={GuidanceCategory.SKILL}>Skills</SelectItem>
                  <SelectItem value={GuidanceCategory.ENGAGEMENT}>Engagement</SelectItem>
                  <SelectItem value={GuidanceCategory.BEHAVIORAL}>Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 mt-4">
          {filteredGuidance.length > 0 ? (
            filteredGuidance.map((guidance: Guidance) => (
              <GuidanceCard
                key={guidance.id}
                guidance={guidance}
                onFeedback={handleFeedback}
                onMarkComplete={handleMarkComplete}
              />
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Active Recommendations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {categoryFilter !== "all"
                    ? `No ${categoryFilter} recommendations at this time.`
                    : "You're all caught up! Check back later for new guidance."}
                </p>
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={generateRecommendations.isPending}
                >
                  {generateRecommendations.isPending ? "Generating..." : "Generate New Recommendations"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          {activeGoals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal: Goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={(id) => console.log("Complete goal:", id)}
                  onEdit={(id) => console.log("Edit goal:", id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Active Goals</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Set goals to track your progress and stay motivated.
                </p>
                <Button variant="outline">Create Goal</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="h-5 w-5 text-yellow-500" />
                          {alert.metricName}: {alert.currentValue}
                          {alert.currentValue < alert.thresholdValue ? " (Below" : " (Above"} threshold: {alert.thresholdValue})
                        </CardTitle>
                        {alert.description && (
                          <CardDescription className="mt-1">{alert.description}</CardDescription>
                        )}
                      </div>
                      <Badge
                        variant={alert.severity === "critical" ? "destructive" : "outline"}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                    <CardContent>
                      <h5 className="text-sm font-medium mb-2">Suggested Actions:</h5>
                      <ul className="space-y-1">
                        {alert.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            {action.action}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
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
