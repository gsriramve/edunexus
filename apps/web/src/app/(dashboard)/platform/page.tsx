'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Mail,
  RefreshCw,
  Ban,
  Play,
  Timer,
  Search,
  Plus,
  History,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  usePlatformStats,
  usePlatformTenants,
  usePlatformAuditLogs,
  useCreatePlatformTenant,
  useExtendTrial,
  useActivateTenant,
  useSuspendTenant,
  useReactivateTenant,
  useInvitePrincipal,
  useResendInvitation,
  useCancelInvitation,
} from '@/hooks/use-api';
import type { PlatformTenant } from '@/lib/api';

export default function PlatformDashboard() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [extendTrialOpen, setExtendTrialOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);

  // Selected tenant for actions
  const [selectedTenant, setSelectedTenant] = useState<PlatformTenant | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'suspend' | 'reactivate' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Form states
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    displayName: '',
    principalEmail: '',
    principalName: '',
    trialDays: 15,
  });
  const [inviteData, setInviteData] = useState({ email: '', name: '', message: '' });
  const [extendDays, setExtendDays] = useState(15);

  // Queries
  const { data: statsData, isLoading: statsLoading } = usePlatformStats();
  const { data: tenantsData, isLoading: tenantsLoading } = usePlatformTenants({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    page: currentPage,
    limit: 10,
  });
  const { data: auditData, isLoading: auditLoading } = usePlatformAuditLogs({
    limit: 10,
    page: 1,
  });

  // Mutations
  const createTenant = useCreatePlatformTenant();
  const extendTrial = useExtendTrial();
  const activateTenant = useActivateTenant();
  const suspendTenant = useSuspendTenant();
  const reactivateTenant = useReactivateTenant();
  const invitePrincipal = useInvitePrincipal();
  const resendInvitation = useResendInvitation();
  const cancelInvitation = useCancelInvitation();

  const isLoading = statsLoading || tenantsLoading;

  const handleCreateTenant = async () => {
    try {
      await createTenant.mutateAsync({
        name: newTenant.name,
        domain: newTenant.domain,
        displayName: newTenant.displayName,
        principalEmail: newTenant.principalEmail || undefined,
        principalName: newTenant.principalName || undefined,
        trialDays: newTenant.trialDays,
      });
      toast({
        title: 'Tenant Created',
        description: `${newTenant.displayName} has been created successfully.`,
      });
      setAddTenantOpen(false);
      setNewTenant({ name: '', domain: '', displayName: '', principalEmail: '', principalName: '', trialDays: 15 });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to create tenant',
        variant: 'destructive',
      });
    }
  };

  const handleInvitePrincipal = async () => {
    if (!selectedTenant) return;
    try {
      await invitePrincipal.mutateAsync({
        tenantId: selectedTenant.id,
        data: {
          email: inviteData.email,
          name: inviteData.name || undefined,
          message: inviteData.message || undefined,
        },
      });
      toast({
        title: 'Invitation Sent',
        description: `Principal invitation sent to ${inviteData.email}`,
      });
      setInviteOpen(false);
      setInviteData({ email: '', name: '', message: '' });
      setSelectedTenant(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (tenant: PlatformTenant) => {
    if (!tenant.pendingInvitation) return;
    try {
      await resendInvitation.mutateAsync({ invitationId: tenant.pendingInvitation.id });
      toast({
        title: 'Invitation Resent',
        description: `Invitation resent to ${tenant.pendingInvitation.email}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvitation = async (tenant: PlatformTenant) => {
    if (!tenant.pendingInvitation) return;
    try {
      await cancelInvitation.mutateAsync(tenant.pendingInvitation.id);
      toast({
        title: 'Invitation Cancelled',
        description: `Invitation cancelled for ${tenant.pendingInvitation.email}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedTenant) return;
    try {
      await extendTrial.mutateAsync({
        id: selectedTenant.id,
        data: { days: extendDays },
      });
      toast({
        title: 'Trial Extended',
        description: `Trial extended by ${extendDays} days for ${selectedTenant.displayName}`,
      });
      setExtendTrialOpen(false);
      setExtendDays(15);
      setSelectedTenant(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to extend trial',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedTenant || !confirmAction) return;

    try {
      const actionData = { reason: actionReason || undefined };

      if (confirmAction === 'activate') {
        await activateTenant.mutateAsync({ id: selectedTenant.id, data: actionData });
        toast({ title: 'Tenant Activated', description: `${selectedTenant.displayName} is now active.` });
      } else if (confirmAction === 'suspend') {
        await suspendTenant.mutateAsync({ id: selectedTenant.id, data: actionData });
        toast({ title: 'Tenant Suspended', description: `${selectedTenant.displayName} has been suspended.` });
      } else if (confirmAction === 'reactivate') {
        await reactivateTenant.mutateAsync({ id: selectedTenant.id, data: actionData });
        toast({ title: 'Tenant Reactivated', description: `${selectedTenant.displayName} has been reactivated.` });
      }

      setConfirmDialogOpen(false);
      setConfirmAction(null);
      setActionReason('');
      setSelectedTenant(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to perform action',
        variant: 'destructive',
      });
    }
  };

  const openConfirmDialog = (tenant: PlatformTenant, action: 'activate' | 'suspend' | 'reactivate') => {
    setSelectedTenant(tenant);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trial':
        return <Badge className="bg-yellow-500">Trial</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPrincipalStatus = (tenant: PlatformTenant) => {
    if (tenant.principal) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">{tenant.principal.email}</span>
        </div>
      );
    }
    if (tenant.pendingInvitation) {
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Invited: {tenant.pendingInvitation.email}</span>
        </div>
      );
    }
    return (
      <span className="text-sm text-muted-foreground">No principal</span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all colleges and monitor platform health
          </p>
        </div>
        <Button onClick={() => setAddTenantOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New College
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statsData?.tenants.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.tenants.active || 0} active, {statsData?.tenants.trial || 0} trial
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statsData?.users.total.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.users.students.toLocaleString() || 0} students
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Trials</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statsData?.tenants.expiringTrials || 0}</div>
                <p className="text-xs text-muted-foreground">Within 7 days</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{statsData?.invitations.pending || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.activity.last24Hours || 0} actions today
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tenants Table */}
          <Card>
            <CardHeader>
              <CardTitle>Colleges</CardTitle>
              <CardDescription>
                Manage all onboarded colleges and their subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tenantsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : tenantsData?.tenants && tenantsData.tenants.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>College</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trial</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenantsData.tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{tenant.displayName}</p>
                              <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getPrincipalStatus(tenant)}</TableCell>
                          <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                          <TableCell>
                            {tenant.status === 'trial' && tenant.trialDaysRemaining !== undefined ? (
                              <div className="flex items-center gap-1">
                                <Timer className="h-4 w-4 text-yellow-500" />
                                <span className={tenant.trialDaysRemaining <= 3 ? 'text-red-500 font-medium' : ''}>
                                  {tenant.trialDaysRemaining}d left
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Invitation actions */}
                                {!tenant.principal && !tenant.pendingInvitation && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedTenant(tenant);
                                      setInviteOpen(true);
                                    }}
                                  >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Invite Principal
                                  </DropdownMenuItem>
                                )}
                                {tenant.pendingInvitation && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleResendInvitation(tenant)}>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Resend Invitation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleCancelInvitation(tenant)}
                                      className="text-destructive"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Invitation
                                    </DropdownMenuItem>
                                  </>
                                )}

                                <DropdownMenuSeparator />

                                {/* Trial actions */}
                                {tenant.status === 'trial' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedTenant(tenant);
                                      setExtendTrialOpen(true);
                                    }}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Extend Trial
                                  </DropdownMenuItem>
                                )}

                                {/* Status actions */}
                                {tenant.status === 'trial' && (
                                  <DropdownMenuItem onClick={() => openConfirmDialog(tenant, 'activate')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                {tenant.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => openConfirmDialog(tenant, 'suspend')}
                                    className="text-destructive"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                {tenant.status === 'suspended' && (
                                  <DropdownMenuItem onClick={() => openConfirmDialog(tenant, 'reactivate')}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Reactivate
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTenant(tenant);
                                    setAuditLogOpen(true);
                                  }}
                                >
                                  <History className="mr-2 h-4 w-4" />
                                  View Audit Log
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {tenantsData.pagination && tenantsData.pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {tenantsData.pagination.page} of {tenantsData.pagination.pages} ({tenantsData.pagination.total} total)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage >= tenantsData.pagination.pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No colleges found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setAddTenantOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First College
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Platform-wide audit log of all actions</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : auditData?.logs && auditData.logs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{log.targetType}</p>
                            {log.tenant && (
                              <p className="text-xs text-muted-foreground">{log.tenant.displayName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{log.performedByName || 'System'}</p>
                            <p className="text-xs text-muted-foreground">{log.performedByEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Tenant Dialog */}
      <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New College</DialogTitle>
            <DialogDescription>
              Create a new college tenant with an optional principal invitation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Internal Name</Label>
              <Input
                id="name"
                placeholder="abc-college"
                value={newTenant.name}
                onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="ABC Engineering College"
                value={newTenant.displayName}
                onChange={(e) => setNewTenant({ ...newTenant, displayName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="abc.edunexus.io"
                value={newTenant.domain}
                onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trialDays">Trial Period (days)</Label>
              <Input
                id="trialDays"
                type="number"
                min={1}
                max={90}
                value={newTenant.trialDays}
                onChange={(e) => setNewTenant({ ...newTenant, trialDays: parseInt(e.target.value) || 15 })}
              />
            </div>
            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-2">Principal Invitation (Optional)</p>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="principalEmail">Principal Email</Label>
                  <Input
                    id="principalEmail"
                    type="email"
                    placeholder="principal@college.edu"
                    value={newTenant.principalEmail}
                    onChange={(e) => setNewTenant({ ...newTenant, principalEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="principalName">Principal Name</Label>
                  <Input
                    id="principalName"
                    placeholder="Dr. John Smith"
                    value={newTenant.principalName}
                    onChange={(e) => setNewTenant({ ...newTenant, principalName: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTenantOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTenant}
              disabled={!newTenant.name || !newTenant.displayName || !newTenant.domain || createTenant.isPending}
            >
              {createTenant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create College
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Principal Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Principal</DialogTitle>
            <DialogDescription>
              Send an invitation to the principal of {selectedTenant?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="principal@college.edu"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteName">Name (Optional)</Label>
              <Input
                id="inviteName"
                placeholder="Dr. John Smith"
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteMessage">Custom Message (Optional)</Label>
              <Textarea
                id="inviteMessage"
                placeholder="You have been invited to manage..."
                value={inviteData.message}
                onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvitePrincipal}
              disabled={!inviteData.email || invitePrincipal.isPending}
            >
              {invitePrincipal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Trial Dialog */}
      <Dialog open={extendTrialOpen} onOpenChange={setExtendTrialOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              Extend the trial period for {selectedTenant?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="extendDays">Additional Days</Label>
              <Input
                id="extendDays"
                type="number"
                min={1}
                max={90}
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 15)}
              />
              {selectedTenant?.trialDaysRemaining !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Current: {selectedTenant.trialDaysRemaining} days remaining
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTrialOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExtendTrial} disabled={extendTrial.isPending}>
              {extendTrial.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'activate' && 'Activate Tenant'}
              {confirmAction === 'suspend' && 'Suspend Tenant'}
              {confirmAction === 'reactivate' && 'Reactivate Tenant'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'activate' &&
                `This will convert ${selectedTenant?.displayName} from trial to active status. The trial period will be removed.`}
              {confirmAction === 'suspend' &&
                `This will suspend ${selectedTenant?.displayName}. Users will not be able to access the platform.`}
              {confirmAction === 'reactivate' &&
                `This will reactivate ${selectedTenant?.displayName}. Users will regain access to the platform.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="actionReason">Reason (Optional)</Label>
              <Textarea
                id="actionReason"
                placeholder="Enter reason for this action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'suspend' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              disabled={activateTenant.isPending || suspendTenant.isPending || reactivateTenant.isPending}
            >
              {(activateTenant.isPending || suspendTenant.isPending || reactivateTenant.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmAction === 'activate' && 'Activate'}
              {confirmAction === 'suspend' && 'Suspend'}
              {confirmAction === 'reactivate' && 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Audit Log Dialog */}
      <Dialog open={auditLogOpen} onOpenChange={setAuditLogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Audit Log</DialogTitle>
            <DialogDescription>
              Activity log for {selectedTenant?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <TenantAuditLogList tenantId={selectedTenant?.id || ''} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditLogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tenant Audit Log Component
function TenantAuditLogList({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = usePlatformAuditLogs({ targetId: tenantId, limit: 20 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.logs || data.logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {log.action.replace(/_/g, ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm mt-1">
              by {log.performedByName || 'System'} ({log.performedByEmail})
            </p>
            {log.details && Object.keys(log.details).length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {JSON.stringify(log.details)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
