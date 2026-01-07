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
} from "lucide-react";

// Mock data - Replace with real API calls
const reportCategories = [
  {
    id: "academic",
    name: "Academic Reports",
    icon: GraduationCap,
    reports: [
      { id: "1", name: "Department-wise Performance", description: "Pass rates and grades by department", lastGenerated: "2026-01-05", format: "PDF" },
      { id: "2", name: "Subject Analysis", description: "Subject-wise student performance", lastGenerated: "2026-01-03", format: "Excel" },
      { id: "3", name: "Semester Results Summary", description: "Overall semester results overview", lastGenerated: "2025-12-20", format: "PDF" },
      { id: "4", name: "Topper List", description: "Top performers across departments", lastGenerated: "2025-12-20", format: "PDF" },
    ],
  },
  {
    id: "attendance",
    name: "Attendance Reports",
    icon: Calendar,
    reports: [
      { id: "5", name: "Monthly Attendance Summary", description: "Student attendance by month", lastGenerated: "2026-01-01", format: "Excel" },
      { id: "6", name: "Low Attendance Alert", description: "Students below 75% attendance", lastGenerated: "2026-01-07", format: "PDF" },
      { id: "7", name: "Department Attendance", description: "Attendance rates by department", lastGenerated: "2026-01-05", format: "PDF" },
    ],
  },
  {
    id: "financial",
    name: "Financial Reports",
    icon: Wallet,
    reports: [
      { id: "8", name: "Fee Collection Summary", description: "Total fees collected vs pending", lastGenerated: "2026-01-07", format: "Excel" },
      { id: "9", name: "Defaulters List", description: "Students with pending fees", lastGenerated: "2026-01-07", format: "PDF" },
      { id: "10", name: "Revenue Analysis", description: "Fee collection trends", lastGenerated: "2026-01-01", format: "PDF" },
    ],
  },
  {
    id: "staff",
    name: "Staff Reports",
    icon: Users,
    reports: [
      { id: "11", name: "Faculty Workload", description: "Teaching hours and assignments", lastGenerated: "2026-01-03", format: "Excel" },
      { id: "12", name: "Staff Attendance", description: "Staff attendance summary", lastGenerated: "2026-01-05", format: "PDF" },
    ],
  },
];

const recentReports = [
  { name: "Fee Collection Summary", generatedBy: "System", date: "2026-01-07 10:30 AM", status: "completed", size: "245 KB" },
  { name: "Low Attendance Alert", generatedBy: "System", date: "2026-01-07 09:00 AM", status: "completed", size: "128 KB" },
  { name: "Department-wise Performance", generatedBy: "Dr. Principal", date: "2026-01-05 04:15 PM", status: "completed", size: "1.2 MB" },
  { name: "Monthly Attendance Summary", generatedBy: "System", date: "2026-01-01 12:00 AM", status: "completed", size: "856 KB" },
  { name: "Semester Results Summary", generatedBy: "Dr. Principal", date: "2025-12-20 03:45 PM", status: "completed", size: "2.4 MB" },
];

const scheduledReports = [
  { name: "Daily Attendance Report", frequency: "Daily", nextRun: "2026-01-09 06:00 AM", recipients: "HODs, Admin" },
  { name: "Weekly Fee Collection", frequency: "Weekly", nextRun: "2026-01-13 09:00 AM", recipients: "Principal, Finance" },
  { name: "Monthly Performance Summary", frequency: "Monthly", nextRun: "2026-02-01 10:00 AM", recipients: "Principal, HODs" },
];

const quickStats = {
  totalReports: 47,
  generatedThisMonth: 12,
  scheduledReports: 5,
  pendingGeneration: 2,
};

export default function PrincipalReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("2025-26");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "PDF":
        return <FileText className="w-4 h-4 text-red-600" />;
      case "Excel":
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

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
            <div className="text-2xl font-bold">{quickStats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.generatedThisMonth}</div>
            <p className="text-xs text-green-600">+3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.scheduledReports}</div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.pendingGeneration}</div>
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
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {reportCategories
              .filter((cat) => selectedCategory === "all" || cat.id === selectedCategory)
              .map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="w-5 h-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                            <TableCell className="text-muted-foreground">{report.description}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getFormatIcon(report.format)}
                                <span className="text-sm">{report.format}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{report.lastGenerated}</TableCell>
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
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Recent Downloads */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Reports</CardTitle>
              <CardDescription>Reports generated in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {recentReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.generatedBy}</TableCell>
                      <TableCell className="text-muted-foreground">{report.date}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{report.size}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{report.nextRun}</TableCell>
                      <TableCell className="text-muted-foreground">{report.recipients}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Disable</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
