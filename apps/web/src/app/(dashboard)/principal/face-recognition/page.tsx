"use client";

import { useState } from "react";
import {
  Camera,
  Users,
  UserCheck,
  UserX,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Shield,
  Zap,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTenantId } from "@/hooks/use-tenant";
import { useDepartments } from "@/hooks/use-api";
import {
  useFaceEnrollmentStats,
  useFaceSessionStats,
  useFaceSessions,
  useFaceRecognitionConfig,
  useInitializeCollection,
  type FaceSessionStatus,
} from "@/hooks/use-face-recognition";

// Status colors
const sessionStatusColors: Record<FaceSessionStatus, string> = {
  pending: "bg-gray-500",
  processing: "bg-blue-500",
  review: "bg-orange-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function PrincipalFaceRecognition() {
  const tenantId = useTenantId() || "";
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [dateRange, setDateRange] = useState("7d");

  // Fetch data
  const { data: departments } = useDepartments(tenantId);
  const { data: enrollmentStats, isLoading: enrollmentLoading } = useFaceEnrollmentStats(tenantId);
  const { data: sessionStats, isLoading: sessionLoading } = useFaceSessionStats(tenantId);
  const { data: config, isLoading: configLoading } = useFaceRecognitionConfig(tenantId);
  const { data: recentSessions, isLoading: sessionsLoading } = useFaceSessions(tenantId, {
    departmentId: selectedDepartment || undefined,
    limit: 10,
  });

  // Mutations
  const initializeCollection = useInitializeCollection(tenantId);

  const sessions = recentSessions?.data || [];
  const isLoading = enrollmentLoading || sessionLoading || configLoading;

  // Calculate overall enrollment percentage
  const totalStudents = enrollmentStats?.byDepartment?.reduce((sum, d) => sum + d.total, 0) || 0;
  const totalEnrolled = enrollmentStats?.active || 0;
  const enrollmentPercentage = totalStudents > 0 ? (totalEnrolled / totalStudents) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Face Recognition</h1>
          <p className="text-muted-foreground">
            Monitor and manage face recognition attendance system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {config && !config.isConfigured && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>AWS Rekognition Not Configured</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Face recognition requires AWS Rekognition credentials. Please configure the
              AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.
            </span>
            <Button
              size="sm"
              onClick={() => initializeCollection.mutate()}
              disabled={initializeCollection.isPending}
            >
              {initializeCollection.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Initialize"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {config?.isConfigured && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>System Active</AlertTitle>
          <AlertDescription>
            Face recognition system is configured and operational. Collection ID: {config.collectionId}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students Enrolled</p>
                <p className="text-2xl font-bold">{enrollmentStats?.active || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(enrollmentPercentage)}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
                <p className="text-2xl font-bold">{sessionStats?.todaySessions || 0}</p>
                <p className="text-xs text-green-600">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Match Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(sessionStats?.averageMatchRate || 0)}%
                </p>
                <p className="text-xs text-muted-foreground">Last 100 sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Marked</p>
                <p className="text-2xl font-bold">
                  {sessionStats?.totalStudentsMarked?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">Via face recognition</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Enrollment Progress */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enrollment Progress by Department</CardTitle>
                <CardDescription>
                  Face recognition enrollment status across departments
                </CardDescription>
              </div>
              <Badge variant="outline">
                {Math.round(enrollmentPercentage)}% Overall
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {enrollmentLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : enrollmentStats?.byDepartment && enrollmentStats.byDepartment.length > 0 ? (
              <div className="space-y-4">
                {enrollmentStats.byDepartment.map((dept) => (
                  <div key={dept.departmentId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{dept.departmentName}</span>
                      <span className="text-muted-foreground">
                        {dept.enrolled} / {dept.total} students
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={dept.percentage} className="flex-1 h-2" />
                      <span
                        className={`text-sm font-medium w-12 text-right ${
                          dept.percentage >= 80
                            ? "text-green-600"
                            : dept.percentage >= 50
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.round(dept.percentage)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No enrollment data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {configLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : config ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Match Threshold</span>
                  </div>
                  <Badge>{config.matchThreshold}%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Quality Threshold</span>
                  </div>
                  <Badge>{config.enrollmentQualityThreshold}%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Max Faces/Photo</span>
                  </div>
                  <Badge variant="outline">{config.maxFacesPerPhoto}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Manual Review</span>
                  </div>
                  <Badge variant={config.requireManualReview ? "default" : "secondary"}>
                    {config.requireManualReview ? "Required" : "Optional"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>Configuration not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      {sessionStats?.byDepartment && sessionStats.byDepartment.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Department Performance
                </CardTitle>
                <CardDescription>
                  Face recognition usage and match rates by department
                </CardDescription>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sessionStats.byDepartment.map((dept) => (
                <div key={dept.departmentId} className="p-4 rounded-lg border">
                  <p className="font-medium mb-2">{dept.departmentName}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sessions</span>
                      <span className="font-medium">{dept.sessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Match Rate</span>
                      <span
                        className={`font-medium ${
                          dept.averageMatchRate >= 90
                            ? "text-green-600"
                            : dept.averageMatchRate >= 70
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.round(dept.averageMatchRate)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest face recognition attendance sessions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments?.data?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent sessions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Faces Detected</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Unmatched</TableHead>
                  <TableHead>Match Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const matchRate =
                    session.totalFacesDetected > 0
                      ? (session.matchedFaces / session.totalFacesDetected) * 100
                      : 0;
                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={sessionStatusColors[session.status]}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.totalFacesDetected}</TableCell>
                      <TableCell className="text-green-600">{session.matchedFaces}</TableCell>
                      <TableCell className="text-orange-600">{session.unmatchedFaces}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={matchRate} className="w-16 h-2" />
                          <span
                            className={`text-sm font-medium ${
                              matchRate >= 90
                                ? "text-green-600"
                                : matchRate >= 70
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {Math.round(matchRate)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <UserCheck className="h-6 w-6 mb-2" />
              <span>Manage Enrollments</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span>Configure System</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
