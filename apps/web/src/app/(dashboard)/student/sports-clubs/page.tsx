'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
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

// Mock data for current student
const studentId = 'student-001';

const myTeams = [
  { id: '1', name: 'Thunder', sport: 'cricket', category: 'men', role: 'captain', position: 'Batsman', jerseyNo: 7, joinedAt: '2024-08-15' },
  { id: '2', name: 'Smashers', sport: 'badminton', category: 'mixed', role: 'member', position: 'Singles', jerseyNo: null, joinedAt: '2025-01-10' },
];

const myClubs = [
  { id: '1', name: 'Google Developer Student Club', code: 'GDSC', category: 'technical', role: 'member', designation: null, joinedAt: '2024-09-01' },
  { id: '2', name: 'Literary Society', code: 'LITSOC', category: 'literary', role: 'secretary', designation: 'Event Coordinator', joinedAt: '2024-08-20' },
];

const upcomingSportsEvents = [
  { id: '1', name: 'Inter-College Cricket Tournament', sport: 'cricket', type: 'tournament', venue: 'Sports Ground', date: '2026-02-15', level: 'inter-college', registered: true },
  { id: '2', name: 'College Badminton Championship', sport: 'badminton', type: 'tournament', venue: 'Indoor Court', date: '2026-01-25', level: 'college', registered: false },
];

const upcomingClubEvents = [
  { id: '1', name: 'Hackathon 2026', club: 'GDSC', clubName: 'Google Developer Student Club', type: 'hackathon', venue: 'Main Auditorium', date: '2026-02-01', maxParticipants: 200, currentRegistrations: 150, registered: true },
  { id: '2', name: 'Poetry Slam', club: 'LITSOC', clubName: 'Literary Society', type: 'competition', venue: 'Seminar Hall', date: '2026-01-25', maxParticipants: 30, currentRegistrations: 18, registered: false },
  { id: '3', name: 'Workshop: Cloud Computing', club: 'GDSC', clubName: 'Google Developer Student Club', type: 'workshop', venue: 'Lab 301', date: '2026-01-20', maxParticipants: 50, currentRegistrations: 35, registered: false },
];

const myAchievements = [
  { id: '1', title: 'Gold Medal - State Cricket Tournament', type: 'medal', category: 'sports', level: 'state', date: '2025-12-15', verified: true, creditsAwarded: 3 },
  { id: '2', title: 'Best Speaker - Inter-College Debate', type: 'certificate', category: 'cultural', level: 'inter-college', date: '2025-11-20', verified: true, creditsAwarded: 2 },
  { id: '3', title: 'Participation - National Hackathon', type: 'certificate', category: 'technical', level: 'national', date: '2025-10-05', verified: true, creditsAwarded: 1 },
];

const myCreditsSummary = {
  totalCredits: 8,
  maxCredits: 20,
  byCategory: [
    { category: 'sports', credits: 4, maxCredits: 10 },
    { category: 'cultural', credits: 2, maxCredits: 10 },
    { category: 'technical', credits: 2, maxCredits: 10 },
    { category: 'social', credits: 0, maxCredits: 10 },
  ],
};

const availableTeams = [
  { id: '3', name: 'Blazers', sport: 'basketball', category: 'women', members: 12, maxMembers: 15 },
  { id: '4', name: 'Strikers', sport: 'football', category: 'men', members: 20, maxMembers: 25 },
];

const availableClubs = [
  { id: '3', name: 'Drama Club', code: 'DRAMA', category: 'cultural', members: 32, maxMembers: 50 },
  { id: '4', name: 'NSS Unit', code: 'NSS', category: 'social', members: 120, maxMembers: 150 },
  { id: '5', name: 'Photography Club', code: 'PHOTO', category: 'hobby', members: 25, maxMembers: 40 },
];

