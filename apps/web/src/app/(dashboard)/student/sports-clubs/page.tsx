'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  Trophy,
  Users,
  Calendar,
  Medal,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  UserPlus,
  CheckCircle,
  ExternalLink,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantId } from '@/hooks/use-tenant';
import { useStudentByUserId } from '@/hooks/use-api';
import {
  useStudentActivities,
  useSportsTeams,
  useClubs,
  useSportsEvents,
  useClubEvents,
  useStudentCreditsSummary,
  useAddTeamMember,
  useAddClubMember,
  useRegisterForEvent,
} from '@/hooks/use-sports-clubs';

export default function StudentSportsClubsPage() {
  const { user } = useAuth();
  const tenantId = useTenantId() || '';
  const [activeTab, setActiveTab] = useState('overview');
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const [showJoinClubDialog, setShowJoinClubDialog] = useState(false);

  // Fetch student data
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');
  const studentId = studentData?.id || '';

  // Fetch student's activities (teams, clubs, registrations, achievements, credits)
  const { data: activities, isLoading: activitiesLoading } = useStudentActivities(tenantId, studentId);

  // Fetch all teams and clubs for "join" dialogs
  const { data: allTeamsData } = useSportsTeams(tenantId, { status: 'active' });
  const { data: allClubsData } = useClubs(tenantId, { status: 'active' });

  // Fetch upcoming events (use status filter instead of upcomingOnly)
  const { data: sportsEventsData } = useSportsEvents(tenantId, { status: 'upcoming' });
  const { data: clubEventsData } = useClubEvents(tenantId, { status: 'upcoming' });

  // Credits summary
  const { data: creditsSummary } = useStudentCreditsSummary(tenantId, studentId);

  // Mutations
  const addTeamMemberMutation = useAddTeamMember(tenantId);
  const addClubMemberMutation = useAddClubMember(tenantId);
  const registerForEventMutation = useRegisterForEvent(tenantId);

  // Derived data - StudentActivitiesResponse has teams: SportsTeam[], clubs: Club[]
  const myTeams = activities?.teams || [];
  const myClubs = activities?.clubs || [];
  const myAchievements = activities?.achievements || [];
  const myRegistrations = activities?.registrations || [];
  const registeredEventIds = new Set(myRegistrations.map(r => r.eventId));

  const allTeams = allTeamsData?.data || [];
  const allClubs = allClubsData?.data || [];
  const sportsEvents = sportsEventsData?.data || [];
  const clubEvents = clubEventsData?.data || [];

  // Available teams/clubs (not already a member)
  // myTeams is SportsTeam[] and myClubs is Club[], so use t.id directly
  const myTeamIds = new Set(myTeams.map(t => t.id));
  const myClubIds = new Set(myClubs.map(c => c.id));
  const availableTeams = allTeams.filter(t => !myTeamIds.has(t.id));
  const availableClubs = allClubs.filter(c => !myClubIds.has(c.id));

  // Credits summary with defaults
  // StudentCreditsSummary has totalCredits and byType: { type: string; credits: number }[]
  const totalCredits = creditsSummary?.totalCredits || 0;
  const maxCredits = 20; // This could come from settings
  const creditsByType = creditsSummary?.byType || [];

  const isLoading = studentLoading || activitiesLoading;

  // Handlers
  // Get student name for mutations - Student has user.name, not firstName/lastName
  const studentName = studentData?.user?.name || user?.name || '';
  const rollNo = studentData?.rollNo;

  const handleJoinTeam = async (teamId: string) => {
    try {
      await addTeamMemberMutation.mutateAsync({
        teamId,
        studentId,
        studentName,
        rollNo,
      });
      setShowJoinTeamDialog(false);
    } catch (error) {
      console.error('Failed to join team:', error);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await addClubMemberMutation.mutateAsync({
        clubId,
        studentId,
        studentName,
        rollNo,
      });
      setShowJoinClubDialog(false);
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const handleRegisterForEvent = async (eventId: string, eventType: 'sports' | 'club') => {
    try {
      await registerForEventMutation.mutateAsync({
        eventId,
        eventType,
        studentId,
        studentName,
        rollNo,
      });
    } catch (error) {
      console.error('Failed to register for event:', error);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      literary: 'bg-green-100 text-green-800',
      social: 'bg-orange-100 text-orange-800',
      hobby: 'bg-pink-100 text-pink-800',
      sports: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      college: { variant: 'outline', label: 'College' },
      'inter-college': { variant: 'secondary', label: 'Inter-College' },
      state: { variant: 'default', label: 'State' },
      national: { variant: 'default', label: 'National' },
      international: { variant: 'destructive', label: 'International' },
    };
    const config = variants[level] || { variant: 'outline', label: level };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      captain: 'default',
      president: 'default',
      'vice-captain': 'secondary',
      'vice-president': 'secondary',
      secretary: 'secondary',
      member: 'outline',
    };
    return <Badge variant={variants[role] || 'outline'}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sports & Clubs</h1>
        <p className="text-muted-foreground">Manage your team memberships, club activities, and achievements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Teams</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTeams.length}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myClubs.length}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAchievements.length}</div>
            <p className="text-xs text-muted-foreground">Verified awards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Credits</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}/{maxCredits}</div>
            <Progress value={(totalCredits / maxCredits) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">My Teams</TabsTrigger>
          <TabsTrigger value="clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Events you&apos;re registered for</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {myRegistrations.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No registered events yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRegistrations.slice(0, 4).map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Event Registration</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline" className="capitalize">{registration.eventType}</Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(registration.registrationDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" className="capitalize">{registration.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Join a Team</CardTitle>
                <CardDescription>Explore available sports teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableTeams.slice(0, 3).map(team => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{team.sport}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleJoinTeam(team.id)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Join
                      </Button>
                    </div>
                  ))}
                  {availableTeams.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No teams available</p>
                  )}
                </div>
                <Button variant="link" className="mt-4 w-full" onClick={() => setShowJoinTeamDialog(true)}>
                  View All Teams <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join a Club</CardTitle>
                <CardDescription>Explore available clubs and societies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableClubs.slice(0, 3).map(club => (
                    <div key={club.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{club.name}</p>
                        <p className="text-sm text-muted-foreground">{getCategoryBadge(club.category || 'other')}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleJoinClub(club.id)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Join
                      </Button>
                    </div>
                  ))}
                  {availableClubs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No clubs available</p>
                  )}
                </div>
                <Button variant="link" className="mt-4 w-full" onClick={() => setShowJoinClubDialog(true)}>
                  View All Clubs <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Activity Credits Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Credits Progress</CardTitle>
              <CardDescription>Your extracurricular activity credits by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditsByType.length > 0 ? (
                  creditsByType.map(({ type, credits }) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{type}</span>
                        <span className="text-muted-foreground">{credits} credits</span>
                      </div>
                      <Progress value={Math.min((credits / 10) * 100, 100)} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity credits earned yet. Participate in activities to earn credits!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Sports Teams</h2>
            <Button onClick={() => setShowJoinTeamDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Join Team
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {myTeams.map(team => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        {team.name}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {team.sport}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{team.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.coachName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coach</span>
                        <span className="font-medium">{team.coachName}</span>
                      </div>
                    )}
                    {team.captainName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Captain</span>
                        <span className="font-medium">{team.captainName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">{team._count?.members || 0}/{team.maxMembers}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Team Details <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {myTeams.length === 0 && (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Team Memberships</h3>
              <p className="text-muted-foreground mb-4">You haven&apos;t joined any sports teams yet.</p>
              <Button onClick={() => setShowJoinTeamDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Join a Team
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* My Clubs Tab */}
        <TabsContent value="clubs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Clubs & Societies</h2>
            <Button onClick={() => setShowJoinClubDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Join Club
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {myClubs.map(club => (
              <Card key={club.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {club.name}
                      </CardTitle>
                      <CardDescription>
                        {getCategoryBadge(club.category || 'other')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{club.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {club.facultyAdvisorName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Faculty Advisor</span>
                        <span className="font-medium">{club.facultyAdvisorName}</span>
                      </div>
                    )}
                    {club.presidentName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">President</span>
                        <span className="font-medium">{club.presidentName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">{club._count?.members || 0}{club.maxMembers ? `/${club.maxMembers}` : ''}</span>
                    </div>
                    {club.meetingSchedule && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Meetings</span>
                        <span className="font-medium">{club.meetingSchedule}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Club Details <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {myClubs.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Club Memberships</h3>
              <p className="text-muted-foreground mb-4">You haven&apos;t joined any clubs yet.</p>
              <Button onClick={() => setShowJoinClubDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Join a Club
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Sports Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sports Events</CardTitle>
              <CardDescription>Matches, tournaments, and sports activities</CardDescription>
            </CardHeader>
            <CardContent>
              {sportsEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming sports events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sportsEvents.map(event => {
                    const isRegistered = registeredEventIds.has(event.id);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{event.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="capitalize">{event.sport}</Badge>
                              <Badge variant="secondary" className="capitalize">{event.eventType}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                              {event.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.venue}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isRegistered ? (
                          <Badge variant="default">Registered</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRegisterForEvent(event.id, 'sports')}
                            disabled={registerForEventMutation.isPending}
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Club Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Club Events</CardTitle>
              <CardDescription>Workshops, competitions, and club activities</CardDescription>
            </CardHeader>
            <CardContent>
              {clubEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming club events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clubEvents.map(event => {
                    const isRegistered = registeredEventIds.has(event.id);
                    const isFull = event.maxParticipants && (event._count?.registrations || 0) >= event.maxParticipants;
                    return (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{event.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{event.club?.name || '-'}</Badge>
                              <Badge variant="secondary" className="capitalize">{event.eventType}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.startDate).toLocaleDateString()}
                              </span>
                              {event.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.venue}
                                </span>
                              )}
                              {event.maxParticipants && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {event._count?.registrations || 0}/{event.maxParticipants}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isRegistered ? (
                          <Badge variant="default">Registered</Badge>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!!isFull || registerForEventMutation.isPending}
                            onClick={() => handleRegisterForEvent(event.id, 'club')}
                          >
                            {isFull ? 'Full' : 'Register'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Achievements</h2>
            <div className="text-sm text-muted-foreground">
              Total Credits Earned: <span className="font-bold text-foreground">{totalCredits}</span>
            </div>
          </div>

          <div className="grid gap-4">
            {myAchievements.map(achievement => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Award className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{achievement.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{achievement.achievementType}</Badge>
                          {achievement.level && getLevelBadge(achievement.level)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Awarded on {new Date(achievement.eventDate || achievement.createdAt).toLocaleDateString()}
                        </p>
                        {achievement.eventName && (
                          <p className="text-sm text-muted-foreground">
                            Event: {achievement.eventName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {achievement.isVerified && (
                        <div className="flex items-center gap-1 text-green-600 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                      {achievement.creditsAwarded && achievement.creditsAwarded > 0 && (
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          +{achievement.creditsAwarded} credits
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myAchievements.length === 0 && (
            <Card className="p-8 text-center">
              <Medal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
              <p className="text-muted-foreground">
                Participate in events and competitions to earn achievements!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Join Team Dialog */}
      <Dialog open={showJoinTeamDialog} onOpenChange={setShowJoinTeamDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Join a Sports Team</DialogTitle>
            <DialogDescription>Browse and request to join available teams</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {availableTeams.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No teams available to join</p>
            ) : (
              availableTeams.map(team => {
                const memberCount = team._count?.members || 0;
                const isFull = team.maxMembers && memberCount >= team.maxMembers;
                return (
                  <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{team.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {team.sport}
                      </p>
                      {team.maxMembers && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {memberCount}/{team.maxMembers} members
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={!!isFull || addTeamMemberMutation.isPending}
                      onClick={() => handleJoinTeam(team.id)}
                    >
                      {isFull ? 'Full' : 'Request to Join'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinTeamDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Club Dialog */}
      <Dialog open={showJoinClubDialog} onOpenChange={setShowJoinClubDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Join a Club</DialogTitle>
            <DialogDescription>Browse and request to join available clubs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {availableClubs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No clubs available to join</p>
            ) : (
              availableClubs.map(club => {
                const memberCount = club._count?.members || 0;
                const isFull = club.maxMembers && memberCount >= club.maxMembers;
                return (
                  <div key={club.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{club.name}</h4>
                      <div className="mt-1">{getCategoryBadge(club.category || 'other')}</div>
                      {club.maxMembers && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {memberCount}/{club.maxMembers} members
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={!!isFull || addClubMemberMutation.isPending}
                      onClick={() => handleJoinClub(club.id)}
                    >
                      {isFull ? 'Full' : 'Request to Join'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinClubDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
