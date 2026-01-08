"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  GraduationCap,
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { usePrincipalReportsOverview, ReportCategoryDto } from "@/hooks/use-principal-dashboard";
import { useTenantId } from "@/hooks/use-tenant";

// Icon mapping from string to component
const iconMap: Record<string, LucideIcon> = {
  GraduationCap: GraduationCap,
  Calendar: Calendar,
  Wallet: Wallet,
  Users: Users,
  FileText: FileText,
};

export default function PrincipalReportsPage() {
  const tenantId = useTenantId();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("2025-26");

  const { data: reportsData, isLoading, error } = usePrincipalReportsOverview(tenantId || '');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    const formatLower = format.toLowerCase();
    if (formatLower === 'pdf') {
      return <FileText className="w-4 h-4 text-red-600" />;
    }
    if (formatLower === 'excel' || formatLower === 'xlsx' || formatLower === 'csv') {
      return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const getCategoryIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || FileText;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-800">Failed to load reports data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = reportsData?.stats || {
    totalTemplates: 0,
    generatedThisMonth: 0,
    scheduledReports: 0,
    pendingJobs: 0,
  };

  const categories = reportsData?.categories || [];
  const recentReports = reportsData?.recentReports || [];
  const scheduledReports = reportsData?.scheduledReports || [];

  // Build category options for filter
  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    name: cat.name.replace(' Reports', ''),
  }));

  // Filter categories based on selection
  const filteredCategories = selectedCategory === 'all'
    ? categories
    : categories.filter((cat) => cat.id === selectedCategory);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
          <p className="text-muted-foreground">
            Generate and download institutional reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-26">2025-26</SelectItem>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generatedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Reports generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledReports}</div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-yellow-600">In queue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent Downloads</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Browse Reports */}
        <TabsContent value="browse" className="space-y-6">
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No report templates available. Report templates can be configured in the admin settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredCategories.map((category) => {
                const IconComponent = getCategoryIcon(category.icon);
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {category.reports.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No reports in this category.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Report Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Format</TableHead>
                              <TableHead>Last Generated</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.reports.map((report) => (
                              <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.name}</TableCell>
                                <TableCell className="text-muted-foreground">{report.description || '-'}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getFormatIcon(report.format)}
                                    <span className="text-sm">{report.format}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {report.lastGenerated || 'Never'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm">
                                      <TrendingUp className="w-4 h-4 mr-1" />
                                      Generate
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Recent Downloads */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Reports</CardTitle>
              <CardDescription>Reports generated in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No reports have been generated yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Generated By</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.generatedBy}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(report.date)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{report.size || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {report.outputUrl && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Printer className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automatically generated reports</CardDescription>
              </div>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Report
              </Button>
            </CardHeader>
            <CardContent>
              {scheduledReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No scheduled reports configured yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.frequency}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.nextRun !== 'Not scheduled' ? formatDate(report.nextRun) : report.nextRun}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{report.recipients}</TableCell>
                        <TableCell>
                          {report.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className={report.isActive ? "text-red-600" : "text-green-600"}>
                              {report.isActive ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Quick Academic Report</h4>
                    <p className="text-sm text-muted-foreground">Generate now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Quick Financial Report</h4>
                    <p className="text-sm text-muted-foreground">Generate now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Quick Staff Report</h4>
                    <p className="text-sm text-muted-foreground">Generate now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
