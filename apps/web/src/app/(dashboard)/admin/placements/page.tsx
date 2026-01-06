'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Simple mock data
const placementStats = {
  totalEligible: 450,
  totalPlaced: 320,
  placementRate: 71.1,
  avgPackage: 6.5,
  highestPackage: 24,
  companiesVisited: 45,
};

const companies = [
  {
    id: '1',
    name: 'TCS',
    date: '2026-01-20',
    package: '7 LPA',
    roles: 'Software Engineer',
    eligible: 400,
    applied: 350,
    selected: 45,
    status: 'completed',
  },
  {
    id: '2',
    name: 'Infosys',
    date: '2026-01-25',
    package: '6.5 LPA',
    roles: 'Systems Engineer',
    eligible: 380,
    applied: 0,
    selected: 0,
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Wipro',
    date: '2026-02-01',
    package: '6 LPA',
    roles: 'Project Engineer',
    eligible: 420,
    applied: 0,
    selected: 0,
    status: 'upcoming',
  },
  {
    id: '4',
    name: 'Accenture',
    date: '2026-01-15',
    package: '6.5 LPA',
    roles: 'Associate SE',
    eligible: 390,
    applied: 340,
    selected: 38,
    status: 'in_progress',
  },
];

const recentPlacements = [
  { id: '1', student: 'Rahul Kumar', company: 'TCS', package: '7 LPA', branch: 'CSE' },
  { id: '2', student: 'Priya Sharma', company: 'TCS', package: '7 LPA', branch: 'IT' },
  { id: '3', student: 'Amit Singh', company: 'Accenture', package: '6.5 LPA', branch: 'CSE' },
  { id: '4', student: 'Neha Gupta', company: 'TCS', package: '7 LPA', branch: 'ECE' },
  { id: '5', student: 'Vikram Rao', company: 'Accenture', package: '6.5 LPA', branch: 'CSE' },
];

export default function PlacementsAdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Placement Management</h1>
          <p className="text-muted-foreground">
            Manage placement drives, track statistics, and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isAddDriveOpen} onOpenChange={setIsAddDriveOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Drive
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Placement Drive</DialogTitle>
                <DialogDescription>
                  Schedule a new company placement drive
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Enter company name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Package (LPA)</Label>
                    <Input placeholder="e.g., 6.5" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Input placeholder="e.g., Software Engineer" />
                </div>
                <div className="grid gap-2">
                  <Label>Eligibility (Min CGPA)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CGPA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5.0">5.0 and above</SelectItem>
                      <SelectItem value="5.5">5.5 and above</SelectItem>
                      <SelectItem value="6.0">6.0 and above</SelectItem>
                      <SelectItem value="6.5">6.5 and above</SelectItem>
                      <SelectItem value="7.0">7.0 and above</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDriveOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDriveOpen(false)}>Add Drive</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.totalEligible}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Placed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{placementStats.totalPlaced}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Placement %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.placementRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.avgPackage} LPA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{placementStats.highestPackage} LPA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.companiesVisited}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drives">Drives</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Drives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Drives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companies
                    .filter((c) => c.status === 'upcoming')
                    .map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.roles}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{company.package}</Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(company.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Placements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recent Placements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPlacements.map((placement) => (
                    <div
                      key={placement.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{placement.student}</p>
                        <p className="text-sm text-muted-foreground">{placement.branch}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{placement.company}</p>
                        <Badge variant="outline">{placement.package}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Branch-wise Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Branch-wise Placement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { branch: 'CSE', placed: 120, total: 150 },
                  { branch: 'IT', placed: 80, total: 100 },
                  { branch: 'ECE', placed: 60, total: 100 },
                  { branch: 'EEE', placed: 40, total: 80 },
                  { branch: 'MECH', placed: 20, total: 70 },
                ].map((item) => (
                  <div key={item.branch} className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground">{item.branch}</p>
                    <p className="text-2xl font-bold">
                      {Math.round((item.placed / item.total) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.placed}/{item.total}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drives Tab */}
        <TabsContent value="drives">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Placement Drives</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search companies..." className="pl-8 w-[200px]" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Eligible</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{new Date(company.date).toLocaleDateString()}</TableCell>
                      <TableCell>{company.package}</TableCell>
                      <TableCell>{company.roles}</TableCell>
                      <TableCell>{company.eligible}</TableCell>
                      <TableCell>{company.applied}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {company.selected}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            company.status === 'completed'
                              ? 'default'
                              : company.status === 'in_progress'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {company.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {company.status === 'in_progress' && <Clock className="mr-1 h-3 w-3" />}
                          {company.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Placement Status</CardTitle>
                  <CardDescription>Track individual student placement progress</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="unplaced">Not Placed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="cse">CSE</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="ece">ECE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Package</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Rahul Kumar', roll: 'CS2001', branch: 'CSE', cgpa: 8.5, apps: 5, status: 'placed', company: 'TCS', package: '7 LPA' },
                    { name: 'Priya Sharma', roll: 'IT2015', branch: 'IT', cgpa: 8.2, apps: 4, status: 'placed', company: 'TCS', package: '7 LPA' },
                    { name: 'Amit Singh', roll: 'CS2010', branch: 'CSE', cgpa: 7.8, apps: 6, status: 'placed', company: 'Accenture', package: '6.5 LPA' },
                    { name: 'Sneha Patel', roll: 'EC2005', branch: 'ECE', cgpa: 7.5, apps: 3, status: 'unplaced', company: '-', package: '-' },
                    { name: 'Vikram Rao', roll: 'CS2022', branch: 'CSE', cgpa: 8.0, apps: 4, status: 'placed', company: 'Accenture', package: '6.5 LPA' },
                  ].map((student, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.roll}</TableCell>
                      <TableCell>{student.branch}</TableCell>
                      <TableCell>{student.cgpa}</TableCell>
                      <TableCell>{student.apps}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'placed' ? 'default' : 'secondary'}>
                          {student.status === 'placed' ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.company}</TableCell>
                      <TableCell>{student.package}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
