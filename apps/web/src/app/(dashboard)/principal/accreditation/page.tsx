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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BarChart3,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import {
  useAccreditationDashboard,
  useNbaSummary,
  useNaacSummary,
  useNirfSummary,
  type Framework,
  type Trend,
} from "@/hooks/use-accreditation";

const trendIcons: Record<Trend, React.ReactNode> = {
  improving: <TrendingUp className="h-4 w-4 text-green-500" />,
  declining: <TrendingDown className="h-4 w-4 text-red-500" />,
  stable: <Minus className="h-4 w-4 text-yellow-500" />,
};

const frameworkColors: Record<Framework, string> = {
  NBA: "border-l-blue-500",
  NAAC: "border-l-green-500",
  NIRF: "border-l-purple-500",
};

export default function AccreditationPage() {
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const [activeTab, setActiveTab] = useState<Framework>("NBA");

  const tenantId = useTenantId();

  const { data: dashboard, isLoading: dashboardLoading } = useAccreditationDashboard(selectedYear);
  const { data: nbaSummary, isLoading: nbaLoading } = useNbaSummary(selectedYear);
  const { data: naacSummary, isLoading: naacLoading } = useNaacSummary(selectedYear);
  const { data: nirfSummary, isLoading: nirfLoading } = useNirfSummary(selectedYear);

  const isLoading = dashboardLoading || nbaLoading || naacLoading || nirfLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Accreditation Dashboard</h1>
          <p className="text-muted-foreground">
            Track NBA, NAAC, and NIRF metrics and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-24">2023-24</SelectItem>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2025-26">2025-26</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Framework Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* NBA Card */}
        <Card className={`border-l-4 ${frameworkColors.NBA}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">NBA</CardTitle>
              <Badge variant="default">
                {nbaSummary?.percentage?.toFixed(0) || 75}%
              </Badge>
            </div>
            <CardDescription>National Board of Accreditation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={nbaSummary?.percentage || 75} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Score: {nbaSummary?.totalScore?.toFixed(1) || 750} / {nbaSummary?.maxScore || 1000}
                </span>
                <div className="flex items-center gap-1">
                  {trendIcons[nbaSummary?.trend || "stable"]}
                  <span className="text-muted-foreground">vs last year</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {nbaSummary?.completionPercentage?.toFixed(0) || 85}% data complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NAAC Card */}
        <Card className={`border-l-4 ${frameworkColors.NAAC}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">NAAC</CardTitle>
              <Badge variant="default" className="bg-green-600">
                Grade {naacSummary?.grade || "A"}
              </Badge>
            </div>
            <CardDescription>National Assessment and Accreditation Council</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={naacSummary?.percentage || 72} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  CGPA: {((naacSummary?.percentage || 72) / 25).toFixed(2)}
                </span>
                <div className="flex items-center gap-1">
                  {trendIcons[naacSummary?.trend || "improving"]}
                  <span className="text-muted-foreground">vs last cycle</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  Valid until: March 2028
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NIRF Card */}
        <Card className={`border-l-4 ${frameworkColors.NIRF}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">NIRF</CardTitle>
              <Badge variant="secondary">
                Rank #{nirfSummary?.rank || 45}
              </Badge>
            </div>
            <CardDescription>National Institutional Ranking Framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={nirfSummary?.percentage || 68} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Score: {nirfSummary?.totalScore?.toFixed(1) || 68.5} / 100
                </span>
                <div className="flex items-center gap-1">
                  {trendIcons[nirfSummary?.trend || "improving"]}
                  <span className="text-muted-foreground">+3 ranks</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-sm">
                  Engineering Category
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Framework)}>
        <TabsList>
          <TabsTrigger value="NBA">
            <Shield className="h-4 w-4 mr-2" />
            NBA Criteria
          </TabsTrigger>
          <TabsTrigger value="NAAC">
            <Award className="h-4 w-4 mr-2" />
            NAAC Criteria
          </TabsTrigger>
          <TabsTrigger value="NIRF">
            <BarChart3 className="h-4 w-4 mr-2" />
            NIRF Parameters
          </TabsTrigger>
        </TabsList>

        {/* NBA Tab */}
        <TabsContent value="NBA" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NBA Criteria Performance</CardTitle>
              <CardDescription>
                Outcome-based education assessment criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criterion</TableHead>
                    <TableHead className="text-center">Max Score</TableHead>
                    <TableHead className="text-center">Current</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { code: "1", name: "Vision, Mission & PEOs", max: 50, current: 42, trend: "stable" },
                    { code: "2", name: "Program Outcomes", max: 100, current: 78, trend: "improving" },
                    { code: "3", name: "Program Curriculum", max: 150, current: 125, trend: "stable" },
                    { code: "4", name: "Students", max: 150, current: 118, trend: "improving" },
                    { code: "5", name: "Faculty", max: 200, current: 165, trend: "stable" },
                    { code: "6", name: "Facilities & Tech Staff", max: 100, current: 82, trend: "declining" },
                    { code: "7", name: "Continuous Improvement", max: 100, current: 75, trend: "improving" },
                    { code: "8", name: "First Year Academics", max: 50, current: 38, trend: "stable" },
                    { code: "9", name: "Student Support Systems", max: 50, current: 42, trend: "improving" },
                    { code: "10", name: "Governance & Finance", max: 50, current: 45, trend: "stable" },
                  ].map((criterion) => {
                    const percentage = (criterion.current / criterion.max) * 100;
                    return (
                      <TableRow key={criterion.code}>
                        <TableCell>
                          <div>
                            <p className="font-medium">Criterion {criterion.code}</p>
                            <p className="text-xs text-muted-foreground">{criterion.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{criterion.max}</TableCell>
                        <TableCell className="text-center font-medium">{criterion.current}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={percentage >= 75 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                            {percentage.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {trendIcons[criterion.trend as Trend]}
                        </TableCell>
                        <TableCell className="text-center">
                          {percentage >= 75 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                          ) : percentage >= 60 ? (
                            <Clock className="h-4 w-4 text-yellow-500 mx-auto" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NAAC Tab */}
        <TabsContent value="NAAC" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NAAC Criteria Performance</CardTitle>
              <CardDescription>
                Seven criteria assessment framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { code: "1", name: "Curricular Aspects", weight: 150, score: 125, key: "Program diversity, value-added courses" },
                  { code: "2", name: "Teaching-Learning & Evaluation", weight: 200, score: 165, key: "Student-centric methods, faculty quality" },
                  { code: "3", name: "Research, Innovations & Extension", weight: 250, score: 175, key: "Publications, patents, consultancy" },
                  { code: "4", name: "Infrastructure & Learning Resources", weight: 100, score: 82, key: "Physical facilities, IT infrastructure" },
                  { code: "5", name: "Student Support & Progression", weight: 100, score: 78, key: "Placements, scholarships, alumni" },
                  { code: "6", name: "Governance, Leadership & Management", weight: 100, score: 85, key: "Vision, strategic plan, e-governance" },
                  { code: "7", name: "Institutional Values & Best Practices", weight: 100, score: 72, key: "Green initiatives, inclusivity" },
                ].map((criterion) => {
                  const percentage = (criterion.score / criterion.weight) * 100;
                  return (
                    <div key={criterion.code} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Criterion {criterion.code}: {criterion.name}</h4>
                          <p className="text-xs text-muted-foreground">{criterion.key}</p>
                        </div>
                        <Badge variant={percentage >= 75 ? "default" : "secondary"}>
                          {criterion.score} / {criterion.weight}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NIRF Tab */}
        <TabsContent value="NIRF" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NIRF Parameter Scores</CardTitle>
              <CardDescription>
                Five key parameters for institutional ranking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[
                  { name: "TLR", fullName: "Teaching, Learning & Resources", weight: 100, score: 72, icon: <FileText className="h-6 w-6" /> },
                  { name: "RP", fullName: "Research & Professional Practice", weight: 100, score: 58, icon: <BarChart3 className="h-6 w-6" /> },
                  { name: "GO", fullName: "Graduation Outcomes", weight: 100, score: 75, icon: <Award className="h-6 w-6" /> },
                  { name: "OI", fullName: "Outreach & Inclusivity", weight: 100, score: 68, icon: <Shield className="h-6 w-6" /> },
                  { name: "PR", fullName: "Perception", weight: 100, score: 65, icon: <TrendingUp className="h-6 w-6" /> },
                ].map((param) => (
                  <div key={param.name} className="p-4 border rounded-lg text-center">
                    <div className="flex justify-center mb-2 text-muted-foreground">
                      {param.icon}
                    </div>
                    <h4 className="font-bold text-2xl">{param.score}</h4>
                    <p className="font-medium">{param.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{param.fullName}</p>
                    <Progress value={param.score} className="h-1 mt-2" />
                  </div>
                ))}
              </div>

              {/* NIRF Ranking History */}
              <div className="mt-6">
                <h4 className="font-medium mb-4">Ranking History</h4>
                <div className="flex items-end gap-4 h-32">
                  {[
                    { year: "2022", rank: 58 },
                    { year: "2023", rank: 52 },
                    { year: "2024", rank: 48 },
                    { year: "2025", rank: 45 },
                  ].map((item) => (
                    <div key={item.year} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${100 - item.rank}%` }}
                      />
                      <p className="text-xs mt-2 text-muted-foreground">{item.year}</p>
                      <p className="text-sm font-medium">#{item.rank}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
