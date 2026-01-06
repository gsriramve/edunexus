'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Trophy,
  Users,
  Calendar,
  Medal,
  Star,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Mock data
const mockTeams = [
  { id: '1', name: 'Thunder', sport: 'cricket', category: 'men', members: 15, maxMembers: 20, coach: 'Prof. Sharma', captain: 'Rahul Sharma', status: 'active' },
  { id: '2', name: 'Strikers', sport: 'football', category: 'men', members: 22, maxMembers: 25, coach: 'Prof. Kumar', captain: 'Amit Verma', status: 'active' },
  { id: '3', name: 'Blazers', sport: 'basketball', category: 'women', members: 12, maxMembers: 15, coach: 'Prof. Reddy', captain: 'Priya Patel', status: 'active' },
  { id: '4', name: 'Smashers', sport: 'badminton', category: 'mixed', members: 8, maxMembers: 12, coach: 'Prof. Das', captain: 'Vikram Singh', status: 'active' },
];

const mockClubs = [
  { id: '1', name: 'Google Developer Student Club', code: 'GDSC', category: 'technical', members: 85, advisor: 'Prof. Tech', president: 'Aditya Kumar', status: 'active' },
  { id: '2', name: 'Literary Society', code: 'LITSOC', category: 'literary', members: 45, advisor: 'Prof. English', president: 'Sneha Gupta', status: 'active' },
  { id: '3', name: 'Drama Club', code: 'DRAMA', category: 'cultural', members: 32, advisor: 'Prof. Arts', president: 'Ravi Menon', status: 'active' },
  { id: '4', name: 'NSS Unit', code: 'NSS', category: 'social', members: 120, advisor: 'Prof. Social', president: 'Kavita Sharma', status: 'active' },
];

const mockSportsEvents = [
  { id: '1', name: 'Inter-College Cricket Tournament', sport: 'cricket', type: 'tournament', venue: 'Sports Ground', date: '2026-02-15', level: 'inter-college', participants: 120, status: 'scheduled' },
  { id: '2', name: 'Football League Match - Finals', sport: 'football', type: 'match', venue: 'Football Field', date: '2026-01-20', level: 'college', participants: 22, status: 'ongoing' },
  { id: '3', name: 'Basketball Trials', sport: 'basketball', type: 'trials', venue: 'Indoor Court', date: '2026-01-10', level: 'college', participants: 35, status: 'completed' },
];

const mockClubEvents = [
  { id: '1', name: 'Hackathon 2026', club: 'GDSC', type: 'hackathon', venue: 'Main Auditorium', date: '2026-02-01', registrations: 150, maxParticipants: 200, status: 'scheduled' },
  { id: '2', name: 'Poetry Slam', club: 'LITSOC', type: 'competition', venue: 'Seminar Hall', date: '2026-01-25', registrations: 25, maxParticipants: 30, status: 'scheduled' },
  { id: '3', name: 'Annual Drama Fest', club: 'DRAMA', type: 'cultural', venue: 'Open Air Theatre', date: '2026-03-10', registrations: 80, maxParticipants: 100, status: 'scheduled' },
];

const mockAchievements = [
  { id: '1', student: 'Rahul Sharma', title: 'Gold Medal - State Cricket', type: 'medal', category: 'sports', level: 'state', date: '2025-12-15', verified: true },
  { id: '2', student: 'Aditya Kumar', title: 'Best Paper Award - TechFest', type: 'award', category: 'technical', level: 'national', date: '2025-11-20', verified: true },
  { id: '3', student: 'Priya Patel', title: 'Best Athlete - Sports Day', type: 'trophy', category: 'sports', level: 'college', date: '2025-12-28', verified: false },
];

const mockActivityCredits = [
  { id: '1', student: 'Rahul Sharma', rollNo: 'CS2021001', category: 'sports', activity: 'Cricket Team Captain', credits: 3, academicYear: '2025-26' },
  { id: '2', student: 'Aditya Kumar', rollNo: 'CS2021002', category: 'technical', activity: 'GDSC Lead', credits: 2, academicYear: '2025-26' },
  { id: '3', student: 'Kavita Sharma', rollNo: 'EC2021001', category: 'social', activity: 'NSS Coordinator', credits: 3, academicYear: '2025-26' },
];

const mockStats = {
  totalTeams: 12,
  totalClubs: 8,
  upcomingSportsEvents: 5,
  upcomingClubEvents: 8,
  recentAchievements: 25,
  totalCreditsAwarded: 156,
};

