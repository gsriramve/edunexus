'use client';

import { useState, useRef, useCallback } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  Download,
  FileSpreadsheet,
  History,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  Settings2,
} from 'lucide-react';
import {
  importExportApi,
  ImportJob,
  ExportJob,
  ImportTemplate,
  ImportEntityType,
  ImportValidationResult,
  ImportExportStats,
} from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantId } from '@/hooks/use-tenant';
import { useAuth } from '@/lib/auth';

const ENTITY_TYPES: { value: ImportEntityType; label: string; description: string }[] = [
  { value: 'students', label: 'Students', description: 'Student records with personal and academic info' },
  { value: 'staff', label: 'Staff', description: 'Staff and faculty records' },
  { value: 'departments', label: 'Departments', description: 'Academic departments' },
  { value: 'fees', label: 'Fees', description: 'Student fee records' },
  { value: 'attendance', label: 'Attendance', description: 'Attendance records' },
  { value: 'marks', label: 'Marks', description: 'Exam marks and results' },
  { value: 'library_books', label: 'Library Books', description: 'Library catalog' },
  { value: 'hostel_rooms', label: 'Hostel Rooms', description: 'Hostel room inventory' },
  { value: 'transport_routes', label: 'Transport Routes', description: 'Bus routes and stops' },
];

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
    validating: { variant: 'outline', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    processing: { variant: 'outline', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    completed: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
    failed: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
    cancelled: { variant: 'secondary', icon: <XCircle className="h-3 w-3" /> },
  };

  const config = statusConfig[status] || { variant: 'secondary' as const, icon: null };

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ImportExportPage() {
  const tenantId = useTenantId() || '';
  const { user } = useAuth();
  const currentUserId = user?.id || '';
  const [activeTab, setActiveTab] = useState('import');
  const [stats, setStats] = useState<ImportExportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Import state
  const [selectedEntityType, setSelectedEntityType] = useState<ImportEntityType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importJob, setImportJob] = useState<ImportJob | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [exportEntityType, setExportEntityType] = useState<ImportEntityType | ''>('');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [isExporting, setIsExporting] = useState(false);

  // History state
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);

  // Dialog state
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedJobErrors, setSelectedJobErrors] = useState<Array<{ row: number; field: string; value: string; error: string }>>([]);

  // Load stats on mount
  const loadStats = useCallback(async () => {
    if (!tenantId) return;
    try {
      const data = await importExportApi.getStats(tenantId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [tenantId]);

  // Load import jobs
  const loadImportJobs = useCallback(async () => {
    if (!tenantId) return;
    try {
      const response = await importExportApi.listImportJobs(tenantId, { limit: 20 });
      setImportJobs(response.data);
    } catch (error) {
      console.error('Failed to load import jobs:', error);
    }
  }, [tenantId]);

  // Load export jobs
  const loadExportJobs = useCallback(async () => {
    if (!tenantId) return;
    try {
      const response = await importExportApi.listExportJobs(tenantId, { limit: 20 });
      setExportJobs(response.data);
    } catch (error) {
      console.error('Failed to load export jobs:', error);
    }
  }, [tenantId]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    if (!tenantId) return;
    try {
      const response = await importExportApi.listTemplates(tenantId, { limit: 50 });
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, [tenantId]);

  // Initial load
  useState(() => {
    loadStats();
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setImportJob(null);
    }
  };

  // Download sample template
  const handleDownloadTemplate = async (entityType: ImportEntityType) => {
    if (!tenantId) return;
    try {
      const blob = await importExportApi.downloadSampleTemplate(tenantId, entityType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  // Upload and validate
  const handleUploadAndValidate = async () => {
    if (!selectedFile || !selectedEntityType || !tenantId || !currentUserId) return;

    setIsImporting(true);
    try {
      const result = await importExportApi.uploadAndValidate(
        tenantId,
        selectedFile,
        selectedEntityType,
        currentUserId
      );
      setImportJob(result.job);
      setValidationResult(result.validation);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Process import
  const handleProcessImport = async () => {
    if (!selectedFile || !importJob || !tenantId) return;

    setIsImporting(true);
    try {
      await importExportApi.processImportJob(tenantId, importJob.id, selectedFile);
      const updatedJob = await importExportApi.getImportJob(tenantId, importJob.id);
      setImportJob(updatedJob);
      loadStats();
      loadImportJobs();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Quick import
  const handleQuickImport = async () => {
    if (!selectedFile || !selectedEntityType || !tenantId || !currentUserId) return;

    setIsImporting(true);
    try {
      const result = await importExportApi.quickImport(
        tenantId,
        selectedFile,
        selectedEntityType,
        currentUserId,
        updateExisting
      );
      setImportJob(result.job);
      loadStats();
      loadImportJobs();
    } catch (error) {
      console.error('Quick import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Export data
  const handleExport = async () => {
    if (!exportEntityType || !tenantId || !currentUserId) return;

    setIsExporting(true);
    try {
      const blob = await importExportApi.quickExport(tenantId, {
        entityType: exportEntityType,
        format: exportFormat,
        createdById: currentUserId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportEntityType}_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      loadStats();
      loadExportJobs();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset import form
  const resetImportForm = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportJob(null);
    setSelectedEntityType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // View job errors
  const handleViewErrors = (errors: Array<{ row: number; field: string; value: string; error: string }>) => {
    setSelectedJobErrors(errors);
    setShowErrorDialog(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import / Export</h1>
          <p className="text-muted-foreground">
            Bulk import and export data using Excel files
          </p>
        </div>
        <Button variant="outline" onClick={loadStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalImports}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentImports} in last 7 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExports}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentExports} in last 7 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                Successfully processed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingJobs + stats.processingJobs} in progress
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import-history" className="flex items-center gap-2" onClick={loadImportJobs}>
            <History className="h-4 w-4" />
            Import History
          </TabsTrigger>
          <TabsTrigger value="export-history" className="flex items-center gap-2" onClick={loadExportJobs}>
            <FileText className="h-4 w-4" />
            Export History
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2" onClick={loadTemplates}>
            <Settings2 className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Data</CardTitle>
                <CardDescription>
                  Upload an Excel file to import data into the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={selectedEntityType}
                    onValueChange={(value) => setSelectedEntityType(value as ImportEntityType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type to import" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEntityType && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate(selectedEntityType)}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Download Sample Template
                  </Button>
                )}

                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      disabled={!selectedEntityType}
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="updateExisting"
                    checked={updateExisting}
                    onCheckedChange={(checked) => setUpdateExisting(!!checked)}
                  />
                  <Label htmlFor="updateExisting" className="text-sm font-normal">
                    Update existing records if found
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadAndValidate}
                    disabled={!selectedFile || !selectedEntityType || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Validate First
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleQuickImport}
                    disabled={!selectedFile || !selectedEntityType || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Quick Import
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
                <CardDescription>
                  Review data before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!validationResult && !importJob && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a file to see validation results</p>
                  </div>
                )}

                {validationResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {validationResult.valid ? (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Validation Passed</AlertTitle>
                          <AlertDescription>
                            All {validationResult.validRows} rows are valid and ready to import.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Validation Failed</AlertTitle>
                          <AlertDescription>
                            {validationResult.invalidRows} of {validationResult.totalRows} rows have errors.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{validationResult.totalRows}</div>
                        <div className="text-xs text-muted-foreground">Total Rows</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
                        <div className="text-xs text-muted-foreground">Valid</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{validationResult.invalidRows}</div>
                        <div className="text-xs text-muted-foreground">Invalid</div>
                      </div>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <Label>Errors (first 10)</Label>
                        <div className="max-h-48 overflow-y-auto border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Error</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validationResult.errors.slice(0, 10).map((error, index) => (
                                <TableRow key={index}>
                                  <TableCell>{error.row}</TableCell>
                                  <TableCell>{error.field}</TableCell>
                                  <TableCell className="text-destructive">{error.error}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {validationResult.valid && importJob && importJob.status === 'pending' && (
                      <Button onClick={handleProcessImport} disabled={isImporting} className="w-full">
                        {isImporting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Start Import
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {importJob && importJob.status === 'completed' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Import Completed</AlertTitle>
                    <AlertDescription>
                      Successfully imported {importJob.successCount} records.
                      {importJob.errorCount > 0 && ` ${importJob.errorCount} records failed.`}
                    </AlertDescription>
                  </Alert>
                )}

                {(validationResult || importJob) && (
                  <Button variant="outline" onClick={resetImportForm} className="w-full mt-4">
                    Start New Import
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download data from the system as Excel or CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={exportEntityType}
                    onValueChange={(value) => setExportEntityType(value as ImportEntityType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type to export" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>File Format</Label>
                  <Select
                    value={exportFormat}
                    onValueChange={(value) => setExportFormat(value as 'xlsx' | 'csv')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={!exportEntityType || isExporting}
                className="w-full md:w-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sample Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Download Sample Templates</CardTitle>
              <CardDescription>
                Get template files with correct column headers for importing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {ENTITY_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDownloadTemplate(type.value)}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {type.label} Template
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import History Tab */}
        <TabsContent value="import-history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Import History</CardTitle>
                  <CardDescription>View past import jobs and their status</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadImportJobs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {importJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No import jobs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.entityType}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          {job.totalRows > 0 && (
                            <div className="w-24">
                              <Progress value={(job.processedRows / job.totalRows) * 100} />
                              <span className="text-xs text-muted-foreground">
                                {job.processedRows}/{job.totalRows}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">{job.successCount} success</span>
                            {job.errorCount > 0 && (
                              <span className="text-destructive ml-2">{job.errorCount} failed</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(job.createdAt)}
                        </TableCell>
                        <TableCell>
                          {job.errorLog && job.errorLog.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewErrors(job.errorLog!)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Export History Tab */}
        <TabsContent value="export-history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Export History</CardTitle>
                  <CardDescription>View past export jobs and download files</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadExportJobs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {exportJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No export jobs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.entityType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{job.format.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>{job.totalRecords}</TableCell>
                        <TableCell>{job.downloadCount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(job.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Import Templates</CardTitle>
                  <CardDescription>
                    Saved column mappings for frequently used import formats
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadTemplates}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates saved yet</p>
                  <p className="text-sm mt-2">
                    Templates are created when you save column mappings during import
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.entityType}</Badge>
                        </TableCell>
                        <TableCell>
                          {template.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(template.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (!tenantId) return;
                              await importExportApi.deleteTemplate(tenantId, template.id);
                              loadTemplates();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Errors</DialogTitle>
            <DialogDescription>
              Detailed error information for failed rows
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedJobErrors.map((error, index) => (
                <TableRow key={index}>
                  <TableCell>{error.row}</TableCell>
                  <TableCell>{error.field}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{error.value}</TableCell>
                  <TableCell className="text-destructive">{error.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
