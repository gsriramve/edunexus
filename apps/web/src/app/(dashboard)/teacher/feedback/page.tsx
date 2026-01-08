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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Star,
  Users,
  AlertTriangle,
  Search,
  GraduationCap,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudents } from "@/hooks/use-api";
import {
  usePendingFeedback,
  useFeedbackCycles,
  useSubmitFeedback,
  useFeedbackStats,
  type PendingFeedback,
  type SubmitFeedbackInput,
  EvaluatorType,
  FeedbackCycleStatus,
} from "@/hooks/use-feedback";

const ratingLabels = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Below Average" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

export default function TeacherFeedbackPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedFeedback, setSelectedFeedback] = useState<PendingFeedback | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    academicRating: 0,
    participationRating: 0,
    teamworkRating: 0,
    communicationRating: 0,
    leadershipRating: 0,
    punctualityRating: 0,
    strengths: "",
    improvements: "",
  });

  const tenantId = useTenantId();

  const { data: pendingFeedback, isLoading: pendingLoading, refetch: refetchPending } = usePendingFeedback(tenantId || "");
  const { data: cyclesData, isLoading: cyclesLoading } = useFeedbackCycles(tenantId || "", {
    status: FeedbackCycleStatus.ACTIVE,
  });
  const { data: stats, isLoading: statsLoading } = useFeedbackStats(tenantId || "");

  const activeCycleId = cyclesData?.data?.[0]?.id;
  const submitFeedback = useSubmitFeedback(tenantId || "", activeCycleId || "");

  const isLoading = pendingLoading || cyclesLoading || statsLoading;

  const handleRatingClick = (field: keyof typeof feedbackForm, value: number) => {
    setFeedbackForm({ ...feedbackForm, [field]: value });
  };

  const handleSubmitFeedback = () => {
    if (!selectedFeedback || !activeCycleId) return;

    const data: SubmitFeedbackInput = {
      targetStudentId: selectedFeedback.targetStudentId,
      evaluatorType: EvaluatorType.FACULTY,
      academicRating: feedbackForm.academicRating || undefined,
      participationRating: feedbackForm.participationRating || undefined,
      teamworkRating: feedbackForm.teamworkRating || undefined,
      communicationRating: feedbackForm.communicationRating || undefined,
      leadershipRating: feedbackForm.leadershipRating || undefined,
      punctualityRating: feedbackForm.punctualityRating || undefined,
      strengths: feedbackForm.strengths || undefined,
      improvements: feedbackForm.improvements || undefined,
    };

    submitFeedback.mutate(data, {
      onSuccess: () => {
        setSelectedFeedback(null);
        setFeedbackForm({
          academicRating: 0,
          participationRating: 0,
          teamworkRating: 0,
          communicationRating: 0,
          leadershipRating: 0,
          punctualityRating: 0,
          strengths: "",
          improvements: "",
        });
        refetchPending();
      },
    });
  };

  const pendingCount = pendingFeedback?.length || 0;
  const overdueCount = pendingFeedback?.filter((f) => f.isOverdue).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Give Feedback</h1>
        <p className="text-muted-foreground">
          Provide 360-degree feedback for your students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{pendingCount}</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">{overdueCount}</span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
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
              <span className="text-2xl font-bold text-green-600">
                {stats?.completedFeedback || 0}
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats?.activeCycles || 0}</span>
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Cycle Info */}
      {cyclesData?.data?.[0] && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{cyclesData.data[0].name}</h3>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(cyclesData.data[0].endDate).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="default">Active Cycle</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Pending Feedback */}
        <TabsContent value="pending" className="space-y-4">
          {pendingFeedback && pendingFeedback.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingFeedback.map((feedback) => (
                <Card
                  key={`${feedback.cycleId}-${feedback.targetStudentId}`}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    feedback.isOverdue ? "border-red-200" : ""
                  }`}
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {feedback.targetStudentName?.[0] || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {feedback.targetStudentName}
                        </CardTitle>
                        <CardDescription>{feedback.cycleName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Due: {new Date(feedback.dueDate).toLocaleDateString()}
                      </div>
                      {feedback.isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All Caught Up!</h3>
                <p className="text-muted-foreground text-center">
                  No pending feedback to submit
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Completed Feedback</h3>
              <p className="text-muted-foreground text-center">
                You have submitted {stats?.completedFeedback || 0} feedback entries
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={selectedFeedback !== null} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Provide feedback for {selectedFeedback.targetStudentName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Rating Categories */}
                <div className="space-y-4">
                  {[
                    { key: "academicRating", label: "Academic Performance" },
                    { key: "participationRating", label: "Class Participation" },
                    { key: "teamworkRating", label: "Teamwork" },
                    { key: "communicationRating", label: "Communication" },
                    { key: "leadershipRating", label: "Leadership" },
                    { key: "punctualityRating", label: "Punctuality & Discipline" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium">{label}</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={
                              feedbackForm[key as keyof typeof feedbackForm] === rating
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleRatingClick(key as keyof typeof feedbackForm, rating)
                            }
                            className="flex-1"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                (feedbackForm[key as keyof typeof feedbackForm] as number) >= rating
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                            <span className="sr-only">{rating}</span>
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {feedbackForm[key as keyof typeof feedbackForm]
                          ? ratingLabels.find(
                              (r) => r.value === feedbackForm[key as keyof typeof feedbackForm]
                            )?.label
                          : "Not rated"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Text Feedback */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strengths</label>
                  <Textarea
                    value={feedbackForm.strengths}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, strengths: e.target.value })
                    }
                    placeholder="What are the student's key strengths?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Areas for Improvement</label>
                  <Textarea
                    value={feedbackForm.improvements}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, improvements: e.target.value })
                    }
                    placeholder="What areas need improvement?"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitFeedback.isPending}
                >
                  {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
