'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { useTenantId } from '@/hooks/use-tenant';
import {
  useStudentByUserId,
  useMyJourneyDashboard,
  useMyTimeline,
  useExportJourney,
} from '@/hooks/use-api';
import {
  useCreateMilestone,
  useCompareSemesters,
  type MilestoneCategory,
  type CreateMilestoneInput,
  type SemesterComparison,
  type JourneyDashboard,
  type TimelineItem,
} from '@/hooks/use-student-journey';
import { useUser } from '@clerk/nextjs';
import {
  JourneyTimeline,
  JourneyStats,
  YearProgressGrid,
  AddMilestoneDialog,
  SemesterCompareDialog,
} from '@/components/journey';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Sample journey data for demo purposes
const sampleTimeline: TimelineItem[] = [
  {
    id: '1',
    type: 'milestone' as const,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Completed Cloud Computing Course',
    description: 'Successfully completed AWS Cloud Practitioner certification course',
    category: 'academic' as const,
    milestoneType: 'certification' as const,
    isPositive: true,
  },
  {
    id: '2',
    type: 'milestone' as const,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Hackathon Winner',
    description: 'Won first place in inter-college hackathon with AI-powered solution',
    category: 'achievement' as const,
    milestoneType: 'award' as const,
    isPositive: true,
  },
  {
    id: '3',
    type: 'milestone' as const,
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Summer Internship at TechCorp',
    description: 'Completed 2-month summer internship as Software Developer',
    category: 'career' as const,
    milestoneType: 'internship_end' as const,
    isPositive: true,
  },
  {
    id: '4',
    type: 'milestone' as const,
    date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'React Advanced Certification',
    description: 'Completed advanced React development certification',
    category: 'academic' as const,
    milestoneType: 'certification' as const,
    isPositive: true,
  },
];

// Sample dashboard data with explicit type for TypeScript
const sampleDashboard: JourneyDashboard = {
  stats: {
    studentId: 'sample-student',
    totalMilestones: 12,
    milestonesByCategory: { academic: 5, career: 3, extracurricular: 2, achievement: 2 },
    totalSnapshots: 4,
    currentCgpa: 8.2,
    cgpaTrend: 'improving',
    totalBacklogsCleared: 2,
    currentBacklogs: 0,
    highestSgi: 82,
    highestCri: 78,
    totalAchievements: 8,
    totalEventsAttended: 15,
    totalClubsJoined: 3,
  },
  progress: {
    studentId: 'sample-student',
    years: [
      { academicYear: '2021-22', startCgpa: 0, endCgpa: 7.8, milestonesCount: 3, achievementsCount: 2, trend: 'improving' },
      { academicYear: '2022-23', startCgpa: 7.8, endCgpa: 8.0, milestonesCount: 4, achievementsCount: 3, trend: 'improving' },
      { academicYear: '2023-24', startCgpa: 8.0, endCgpa: 8.4, milestonesCount: 3, achievementsCount: 2, trend: 'improving' },
      { academicYear: '2024-25', startCgpa: 8.4, endCgpa: undefined, milestonesCount: 2, achievementsCount: 1, trend: 'stable' },
    ],
    overallTrend: 'improving',
  },
  timeline: sampleTimeline,
  snapshots: [],
};

export default function StudentJourneyPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [compareData, setCompareData] = useState<{
    year1: string;
    sem1: number;
    year2: string;
    sem2: number;
  } | null>(null);

  const tenantId = useTenantId();
  const { user } = useUser();
  const { toast } = useToast();

  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || '',
    user?.id || ''
  );

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useMyJourneyDashboard(tenantId || '');

  const categories =
    categoryFilter === 'all' ? undefined : ([categoryFilter] as MilestoneCategory[]);

  const {
    data: timeline,
    isLoading: timelineLoading,
    refetch: refetchTimeline,
  } = useMyTimeline(tenantId || '', {
    categories,
    includeSnapshots: true,
    limit: 50,
  });

  const exportJourney = useExportJourney(tenantId || '');
  const createMilestone = useCreateMilestone(tenantId || '');

  // For semester comparison - we'll trigger this manually
  const [comparison, setComparison] = useState<SemesterComparison | undefined>();
  const [isComparing, setIsComparing] = useState(false);

  const isLoading = studentLoading || dashboardLoading || timelineLoading;

  // Use sample data if no real data available (for demo purposes)
  const effectiveDashboard = dashboard || sampleDashboard;
  const effectiveTimeline = timeline || sampleTimeline;
  const isUsingDemoData = !dashboard || !timeline;

  const handleExport = (format: 'json' | 'csv') => {
    if (student?.id) {
      exportJourney.mutate(
        {
          studentId: student.id,
          format,
          includeMilestones: true,
          includeSnapshots: true,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Export successful',
              description: `Your journey has been exported as ${format.toUpperCase()}`,
            });
          },
          onError: () => {
            toast({
              title: 'Export failed',
              description: 'Failed to export journey data',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleAddMilestone = (data: CreateMilestoneInput) => {
    createMilestone.mutate(data, {
      onSuccess: () => {
        setShowAddMilestone(false);
        refetchDashboard();
        refetchTimeline();
        toast({
          title: 'Milestone added',
          description: 'Your milestone has been recorded successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Failed to add milestone',
          description: 'There was an error adding your milestone',
          variant: 'destructive',
        });
      },
    });
  };

  const handleCompare = async (
    year1: string,
    sem1: number,
    year2: string,
    sem2: number
  ) => {
    if (!student?.id) return;

    setIsComparing(true);
    try {
      // This would typically use the useCompareSemesters hook,
      // but for now we'll just set the data
      // In a real implementation, you'd call the API here
      setCompareData({ year1, sem1, year2, sem2 });
      // The comparison would be fetched and set here
    } finally {
      setIsComparing(false);
    }
  };

  const handleRefresh = () => {
    refetchDashboard();
    refetchTimeline();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Get available snapshots for comparison
  const availableSnapshots =
    effectiveDashboard?.snapshots?.map((s: { academicYear: string; semester: number }) => ({
      academicYear: s.academicYear,
      semester: s.semester,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Journey</h1>
          <p className="text-muted-foreground">
            Your 4-year academic and career journey timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isUsingDemoData && (
            <Badge variant="secondary" className="text-xs">
              Sample Data
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={dashboardLoading || timelineLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                dashboardLoading || timelineLoading ? 'animate-spin' : ''
              }`}
            />
          </Button>

          {availableSnapshots.length >= 2 && (
            <SemesterCompareDialog
              snapshots={availableSnapshots}
              comparison={comparison}
              isLoading={isComparing}
              onCompare={handleCompare}
            />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMilestone(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={exportJourney.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <JourneyStats stats={effectiveDashboard?.stats} isLoading={dashboardLoading} />

      {/* Year Progress */}
      <YearProgressGrid progress={effectiveDashboard?.progress} isLoading={dashboardLoading} />

      {/* Timeline */}
      <JourneyTimeline
        timeline={effectiveTimeline}
        isLoading={timelineLoading}
        onCategoryFilter={setCategoryFilter}
        categoryFilter={categoryFilter}
        showHeader={true}
        maxItems={10}
        expandable={true}
      />

      {/* Add Milestone Dialog */}
      <AddMilestoneDialog
        open={showAddMilestone}
        onOpenChange={setShowAddMilestone}
        studentId={student?.id || ''}
        onSubmit={handleAddMilestone}
        isLoading={createMilestone.isPending}
      />
    </div>
  );
}
