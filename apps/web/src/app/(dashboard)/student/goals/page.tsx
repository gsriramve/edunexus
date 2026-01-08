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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  Award,
  Trophy,
  Brain,
  Calendar,
  ChevronRight,
  Edit2,
  Trash2,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useUser } from "@clerk/nextjs";

// Mock data - will be replaced with API hooks
const mockGoalsData = {
  summary: {
    total: 8,
    completed: 3,
    inProgress: 4,
    pending: 1,
  },
  goals: [
    {
      id: "1",
      title: "Achieve 8.5+ CGPA",
      description: "Maintain consistent academic performance",
      category: "academic",
      targetDate: "2026-05-31",
      targetValue: 8.5,
      currentValue: 8.2,
      unit: "CGPA",
      status: "active",
      progress: 82,
      isAiSuggested: false,
      isMentorAssigned: true,
    },
    {
      id: "2",
      title: "Complete AWS Certification",
      description: "Get AWS Cloud Practitioner certification",
      category: "skill",
      targetDate: "2026-02-28",
      status: "active",
      progress: 60,
      isAiSuggested: true,
      isMentorAssigned: false,
    },
    {
      id: "3",
      title: "Secure Summer Internship",
      description: "Get an internship at a product company",
      category: "career",
      targetDate: "2026-03-31",
      status: "active",
      progress: 30,
      isAiSuggested: false,
      isMentorAssigned: false,
    },
    {
      id: "4",
      title: "Lead a Club Event",
      description: "Organize a technical workshop for juniors",
      category: "extracurricular",
      targetDate: "2026-02-15",
      status: "active",
      progress: 45,
      isAiSuggested: false,
      isMentorAssigned: false,
    },
    {
      id: "5",
      title: "Complete 100 LeetCode Problems",
      description: "Practice DSA for placements",
      category: "skill",
      targetValue: 100,
      currentValue: 65,
      unit: "problems",
      status: "active",
      progress: 65,
      isAiSuggested: true,
      isMentorAssigned: false,
    },
    {
      id: "6",
      title: "Learn React Framework",
      description: "Master React for web development",
      category: "skill",
      status: "completed",
      progress: 100,
      isAiSuggested: false,
      isMentorAssigned: false,
    },
    {
      id: "7",
      title: "Win Hackathon",
      description: "Participate and win a college hackathon",
      category: "extracurricular",
      status: "completed",
      progress: 100,
      isAiSuggested: false,
      isMentorAssigned: false,
    },
    {
      id: "8",
      title: "Build Portfolio Website",
      description: "Create a personal portfolio to showcase projects",
      category: "career",
      status: "completed",
      progress: 100,
      isAiSuggested: false,
      isMentorAssigned: false,
    },
  ],
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "academic":
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case "career":
      return <Briefcase className="h-5 w-5 text-purple-500" />;
    case "skill":
      return <Award className="h-5 w-5 text-yellow-500" />;
    case "extracurricular":
      return <Trophy className="h-5 w-5 text-green-500" />;
    default:
      return <Target className="h-5 w-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function StudentGoalsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const tenantId = useTenantId();
  const { user } = useUser();

  const isLoading = false;
  const data = mockGoalsData;

  const filteredGoals = categoryFilter === "all"
    ? data.goals
    : data.goals.filter(g => g.category === categoryFilter);

  const activeGoals = filteredGoals.filter(g => g.status === "active");
  const completedGoals = filteredGoals.filter(g => g.status === "completed");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your personal and academic goals
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter goal title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Describe your goal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="extracurricular">Extracurricular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Date</label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Value (optional)</label>
                  <Input type="number" placeholder="e.g., 100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit (optional)</label>
                  <Input placeholder="e.g., problems, hours" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddDialog(false)}>
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{data.summary.total}</span>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{data.summary.completed}</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{data.summary.inProgress}</span>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {Math.round((data.summary.completed / data.summary.total) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="skill">Skill</SelectItem>
            <SelectItem value="extracurricular">Extracurricular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Goals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(goal.category)}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {goal.title}
                          {goal.isAiSuggested && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              AI Suggested
                            </Badge>
                          )}
                        </CardTitle>
                        {goal.description && (
                          <CardDescription className="mt-1">
                            {goal.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    {/* Target Value */}
                    {goal.targetValue !== undefined && goal.currentValue !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-medium">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                    )}

                    {/* Target Date */}
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Mentor Badge */}
                    {goal.isMentorAssigned && (
                      <Badge variant="secondary" className="text-xs">
                        Mentor Assigned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completed Goals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      {goal.description && (
                        <CardDescription className="mt-1">
                          {goal.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(goal.status)}>
                    Completed
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {categoryFilter !== "all"
                ? `No goals in the ${categoryFilter} category yet.`
                : "Start by adding your first goal."}
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
