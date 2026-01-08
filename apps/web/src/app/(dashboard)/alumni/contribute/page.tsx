"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Award,
  Plus,
  DollarSign,
  Clock,
  GraduationCap,
  Laptop,
  Users,
  Presentation,
  Heart,
  CheckCircle2,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useCreateContribution,
  useMyContributions,
  usePublicContributions,
  useTopContributors,
  type Contribution,
  type ContributionType,
  type ContributionStatus,
  type CreateContributionInput,
} from "@/hooks/use-alumni";

const contributionTypeLabels: Record<ContributionType, string> = {
  monetary: "Monetary Donation",
  scholarship: "Scholarship Fund",
  equipment: "Equipment Donation",
  time: "Time & Expertise",
  guest_lecture: "Guest Lecture",
  workshop: "Workshop",
};

const contributionTypeIcons: Record<ContributionType, React.ReactNode> = {
  monetary: <DollarSign className="h-5 w-5" />,
  scholarship: <GraduationCap className="h-5 w-5" />,
  equipment: <Laptop className="h-5 w-5" />,
  time: <Clock className="h-5 w-5" />,
  guest_lecture: <Presentation className="h-5 w-5" />,
  workshop: <Users className="h-5 w-5" />,
};

const statusColors: Record<ContributionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  received: "bg-green-100 text-green-800",
  acknowledged: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<ContributionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  received: "Received",
  acknowledged: "Acknowledged",
};

