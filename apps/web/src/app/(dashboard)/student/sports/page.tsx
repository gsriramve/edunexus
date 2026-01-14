'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Trophy,
  Users,
  Calendar,
  Award,
  Star,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  Medal,
  Clock,
  MapPin,
  UserCheck,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  sportsClubsApi,
  SportsTeam,
  Club,
  SportsEvent,
  ClubEvent,
  Achievement,
  EventRegistration,
  ActivityCredit,
  StudentActivitiesResponse,
  CreateAchievementInput,
} from '@/lib/api';
import { useTenantId } from '@/hooks/use-tenant';
import { useStudentByUserId } from '@/hooks/use-api';

export default function StudentSportsPage() {
  // Auth context
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId() || '';
  const { data: studentData, isLoading: studentLoading } = useStudentByUserId(tenantId, user?.id || '');

  const studentId = studentData?.id || '';
  const studentName = studentData?.user?.name || '';
  const rollNo = studentData?.rollNo || '';

  const [activeTab, setActiveTab] = useState('overview');
  const [studentActivities, setStudentActivities] = useState<StudentActivitiesResponse | null>(null);
  const [allSportsEvents, setAllSportsEvents] = useState<SportsEvent[]>([]);
  const [allClubEvents, setAllClubEvents] = useState<ClubEvent[]>([]);
  const [allTeams, setAllTeams] = useState<SportsTeam[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const [showJoinClubDialog, setShowJoinClubDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | ClubEvent | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'sports' | 'club'>('sports');

  // Form states
  const [achievementForm, setAchievementForm] = useState<Partial<CreateAchievementInput>>({
    studentId: '',
    studentName: '',
    rollNo: '',
  });

  // Update achievement form when student data loads
  useEffect(() => {
    if (studentId && studentName && rollNo) {
      setAchievementForm({
        studentId,
        studentName,
        rollNo,
      });
    }
  }, [studentId, studentName, rollNo]);

  useEffect(() => {
    if (tenantId && studentId) {
      loadData();
    }
  }, [tenantId, studentId]);

  const loadData = async () => {
    if (!tenantId || !studentId) return;
    setLoading(true);
    try {
      const [activities, sportsEvents, clubEvents, teams, clubs] = await Promise.all([
        sportsClubsApi.getStudentActivities(tenantId, studentId),
        sportsClubsApi.listSportsEvents(tenantId, { upcomingOnly: true, limit: 20 }),
        sportsClubsApi.listClubEvents(tenantId, { upcomingOnly: true, limit: 20 }),
        sportsClubsApi.listTeams(tenantId, { status: 'recruiting', limit: 50 }),
        sportsClubsApi.listClubs(tenantId, { status: 'recruiting', limit: 50 }),
      ]);
      setStudentActivities(activities);
      setAllSportsEvents(sportsEvents.data);
      setAllClubEvents(clubEvents.data);
      setAllTeams(teams.data);
      setAllClubs(clubs.data);
    } catch (error) {
      console.error('Failed to load sports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAchievement = async () => {
    if (!tenantId) return;
    try {
      await sportsClubsApi.createAchievement(tenantId, achievementForm as CreateAchievementInput);
      setShowAchievementDialog(false);
      setAchievementForm({
        studentId,
        studentName,
        rollNo,
      });
      loadData();
    } catch (error) {
      console.error('Failed to submit achievement:', error);
    }
  };

  const handleRegisterForEvent = async () => {
    if (!selectedEvent || !tenantId) return;
    try {
      await sportsClubsApi.registerForEvent(tenantId, {
        eventId: selectedEvent.id,
        eventType: selectedEventType,
        studentId,
        studentName,
        rollNo,
      });
      setShowRegisterDialog(false);
      setSelectedEvent(null);
      loadData();
    } catch (error) {
      console.error('Failed to register for event:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      recruiting: 'outline',
      upcoming: 'outline',
      ongoing: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      postponed: 'secondary',
      registered: 'outline',
      confirmed: 'default',
      attended: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      college: 'bg-blue-100 text-blue-800',
      university: 'bg-green-100 text-green-800',
      state: 'bg-yellow-100 text-yellow-800',
      national: 'bg-orange-100 text-orange-800',
      international: 'bg-purple-100 text-purple-800',
    };
    return <Badge className={colors[level] || 'bg-gray-100 text-gray-800'}>{level}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Initial loading state
  if (authLoading || studentLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Loading sports data
  if (loading && studentId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading sports data...</p>
        </div>
      </div>
    );
  }

  const myTeams = studentActivities?.teams || [];
  const myClubs = studentActivities?.clubs || [];
  const myRegistrations = studentActivities?.registrations || [];
  const myAchievements = studentActivities?.achievements || [];
  const myCredits = studentActivities?.credits || { total: 0, byType: [] };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sports & Clubs</h1>
          <p className="text-muted-foreground">Explore teams, clubs, events, and track your achievements</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams & Clubs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Teams</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myTeams.length}</div>
                <p className="text-xs text-muted-foreground">
                  Sports teams joined
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Clubs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myClubs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Student clubs joined
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myAchievements.length}</div>
                <p className="text-xs text-muted-foreground">
                  {myAchievements.filter(a => a.isVerified).length} verified
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity Credits</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myCredits.total}</div>
                <p className="text-xs text-muted-foreground">
                  Total credits earned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('teams')}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Join a Team</h3>
                    <p className="text-sm text-muted-foreground">Explore sports teams accepting members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('events')}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Browse Events</h3>
                    <p className="text-sm text-muted-foreground">Register for upcoming events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Medal className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Submit Achievement</h3>
                        <p className="text-sm text-muted-foreground">Report a new achievement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit Achievement</DialogTitle>
                  <DialogDescription>Report your achievement for verification</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input
                      value={achievementForm.title || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                      placeholder="Achievement title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type *</Label>
                    <Select
                      value={achievementForm.achievementType}
                      onValueChange={(value) => setAchievementForm({ ...achievementForm, achievementType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Level *</Label>
                    <Select
                      value={achievementForm.level}
                      onValueChange={(value) => setAchievementForm({ ...achievementForm, level: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Name</Label>
                    <Input
                      value={achievementForm.eventName || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, eventName: e.target.value })}
                      placeholder="Event or competition name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Date *</Label>
                    <Input
                      type="date"
                      value={achievementForm.eventDate || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, eventDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Position/Rank</Label>
                    <Input
                      value={achievementForm.position || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, position: e.target.value })}
                      placeholder="e.g., 1st Place, Gold Medal"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={achievementForm.description || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                      placeholder="Describe your achievement..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAchievementDialog(false)}>Cancel</Button>
                  <Button onClick={handleSubmitAchievement} disabled={!achievementForm.title || !achievementForm.achievementType || !achievementForm.level || !achievementForm.eventDate}>
                    Submit for Review
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Recent Registrations */}
          {myRegistrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Event Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myRegistrations.slice(0, 5).map((reg) => (
                    <div key={reg.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Event ID: {reg.eventId}</p>
                        <p className="text-sm text-muted-foreground">
                          Registered on {formatDate(reg.registrationDate)}
                        </p>
                      </div>
                      {getStatusBadge(reg.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Teams & Clubs Tab */}
        <TabsContent value="teams" className="space-y-6">
          {/* My Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                My Teams
              </CardTitle>
              <CardDescription>Sports teams you are a member of</CardDescription>
            </CardHeader>
            <CardContent>
              {myTeams.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {myTeams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">{team.sport}</p>
                            {team.coachName && (
                              <p className="text-xs text-muted-foreground">Coach: {team.coachName}</p>
                            )}
                          </div>
                          {getStatusBadge(team.status)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>You haven't joined any sports teams yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Clubs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Clubs
              </CardTitle>
              <CardDescription>Student clubs you are a member of</CardDescription>
            </CardHeader>
            <CardContent>
              {myClubs.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {myClubs.map((club) => (
                    <Card key={club.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{club.name}</h4>
                            <p className="text-sm text-muted-foreground">{club.category}</p>
                            {club.meetingSchedule && (
                              <p className="text-xs text-muted-foreground">{club.meetingSchedule}</p>
                            )}
                          </div>
                          {getStatusBadge(club.status)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>You haven't joined any clubs yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available to Join */}
          <Card>
            <CardHeader>
              <CardTitle>Open for Membership</CardTitle>
              <CardDescription>Teams and clubs accepting new members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Available Teams */}
                {allTeams.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Sports Teams</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {allTeams.slice(0, 4).map((team) => (
                        <div key={team.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-muted-foreground">{team.sport}</p>
                          </div>
                          <Button size="sm" variant="outline">Apply</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Clubs */}
                {allClubs.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Student Clubs</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {allClubs.slice(0, 4).map((club) => (
                        <div key={club.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{club.name}</p>
                            <p className="text-sm text-muted-foreground">{club.category}</p>
                          </div>
                          <Button size="sm" variant="outline">Join</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {allTeams.length === 0 && allClubs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No teams or clubs are currently recruiting
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sports Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Upcoming Sports Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allSportsEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{event.name}</h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{event.sport} - {event.eventType}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(event.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {event._count?.registrations || 0} registered
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setSelectedEventType('sports');
                            setShowRegisterDialog(true);
                          }}
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  ))}
                  {allSportsEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No upcoming sports events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Club Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Upcoming Club Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allClubEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{event.name}</h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{event.club?.name} - {event.eventType}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(event.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {event._count?.registrations || 0} registered
                          {event.registrationFee && event.registrationFee > 0 && (
                            <span className="ml-2">| Fee: ₹{event.registrationFee}</span>
                          )}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setSelectedEventType('club');
                            setShowRegisterDialog(true);
                          }}
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  ))}
                  {allClubEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No upcoming club events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Dialog */}
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Registration</DialogTitle>
                <DialogDescription>
                  Register for {selectedEvent?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedEvent && (
                  <div className="space-y-2">
                    <p><strong>Event:</strong> {selectedEvent.name}</p>
                    <p><strong>Date:</strong> {formatDateTime(selectedEvent.startDate)}</p>
                    <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
                <Button onClick={handleRegisterForEvent}>
                  Confirm Registration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <Button onClick={() => setShowAchievementDialog(true)}>
              <Medal className="h-4 w-4 mr-2" />
              Submit Achievement
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {myAchievements.length > 0 ? (
                <div className="space-y-4">
                  {myAchievements.filter(a =>
                    a.title.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((achievement) => (
                    <div key={achievement.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.eventName || 'General Achievement'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getLevelBadge(achievement.level)}
                          {achievement.isVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{achievement.achievementType}</span>
                        <span>{formatDate(achievement.eventDate)}</span>
                        {achievement.position && (
                          <span className="font-medium text-primary">{achievement.position}</span>
                        )}
                        {achievement.creditsAwarded && (
                          <Badge variant="outline">{achievement.creditsAwarded} credits</Badge>
                        )}
                      </div>
                      {achievement.description && (
                        <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium text-lg mb-2">No Achievements Yet</h3>
                  <p className="mb-4">Submit your first achievement to get started!</p>
                  <Button onClick={() => setShowAchievementDialog(true)}>
                    Submit Achievement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{myCredits.total}</div>
                <p className="text-xs text-muted-foreground">Activity credits earned</p>
              </CardContent>
            </Card>
            {myCredits.byType.slice(0, 2).map((item) => (
              <Card key={item.type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{item.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{item.credits}</div>
                  <p className="text-xs text-muted-foreground">credits</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Credits by Activity Type</CardTitle>
              <CardDescription>Breakdown of your activity credits</CardDescription>
            </CardHeader>
            <CardContent>
              {myCredits.byType.length > 0 ? (
                <div className="space-y-3">
                  {myCredits.byType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium capitalize">{item.type}</span>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {item.credits} credits
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium text-lg mb-2">No Credits Yet</h3>
                  <p>Participate in activities and submit achievements to earn credits!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
