"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  MoreHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useInvitations,
  useInvitationStats,
  useCreateInvitation,
  useResendInvitation,
  useCancelInvitation,
} from "@/hooks/use-invitations";
import { useStaff, useStudents } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import type { InvitationRole, Invitation } from "@/lib/api";

// Role options for invitations
const roleOptions = [
  { value: "hod", label: "Head of Department", description: "Department management" },
  { value: "admin_staff", label: "Admin Staff", description: "Administrative operations" },
  { value: "teacher", label: "Teacher", description: "Classes and academics" },
  { value: "lab_assistant", label: "Lab Assistant", description: "Lab sessions and practicals" },
  { value: "student", label: "Student", description: "Student portal access" },
  { value: "parent", label: "Parent", description: "Monitor child's progress" },
];

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const tenantId = useTenantId();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "",
    message: "",
  });

  // API hooks
  const effectiveTenantId = tenantId || '';
  const { data: staffData, isLoading: staffLoading } = useStaff(effectiveTenantId);
  const { data: studentsData, isLoading: studentsLoading } = useStudents(effectiveTenantId);
  const { data: invitationsData, isLoading: invitationsLoading } = useInvitations(effectiveTenantId);
  const { data: invitationStats, isLoading: statsLoading } = useInvitationStats(effectiveTenantId);

  // Mutations
  const createInvitation = useCreateInvitation(effectiveTenantId);
  const resendInvitation = useResendInvitation(effectiveTenantId);
  const cancelInvitation = useCancelInvitation(effectiveTenantId);

  // Combine staff and students for the users list
  const staffUsers = (staffData?.data || []).map((staff: any) => ({
    id: staff.id,
    name: staff.user?.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown',
    email: staff.email || staff.user?.email || 'N/A',
    role: staff.role || staff.user?.role || 'staff',
    status: staff.employmentStatus === 'active' ? 'active' : 'inactive',
    lastLogin: staff.user?.lastLoginAt ? formatRelativeTime(staff.user.lastLoginAt) : 'Never',
  }));

  const studentUsers = (studentsData?.data || []).map((student: any) => ({
    id: student.id,
    name: student.user?.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown',
    email: student.email || student.user?.email || 'N/A',
    role: 'student',
    status: student.enrollmentStatus === 'enrolled' || student.status === 'active' ? 'active' : 'inactive',
    lastLogin: student.user?.lastLoginAt ? formatRelativeTime(student.user.lastLoginAt) : 'Never',
  }));

  // Filter users based on search and role
  const allUsers = [...staffUsers, ...studentUsers];
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Get invitations list
  const invitations: Invitation[] = invitationsData?.data || [];

  // Stats from API or calculated
  const stats = {
    totalUsers: staffUsers.length + studentUsers.length,
    activeUsers: allUsers.filter((u) => u.status === 'active').length,
    pendingInvitations: invitationStats?.pendingCount || 0,
    acceptedThisMonth: invitationStats?.acceptedThisMonth || 0,
  };

  // Helper function to format relative time
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  // Calculate expiry time
  function getExpiresIn(expiresAt: string): string {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    return `${diffDays} days`;
  }

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.role) return;

    try {
      await createInvitation.mutateAsync({
        email: inviteForm.email,
        role: inviteForm.role as InvitationRole,
        message: inviteForm.message || undefined,
      });
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteForm.email}`,
      });
      setIsInviteDialogOpen(false);
      setInviteForm({ email: "", role: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation.mutateAsync({ id: invitationId });
      toast({
        title: "Invitation Resent",
        description: "The invitation has been resent.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync(invitationId);
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const isLoading = staffLoading || studentsLoading || invitationsLoading || statsLoading;

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      hod: "bg-purple-100 text-purple-800",
      admin_staff: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      lab_assistant: "bg-yellow-100 text-yellow-800",
      student: "bg-indigo-100 text-indigo-800",
      parent: "bg-pink-100 text-pink-800",
    };
    return <Badge className={colors[role] || "bg-gray-100 text-gray-800"}>{role?.replace("_", " ") || 'N/A'}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="border-green-500 text-green-600">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Accepted</Badge>;
      case "expired":
        return <Badge variant="outline" className="border-red-500 text-red-600">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and send invitations
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation email to a new user. They will receive a link to create their account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Welcome Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal welcome message..."
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteForm.email || !inviteForm.role}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingInvitations}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.acceptedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              New users joined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(invitationStats?.byRole || {}).length || roleOptions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage users in your institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-medium">No Users Found</p>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedRole ? "Try adjusting your filters" : "Start by inviting users"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                        <TableCell>{getStatusBadge(u.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{u.lastLogin}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Role</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Track and manage sent invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-lg font-medium">No Invitations</p>
                  <p className="text-muted-foreground">Start by inviting users to your institution</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires In</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                        <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatRelativeTime(invitation.createdAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getExpiresIn(invitation.expiresAt)}
                        </TableCell>
                        <TableCell>
                          {invitation.status === "pending" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">How User Invitations Work</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When you invite a user, they receive an email with a secure sign-up link.
                After they create their account, their role is automatically assigned based on your selection.
                Users cannot self-register or choose their own roles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
