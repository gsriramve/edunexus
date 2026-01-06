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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  Download,
  Clock,
  Calendar,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Eye,
  Play,
  Pause,
  Settings2,
  BarChart3,
  FileSpreadsheet,
  File,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Layout,
  Filter,
} from 'lucide-react';
import {
  reportsApi,
  ReportTemplate,
  ReportJob,
  ScheduledReport,
  ReportStats,
  ReportCategory,
  DataSource,
  ReportFormat,
  ReportJobStatus,
  Frequency,
  ColumnDefinition,
} from '@/lib/api';

// Mock tenant ID - in production would come from auth context
const TENANT_ID = 'cmk2l82k00001viari7idl59u';

const CATEGORY_OPTIONS: { value: ReportCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'financial', label: 'Financial' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'exam', label: 'Exam' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'transport', label: 'Transport' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'library', label: 'Library' },
  { value: 'sports', label: 'Sports' },
  { value: 'communication', label: 'Communication' },
  { value: 'audit', label: 'Audit' },
];

const DATA_SOURCE_OPTIONS: { value: DataSource; label: string }[] = [
  { value: 'students', label: 'Students' },
  { value: 'staff', label: 'Staff' },
  { value: 'departments', label: 'Departments' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'fees', label: 'Fees' },
  { value: 'payments', label: 'Payments' },
  { value: 'exams', label: 'Exams' },
  { value: 'exam_results', label: 'Exam Results' },
  { value: 'transport', label: 'Transport' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'library', label: 'Library' },
  { value: 'sports_teams', label: 'Sports Teams' },
  { value: 'clubs', label: 'Clubs' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'audit_logs', label: 'Audit Logs' },
];

