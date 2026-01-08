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
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Code,
  Database,
  Cloud,
  Brain,
  Users,
  Download,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { useHodSkillGaps } from "@/hooks/use-hod-skill-gaps";

const categoryIcons: Record<string, React.ReactNode> = {
  Programming: <Code className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Cloud: <Cloud className="h-5 w-5" />,
  "AI/ML": <Brain className="h-5 w-5" />,
  "Soft Skills": <Users className="h-5 w-5" />,
};

export default function SkillGapsPage() {
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: skillGapsData, isLoading } = useHodSkillGaps({
    batch: selectedBatch !== 'all' ? selectedBatch : undefined,
  });

  // Default data structure when API returns no data
  const data = skillGapsData || {
    topGaps: [],
    byCategory: [],
    industryDemand: [],
    placementReadiness: {
      ready: 0,
      almostReady: 0,
      needsWork: 0,
      atRisk: 0,
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
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
          <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analysis</h1>
          <p className="text-muted-foreground">
            Identify and address skill gaps in your department
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="2023">Batch 2023</SelectItem>
              <SelectItem value="2024">Batch 2024</SelectItem>
              <SelectItem value="2025">Batch 2025</SelectItem>
              <SelectItem value="2026">Batch 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Placement Readiness Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Placement Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {data.placementReadiness.ready}
              </span>
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">CRI &gt; 80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Almost Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {data.placementReadiness.almostReady}
              </span>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">CRI 60-80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                {data.placementReadiness.needsWork}
              </span>
              <Target className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">CRI 40-60</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">
                {data.placementReadiness.atRisk}
              </span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">CRI &lt; 40</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <Target className="h-4 w-4 mr-2" />
            Top Gaps
          </TabsTrigger>
          <TabsTrigger value="demand">
            <Briefcase className="h-4 w-4 mr-2" />
            Industry Demand
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Category Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Category Overview</CardTitle>
              <CardDescription>
                Average proficiency by skill category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {data.byCategory.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 border rounded-lg text-center"
                  >
                    <div className="flex justify-center mb-2 text-muted-foreground">
                      {categoryIcons[cat.category] || <Code className="h-5 w-5" />}
                    </div>
                    <p className="font-medium">{cat.category}</p>
                    <p className="text-2xl font-bold mt-1">{cat.avgScore}%</p>
                    <Progress value={cat.avgScore} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {cat.studentCount} students
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Analysis Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Critical Skill Gaps</CardTitle>
                <CardDescription>
                  Skills with the largest proficiency gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topGaps.slice(0, 5).map((gap) => (
                    <div key={gap.skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{gap.skill}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {gap.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-red-600 font-medium">
                          -{gap.gap}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Progress value={100 - gap.gap} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-20">
                          {gap.students} students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>
                  Suggested interventions to address skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Cloud Computing Workshop",
                      target: "45% gap in AWS/Cloud skills",
                      priority: "high",
                      students: 80,
                    },
                    {
                      action: "System Design Bootcamp",
                      target: "42% gap in design skills",
                      priority: "high",
                      students: 95,
                    },
                    {
                      action: "ML/AI Hands-on Lab",
                      target: "38% gap in ML skills",
                      priority: "medium",
                      students: 110,
                    },
                    {
                      action: "Communication Skills Training",
                      target: "28% gap in soft skills",
                      priority: "medium",
                      students: 150,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          item.priority === "high" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.target}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Affects {item.students} students
                        </p>
                      </div>
                      <Badge
                        variant={item.priority === "high" ? "destructive" : "secondary"}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Gaps Tab */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Skill Gap Analysis</CardTitle>
              <CardDescription>
                Complete breakdown of skill deficiencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Gap %</TableHead>
                    <TableHead className="text-center">Students Affected</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topGaps.map((gap) => (
                    <TableRow key={gap.skill}>
                      <TableCell className="font-medium">{gap.skill}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{gap.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium">
                          -{gap.gap}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{gap.students}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={gap.gap > 40 ? "destructive" : gap.gap > 30 ? "default" : "secondary"}
                        >
                          {gap.gap > 40 ? "Critical" : gap.gap > 30 ? "High" : "Medium"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry Demand Tab */}
        <TabsContent value="demand">
          <Card>
            <CardHeader>
              <CardTitle>Industry Demand vs Student Supply</CardTitle>
              <CardDescription>
                Comparison of market demand with student skill levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.industryDemand.map((item) => (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.skill}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600">
                          Demand: {item.demand}%
                        </span>
                        <span className="text-green-600">
                          Supply: {item.supply}%
                        </span>
                        <span
                          className={
                            item.demand - item.supply > 20
                              ? "text-red-600 font-medium"
                              : "text-yellow-600"
                          }
                        >
                          Gap: {item.demand - item.supply}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-blue-200 rounded-full"
                        style={{ width: `${item.demand}%` }}
                      />
                      <div
                        className="absolute h-full bg-green-500 rounded-full"
                        style={{ width: `${item.supply}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 rounded" />
                  <span className="text-sm">Industry Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm">Student Supply</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
