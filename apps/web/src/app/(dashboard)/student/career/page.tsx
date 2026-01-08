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
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useStudentCareerDashboard,
  useApplyToDrive,
  PlacementStats,
  PlacementDrive,
  JobApplication,
  SkillGap,
} from '@/hooks/use-student-career';

// TODO: Get from auth context
const STUDENT_ID = 'current-student';

function StatsSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContentSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface QuickStatsProps {
  stats: PlacementStats;
}

function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Placement Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.probability}%</div>
          <p className="text-xs text-muted-foreground">Based on your profile</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Expected Package</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expectedSalary}</div>
          <p className="text-xs text-muted-foreground">Predicted range</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Eligible Drives</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.eligibleDrives}</div>
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
            {stats.shortlistedCount}/{stats.appliedCount}
          </div>
          <p className="text-xs text-muted-foreground">Shortlisted/Applied</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface UpcomingDrivesPreviewProps {
  drives: PlacementDrive[];
  onViewAll: () => void;
}

function UpcomingDrivesPreview({ drives, onViewAll }: UpcomingDrivesPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Drives
        </CardTitle>
        <CardDescription>Companies visiting soon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {drives.length > 0 ? (
          <>
            {drives.slice(0, 3).map((drive) => (
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
            <Button variant="outline" className="w-full" onClick={onViewAll}>
              View All Drives
            </Button>
          </>
        ) : (
          <p className="py-4 text-center text-muted-foreground">No upcoming drives</p>
        )}
      </CardContent>
    </Card>
  );
}

interface SkillGapsCardProps {
  skillGaps: SkillGap[];
  onViewAll: () => void;
}

function SkillGapsCard({ skillGaps, onViewAll }: SkillGapsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Skill Assessment
        </CardTitle>
        <CardDescription>Areas to improve for placements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skillGaps.length > 0 ? (
          <>
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
            <Button variant="outline" className="w-full" onClick={onViewAll}>
              Start Practicing
            </Button>
          </>
        ) : (
          <p className="py-4 text-center text-muted-foreground">
            No skill assessment available
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface PlacementDrivesListProps {
  drives: PlacementDrive[];
  onApply: (driveId: string) => void;
  isApplying: boolean;
}

function PlacementDrivesList({ drives, onApply, isApplying }: PlacementDrivesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Placement Drives</CardTitle>
        <CardDescription>Apply to companies based on your eligibility</CardDescription>
      </CardHeader>
      <CardContent>
        {drives.length > 0 ? (
          <div className="space-y-4">
            {drives.map((drive) => (
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
                  <Button
                    size="sm"
                    onClick={() => onApply(drive.id)}
                    disabled={isApplying}
                  >
                    {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Building2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No placement drives available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ApplicationsListProps {
  applications: JobApplication[];
  onViewDrives: () => void;
}

function ApplicationsList({ applications, onViewDrives }: ApplicationsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Applications</CardTitle>
        <CardDescription>Track your placement application status</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
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
            <Button variant="link" onClick={onViewDrives}>
              Browse available drives
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CareerHubPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch career dashboard data
  const { data, isLoading, error } = useStudentCareerDashboard(STUDENT_ID);

  // Apply to drive mutation
  const applyMutation = useApplyToDrive(STUDENT_ID);

  const handleApply = async (driveId: string) => {
    try {
      await applyMutation.mutateAsync(driveId);
      toast({
        title: 'Application submitted',
        description: 'Your application has been submitted successfully.',
      });
    } catch {
      toast({
        title: 'Application failed',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Failed to load career data</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    probability: 0,
    expectedSalary: 'N/A',
    eligibleDrives: 0,
    appliedCount: 0,
    shortlistedCount: 0,
  };
  const upcomingDrives = data?.upcomingDrives || [];
  const applications = data?.applications || [];
  const skillGaps = data?.skillGaps || [];

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
      {isLoading ? <StatsSkeletons /> : <QuickStats stats={stats} />}

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
          {isLoading ? (
            <ContentSkeletons />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <UpcomingDrivesPreview
                drives={upcomingDrives}
                onViewAll={() => setActiveTab('drives')}
              />
              <SkillGapsCard
                skillGaps={skillGaps}
                onViewAll={() => setActiveTab('prepare')}
              />
            </div>
          )}

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
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <PlacementDrivesList
              drives={upcomingDrives}
              onApply={handleApply}
              isApplying={applyMutation.isPending}
            />
          )}
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <ApplicationsList
              applications={applications}
              onViewDrives={() => setActiveTab('drives')}
            />
          )}
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
