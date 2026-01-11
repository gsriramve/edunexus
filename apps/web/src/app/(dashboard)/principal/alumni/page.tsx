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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Users,
  Briefcase,
  Heart,
  Handshake,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  Eye,
  UserCheck,
  XCircle,
  TrendingUp,
  Building2,
  DollarSign,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useAlumniStats,
  useAlumniDirectory,
  useApproveAlumni,
  useAlumniEvents,
  type AlumniProfile,
  type AlumniStats,
  type RegistrationStatus,
} from "@/hooks/use-alumni";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function PrincipalAlumniPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);

  const tenantId = useTenantId();

  const { data: stats, isLoading: statsLoading } = useAlumniStats(tenantId || "");
  const { data: alumniData, isLoading: alumniLoading, refetch } = useAlumniDirectory(tenantId || "", {
    registrationStatus: statusFilter !== "all" ? statusFilter as RegistrationStatus : undefined,
    limit: 50,
  });
  const { data: eventsData, isLoading: eventsLoading } = useAlumniEvents(tenantId || "", { limit: 5 });
  const approveAlumni = useApproveAlumni(tenantId || "");

  const isLoading = statsLoading || alumniLoading || eventsLoading;
  const alumni = alumniData?.data || [];
  const events = eventsData?.data || [];

  const handleApprove = (alumniId: string) => {
    approveAlumni.mutate({ id: alumniId, status: "approved" as RegistrationStatus }, { onSuccess: () => refetch() });
  };

  const filteredAlumni = alumni.filter((a: AlumniProfile) =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
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
          <h1 className="text-3xl font-bold tracking-tight">Alumni Management</h1>
          <p className="text-muted-foreground">
            Manage alumni network, approvals, and engagement
          </p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alumni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats?.totalAlumni || 0}</span>
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                {stats?.pendingCount || 0}
              </span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats?.employedCount || 0}
              </span>
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entrepreneurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {stats?.entrepreneurCount || 0}
              </span>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Mentors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600">
                {stats?.openToMentoringCount || 0}
              </span>
              <Handshake className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {stats?.totalContributions || 0}
              </span>
              <Heart className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <GraduationCap className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <UserCheck className="h-4 w-4 mr-2" />
            Pending Approvals ({stats?.pendingCount || 0})
          </TabsTrigger>
          <TabsTrigger value="directory">
            <Users className="h-4 w-4 mr-2" />
            Directory
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle>Top Employers</CardTitle>
                <CardDescription>Companies with most alumni</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.topCompanies || [
                    { company: "Google", count: 25 },
                    { company: "Microsoft", count: 22 },
                    { company: "Amazon", count: 18 },
                    { company: "Infosys", count: 45 },
                    { company: "TCS", count: 38 },
                  ]).slice(0, 5).map((item, idx) => (
                    <div key={item.company} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {idx + 1}
                        </span>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.company}</span>
                      </div>
                      <Badge variant="secondary">{item.count} alumni</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Industries */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Distribution</CardTitle>
                <CardDescription>Alumni by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.topIndustries || [
                    { industry: "Information Technology", count: 120 },
                    { industry: "Finance & Banking", count: 45 },
                    { industry: "Manufacturing", count: 35 },
                    { industry: "Consulting", count: 28 },
                    { industry: "Healthcare", count: 22 },
                  ]).slice(0, 5).map((item, idx) => (
                    <div key={item.industry} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{item.industry}</span>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Graduation Year Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Alumni by Graduation Year</CardTitle>
                <CardDescription>Distribution across batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {[
                    { year: "2020", count: 85 },
                    { year: "2021", count: 92 },
                    { year: "2022", count: 88 },
                    { year: "2023", count: 95 },
                    { year: "2024", count: 78 },
                    { year: "2025", count: 42 },
                  ].map((item) => (
                    <div key={item.year} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${item.count}%` }}
                      />
                      <p className="text-xs mt-2 text-muted-foreground">{item.year}</p>
                      <p className="text-sm font-medium">{item.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Alumni Events</CardTitle>
                <CardDescription>Scheduled events and reunions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(events.length > 0 ? events : [
                    { id: "1", title: "Annual Alumni Meet 2026", startDate: "2026-02-15", eventType: "reunion" },
                    { id: "2", title: "Tech Talk Series", startDate: "2026-01-25", eventType: "guest_lecture" },
                    { id: "3", title: "Networking Mixer", startDate: "2026-02-05", eventType: "networking" },
                  ]).slice(0, 3).map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{event.eventType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Registration Approvals</CardTitle>
              <CardDescription>
                Review and approve alumni registration requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAlumni.filter((a: AlumniProfile) => a.registrationStatus === "pending").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alumni</TableHead>
                      <TableHead>Graduation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlumni
                      .filter((a: AlumniProfile) => a.registrationStatus === "pending")
                      .map((alumni: AlumniProfile) => (
                        <TableRow key={alumni.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {alumni.firstName[0]}{alumni.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {alumni.firstName} {alumni.lastName}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{alumni.graduationYear}</TableCell>
                          <TableCell>{alumni.degree || "B.Tech"}</TableCell>
                          <TableCell>{alumni.email}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusColors[alumni.registrationStatus]}>
                              {alumni.registrationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAlumni(alumni)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(alumni.id)}
                                disabled={approveAlumni.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No pending approvals at this time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Directory Tab */}
        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alumni Directory</CardTitle>
                  <CardDescription>{filteredAlumni.length} alumni registered</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alumni..."
                      className="pl-9 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead>Mentoring</TableHead>
                    <TableHead className="text-center">Registration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumni.slice(0, 10).map((alumni: AlumniProfile) => (
                    <TableRow key={alumni.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {alumni.firstName[0]}{alumni.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {alumni.firstName} {alumni.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{alumni.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{alumni.graduationYear}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{alumni.currentStatus || "employed"}</Badge>
                      </TableCell>
                      <TableCell>
                        {alumni.openToMentoring ? (
                          <Badge variant="default">Available</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={statusColors[alumni.registrationStatus]}>
                          {alumni.registrationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAlumni(alumni)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            {alumni.registrationStatus === "pending" && (
                              <DropdownMenuItem onClick={() => handleApprove(alumni.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alumni Detail Dialog */}
      <Dialog open={selectedAlumni !== null} onOpenChange={() => setSelectedAlumni(null)}>
        <DialogContent>
          {selectedAlumni && (
            <>
              <DialogHeader>
                <DialogTitle>Alumni Profile</DialogTitle>
                <DialogDescription>
                  {selectedAlumni.firstName} {selectedAlumni.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {selectedAlumni.firstName[0]}{selectedAlumni.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedAlumni.firstName} {selectedAlumni.lastName}
                    </h3>
                    <p className="text-muted-foreground">{selectedAlumni.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Graduation Year</p>
                    <p className="font-medium">{selectedAlumni.graduationYear}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Batch</p>
                    <p className="font-medium">{selectedAlumni.batch}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Degree</p>
                    <p className="font-medium">{selectedAlumni.degree || "B.Tech"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedAlumni.registrationStatus]}>
                      {selectedAlumni.registrationStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAlumni(null)}>
                  Close
                </Button>
                {selectedAlumni.registrationStatus === "pending" && (
                  <Button onClick={() => {
                    handleApprove(selectedAlumni.id);
                    setSelectedAlumni(null);
                  }}>
                    Approve Registration
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
