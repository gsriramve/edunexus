'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Trophy,
  Users,
  Calendar,
  Award,
  Star,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  UserPlus,
  Medal,
  Loader2,
} from 'lucide-react';
import { useTenantId } from '@/hooks/use-tenant';
import {
  sportsClubsApi,
  SportsTeam,
  Club,
  SportsEvent,
  ClubEvent,
  Achievement,
  SportsClubsStats,
  CreateTeamInput,
  CreateClubInput,
  CreateSportsEventInput,
  CreateClubEventInput,
  CreateAchievementInput,
} from '@/lib/api';

const SPORTS = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Table Tennis', 'Chess', 'Athletics', 'Swimming', 'Tennis', 'Hockey', 'Kabaddi'];
const CLUB_CATEGORIES = ['Technical', 'Cultural', 'Literary', 'Social Service', 'Sports', 'Music', 'Dance', 'Drama', 'Photography', 'Environment', 'Entrepreneurship', 'Other'];

export default function AdminSportsPage() {
  // Auth context
  const { user, isLoading: authLoading } = useAuth();
  const tenantId = useTenantId() || '';

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<SportsClubsStats | null>(null);
  const [teams, setTeams] = useState<SportsTeam[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [sportsEvents, setSportsEvents] = useState<SportsEvent[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showClubDialog, setShowClubDialog] = useState(false);
  const [showSportsEventDialog, setShowSportsEventDialog] = useState(false);
  const [showClubEventDialog, setShowClubEventDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState<Partial<CreateTeamInput>>({});
  const [clubForm, setClubForm] = useState<Partial<CreateClubInput>>({});
  const [sportsEventForm, setSportsEventForm] = useState<Partial<CreateSportsEventInput>>({});
  const [clubEventForm, setClubEventForm] = useState<Partial<CreateClubEventInput>>({});
  const [achievementForm, setAchievementForm] = useState<Partial<CreateAchievementInput>>({});

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, teamsData, clubsData, sportsEventsData, clubEventsData, achievementsData] = await Promise.all([
        sportsClubsApi.getStats(tenantId),
        sportsClubsApi.listTeams(tenantId, { limit: 100 }),
        sportsClubsApi.listClubs(tenantId, { limit: 100 }),
        sportsClubsApi.listSportsEvents(tenantId, { limit: 100 }),
        sportsClubsApi.listClubEvents(tenantId, { limit: 100 }),
        sportsClubsApi.listAchievements(tenantId, { limit: 100 }),
      ]);
      setStats(statsData);
      setTeams(teamsData.data);
      setClubs(clubsData.data);
      setSportsEvents(sportsEventsData.data);
      setClubEvents(clubEventsData.data);
      setAchievements(achievementsData.data);
    } catch (error) {
      console.error('Failed to load sports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      await sportsClubsApi.createTeam(tenantId, teamForm as CreateTeamInput);
      setShowTeamDialog(false);
      setTeamForm({});
      loadData();
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleCreateClub = async () => {
    try {
      await sportsClubsApi.createClub(tenantId, clubForm as CreateClubInput);
      setShowClubDialog(false);
      setClubForm({});
      loadData();
    } catch (error) {
      console.error('Failed to create club:', error);
    }
  };

  const handleCreateSportsEvent = async () => {
    try {
      await sportsClubsApi.createSportsEvent(tenantId, sportsEventForm as CreateSportsEventInput);
      setShowSportsEventDialog(false);
      setSportsEventForm({});
      loadData();
    } catch (error) {
      console.error('Failed to create sports event:', error);
    }
  };

  const handleCreateClubEvent = async () => {
    try {
      await sportsClubsApi.createClubEvent(tenantId, clubEventForm as CreateClubEventInput);
      setShowClubEventDialog(false);
      setClubEventForm({});
      loadData();
    } catch (error) {
      console.error('Failed to create club event:', error);
    }
  };

  const handleCreateAchievement = async () => {
    try {
      await sportsClubsApi.createAchievement(tenantId, achievementForm as CreateAchievementInput);
      setShowAchievementDialog(false);
      setAchievementForm({});
      loadData();
    } catch (error) {
      console.error('Failed to create achievement:', error);
    }
  };

  const handleVerifyAchievement = async (id: string) => {
    try {
      await sportsClubsApi.verifyAchievement(tenantId, id, 'Admin');
      loadData();
    } catch (error) {
      console.error('Failed to verify achievement:', error);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await sportsClubsApi.deleteTeam(tenantId, id);
      loadData();
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this club?')) return;
    try {
      await sportsClubsApi.deleteClub(tenantId, id);
      loadData();
    } catch (error) {
      console.error('Failed to delete club:', error);
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

  // Show loading state while auth is initializing
  if (authLoading || !tenantId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sports & Clubs Management</h1>
          <p className="text-muted-foreground">Manage teams, clubs, events, and achievements</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.teams.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.teams.active || 0} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.clubs.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.clubs.active || 0} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.events?.upcoming || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.events?.totalRegistrations || 0} total registrations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.achievements.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.achievements.verified || 0} verified
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Teams by Sport</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.teams.bySport.map((item) => (
                    <div key={item.sport} className="flex justify-between items-center">
                      <span className="text-sm">{item.sport}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                  {(!stats?.teams.bySport || stats.teams.bySport.length === 0) && (
                    <p className="text-sm text-muted-foreground">No teams yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Clubs by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.clubs.byCategory.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                  {(!stats?.clubs.byCategory || stats.clubs.byCategory.length === 0) && (
                    <p className="text-sm text-muted-foreground">No clubs yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Achievements by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.achievements.byLevel.map((item) => (
                    <div key={item.level} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{item.level}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                  {(!stats?.achievements.byLevel || stats.achievements.byLevel.length === 0) && (
                    <p className="text-sm text-muted-foreground">No achievements yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Credits by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.credits.byType.map((item) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{item.type}</span>
                      <Badge variant="outline">{item.total} credits</Badge>
                    </div>
                  ))}
                  {(!stats?.credits.byType || stats.credits.byType.length === 0) && (
                    <p className="text-sm text-muted-foreground">No credits awarded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>Add a new sports team</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Team Name *</Label>
                    <Input
                      value={teamForm.name || ''}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sport *</Label>
                    <Select
                      value={teamForm.sport}
                      onValueChange={(value) => setTeamForm({ ...teamForm, sport: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORTS.map((sport) => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Academic Year *</Label>
                    <Input
                      value={teamForm.academicYear || ''}
                      onChange={(e) => setTeamForm({ ...teamForm, academicYear: e.target.value })}
                      placeholder="e.g., 2025-26"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Coach Name</Label>
                    <Input
                      value={teamForm.coachName || ''}
                      onChange={(e) => setTeamForm({ ...teamForm, coachName: e.target.value })}
                      placeholder="Enter coach name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Max Members</Label>
                    <Input
                      type="number"
                      value={teamForm.maxMembers || ''}
                      onChange={(e) => setTeamForm({ ...teamForm, maxMembers: parseInt(e.target.value) })}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={teamForm.description || ''}
                      onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                      placeholder="Team description..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTeamDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateTeam} disabled={!teamForm.name || !teamForm.sport || !teamForm.academicYear}>
                    Create Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Coach</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.sport}</TableCell>
                    <TableCell>{team.coachName || '-'}</TableCell>
                    <TableCell>{team._count?.members || 0}/{team.maxMembers}</TableCell>
                    <TableCell>{team.academicYear}</TableCell>
                    <TableCell>{getStatusBadge(team.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {teams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No teams found. Create your first team!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Clubs Tab */}
        <TabsContent value="clubs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <Dialog open={showClubDialog} onOpenChange={setShowClubDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Club
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Club</DialogTitle>
                  <DialogDescription>Add a new student club</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Club Name *</Label>
                    <Input
                      value={clubForm.name || ''}
                      onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                      placeholder="Enter club name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category *</Label>
                    <Select
                      value={clubForm.category}
                      onValueChange={(value) => setClubForm({ ...clubForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUB_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Faculty Advisor</Label>
                    <Input
                      value={clubForm.facultyAdvisorName || ''}
                      onChange={(e) => setClubForm({ ...clubForm, facultyAdvisorName: e.target.value })}
                      placeholder="Enter faculty advisor name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Meeting Schedule</Label>
                    <Input
                      value={clubForm.meetingSchedule || ''}
                      onChange={(e) => setClubForm({ ...clubForm, meetingSchedule: e.target.value })}
                      placeholder="e.g., Every Saturday 4 PM"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Venue</Label>
                    <Input
                      value={clubForm.venue || ''}
                      onChange={(e) => setClubForm({ ...clubForm, venue: e.target.value })}
                      placeholder="e.g., Seminar Hall"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={clubForm.description || ''}
                      onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                      placeholder="Club description..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowClubDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateClub} disabled={!clubForm.name || !clubForm.category}>
                    Create Club
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Club Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Faculty Advisor</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((club) => (
                  <TableRow key={club.id}>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>{club.category}</TableCell>
                    <TableCell>{club.facultyAdvisorName || '-'}</TableCell>
                    <TableCell>{club._count?.members || 0}</TableCell>
                    <TableCell>{club._count?.events || 0}</TableCell>
                    <TableCell>{getStatusBadge(club.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClub(club.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {clubs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No clubs found. Create your first club!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showSportsEventDialog} onOpenChange={setShowSportsEventDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Trophy className="h-4 w-4 mr-2" />
                    Sports Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Sports Event</DialogTitle>
                    <DialogDescription>Add a new sports event or competition</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Event Name *</Label>
                      <Input
                        value={sportsEventForm.name || ''}
                        onChange={(e) => setSportsEventForm({ ...sportsEventForm, name: e.target.value })}
                        placeholder="Enter event name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Sport *</Label>
                      <Select
                        value={sportsEventForm.sport}
                        onValueChange={(value) => setSportsEventForm({ ...sportsEventForm, sport: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORTS.map((sport) => (
                            <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Event Type *</Label>
                      <Select
                        value={sportsEventForm.eventType}
                        onValueChange={(value) => setSportsEventForm({ ...sportsEventForm, eventType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="match">Match</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="tryout">Tryout</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="datetime-local"
                        value={sportsEventForm.startDate || ''}
                        onChange={(e) => setSportsEventForm({ ...sportsEventForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Venue *</Label>
                      <Input
                        value={sportsEventForm.venue || ''}
                        onChange={(e) => setSportsEventForm({ ...sportsEventForm, venue: e.target.value })}
                        placeholder="Enter venue"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={sportsEventForm.description || ''}
                        onChange={(e) => setSportsEventForm({ ...sportsEventForm, description: e.target.value })}
                        placeholder="Event description..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSportsEventDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateSportsEvent} disabled={!sportsEventForm.name || !sportsEventForm.sport || !sportsEventForm.eventType || !sportsEventForm.startDate || !sportsEventForm.venue}>
                      Create Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={showClubEventDialog} onOpenChange={setShowClubEventDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Club Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Club Event</DialogTitle>
                    <DialogDescription>Add a new club event or activity</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Event Name *</Label>
                      <Input
                        value={clubEventForm.name || ''}
                        onChange={(e) => setClubEventForm({ ...clubEventForm, name: e.target.value })}
                        placeholder="Enter event name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Club *</Label>
                      <Select
                        value={clubEventForm.clubId}
                        onValueChange={(value) => setClubEventForm({ ...clubEventForm, clubId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select club" />
                        </SelectTrigger>
                        <SelectContent>
                          {clubs.map((club) => (
                            <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Event Type *</Label>
                      <Select
                        value={clubEventForm.eventType}
                        onValueChange={(value) => setClubEventForm({ ...clubEventForm, eventType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="datetime-local"
                        value={clubEventForm.startDate || ''}
                        onChange={(e) => setClubEventForm({ ...clubEventForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Venue *</Label>
                      <Input
                        value={clubEventForm.venue || ''}
                        onChange={(e) => setClubEventForm({ ...clubEventForm, venue: e.target.value })}
                        placeholder="Enter venue"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowClubEventDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateClubEvent} disabled={!clubEventForm.name || !clubEventForm.clubId || !clubEventForm.eventType || !clubEventForm.startDate || !clubEventForm.venue}>
                      Create Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Sports Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sportsEvents.map((event) => (
                    <div key={event.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.sport} - {event.eventType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()} at {event.venue}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(event.status)}
                        <span className="text-xs text-muted-foreground">
                          {event._count?.registrations || 0} registered
                        </span>
                      </div>
                    </div>
                  ))}
                  {sportsEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No sports events yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Club Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clubEvents.map((event) => (
                    <div key={event.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.club?.name || 'Unknown Club'} - {event.eventType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()} at {event.venue}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(event.status)}
                        <span className="text-xs text-muted-foreground">
                          {event._count?.registrations || 0} registered
                        </span>
                      </div>
                    </div>
                  ))}
                  {clubEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No club events yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
            <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Medal className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Achievement</DialogTitle>
                  <DialogDescription>Add a new student achievement</DialogDescription>
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
                    <Label>Student Name *</Label>
                    <Input
                      value={achievementForm.studentName || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, studentName: e.target.value })}
                      placeholder="Student name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Student ID *</Label>
                    <Input
                      value={achievementForm.studentId || ''}
                      onChange={(e) => setAchievementForm({ ...achievementForm, studentId: e.target.value })}
                      placeholder="Student ID"
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAchievementDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateAchievement} disabled={!achievementForm.title || !achievementForm.studentName || !achievementForm.studentId || !achievementForm.achievementType || !achievementForm.level || !achievementForm.eventDate}>
                    Add Achievement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.filter(a =>
                  a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.studentName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell className="font-medium">{achievement.title}</TableCell>
                    <TableCell>{achievement.studentName}</TableCell>
                    <TableCell className="capitalize">{achievement.achievementType}</TableCell>
                    <TableCell>{getLevelBadge(achievement.level)}</TableCell>
                    <TableCell>{achievement.position || '-'}</TableCell>
                    <TableCell>{new Date(achievement.eventDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {achievement.isVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!achievement.isVerified && (
                          <Button variant="ghost" size="icon" onClick={() => handleVerifyAchievement(achievement.id)}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {achievements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No achievements recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Credits Overview</CardTitle>
              <CardDescription>Track student activity credits for extracurricular activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Credits Awarded</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.credits.totalAwarded || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">By Sports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.credits.byType.find(t => t.type === 'sports')?.total || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">By Cultural</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.credits.byType.find(t => t.type === 'cultural')?.total || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Credits by Activity Type</h4>
                  <div className="space-y-2">
                    {stats?.credits.byType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="capitalize font-medium">{item.type}</span>
                        <Badge variant="outline">{item.total} credits</Badge>
                      </div>
                    ))}
                    {(!stats?.credits.byType || stats.credits.byType.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">
                        No activity credits awarded yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
