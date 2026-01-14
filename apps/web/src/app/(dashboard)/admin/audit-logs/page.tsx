'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Download,
  Settings2,
  Eye,
  FileText,
  LogIn,
  Pencil,
  Trash2,
  Plus,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  auditApi,
  AuditLog,
  AuditLogStats,
  AuditLogSettings,
  AuditAction,
  AuditCategory,
  AuditStatus,
} from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantId } from '@/hooks/use-tenant';

const ACTION_OPTIONS: { value: AuditAction; label: string; icon: React.ReactNode }[] = [
  { value: 'CREATE', label: 'Create', icon: <Plus className="h-3 w-3" /> },
  { value: 'UPDATE', label: 'Update', icon: <Pencil className="h-3 w-3" /> },
  { value: 'DELETE', label: 'Delete', icon: <Trash2 className="h-3 w-3" /> },
  { value: 'VIEW', label: 'View', icon: <Eye className="h-3 w-3" /> },
  { value: 'LOGIN', label: 'Login', icon: <LogIn className="h-3 w-3" /> },
  { value: 'LOGOUT', label: 'Logout', icon: <LogIn className="h-3 w-3" /> },
  { value: 'EXPORT', label: 'Export', icon: <Download className="h-3 w-3" /> },
  { value: 'IMPORT', label: 'Import', icon: <FileText className="h-3 w-3" /> },
];

const CATEGORY_OPTIONS: { value: AuditCategory; label: string }[] = [
  { value: 'AUTHENTICATION', label: 'Authentication' },
  { value: 'USER_MANAGEMENT', label: 'User Management' },
  { value: 'STUDENT_MANAGEMENT', label: 'Student Management' },
  { value: 'STAFF_MANAGEMENT', label: 'Staff Management' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'ATTENDANCE', label: 'Attendance' },
  { value: 'EXAM', label: 'Exam' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'LIBRARY', label: 'Library' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'IMPORT_EXPORT', label: 'Import/Export' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'SETTINGS', label: 'Settings' },
];

