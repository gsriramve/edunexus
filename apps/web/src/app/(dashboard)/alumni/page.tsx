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

// Placeholder data - will be replaced with API calls
const mockAlumniData = {
  profile: {
    firstName: "Rahul",
    lastName: "Sharma",
    batch: "2020-2024",
    department: "Computer Science",
    currentCompany: "Tech Corp",
    currentRole: "Software Engineer",
    openToMentoring: true,
    profileCompletion: 85,
  },
  stats: {
    activeMentees: 2,
    upcomingEvents: 3,
    contributions: 1,
    testimonials: 1,
  },
  upcomingEvents: [
    {
      id: "1",
      title: "Alumni Meet 2026",
      date: "2026-02-15",
      type: "reunion",
    },
    {
      id: "2",
      title: "Tech Talk: AI in Industry",
      date: "2026-01-25",
      type: "guest_lecture",
    },
  ],
  recentAnnouncements: [
    {
      id: "1",
      title: "New Scholarship Fund Launched",
      date: "2026-01-05",
    },
    {
      id: "2",
      title: "Campus Infrastructure Upgrade",
      date: "2026-01-02",
    },
  ],
  mentorshipRequests: [
    {
      id: "1",
      studentName: "Priya Kumar",
      focusArea: "career_guidance",
      status: "pending",
    },
  ],
};

export default function AlumniDashboardPage() {
  const data = mockAlumniData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {data.profile.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Stay connected with your alma mater
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {data.profile.batch}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeMentees}</div>
            <p className="text-xs text-muted-foreground">
              students you're mentoring
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              events this quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.contributions}</div>
            <p className="text-xs text-muted-foreground">
              total contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.testimonials}</div>
            <p className="text-xs text-muted-foreground">
              success stories shared
            </p>
          </CardContent>
        </Card>
      </div>

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
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {data.profile.firstName[0]}{data.profile.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold">
                  {data.profile.firstName} {data.profile.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.profile.department}, {data.profile.batch}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{data.profile.currentCompany}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{data.profile.currentRole}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Profile completion: {data.profile.profileCompletion}%
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/alumni/profile">
                  Complete Profile <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {data.profile.openToMentoring && (
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
            </CardTitle>
            <CardDescription>
              Students seeking your guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.mentorshipRequests.length > 0 ? (
              <div className="space-y-4">
                {data.mentorshipRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{request.studentName}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {request.focusArea.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                      <Button size="sm">Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Handshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending mentorship requests</p>
              </div>
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
            <div className="space-y-4">
              {data.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {event.type.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {data.recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 rounded-lg border"
                >
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
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
