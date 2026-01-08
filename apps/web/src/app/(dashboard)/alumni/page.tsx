"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserCheck,
  Handshake,
  Calendar,
  Users,
  Award,
  Star,
  ArrowRight,
  Bell,
  Building2,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useMyAlumniProfile,
  useMyMentorStats,
  usePendingMentorshipRequests,
  useUpcomingAlumniEvents,
  useMyContributions,
} from "@/hooks/use-alumni";
import { AlumniStatsRow } from "@/components/alumni/AlumniStatsRow";
import {
  MentorshipRequestCard,
  MentorshipRequestCardSkeleton,
  MentorshipRequestsEmptyState,
} from "@/components/alumni/MentorshipRequestCard";
import {
  EventCard,
  EventCardSkeleton,
  EventsEmptyState,
} from "@/components/alumni/EventCard";

export default function AlumniDashboardPage() {
  const tenantId = useTenantId();

  // Fetch data using hooks
  const { data: profile, isLoading: profileLoading } = useMyAlumniProfile(tenantId || "");
  const { data: mentorStats, isLoading: statsLoading } = useMyMentorStats(tenantId || "");
  const { data: pendingRequests, isLoading: requestsLoading, refetch: refetchRequests } = usePendingMentorshipRequests(tenantId || "");
  const { data: upcomingEvents, isLoading: eventsLoading } = useUpcomingAlumniEvents(tenantId || "", 5);
  const { data: contributions } = useMyContributions(tenantId || "");

  const isLoading = profileLoading || statsLoading;

  // Calculate dashboard stats
  const dashboardStats = {
    activeMentees: mentorStats?.activeMentees || 0,
    upcomingEvents: upcomingEvents?.length || 0,
    contributions: contributions?.length || 0,
    testimonials: 0, // Would need a separate hook for this
  };

  // Get current employment
  const currentEmployment = profile?.employmentHistory?.find(emp => emp.isCurrent);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <AlumniStatsRow stats={undefined} isLoading={true} />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Alumni Dashboard</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Your alumni profile hasn't been set up yet.
            </p>
            <Button asChild>
              <Link href="/alumni/profile">Set Up Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Stay connected with your alma mater
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {profile.batch}
        </Badge>
      </div>

      {/* Quick Stats */}
      <AlumniStatsRow stats={dashboardStats} isLoading={false} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>
              Keep your profile updated to connect with fellow alumni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-lg">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.department?.name || profile.batch}
                </p>
              </div>
            </div>

            {currentEmployment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{currentEmployment.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{currentEmployment.role}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href="/alumni/profile">
                  Edit Profile <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {profile.openToMentoring && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Open to Mentoring
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Mentorship Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Mentorship Requests
              {pendingRequests && pendingRequests.length > 0 && (
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Students seeking your guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="space-y-4">
                <MentorshipRequestCardSkeleton />
              </div>
            ) : pendingRequests && pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 2).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {request.student?.user?.name?.[0] || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {request.student?.user?.name || "Student"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {request.focusArea?.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                ))}
                {pendingRequests.length > 2 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{pendingRequests.length - 2} more requests
                  </p>
                )}
              </div>
            ) : (
              <MentorshipRequestsEmptyState />
            )}
            <Button variant="link" className="w-full mt-4" asChild>
              <Link href="/alumni/mentorship">
                View All Mentorships <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Don't miss these alumni events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                <EventCardSkeleton compact />
                <EventCardSkeleton compact />
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </div>
            ) : (
              <EventsEmptyState />
            )}
            <Button variant="link" className="w-full mt-4" asChild>
              <Link href="/alumni/events">
                View All Events <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              College Updates
            </CardTitle>
            <CardDescription>
              Latest news from your alma mater
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No recent announcements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Ways to contribute and stay connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/alumni/directory">
                <Users className="h-6 w-6" />
                <span>Find Alumni</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/alumni/contribute">
                <Award className="h-6 w-6" />
                <span>Make a Contribution</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/alumni/testimonials">
                <Star className="h-6 w-6" />
                <span>Share Your Story</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/alumni/mentorship">
                <Handshake className="h-6 w-6" />
                <span>Mentor a Student</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