const sportTypes = ['cricket', 'football', 'basketball', 'volleyball', 'badminton', 'table_tennis', 'tennis', 'athletics', 'swimming', 'chess', 'kabaddi', 'hockey'];
const teamCategories = ['men', 'women', 'mixed'];
const clubCategories = ['technical', 'cultural', 'literary', 'social', 'hobby'];
const eventTypes = { sports: ['match', 'tournament', 'practice', 'training', 'trials'], club: ['workshop', 'competition', 'meetup', 'seminar', 'hackathon', 'cultural'] };
const achievementTypes = ['medal', 'trophy', 'certificate', 'award', 'recognition'];
const achievementCategories = ['sports', 'academic', 'cultural', 'technical', 'social'];
const eventLevels = ['college', 'inter-college', 'state', 'national', 'international'];
const activityCategories = ['sports', 'cultural', 'technical', 'social', 'ncc', 'nss'];

export default function AdminSportsClubsPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [showAddClubDialog, setShowAddClubDialog] = useState(false);
  const [showAddSportsEventDialog, setShowAddSportsEventDialog] = useState(false);
  const [showAddClubEventDialog, setShowAddClubEventDialog] = useState(false);
  const [showAddAchievementDialog, setShowAddAchievementDialog] = useState(false);
  const [showAddCreditDialog, setShowAddCreditDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedClub, setSelectedClub] = useState<any>(null);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      scheduled: { variant: 'outline', label: 'Scheduled' },
      ongoing: { variant: 'default', label: 'Ongoing' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      literary: 'bg-green-100 text-green-800',
      social: 'bg-orange-100 text-orange-800',
      hobby: 'bg-pink-100 text-pink-800',
      sports: 'bg-red-100 text-red-800',
      academic: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sports & Clubs Management</h1>
          <p className="text-muted-foreground">Manage teams, clubs, events, and achievements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sports Teams</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">Active teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalClubs}</div>
            <p className="text-xs text-muted-foreground">Active clubs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sports Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.upcomingSportsEvents}</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Club Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.upcomingClubEvents}</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.recentAchievements}</div>
            <p className="text-xs text-muted-foreground">Last 3 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Awarded</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCreditsAwarded}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="sports-events">Sports Events</TabsTrigger>
          <TabsTrigger value="club-events">Club Events</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="credits">Activity Credits</TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sports Teams</CardTitle>
                  <CardDescription>Manage college sports teams</CardDescription>
                </div>
                <Button onClick={() => setShowAddTeamDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Team
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sportTypes.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport.replace('_', ' ').charAt(0).toUpperCase() + sport.replace('_', ' ').slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Captain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="capitalize">{team.sport}</TableCell>
                      <TableCell className="capitalize">{team.category}</TableCell>
                      <TableCell>{team.members}/{team.maxMembers}</TableCell>
                      <TableCell>{team.coach}</TableCell>
                      <TableCell>{team.captain}</TableCell>
                      <TableCell>{getStatusBadge(team.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(team)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clubs Tab */}
        <TabsContent value="clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Clubs & Societies</CardTitle>
                  <CardDescription>Manage student clubs and societies</CardDescription>
                </div>
                <Button onClick={() => setShowAddClubDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Club
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clubs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {clubCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Faculty Advisor</TableHead>
                    <TableHead>President</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell className="font-medium">{club.name}</TableCell>
                      <TableCell>{club.code}</TableCell>
                      <TableCell>{getCategoryBadge(club.category)}</TableCell>
                      <TableCell>{club.members}</TableCell>
                      <TableCell>{club.advisor}</TableCell>
                      <TableCell>{club.president}</TableCell>
                      <TableCell>{getStatusBadge(club.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedClub(club)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sports Events Tab */}
        <TabsContent value="sports-events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sports Events</CardTitle>
                  <CardDescription>Manage matches, tournaments, and sports activities</CardDescription>
                </div>
                <Button onClick={() => setShowAddSportsEventDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sportTypes.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport.replace('_', ' ').charAt(0).toUpperCase() + sport.replace('_', ' ').slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSportsEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell className="capitalize">{event.sport}</TableCell>
                      <TableCell className="capitalize">{event.type}</TableCell>
                      <TableCell>{event.venue}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getLevelBadge(event.level)}</TableCell>
                      <TableCell>{event.participants}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Club Events Tab */}
        <TabsContent value="club-events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Club Events</CardTitle>
                  <CardDescription>Manage workshops, competitions, and club activities</CardDescription>
                </div>
                <Button onClick={() => setShowAddClubEventDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clubs</SelectItem>
                    {mockClubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>{club.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.club.map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClubEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.club}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{event.type}</TableCell>
                      <TableCell>{event.venue}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell>{event.registrations}/{event.maxParticipants}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Student Achievements</CardTitle>
                  <CardDescription>Track and verify student achievements</CardDescription>
                </div>
                <Button onClick={() => setShowAddAchievementDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Achievement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {achievementCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {eventLevels.map(level => (
                      <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Achievement Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAchievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell className="font-medium">{achievement.student}</TableCell>
                      <TableCell>{achievement.title}</TableCell>
                      <TableCell className="capitalize">{achievement.type}</TableCell>
                      <TableCell>{getCategoryBadge(achievement.category)}</TableCell>
                      <TableCell>{getLevelBadge(achievement.level)}</TableCell>
                      <TableCell>{new Date(achievement.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {achievement.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!achievement.verified && (
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Activity Credits</CardTitle>
                  <CardDescription>Manage student activity credits for extracurricular participation</CardDescription>
                </div>
                <Button onClick={() => setShowAddCreditDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Award Credit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student or activity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {activityCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivityCredits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell className="font-medium">{credit.student}</TableCell>
                      <TableCell>{credit.rollNo}</TableCell>
                      <TableCell>{getCategoryBadge(credit.category)}</TableCell>
                      <TableCell>{credit.activity}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{credit.credits} credits</Badge>
                      </TableCell>
                      <TableCell>{credit.academicYear}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Team Dialog */}
      <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sports Team</DialogTitle>
            <DialogDescription>Create a new sports team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input placeholder="e.g., Thunder" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport.replace('_', ' ').charAt(0).toUpperCase() + sport.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Members</Label>
              <Input type="number" placeholder="20" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Team description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTeamDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddTeamDialog(false)}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Club Dialog */}
      <Dialog open={showAddClubDialog} onOpenChange={setShowAddClubDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Club</DialogTitle>
            <DialogDescription>Create a new student club</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Club Name</Label>
              <Input placeholder="e.g., Google Developer Student Club" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Club Code</Label>
                <Input placeholder="e.g., GDSC" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meeting Schedule</Label>
              <Input placeholder="e.g., Every Saturday 4:00 PM" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Club description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClubDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddClubDialog(false)}>Create Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sports Event Dialog */}
      <Dialog open={showAddSportsEventDialog} onOpenChange={setShowAddSportsEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sports Event</DialogTitle>
            <DialogDescription>Create a new sports event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input placeholder="e.g., Inter-College Cricket Tournament" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport.replace('_', ' ').charAt(0).toUpperCase() + sport.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.sports.map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventLevels.map(level => (
                      <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input placeholder="e.g., Sports Ground" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Event details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSportsEventDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddSportsEventDialog(false)}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Club Event Dialog */}
      <Dialog open={showAddClubEventDialog} onOpenChange={setShowAddClubEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Club Event</DialogTitle>
            <DialogDescription>Create a new club event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input placeholder="e.g., Hackathon 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Club</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select club" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>{club.code} - {club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.club.map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input type="number" placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input placeholder="e.g., Main Auditorium" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Event details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClubEventDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddClubEventDialog(false)}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Achievement Dialog */}
      <Dialog open={showAddAchievementDialog} onOpenChange={setShowAddAchievementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Achievement</DialogTitle>
            <DialogDescription>Record a student achievement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Input placeholder="Search student..." />
            </div>
            <div className="space-y-2">
              <Label>Achievement Title</Label>
              <Input placeholder="e.g., Gold Medal - State Cricket" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {achievementTypes.map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {achievementCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventLevels.map(level => (
                      <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Achievement details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAchievementDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddAchievementDialog(false)}>Add Achievement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credit Dialog */}
      <Dialog open={showAddCreditDialog} onOpenChange={setShowAddCreditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Award Activity Credit</DialogTitle>
            <DialogDescription>Award activity credits to a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Input placeholder="Search student..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Activity</Label>
              <Input placeholder="e.g., Cricket Team Captain" />
            </div>
            <div className="space-y-2">
              <Label>Credits (1-10)</Label>
              <Input type="number" min="1" max="10" placeholder="3" />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCreditDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddCreditDialog(false)}>Award Credit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
