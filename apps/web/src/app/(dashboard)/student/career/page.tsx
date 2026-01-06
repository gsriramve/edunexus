'use client';

import { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple mock data - will be replaced with API calls later
const placementStats = {
  probability: 78,
  expectedSalary: '6-10 LPA',
  eligibleDrives: 12,
  appliedCount: 5,
  shortlistedCount: 2,
};

const upcomingDrives = [
  {
    id: '1',
    company: 'TCS',
    role: 'Software Engineer',
    package: '7 LPA',
    date: '2026-01-20',
    eligibility: 'CGPA >= 6.0',
    status: 'open',
  },
  {
    id: '2',
    company: 'Infosys',
    role: 'Systems Engineer',
    package: '6.5 LPA',
    date: '2026-01-25',
    eligibility: 'CGPA >= 6.0',
    status: 'open',
  },
  {
    id: '3',
    company: 'Wipro',
    role: 'Project Engineer',
    package: '6 LPA',
    date: '2026-02-01',
    eligibility: 'CGPA >= 5.5',
    status: 'open',
  },
  {
    id: '4',
    company: 'Cognizant',
    role: 'Programmer Analyst',
    package: '6.75 LPA',
    date: '2026-02-10',
    eligibility: 'CGPA >= 6.0',
    status: 'upcoming',
  },
];

const myApplications = [
  {
    id: '1',
    company: 'Accenture',
    role: 'Associate Software Engineer',
    appliedDate: '2026-01-05',
    status: 'shortlisted',
    nextRound: 'Technical Interview - Jan 15',
  },
  {
    id: '2',
    company: 'Tech Mahindra',
    role: 'Software Developer',
    appliedDate: '2026-01-03',
    status: 'applied',
    nextRound: 'Waiting for results',
  },
];

const skillGaps = [
  { skill: 'Data Structures', level: 65, required: 80 },
  { skill: 'System Design', level: 40, required: 70 },
  { skill: 'SQL', level: 70, required: 75 },
];

export default function CareerHubPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Career Hub</h1>
          <p className="text-muted-foreground">
            Track placements, apply to companies, and prepare for your career
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Update Resume
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placement Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{placementStats.probability}%</div>
            <p className="text-xs text-muted-foreground">Based on your profile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expected Package</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.expectedSalary}</div>
            <p className="text-xs text-muted-foreground">Predicted range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible Drives</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.eligibleDrives}</div>
            <p className="text-xs text-muted-foreground">Companies visiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placementStats.shortlistedCount}/{placementStats.appliedCount}
            </div>
            <p className="text-xs text-muted-foreground">Shortlisted/Applied</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drives">Placement Drives</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="prepare">Prepare</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upcoming Drives Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Drives
                </CardTitle>
                <CardDescription>Companies visiting soon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDrives.slice(0, 3).map((drive) => (
                  <div
                    key={drive.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{drive.company}</p>
                      <p className="text-sm text-muted-foreground">{drive.role}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{drive.package}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(drive.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('drives')}
                >
                  View All Drives
                </Button>
              </CardContent>
            </Card>

            {/* Skill Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Skill Assessment
                </CardTitle>
                <CardDescription>Areas to improve for placements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skillGaps.map((skill) => (
                  <div key={skill.skill} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{skill.skill}</span>
                      <span className="text-muted-foreground">
                        {skill.level}% / {skill.required}%
                      </span>
                    </div>
                    <Progress
                      value={skill.level}
                      className={skill.level >= skill.required ? 'bg-green-100' : 'bg-orange-100'}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('prepare')}
                >
                  Start Practicing
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col py-4">
                  <FileText className="mb-2 h-6 w-6" />
                  <span>Update Resume</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Target className="mb-2 h-6 w-6" />
                  <span>Take Mock Test</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Users className="mb-2 h-6 w-6" />
                  <span>Practice Interview</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <ExternalLink className="mb-2 h-6 w-6" />
                  <span>Company Research</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placement Drives Tab */}
        <TabsContent value="drives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Placement Drives</CardTitle>
              <CardDescription>Apply to companies based on your eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDrives.map((drive) => (
                  <div
                    key={drive.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{drive.company}</p>
                        <p className="text-sm text-muted-foreground">{drive.role}</p>
                        <p className="text-xs text-muted-foreground">
                          Eligibility: {drive.eligibility}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {drive.package}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(drive.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track your placement application status</CardDescription>
            </CardHeader>
            <CardContent>
              {myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{app.company}</p>
                          <p className="text-sm text-muted-foreground">{app.role}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={app.status === 'shortlisted' ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {app.status === 'shortlisted' ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {app.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{app.nextRound}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Briefcase className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No applications yet</p>
                  <Button variant="link" onClick={() => setActiveTab('drives')}>
                    Browse available drives
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prepare Tab */}
        <TabsContent value="prepare" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Practice Resources</CardTitle>
                <CardDescription>Prepare for placement tests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Aptitude Practice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Coding Practice (DSA)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Mock Interviews
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Technical MCQs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Preparation</CardTitle>
                <CardDescription>Company-specific resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  TCS NQT Preparation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Infosys InfyTQ Practice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Wipro NLTH Pattern
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Cognizant GenC Practice
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Placement Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  Keep your resume updated and ATS-friendly
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  Practice coding daily on platforms like LeetCode
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  Prepare STAR format answers for HR interviews
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  Research companies before applying
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