export default function AlumniContributePage() {
  const [activeTab, setActiveTab] = useState("make");
  const [showContributionDialog, setShowContributionDialog] = useState(false);
  const [contributionForm, setContributionForm] = useState<CreateContributionInput>({
    contributionType: "monetary",
    title: "",
    description: "",
    amount: undefined,
    currency: "INR",
    isPubliclyAcknowledged: true,
  });

  const tenantId = useTenantId();

  const { data: myContributions, isLoading: myLoading, refetch: refetchMy } = useMyContributions(tenantId || "");
  const { data: publicContributions, isLoading: publicLoading } = usePublicContributions(tenantId || "", 20);
  const { data: topContributors, isLoading: topLoading } = useTopContributors(tenantId || "", 10);

  const createContribution = useCreateContribution(tenantId || "");

  const isLoading = myLoading || publicLoading || topLoading;

  const handleSubmitContribution = () => {
    if (!contributionForm.title || !contributionForm.contributionType) return;

    createContribution.mutate(contributionForm, {
      onSuccess: () => {
        setShowContributionDialog(false);
        setContributionForm({
          contributionType: "monetary",
          title: "",
          description: "",
          amount: undefined,
          currency: "INR",
          isPubliclyAcknowledged: true,
        });
        refetchMy();
      },
    });
  };

  const totalContributed = myContributions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Give Back</h1>
          <p className="text-muted-foreground">
            Support your alma mater through contributions
          </p>
        </div>
        <Dialog open={showContributionDialog} onOpenChange={setShowContributionDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Make a Contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Make a Contribution</DialogTitle>
              <DialogDescription>
                Choose how you'd like to give back to your alma mater
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contribution Type</label>
                <Select
                  value={contributionForm.contributionType}
                  onValueChange={(value: ContributionType) =>
                    setContributionForm({ ...contributionForm, contributionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contributionTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {contributionTypeIcons[value as ContributionType]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={contributionForm.title}
                  onChange={(e) =>
                    setContributionForm({ ...contributionForm, title: e.target.value })
                  }
                  placeholder="e.g., Annual Donation 2026"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={contributionForm.description || ""}
                  onChange={(e) =>
                    setContributionForm({ ...contributionForm, description: e.target.value })
                  }
                  placeholder="Describe your contribution or how you'd like it to be used..."
                  rows={3}
                />
              </div>

              {["monetary", "scholarship"].includes(contributionForm.contributionType) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      value={contributionForm.amount || ""}
                      onChange={(e) =>
                        setContributionForm({
                          ...contributionForm,
                          amount: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <Select
                      value={contributionForm.currency || "INR"}
                      onValueChange={(value) =>
                        setContributionForm({ ...contributionForm, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {["time", "guest_lecture", "workshop"].includes(contributionForm.contributionType) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours Contributing</label>
                  <Input
                    type="number"
                    value={contributionForm.hoursContributed || ""}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        hoursContributed: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 4"
                  />
                </div>
              )}

              {contributionForm.contributionType === "equipment" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Value (Optional)</label>
                  <Input
                    type="number"
                    value={contributionForm.estimatedValue || ""}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        estimatedValue: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Allocate To (Optional)</label>
                <Input
                  value={contributionForm.allocatedTo || ""}
                  onChange={(e) =>
                    setContributionForm({ ...contributionForm, allocatedTo: e.target.value })
                  }
                  placeholder="e.g., Computer Science Department, Library"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Public Acknowledgement</label>
                  <p className="text-xs text-muted-foreground">
                    Allow your contribution to be publicly recognized
                  </p>
                </div>
                <Switch
                  checked={contributionForm.isPubliclyAcknowledged}
                  onCheckedChange={(checked) =>
                    setContributionForm({ ...contributionForm, isPubliclyAcknowledged: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowContributionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitContribution}
                disabled={!contributionForm.title || createContribution.isPending}
              >
                {createContribution.isPending ? "Submitting..." : "Submit Contribution"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{myContributions?.length || 0}</span>
              <Award className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ₹{totalContributed.toLocaleString()}
              </span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acknowledged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {myContributions?.filter((c) => c.status === "acknowledged").length || 0}
              </span>
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="make">
            <Heart className="h-4 w-4 mr-2" />
            Ways to Give
          </TabsTrigger>
          <TabsTrigger value="my">
            <Award className="h-4 w-4 mr-2" />
            My Contributions
          </TabsTrigger>
          <TabsTrigger value="wall">
            <Trophy className="h-4 w-4 mr-2" />
            Wall of Honor
          </TabsTrigger>
        </TabsList>

        {/* Ways to Give */}
        <TabsContent value="make" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(contributionTypeLabels).map(([type, label]) => (
              <Card
                key={type}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setContributionForm({ ...contributionForm, contributionType: type as ContributionType });
                  setShowContributionDialog(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {contributionTypeIcons[type as ContributionType]}
                    </div>
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {type === "monetary" && "Make a financial donation to support the institution"}
                    {type === "scholarship" && "Fund scholarships for deserving students"}
                    {type === "equipment" && "Donate equipment, books, or other resources"}
                    {type === "time" && "Volunteer your time and expertise"}
                    {type === "guest_lecture" && "Share your knowledge through guest lectures"}
                    {type === "workshop" && "Conduct workshops to train students"}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Impact Section */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Impact Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-muted-foreground">Students Supported</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">₹25L+</p>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">100+</p>
                  <p className="text-sm text-muted-foreground">Active Donors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Contributions */}
        <TabsContent value="my" className="space-y-4">
          {myContributions && myContributions.length > 0 ? (
            <div className="space-y-4">
              {myContributions.map((contribution) => (
                <Card key={contribution.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {contributionTypeIcons[contribution.contributionType]}
                        </div>
                        <div>
                          <CardTitle className="text-base">{contribution.title}</CardTitle>
                          <CardDescription>
                            {contributionTypeLabels[contribution.contributionType]}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={statusColors[contribution.status]}>
                        {statusLabels[contribution.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {contribution.description && (
                        <p className="text-muted-foreground">{contribution.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4">
                        {contribution.amount && (
                          <div>
                            <span className="text-muted-foreground">Amount: </span>
                            <span className="font-medium">
                              {contribution.currency} {contribution.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {contribution.hoursContributed && (
                          <div>
                            <span className="text-muted-foreground">Hours: </span>
                            <span className="font-medium">{contribution.hoursContributed}</span>
                          </div>
                        )}
                        {contribution.allocatedTo && (
                          <div>
                            <span className="text-muted-foreground">Allocated to: </span>
                            <span className="font-medium">{contribution.allocatedTo}</span>
                          </div>
                        )}
                      </div>

                      {contribution.acknowledgementText && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm italic">"{contribution.acknowledgementText}"</p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(contribution.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Contributions Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start giving back to your alma mater
                </p>
                <Button onClick={() => setShowContributionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Make a Contribution
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Wall of Honor */}
        <TabsContent value="wall" className="space-y-6">
          {/* Top Contributors */}
          {topContributors && topContributors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Contributors
                </CardTitle>
                <CardDescription>
                  Recognizing our most generous alumni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div
                      key={contributor.alumni?.id || index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarImage src={contributor.alumni?.photoUrl} />
                        <AvatarFallback>
                          {contributor.alumni?.firstName?.[0]}
                          {contributor.alumni?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {contributor.alumni?.firstName} {contributor.alumni?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.contributionCount} contributions
                        </p>
                      </div>
                      <Badge variant="secondary">
                        ₹{contributor.totalAmount.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Public Contributions */}
          {publicContributions && publicContributions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Contributions</CardTitle>
                <CardDescription>
                  Thank you to all our contributors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {publicContributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contribution.alumni?.photoUrl} />
                        <AvatarFallback>
                          {contribution.alumni?.firstName?.[0]}
                          {contribution.alumni?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {contribution.alumni?.firstName} {contribution.alumni?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {contribution.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {contributionTypeLabels[contribution.contributionType].split(" ")[0]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(!publicContributions || publicContributions.length === 0) &&
            (!topContributors || topContributors.length === 0) && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Public Contributions Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Be the first to contribute and get featured here
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
