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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  Trophy,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Filter,
  ChevronRight,
  Star,
  Target,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId, useMyJourneyDashboard, useMyTimeline, useExportJourney } from "@/hooks/use-api";
import { useUser } from "@clerk/nextjs";
import type { MilestoneCategory, MilestoneType, TimelineItem } from "@/hooks/use-student-journey";

const categoryIcons: Record<string, any> = {
  academic: BookOpen,
  career: Briefcase,
  extracurricular: Trophy,
  achievement: Award,
  administrative: GraduationCap,
};

const milestoneTypeIcons: Record<string, any> = {
  admission: GraduationCap,
  semester_start: Calendar,
  semester_end: CheckCircle2,
  exam_result: BookOpen,
  backlog_cleared: CheckCircle2,
  dean_list: Star,
  award: Award,
  certification: Award,
  internship_start: Briefcase,
  internship_end: Briefcase,
  project_completion: Target,
  club_leadership: Users,
  event_participation: Trophy,
  placement_offer: Briefcase,
  placement_accepted: CheckCircle2,
  graduation: GraduationCap,
  custom: Star,
};

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

const getCategoryColor = (category?: string) => {
  switch (category) {
    case "academic":
      return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20";
    case "career":
      return "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20";
    case "extracurricular":
      return "border-l-green-500 bg-green-50/50 dark:bg-green-950/20";
    case "achievement":
      return "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20";
    case "administrative":
      return "border-l-gray-500 bg-gray-50/50 dark:bg-gray-950/20";
    default:
      return "border-l-primary bg-muted/50";
  }
};

export default function StudentJourneyPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const tenantId = useTenantId();
  const { user } = useUser();

  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || "",
    user?.id || ""
  );

  const { data: dashboard, isLoading: dashboardLoading } = useMyJourneyDashboard(
    tenantId || ""
  );

  const categories = categoryFilter === "all" ? undefined : [categoryFilter as MilestoneCategory];

  const { data: timeline, isLoading: timelineLoading } = useMyTimeline(
    tenantId || "",
    { categories, includeSnapshots: true, limit: 50 }
  );

  const exportJourney = useExportJourney(tenantId || "");

  const isLoading = studentLoading || dashboardLoading || timelineLoading;

  const handleExport = (format: "json" | "csv") => {
    if (student?.id) {
      exportJourney.mutate({
        studentId: student.id,
        format,
        includeMilestones: true,
        includeSnapshots: true,
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
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stats = dashboard?.stats;
  const progress = dashboard?.progress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Journey</h1>
          <p className="text-muted-foreground">
            Your 4-year academic and career journey timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            disabled={exportJourney.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current CGPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {stats.currentCgpa?.toFixed(2) || "N/A"}
                </span>
                {getTrendIcon(stats.cgpaTrend)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.totalMilestones}</span>
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.totalAchievements}</span>
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Events Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.totalEventsAttended}</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Year Progress */}
      {progress && progress.years.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Year-over-Year Progress</CardTitle>
            <CardDescription>
              Your academic journey across different years
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {progress.years.map((year, index) => (
                <div
                  key={year.academicYear}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{year.academicYear}</h4>
                    {getTrendIcon(year.trend)}
                  </div>
                  <div className="space-y-1 text-sm">
                    {year.endCgpa && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CGPA</span>
                        <span className="font-medium">{year.endCgpa.toFixed(2)}</span>
                      </div>
                    )}
                    {year.endSgi && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SGI</span>
                        <span className="font-medium">{Math.round(year.endSgi)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="font-medium">{year.milestonesCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Journey Timeline</CardTitle>
              <CardDescription>
                All your milestones and achievements
              </CardDescription>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="extracurricular">Extracurricular</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {timeline && timeline.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((item: TimelineItem, index: number) => {
                  const Icon = item.milestoneType
                    ? milestoneTypeIcons[item.milestoneType] || Star
                    : item.category
                    ? categoryIcons[item.category] || Star
                    : Calendar;

                  return (
                    <div
                      key={item.id}
                      className={`relative pl-10 ${index === 0 ? "pt-0" : ""}`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          item.isPositive !== false
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div
                        className={`p-4 rounded-lg border-l-4 ${getCategoryColor(item.category)}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{item.title}</h4>
                              {item.category && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                              {item.academicYear && (
                                <span>AY: {item.academicYear}</span>
                              )}
                              {item.semester && (
                                <span>Sem {item.semester}</span>
                              )}
                            </div>
                          </div>

                          {/* Snapshot data if available */}
                          {item.snapshotData && (
                            <div className="text-right text-sm">
                              {item.snapshotData.cgpa && (
                                <div>
                                  <span className="text-muted-foreground">CGPA: </span>
                                  <span className="font-medium">
                                    {item.snapshotData.cgpa.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {item.snapshotData.sgiScore && (
                                <div>
                                  <span className="text-muted-foreground">SGI: </span>
                                  <span className="font-medium">
                                    {Math.round(item.snapshotData.sgiScore)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>No milestones recorded yet.</p>
              <p className="text-sm">
                Your journey will be populated as you progress through your academics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
