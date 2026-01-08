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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Handshake,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Star,
  Calendar,
  TrendingUp,
  Award,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useMyMentorshipsAsAlumni,
  usePendingMentorshipRequests,
  useRespondMentorship,
  useLogMeeting,
  useMyMentorStats,
  type Mentorship,
  type MentorshipStatus,
} from "@/hooks/use-api";

const focusAreaLabels: Record<string, string> = {
  career_guidance: "Career Guidance",
  technical: "Technical Skills",
  interview_prep: "Interview Preparation",
  resume_review: "Resume Review",
  higher_studies: "Higher Studies",
  entrepreneurship: "Entrepreneurship",
  general: "General Guidance",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function AlumniMentorshipPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<Mentorship | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [dialogAction, setDialogAction] = useState<"accept" | "decline" | null>(null);

  const tenantId = useTenantId();

  const { data: mentorships, isLoading: mentorshipsLoading } = useMyMentorshipsAsAlumni(tenantId || "");
  const { data: pendingRequests, isLoading: pendingLoading, refetch: refetchPending } = usePendingMentorshipRequests(tenantId || "");
  const { data: stats, isLoading: statsLoading } = useMyMentorStats(tenantId || "");

  const respondMentorship = useRespondMentorship(tenantId || "");
  const logMeeting = useLogMeeting(tenantId || "");

  const isLoading = mentorshipsLoading || pendingLoading;

  const activeMentorships = mentorships?.filter(m => m.status === "active") || [];
  const completedMentorships = mentorships?.filter(m => m.status === "completed") || [];

  const handleRespond = (status: MentorshipStatus) => {
    if (selectedRequest) {
      respondMentorship.mutate(
        {
          id: selectedRequest.id,
          data: { status, responseMessage: responseMessage || undefined },
        },
        {
          onSuccess: () => {
            setSelectedRequest(null);
            setResponseMessage("");
            setDialogAction(null);
            refetchPending();
          },
        }
      );
    }
  };

  const handleLogMeeting = (mentorshipId: string) => {
    logMeeting.mutate(mentorshipId);
  };

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
        <h1 className="text-3xl font-bold tracking-tight">My Mentorships</h1>
        <p className="text-muted-foreground">
          Manage your mentee relationships and respond to requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mentees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats?.totalMentees || 0}</span>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Mentees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats?.activeMentees || 0}</span>
              <Handshake className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {stats?.averageRating?.toFixed(1) || "N/A"}
              </span>
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            {stats?.totalRatings && (
              <p className="text-xs text-muted-foreground">
                {stats.totalRatings} reviews
              </p>
            )}
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
              <span className="text-2xl font-bold">{stats?.completedMentorships || 0}</span>
              <Award className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            <Handshake className="h-4 w-4 mr-2" />
            Active ({activeMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed ({completedMentorships.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests && pendingRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {request.student?.user?.name?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {request.student?.user?.name || "Student"}
                          </CardTitle>
                          <CardDescription>
                            {request.student?.department?.name || "Unknown Department"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors.pending}>
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Focus Area</p>
                      <Badge variant="secondary">
                        {focusAreaLabels[request.focusArea] || request.focusArea}
                      </Badge>
                    </div>

                    {request.requestMessage && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Message</p>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          "{request.requestMessage}"
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogAction("accept");
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogAction("decline");
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Pending Requests</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any pending mentorship requests
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Mentorships */}
        <TabsContent value="active" className="space-y-4">
          {activeMentorships.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeMentorships.map((mentorship) => (
                <Card key={mentorship.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {mentorship.student?.user?.name?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {mentorship.student?.user?.name || "Student"}
                          </CardTitle>
                          <CardDescription>
                            {mentorship.student?.department?.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={statusColors.active}>Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        {focusAreaLabels[mentorship.focusArea] || mentorship.focusArea}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {mentorship.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started {new Date(mentorship.startDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {mentorship.meetingsCount} meetings
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleLogMeeting(mentorship.id)}
                        disabled={logMeeting.isPending}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Log Meeting
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Active Mentorships</h3>
                <p className="text-muted-foreground text-center">
                  Accept requests to start mentoring students
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Mentorships */}
        <TabsContent value="completed" className="space-y-4">
          {completedMentorships.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedMentorships.map((mentorship) => (
                <Card key={mentorship.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {mentorship.student?.user?.name?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {mentorship.student?.user?.name || "Student"}
                          </CardTitle>
                          <CardDescription>
                            {mentorship.student?.department?.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={statusColors.completed}>Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {mentorship.meetingsCount} meetings
                      </div>
                      {mentorship.studentRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {mentorship.studentRating}/5
                        </div>
                      )}
                    </div>
                    {mentorship.studentReview && (
                      <p className="text-sm mt-2 bg-muted p-3 rounded-lg">
                        "{mentorship.studentReview}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Completed Mentorships</h3>
                <p className="text-muted-foreground text-center">
                  Completed mentorships will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={dialogAction !== null} onOpenChange={() => {
        setDialogAction(null);
        setSelectedRequest(null);
        setResponseMessage("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "accept" ? "Accept Mentorship Request" : "Decline Request"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "accept"
                ? "You're about to accept this mentorship request."
                : "Are you sure you want to decline this request?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  dialogAction === "accept"
                    ? "Welcome message for your new mentee..."
                    : "Reason for declining (optional)..."
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogAction(null);
                setSelectedRequest(null);
                setResponseMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={dialogAction === "accept" ? "default" : "destructive"}
              onClick={() => handleRespond(dialogAction === "accept" ? "active" : "cancelled")}
              disabled={respondMentorship.isPending}
            >
              {respondMentorship.isPending
                ? "Processing..."
                : dialogAction === "accept"
                ? "Accept"
                : "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