export default function StudentSportsClubsPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const [showJoinClubDialog, setShowJoinClubDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);

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
            <div className="text-2xl font-bold">{myCreditsSummary.totalCredits}/{myCreditsSummary.maxCredits}</div>
            <Progress value={(myCreditsSummary.totalCredits / myCreditsSummary.maxCredits) * 100} className="mt-2" />
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
                  <CardDescription>Events you're registered for or might be interested in</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...upcomingSportsEvents.filter(e => e.registered), ...upcomingClubEvents.filter(e => e.registered)].slice(0, 4).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default">Registered</Badge>
                  </div>
                ))}
              </div>
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
                        <p className="text-sm text-muted-foreground capitalize">{team.sport} - {team.category}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4 mr-1" /> Join
                      </Button>
                    </div>
                  ))}
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
                        <p className="text-sm text-muted-foreground">{getCategoryBadge(club.category)}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4 mr-1" /> Join
                      </Button>
                    </div>
                  ))}
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
              <CardDescription>Your extracurricular activity credits by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCreditsSummary.byCategory.map(cat => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{cat.category}</span>
                      <span className="text-muted-foreground">{cat.credits}/{cat.maxCredits} credits</span>
                    </div>
                    <Progress value={(cat.credits / cat.maxCredits) * 100} />
                  </div>
                ))}
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
                      <CardDescription className="capitalize">{team.sport} - {team.category}</CardDescription>
                    </div>
                    {getRoleBadge(team.role)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Position</span>
                      <span className="font-medium">{team.position}</span>
                    </div>
                    {team.jerseyNo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Jersey Number</span>
                        <span className="font-medium">#{team.jerseyNo}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium">{new Date(team.joinedAt).toLocaleDateString()}</span>
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
              <p className="text-muted-foreground mb-4">You haven't joined any sports teams yet.</p>
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
                      <CardDescription>{club.code} - {getCategoryBadge(club.category)}</CardDescription>
                    </div>
                    {getRoleBadge(club.role)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {club.designation && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Designation</span>
                        <span className="font-medium">{club.designation}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium">{new Date(club.joinedAt).toLocaleDateString()}</span>
                    </div>
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
              <p className="text-muted-foreground mb-4">You haven't joined any clubs yet.</p>
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
              <div className="space-y-4">
                {upcomingSportsEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Trophy className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">{event.sport}</Badge>
                          {getLevelBadge(event.level)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                    {event.registered ? (
                      <Badge variant="default">Registered</Badge>
                    ) : (
                      <Button size="sm">Register</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Club Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Club Events</CardTitle>
              <CardDescription>Workshops, competitions, and club activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClubEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{event.club}</Badge>
                          <Badge variant="secondary" className="capitalize">{event.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.currentRegistrations}/{event.maxParticipants}
                          </span>
                        </div>
                      </div>
                    </div>
                    {event.registered ? (
                      <Badge variant="default">Registered</Badge>
                    ) : (
                      <Button size="sm" disabled={event.currentRegistrations >= event.maxParticipants}>
                        {event.currentRegistrations >= event.maxParticipants ? 'Full' : 'Register'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Achievements</h2>
            <div className="text-sm text-muted-foreground">
              Total Credits Earned: <span className="font-bold text-foreground">{myCreditsSummary.totalCredits}</span>
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
                          <Badge variant="outline" className="capitalize">{achievement.type}</Badge>
                          {getCategoryBadge(achievement.category)}
                          {getLevelBadge(achievement.level)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Awarded on {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {achievement.verified && (
                        <div className="flex items-center gap-1 text-green-600 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                      {achievement.creditsAwarded > 0 && (
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
            {availableTeams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{team.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {team.sport} - {team.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {team.members}/{team.maxMembers} members
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={team.members >= team.maxMembers}
                >
                  {team.members >= team.maxMembers ? 'Full' : 'Request to Join'}
                </Button>
              </div>
            ))}
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
            {availableClubs.map(club => (
              <div key={club.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{club.name}</h4>
                  <div className="mt-1">{getCategoryBadge(club.category)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {club.members}/{club.maxMembers} members
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={club.maxMembers && club.members >= club.maxMembers}
                >
                  {club.maxMembers && club.members >= club.maxMembers ? 'Full' : 'Request to Join'}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinClubDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
