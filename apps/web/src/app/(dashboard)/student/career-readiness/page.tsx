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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  Briefcase,
  FileText,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId, useStudentCri, useCalculateCri } from "@/hooks/use-api";
import { useUser } from "@clerk/nextjs";

// Salary band display mapping
const salaryBandLabels: Record<string, string> = {
  LPA_0_3: "< 3 LPA",
  LPA_3_5: "3-5 LPA",
  LPA_5_8: "5-8 LPA",
  LPA_8_12: "8-12 LPA",
  LPA_12_PLUS: "12+ LPA",
};

const getSalaryBandColor = (band: string) => {
  switch (band) {
    case "LPA_12_PLUS":
      return "bg-green-100 text-green-800";
    case "LPA_8_12":
      return "bg-blue-100 text-blue-800";
    case "LPA_5_8":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

const getProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const getProbabilityColor = (probability: number) => {
  if (probability >= 0.8) return "text-green-600";
  if (probability >= 0.6) return "text-blue-600";
  if (probability >= 0.4) return "text-yellow-600";
  return "text-red-600";
};

export default function CareerReadinessPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const tenantId = useTenantId();
  const { user } = useUser();

  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || "",
    user?.id || ""
  );

  const { data: criData, isLoading: criLoading } = useStudentCri(
    tenantId || "",
    student?.id || ""
  );

  const calculateCri = useCalculateCri(tenantId || "");

  const isLoading = studentLoading || criLoading;

  // Get the latest CRI data
  const cri = criData && "latest" in criData ? criData.latest : criData;

  const handleRecalculate = () => {
    if (student?.id) {
      calculateCri.mutate(student.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!cri) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Readiness Index</h1>
          <p className="text-muted-foreground">
            Assess your placement readiness and career preparation
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No CRI Data Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Your Career Readiness Index hasn't been calculated yet. <br />
              Complete more activities and assessments to generate your CRI.
            </p>
            <Button onClick={handleRecalculate} disabled={calculateCri.isPending}>
              {calculateCri.isPending ? "Calculating..." : "Calculate CRI Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Readiness Index</h1>
          <p className="text-muted-foreground">
            Assess your placement readiness and career preparation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Last assessed: {new Date(cri.assessmentDate).toLocaleDateString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={calculateCri.isPending}
          >
            {calculateCri.isPending ? "Recalculating..." : "Recalculate"}
          </Button>
        </div>
      </div>

      {/* Main CRI Score Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Career Readiness Index (CRI)</CardTitle>
              <CardDescription>
                Your overall career preparedness score based on resume, interview skills,
                role fit, and industry exposure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-4xl font-bold ${getScoreColor(cri.criScore)}`}>
                    {Math.round(cri.criScore)}
                  </span>
                  <span className="text-muted-foreground text-sm block">/100</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="flex-1 grid gap-4 sm:grid-cols-3">
              {/* Placement Probability */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Placement Probability
                </div>
                <span className={`text-2xl font-bold ${getProbabilityColor(cri.placementProbability)}`}>
                  {Math.round(cri.placementProbability * 100)}%
                </span>
              </div>

              {/* Salary Band */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Expected Package
                </div>
                <Badge className={getSalaryBandColor(cri.salaryBand)}>
                  {salaryBandLabels[cri.salaryBand] || cri.salaryBand}
                </Badge>
              </div>

              {/* Confidence Score */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  Confidence
                </div>
                <span className="text-2xl font-bold">
                  {Math.round(cri.confidenceScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Score Breakdown</TabsTrigger>
          <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
          <TabsTrigger value="roles">Target Roles</TabsTrigger>
          <TabsTrigger value="action">Action Plan</TabsTrigger>
        </TabsList>

        {/* Score Breakdown */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Resume Score */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-sm">Resume Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className={`text-2xl font-bold ${getScoreColor(cri.resumeScore)}`}>
                    {Math.round(cri.resumeScore)}
                  </span>
                  <Progress value={cri.resumeScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Format, content quality, keywords
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Interview Score */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-sm">Interview Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className={`text-2xl font-bold ${getScoreColor(cri.interviewScore)}`}>
                    {Math.round(cri.interviewScore)}
                  </span>
                  <Progress value={cri.interviewScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Mock interviews, communication
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skill-Role Fit */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-sm">Skill-Role Fit</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className={`text-2xl font-bold ${getScoreColor(cri.skillRoleFitScore)}`}>
                    {Math.round(cri.skillRoleFitScore)}
                  </span>
                  <Progress value={cri.skillRoleFitScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Skills matching target roles
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Industry Exposure */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-sm">Industry Exposure</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className={`text-2xl font-bold ${getScoreColor(cri.industryExposureScore)}`}>
                    {Math.round(cri.industryExposureScore)}
                  </span>
                  <Progress value={cri.industryExposureScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Internships, projects, certifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skill Gaps */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Skill Gaps to Address
              </CardTitle>
              <CardDescription>
                These are the skills you need to develop based on your target roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cri.skillGaps && cri.skillGaps.length > 0 ? (
                <div className="space-y-4">
                  {cri.skillGaps.map((gap: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{gap.skill || gap.name || gap}</h4>
                        {gap.description && (
                          <p className="text-sm text-muted-foreground">{gap.description}</p>
                        )}
                        {gap.importance && (
                          <Badge variant="outline" className="mt-1">
                            {gap.importance} priority
                          </Badge>
                        )}
                      </div>
                      {gap.currentLevel !== undefined && gap.requiredLevel !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Current vs Required</div>
                          <div className="font-medium">
                            {gap.currentLevel} / {gap.requiredLevel}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No significant skill gaps identified!</p>
                  <p className="text-sm">Keep building your skills to maintain your edge.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Target Roles */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Target Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Target Roles
                </CardTitle>
                <CardDescription>
                  Roles that match your profile and interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cri.targetRoles && cri.targetRoles.length > 0 ? (
                  <div className="space-y-3">
                    {cri.targetRoles.map((role: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-medium">{role.title || role.name || role}</h4>
                          {role.fitScore && (
                            <p className="text-sm text-muted-foreground">
                              {Math.round(role.fitScore * 100)}% match
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Complete more assessments to identify target roles.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Matching Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Matching Companies
                </CardTitle>
                <CardDescription>
                  Companies that align with your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cri.topMatchingCompanies && cri.topMatchingCompanies.length > 0 ? (
                  <div className="space-y-3">
                    {cri.topMatchingCompanies.map((company: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-medium">{company.name || company}</h4>
                          {company.industry && (
                            <p className="text-sm text-muted-foreground">
                              {company.industry}
                            </p>
                          )}
                        </div>
                        {company.matchScore && (
                          <Badge variant="secondary">
                            {Math.round(company.matchScore * 100)}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Complete more assessments to identify matching companies.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Action Plan */}
        <TabsContent value="action" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Personalized Action Plan
              </CardTitle>
              <CardDescription>
                Follow these steps to improve your career readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cri.actionPlan && cri.actionPlan.length > 0 ? (
                <div className="space-y-4">
                  {cri.actionPlan.map((action: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{action.title || action.action || action}</h4>
                        {action.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        )}
                        {action.deadline && (
                          <Badge variant="outline" className="mt-2">
                            Due: {new Date(action.deadline).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No specific action items at this time.</p>
                  <p className="text-sm">Your action plan will be generated based on your CRI analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