const FORMAT_OPTIONS: { value: ReportFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
  { value: 'xlsx', label: 'Excel', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: 'csv', label: 'CSV', icon: <File className="h-4 w-4" /> },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
    case 'processing':
      return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getCategoryBadge(category: string) {
  const colors: Record<string, string> = {
    academic: 'bg-blue-100 text-blue-800',
    financial: 'bg-green-100 text-green-800',
    attendance: 'bg-purple-100 text-purple-800',
    exam: 'bg-orange-100 text-orange-800',
    student: 'bg-cyan-100 text-cyan-800',
    staff: 'bg-pink-100 text-pink-800',
  };
  return <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [templateFilter, setTemplateFilter] = useState({ category: '', dataSource: '', search: '' });
  const [jobFilter, setJobFilter] = useState({ status: '', format: '' });
  const [scheduledFilter, setScheduledFilter] = useState({ frequency: '', isActive: '' });

  // Pagination
  const [templatePage, setTemplatePage] = useState(0);
  const [jobPage, setJobPage] = useState(0);
  const [scheduledPage, setScheduledPage] = useState(0);
  const PAGE_SIZE = 10;

  // Dialogs
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generateFormat, setGenerateFormat] = useState<ReportFormat>('pdf');

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    frequency: 'weekly' as Frequency,
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: '',
    emailSubject: '',
    format: 'pdf' as ReportFormat,
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await reportsApi.getStats(TENANT_ID);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await reportsApi.listTemplates(TENANT_ID, {
        category: templateFilter.category || undefined,
        dataSource: templateFilter.dataSource || undefined,
        search: templateFilter.search || undefined,
        limit: PAGE_SIZE,
        offset: templatePage * PAGE_SIZE,
      });
      setTemplates(data.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  }, [templateFilter, templatePage]);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await reportsApi.listJobs(TENANT_ID, {
        status: jobFilter.status as ReportJobStatus || undefined,
        format: jobFilter.format as ReportFormat || undefined,
        limit: PAGE_SIZE,
        offset: jobPage * PAGE_SIZE,
      });
      setJobs(data.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  }, [jobFilter, jobPage]);

  const fetchScheduledReports = useCallback(async () => {
    try {
      const data = await reportsApi.listScheduledReports(TENANT_ID, {
        frequency: scheduledFilter.frequency as Frequency || undefined,
        isActive: scheduledFilter.isActive ? scheduledFilter.isActive === 'true' : undefined,
        limit: PAGE_SIZE,
        offset: scheduledPage * PAGE_SIZE,
      });
      setScheduledReports(data.data);
    } catch (err) {
      console.error('Failed to fetch scheduled reports:', err);
    }
  }, [scheduledFilter, scheduledPage]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchTemplates(), fetchJobs(), fetchScheduledReports()]);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchTemplates, fetchJobs, fetchScheduledReports]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchScheduledReports();
  }, [fetchScheduledReports]);

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    setGeneratingReport(true);
    try {
      await reportsApi.generateFromTemplate(TENANT_ID, {
        templateId: selectedTemplate.id,
        format: generateFormat,
      });
      setShowGenerateDialog(false);
      setSelectedTemplate(null);
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedTemplate) return;

    try {
      await reportsApi.createScheduledReport(TENANT_ID, {
        templateId: selectedTemplate.id,
        name: scheduleForm.name || `Scheduled ${selectedTemplate.name}`,
        frequency: scheduleForm.frequency,
        time: scheduleForm.time,
        dayOfWeek: scheduleForm.frequency === 'weekly' ? scheduleForm.dayOfWeek : undefined,
        dayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(scheduleForm.frequency) ? scheduleForm.dayOfMonth : undefined,
        recipients: scheduleForm.recipients.split(',').map(r => r.trim()).filter(Boolean),
        emailSubject: scheduleForm.emailSubject || undefined,
        format: scheduleForm.format,
      });
      setShowScheduleDialog(false);
      setSelectedTemplate(null);
      setScheduleForm({
        name: '',
        frequency: 'weekly',
        time: '09:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        recipients: '',
        emailSubject: '',
        format: 'pdf',
      });
      fetchScheduledReports();
      fetchStats();
    } catch (err: any) {
      alert('Failed to create schedule: ' + err.message);
    }
  };

  const handleToggleSchedule = async (schedule: ScheduledReport) => {
    try {
      await reportsApi.updateScheduledReport(TENANT_ID, schedule.id, {
        isActive: !schedule.isActive,
      });
      fetchScheduledReports();
    } catch (err: any) {
      alert('Failed to update schedule: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;

    try {
      await reportsApi.deleteScheduledReport(TENANT_ID, id);
      fetchScheduledReports();
      fetchStats();
    } catch (err: any) {
      alert('Failed to delete schedule: ' + err.message);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report job?')) return;

    try {
      await reportsApi.deleteJob(TENANT_ID, id);
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert('Failed to delete job: ' + err.message);
    }
  };

  const handleSeedTemplates = async () => {
    try {
      const result = await reportsApi.seedTemplates();
      alert(`Created ${result.count} system templates`);
      fetchTemplates();
      fetchStats();
    } catch (err: any) {
      alert('Failed to seed templates: ' + err.message);
    }
  };

  const handleQuickReport = async (type: 'students' | 'fees' | 'attendance' | 'exam-results') => {
    try {
      let job: ReportJob;
      switch (type) {
        case 'students':
          job = await reportsApi.quickStudentReport(TENANT_ID, { format: 'pdf' });
          break;
        case 'fees':
          job = await reportsApi.quickFeeReport(TENANT_ID, { format: 'pdf' });
          break;
        case 'attendance':
          job = await reportsApi.quickAttendanceReport(TENANT_ID, { format: 'pdf' });
          break;
        case 'exam-results':
          job = await reportsApi.quickExamResultsReport(TENANT_ID, { format: 'pdf' });
          break;
      }
      setActiveTab('history');
      fetchJobs();
      fetchStats();
    } catch (err: any) {
      alert('Failed to generate quick report: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and manage reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleSeedTemplates}>
            <Plus className="h-4 w-4 mr-2" />
            Seed Templates
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{stats?.totalTemplates || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.systemTemplates || 0} system, {stats?.customTemplates || 0} custom
                </p>
              </div>
              <Layout className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold">{stats?.totalJobs || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.completedJobs || 0} completed
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Jobs</p>
                <p className="text-2xl font-bold">{stats?.pendingJobs || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.failedJobs || 0} failed
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Reports</p>
                <p className="text-2xl font-bold">{stats?.totalScheduledReports || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeScheduledReports || 0} active
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Reports</CardTitle>
          <CardDescription>Generate common reports instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => handleQuickReport('students')}>
              <FileText className="h-6 w-6 mb-2" />
              Student List
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => handleQuickReport('fees')}>
              <FileSpreadsheet className="h-6 w-6 mb-2" />
              Fee Collection
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => handleQuickReport('attendance')}>
              <Calendar className="h-6 w-6 mb-2" />
              Attendance
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => handleQuickReport('exam-results')}>
              <BarChart3 className="h-6 w-6 mb-2" />
              Exam Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>System and custom report templates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search templates..."
                    value={templateFilter.search}
                    onChange={(e) => setTemplateFilter(prev => ({ ...prev, search: e.target.value }))}
                    className="max-w-xs"
                  />
                </div>
                <Select
                  value={templateFilter.category}
                  onValueChange={(value) => setTemplateFilter(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={templateFilter.dataSource}
                  onValueChange={(value) => setTemplateFilter(prev => ({ ...prev, dataSource: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Data Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sources</SelectItem>
                    {DATA_SOURCE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Columns</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No templates found. Click "Seed Templates" to create system templates.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                          {template.isSystem && (
                            <Badge variant="secondary" className="mt-1 text-xs">System</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getCategoryBadge(template.category)}</TableCell>
                        <TableCell>{template.dataSource}</TableCell>
                        <TableCell>{template.reportType}</TableCell>
                        <TableCell>{template.columns?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowGenerateDialog(true);
                              }}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Generate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setScheduleForm(prev => ({
                                  ...prev,
                                  name: `Scheduled ${template.name}`,
                                }));
                                setShowScheduleDialog(true);
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {templates.length} templates
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTemplatePage(prev => Math.max(0, prev - 1))}
                    disabled={templatePage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTemplatePage(prev => prev + 1)}
                    disabled={templates.length < PAGE_SIZE}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <Select
                  value={jobFilter.status}
                  onValueChange={(value) => setJobFilter(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={jobFilter.format}
                  onValueChange={(value) => setJobFilter(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Formats</SelectItem>
                    {FORMAT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No reports generated yet. Generate a report from a template.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium">{job.name}</div>
                          <div className="text-xs text-muted-foreground">{job.dataSource}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.format.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>{job.rowCount || '-'}</TableCell>
                        <TableCell>{formatFileSize(job.fileSize)}</TableCell>
                        <TableCell>{formatDate(job.generatedAt || job.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {job.status === 'completed' && job.fileUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={job.fileUrl} download={job.fileName}>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {jobs.length} jobs
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJobPage(prev => Math.max(0, prev - 1))}
                    disabled={jobPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJobPage(prev => prev + 1)}
                    disabled={jobs.length < PAGE_SIZE}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report generation schedules</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <Select
                  value={scheduledFilter.frequency}
                  onValueChange={(value) => setScheduledFilter(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Frequencies</SelectItem>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={scheduledFilter.isActive}
                  onValueChange={(value) => setScheduledFilter(prev => ({ ...prev, isActive: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No scheduled reports yet. Schedule a report from a template.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduledReports.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.recipients?.length || 0} recipients
                          </div>
                        </TableCell>
                        <TableCell>{schedule.template?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.frequency}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(schedule.nextRunAt)}</TableCell>
                        <TableCell>{formatDate(schedule.lastRunAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={schedule.isActive}
                              onCheckedChange={() => handleToggleSchedule(schedule)}
                            />
                            <span className="text-sm">
                              {schedule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {scheduledReports.length} scheduled reports
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setScheduledPage(prev => Math.max(0, prev - 1))}
                    disabled={scheduledPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setScheduledPage(prev => prev + 1)}
                    disabled={scheduledReports.length < PAGE_SIZE}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Generate a report from the "{selectedTemplate?.name}" template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={generateFormat} onValueChange={(value: ReportFormat) => setGenerateFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate && (
              <div className="space-y-2">
                <Label>Template Details</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Category: {selectedTemplate.category}</p>
                  <p>Data Source: {selectedTemplate.dataSource}</p>
                  <p>Columns: {selectedTemplate.columns?.length || 0}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={generatingReport}>
              {generatingReport && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Schedule automatic generation of "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter a name for this schedule"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={scheduleForm.frequency}
                  onValueChange={(value: Frequency) => setScheduleForm(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            {scheduleForm.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={scheduleForm.dayOfWeek.toString()}
                  onValueChange={(value) => setScheduleForm(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {['monthly', 'quarterly', 'yearly'].includes(scheduleForm.frequency) && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={scheduleForm.dayOfMonth}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={scheduleForm.format}
                onValueChange={(value: ReportFormat) => setScheduleForm(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Textarea
                value={scheduleForm.recipients}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder="email1@example.com, email2@example.com"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Subject (optional)</Label>
              <Input
                value={scheduleForm.emailSubject}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, emailSubject: e.target.value }))}
                placeholder="Your scheduled report is ready"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