function getActionBadge(action: string) {
  const actionConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    CREATE: { variant: 'default', className: 'bg-green-500' },
    UPDATE: { variant: 'default', className: 'bg-blue-500' },
    DELETE: { variant: 'destructive' },
    VIEW: { variant: 'secondary' },
    LOGIN: { variant: 'outline', className: 'border-green-500 text-green-600' },
    LOGOUT: { variant: 'outline', className: 'border-orange-500 text-orange-600' },
    EXPORT: { variant: 'outline', className: 'border-purple-500 text-purple-600' },
    IMPORT: { variant: 'outline', className: 'border-purple-500 text-purple-600' },
  };

  const config = actionConfig[action] || { variant: 'secondary' as const };

  return (
    <Badge variant={config.variant} className={config.className}>
      {action}
    </Badge>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failure':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function AuditLogsPage() {
  const tenantId = useTenantId() || '';
  const [activeTab, setActiveTab] = useState('logs');
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [settings, setSettings] = useState<AuditLogSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Detail dialog state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!tenantId) return;
    try {
      const data = await auditApi.getStats(tenantId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [tenantId]);

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!tenantId) return;
    try {
      const data = await auditApi.getSettings(tenantId);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [tenantId]);

  // Load logs
  const loadLogs = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const response = await auditApi.listLogs(tenantId, {
        search: searchQuery || undefined,
        action: selectedAction as AuditAction || undefined,
        category: selectedCategory as AuditCategory || undefined,
        status: selectedStatus as AuditStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy: 'timestamp',
        sortOrder: 'desc',
      });
      setLogs(response.logs);
      setTotalLogs(response.total);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, searchQuery, selectedAction, selectedCategory, selectedStatus, startDate, endDate, currentPage]);

  // Update settings
  const handleUpdateSettings = async (updates: Partial<AuditLogSettings>) => {
    if (!tenantId) return;
    try {
      const updated = await auditApi.updateSettings(tenantId, updates);
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  // Export logs
  const handleExportLogs = async () => {
    if (!tenantId) return;
    try {
      const exportedLogs = await auditApi.exportLogs(tenantId, {
        action: selectedAction as AuditAction || undefined,
        category: selectedCategory as AuditCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Convert to CSV
      const headers = ['Timestamp', 'User', 'Action', 'Category', 'Entity', 'Status', 'IP Address', 'Duration'];
      const rows = exportedLogs.map(log => [
        log.timestamp,
        log.userName || log.userEmail || log.userId || 'System',
        log.action,
        log.category,
        log.entityType ? `${log.entityType}${log.entityId ? `:${log.entityId}` : ''}` : '-',
        log.status,
        log.ipAddress || '-',
        log.duration ? `${log.duration}ms` : '-',
      ]);

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Load logs when filters change
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAction, selectedCategory, selectedStatus, startDate, endDate]);

  const totalPages = Math.ceil(totalLogs / pageSize);

  // Loading state for tenant
  if (!tenantId) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor all system activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayLogs.toLocaleString()} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLogs > 0
                  ? ((stats.successLogs / stats.totalLogs) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.successLogs.toLocaleString()} successful
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failures</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failureLogs}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                Unique users logged
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logins Today</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.actionCounts['LOGIN'] || 0}</div>
              <p className="text-xs text-muted-foreground">
                Authentication events
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" onClick={loadSettings}>
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <div className="md:col-span-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by user, entity..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {ACTION_OPTIONS.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <div className="flex gap-1">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Activity Logs
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({totalLogs.toLocaleString()} total)
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {formatDate(log.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.userName || 'System'}</div>
                              <div className="text-xs text-muted-foreground">
                                {log.userEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {log.entityType ? (
                              <div>
                                <div className="font-medium">{log.entityType}</div>
                                {log.entityName && (
                                  <div className="text-xs text-muted-foreground">
                                    {log.entityName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(log.status)}
                              <span className="capitalize">{log.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDuration(log.duration)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                      {Math.min(currentPage * pageSize, totalLogs)} of {totalLogs}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Actions Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.actionCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([action, count]) => (
                        <div key={action} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getActionBadge(action)}
                          </div>
                          <div className="text-sm font-medium">{count.toLocaleString()}</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.categoryCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <Badge variant="outline">{category}</Badge>
                          <div className="text-sm font-medium">{count.toLocaleString()}</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Entity Types Modified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-4">
                    {Object.entries(stats.entityTypeCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([entityType, count]) => (
                        <div key={entityType} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">{entityType}</span>
                          <Badge variant="secondary">{count.toLocaleString()}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 bg-muted rounded-lg">
                        {getStatusIcon(log.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.userName || 'System'}</span>
                            {getActionBadge(log.action)}
                            {log.entityType && (
                              <Badge variant="outline" className="text-xs">
                                {log.entityType}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {log.requestPath}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Policy</CardTitle>
                  <CardDescription>
                    Configure how long audit logs are retained
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Retention Period (Days)</Label>
                      <p className="text-sm text-muted-foreground">
                        Logs older than this will be automatically deleted
                      </p>
                    </div>
                    <Input
                      type="number"
                      className="w-24"
                      value={settings.retentionDays}
                      onChange={(e) => handleUpdateSettings({ retentionDays: parseInt(e.target.value) })}
                      min={30}
                      max={3650}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logging Configuration</CardTitle>
                  <CardDescription>
                    Control what activities are logged
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log Read Operations</Label>
                      <p className="text-sm text-muted-foreground">Log VIEW actions</p>
                    </div>
                    <Switch
                      checked={settings.logReads}
                      onCheckedChange={(checked) => handleUpdateSettings({ logReads: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log Authentication</Label>
                      <p className="text-sm text-muted-foreground">Login/logout events</p>
                    </div>
                    <Switch
                      checked={settings.logAuthentication}
                      onCheckedChange={(checked) => handleUpdateSettings({ logAuthentication: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log Data Changes</Label>
                      <p className="text-sm text-muted-foreground">Create/update/delete</p>
                    </div>
                    <Switch
                      checked={settings.logDataChanges}
                      onCheckedChange={(checked) => handleUpdateSettings({ logDataChanges: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log Exports</Label>
                      <p className="text-sm text-muted-foreground">Data export events</p>
                    </div>
                    <Switch
                      checked={settings.logExports}
                      onCheckedChange={(checked) => handleUpdateSettings({ logExports: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log Imports</Label>
                      <p className="text-sm text-muted-foreground">Data import events</p>
                    </div>
                    <Switch
                      checked={settings.logImports}
                      onCheckedChange={(checked) => handleUpdateSettings({ logImports: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log System Events</Label>
                      <p className="text-sm text-muted-foreground">System-level events</p>
                    </div>
                    <Switch
                      checked={settings.logSystemEvents}
                      onCheckedChange={(checked) => handleUpdateSettings({ logSystemEvents: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this activity
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="font-medium">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    <span className="capitalize">{selectedLog.status}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedLog.userName || 'System'}</p>
                  {selectedLog.userEmail && (
                    <p className="text-sm text-muted-foreground">{selectedLog.userEmail}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <p className="font-medium">{selectedLog.userRole || '-'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedLog.category}</Badge>
                  </div>
                </div>
              </div>

              {selectedLog.entityType && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Entity Type</Label>
                      <p className="font-medium">{selectedLog.entityType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Entity ID</Label>
                      <p className="font-mono text-sm">{selectedLog.entityId || '-'}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-mono text-sm">{selectedLog.ipAddress || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{formatDuration(selectedLog.duration)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Request Path</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                  {selectedLog.requestMethod} {selectedLog.requestPath}
                </p>
              </div>

              {selectedLog.changedFields && selectedLog.changedFields.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Changed Fields</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLog.changedFields.map((field) => (
                      <Badge key={field} variant="secondary">{field}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div>
                  <Label className="text-muted-foreground">Error Message</Label>
                  <p className="text-destructive bg-destructive/10 p-2 rounded mt-1">
                    {selectedLog.errorMessage}
                  </p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded mt-1 break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
