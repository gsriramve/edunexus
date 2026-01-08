'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenantId } from '@/hooks/use-tenant';
import {
  usePendingFeedback,
  useFeedbackCycles,
  useSubmitFeedback,
  useFeedbackStats,
  useFeedbackEntries,
  type PendingFeedback,
  type SubmitFeedbackInput,
  EvaluatorType,
  FeedbackCycleStatus,
} from '@/hooks/use-feedback';
import {
  FeedbackStatsRow,
  StudentFeedbackCard,
  FeedbackFormDialog,
  FeedbackHistory,
} from '@/components/feedback';

export default function TeacherFeedbackPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedFeedback, setSelectedFeedback] = useState<PendingFeedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const tenantId = useTenantId();

  // Queries
  const {
    data: pendingFeedback,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = usePendingFeedback(tenantId || '');

  const { data: cyclesData, isLoading: cyclesLoading } = useFeedbackCycles(
    tenantId || '',
    { status: FeedbackCycleStatus.ACTIVE }
  );

  const { data: stats, isLoading: statsLoading } = useFeedbackStats(tenantId || '');

  // Get completed feedback entries (submitted = true)
  const { data: completedEntries, isLoading: completedLoading } = useFeedbackEntries(
    tenantId || '',
    { submitted: true, limit: 50 }
  );

  const activeCycleId = cyclesData?.data?.[0]?.id;
  const submitFeedback = useSubmitFeedback(tenantId || '', activeCycleId || '');

  const isLoading = pendingLoading || cyclesLoading || statsLoading;
  const pendingCount = pendingFeedback?.length || 0;
  const overdueCount = pendingFeedback?.filter((f) => f.isOverdue).length || 0;

  const handleCardClick = (feedback: PendingFeedback) => {
    setSelectedFeedback(feedback);
    setDialogOpen(true);
  };

  const handleSubmitFeedback = (data: SubmitFeedbackInput) => {
    if (!activeCycleId) {
      toast.error('No active feedback cycle found');
      return;
    }

    submitFeedback.mutate(data, {
      onSuccess: () => {
        toast.success('Feedback submitted successfully');
        setDialogOpen(false);
        setSelectedFeedback(null);
        refetchPending();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit feedback');
      },
    });
  };

  const handleRefresh = () => {
    refetchPending();
    toast.success('Refreshed');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Give Feedback</h1>
          <p className="text-muted-foreground">
            Provide 360-degree feedback for your students
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <FeedbackStatsRow
        stats={stats}
        pendingCount={pendingCount}
        overdueCount={overdueCount}
        isLoading={isLoading}
      />

      {/* Active Cycle Info */}
      {cyclesData?.data?.[0] && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{cyclesData.data[0].name}</h3>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(cyclesData.data[0].endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant="default">Active Cycle</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed ({stats?.completedFeedback || 0})
          </TabsTrigger>
        </TabsList>

        {/* Pending Feedback */}
        <TabsContent value="pending" className="space-y-4">
          {pendingFeedback && pendingFeedback.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingFeedback.map((feedback) => (
                <StudentFeedbackCard
                  key={`${feedback.cycleId}-${feedback.targetStudentId}`}
                  feedback={feedback}
                  onClick={() => handleCardClick(feedback)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">All Caught Up!</h3>
                <p className="text-muted-foreground text-center">
                  No pending feedback to submit
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <FeedbackHistory
            entries={completedEntries?.data}
            isLoading={completedLoading}
            emptyMessage={`You have submitted ${stats?.completedFeedback || 0} feedback entries`}
          />
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <FeedbackFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedFeedback(null);
        }}
        feedback={selectedFeedback}
        evaluatorType={EvaluatorType.FACULTY}
        onSubmit={handleSubmitFeedback}
        isLoading={submitFeedback.isPending}
      />
    </div>
  );
}
