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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  Award,
  Trophy,
  Heart,
  Brain,
  Calendar,
  Edit2,
  Trash2,
  TrendingUp,
  Filter,
  User,
  Sparkles,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useAuth } from "@/lib/auth";
import { useStudentByUserId } from "@/hooks/use-api";
import {
  useMyGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useGoalSuggestions,
  GoalCategory,
  GoalStatus,
  type Goal,
  type CreateGoalInput,
  type UpdateGoalInput,
  type GoalSuggestion,
} from "@/hooks/use-ai-guidance";
import { GoalForm, GoalSuggestions, ProgressUpdateDialog } from "@/components/goals";
import { GoalCard } from "@/components/guidance";

export default function StudentGoalsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const tenantId = useTenantId();
  const { user } = useAuth();

  // Get student data
  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || "",
    user?.id || ""
  );

  // Fetch goals
  const { data: goalsData, isLoading: goalsLoading, refetch: refetchGoals } = useMyGoals(
    tenantId || "",
    {
      category: categoryFilter !== "all" ? categoryFilter as GoalCategory : undefined,
      status: statusFilter !== "all" ? statusFilter as GoalStatus : undefined,
    }
  );

  // Fetch AI suggestions
  const { data: suggestions, isLoading: suggestionsLoading, refetch: refetchSuggestions } = useGoalSuggestions(
    tenantId || "",
    student?.id || "",
    5
  );

  // Mutations
  const createGoal = useCreateGoal(tenantId || "");
  const deleteGoal = useDeleteGoal(tenantId || "");

  const isLoading = studentLoading || goalsLoading;
  const goals = goalsData?.data || [];

  // Calculate summary stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
  const activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Filter goals by status for display
  const activeGoalsList = goals.filter(g => g.status === GoalStatus.ACTIVE);
  const completedGoalsList = goals.filter(g => g.status === GoalStatus.COMPLETED);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GoalCategory.ACADEMIC:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case GoalCategory.CAREER:
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case GoalCategory.SKILL:
        return <Award className="h-5 w-5 text-yellow-500" />;
      case GoalCategory.EXTRACURRICULAR:
        return <Trophy className="h-5 w-5 text-green-500" />;
      case GoalCategory.PERSONAL:
        return <Heart className="h-5 w-5 text-pink-500" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const handleCreateGoal = (data: CreateGoalInput | UpdateGoalInput) => {
    createGoal.mutate(data as CreateGoalInput, {
      onSuccess: () => {
        setShowAddDialog(false);
        refetchGoals();
      },
    });
  };

  const handleUpdateGoal = (data: CreateGoalInput | UpdateGoalInput) => {
    if (!editingGoal) return;
    // Would use useUpdateGoal mutation
    console.log("Update goal:", editingGoal.id, data);
    setEditingGoal(null);
    refetchGoals();
  };

  const handleDeleteGoal = () => {
    if (!deletingGoal) return;
    deleteGoal.mutate(deletingGoal.id, {
      onSuccess: () => {
        setDeletingGoal(null);
        refetchGoals();
      },
    });
  };

  const handleUpdateProgress = (goalId: string, progress: number, currentValue?: number) => {
    console.log("Update progress:", goalId, progress, currentValue);
    setProgressGoal(null);
    refetchGoals();
  };

  const handleAcceptSuggestion = (suggestion: GoalSuggestion) => {
    if (!student?.id) return;
    const goalData: CreateGoalInput = {
      studentId: student.id,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category as GoalCategory,
      targetValue: suggestion.targetValue,
      unit: suggestion.unit,
      isAiSuggested: true,
    };
    createGoal.mutate(goalData, {
      onSuccess: () => {
        refetchGoals();
        refetchSuggestions();
      },
    });
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
          <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your personal and academic goals
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
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
              <span className="text-2xl font-bold">{totalGoals}</span>
              <Target className="h-5 w-5 text-muted-foreground" />
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
              <span className="text-2xl font-bold text-blue-600">{activeGoals}</span>
              <Clock className="h-5 w-5 text-blue-500" />
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
              <span className="text-2xl font-bold text-green-600">{completedGoals}</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
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
              <span className="text-2xl font-bold">{completionRate}%</span>
              <TrendingUp className={`h-5 w-5 ${completionRate >= 50 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <GoalSuggestions
        suggestions={suggestions}
        isLoading={suggestionsLoading}
        onAcceptSuggestion={handleAcceptSuggestion}
        onRefresh={() => refetchSuggestions()}
        isRefreshing={suggestionsLoading}
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value={GoalCategory.ACADEMIC}>Academic</SelectItem>
              <SelectItem value={GoalCategory.CAREER}>Career</SelectItem>
              <SelectItem value={GoalCategory.SKILL}>Skill</SelectItem>
              <SelectItem value={GoalCategory.EXTRACURRICULAR}>Extracurricular</SelectItem>
              <SelectItem value={GoalCategory.PERSONAL}>Personal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={GoalStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={GoalStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        <Badge variant="outline" className="text-sm">
          {goals.length} goal{goals.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Active Goals */}
      {activeGoalsList.length > 0 && (statusFilter === "all" || statusFilter === GoalStatus.ACTIVE) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Active Goals
            <Badge variant="secondary">{activeGoalsList.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoalsList.map((goal) => (
              <Card key={goal.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(goal.category)}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                          {goal.title}
                          {goal.isAiSuggested && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          {goal.isMentorAssigned && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Mentor
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
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setProgressGoal(goal)}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeletingGoal(goal)}
                      >
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
                        {new Date(goal.targetDate) < new Date() && (
                          <Badge variant="destructive" className="text-xs">Overdue</Badge>
                        )}
                      </div>
                    )}

                    {/* Milestones preview */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones completed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoalsList.length > 0 && (statusFilter === "all" || statusFilter === GoalStatus.COMPLETED) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completed Goals
            <Badge variant="secondary">{completedGoalsList.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoalsList.map((goal) => (
              <Card key={goal.id} className="bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
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
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Completed
                    </Badge>
                    {goal.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(goal.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {categoryFilter !== "all" || statusFilter !== "all"
                ? "No goals match your current filters."
                : "Start by adding your first goal to track your progress."}
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goal Form Dialog */}
      <GoalForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        studentId={student?.id || ""}
        onSubmit={handleCreateGoal}
        isLoading={createGoal.isPending}
        mode="create"
      />

      {/* Edit Goal Dialog */}
      <GoalForm
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        goal={editingGoal}
        studentId={student?.id || ""}
        onSubmit={handleUpdateGoal}
        isLoading={false}
        mode="edit"
      />

      {/* Progress Update Dialog */}
      <ProgressUpdateDialog
        open={!!progressGoal}
        onOpenChange={(open) => !open && setProgressGoal(null)}
        goal={progressGoal}
        onUpdate={handleUpdateProgress}
        isLoading={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGoal} onOpenChange={(open) => !open && setDeletingGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingGoal?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteGoal.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
