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
  GraduationCap,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { useStudentByUserId, useStudentCri, useCalculateCri } from "@/hooks/use-api";
import { useUser } from "@clerk/nextjs";
import { CRICard, CRIRadarChart, CRISkillGapChart, CRIActionPlan } from "@/components/career";
import {
  CriData,
  getSalaryBandLabel,
  getSalaryBandColor,
  getScoreColor,
  getProbabilityColor,
  formatAssessmentDate,
} from "@/hooks/use-career-readiness";

// Sample CRI data for demo purposes
const sampleCriData: CriData = {
  id: 'sample-cri',
  studentId: 'sample-student',
  criScore: 72.5,
  placementProbability: 78,
  salaryBand: 'mid',
  resumeScore: 75,
  interviewScore: 70,
  skillRoleFitScore: 72,
  industryExposureScore: 68,
  skillGaps: [
    { skill: 'System Design', currentLevel: 65, requiredLevel: 100, priority: 'high' },
    { skill: 'Certifications', currentLevel: 55, requiredLevel: 100, priority: 'medium' },
    { skill: 'Leadership', currentLevel: 65, requiredLevel: 100, priority: 'medium' },
  ],
  targetRoles: [
    { role: 'Software Engineer', fitScore: 82, requirements: ['DSA', 'System Design', 'OOP'] },
    { role: 'Full Stack Developer', fitScore: 78, requirements: ['React', 'Node.js', 'SQL'] },
    { role: 'Data Analyst', fitScore: 65, requirements: ['Python', 'SQL', 'Statistics'] },
  ],
  topMatchingCompanies: [
    { company: 'TCS', fitScore: 85, openings: 150, industry: 'IT Services', avgPackage: 650000 },
    { company: 'Infosys', fitScore: 82, openings: 200, industry: 'IT Services', avgPackage: 600000 },
    { company: 'Wipro', fitScore: 78, openings: 120, industry: 'IT Services', avgPackage: 550000 },
  ],
  actionPlan: [
    { action: 'Practice system design problems', deadline: '2025-03-01', impact: 'high', category: 'Technical' },
    { action: 'Get AWS certification', deadline: '2025-04-01', impact: 'medium', category: 'Experience' },
    { action: 'Join leadership activities', deadline: '2025-02-15', impact: 'medium', category: 'Soft Skills' },
  ],
  confidenceScore: 85,
  assessmentDate: new Date().toISOString(),
};

export default function CareerReadinessPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const tenantId = useTenantId();
  const { user } = useUser();

  const { data: student, isLoading: studentLoading } = useStudentByUserId(
    tenantId || "",
    user?.id || ""
  );

  const { data: criData, isLoading: criLoading, refetch: refetchCri } = useStudentCri(
    tenantId || "",
    student?.id || ""
  );

  const calculateCri = useCalculateCri(tenantId || "");

  const isLoading = studentLoading || criLoading;

  // Get the latest CRI data - use sample data if no real data available
  const realCri: CriData | null = criData && "latest" in criData ? criData.latest : (criData as CriData | null);
  const criHistory = criData && "history" in criData ? criData.history : [];

  // Use sample data if no real data is available (for demo purposes)
  const cri: CriData = realCri || sampleCriData;
  const isUsingDemoData = !realCri;

  const handleRecalculate = () => {
    if (student?.id) {
      calculateCri.mutate(student.id, {
        onSuccess: () => {
          refetchCri();
        },
      });
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

  // No longer returning early for missing data since we use sample data
  if (false) {
    // Keep this block for reference but it will never execute
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
              Your Career Readiness Index hasn&apos;t been calculated yet. <br />
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
          {isUsingDemoData && (
            <Badge variant="secondary" className="text-xs">
              Sample Data
            </Badge>
          )}
          <Badge variant="outline" className="text-sm">
            Last assessed: {formatAssessmentDate(cri.assessmentDate)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={calculateCri.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${calculateCri.isPending ? 'animate-spin' : ''}`} />
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
                  {getSalaryBandLabel(cri.salaryBand)}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
          <TabsTrigger value="roles">Roles & Companies</TabsTrigger>
          <TabsTrigger value="action">Action Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Radar Chart */}
            <CRIRadarChart data={cri} />

            {/* Component Score Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Component Scores</CardTitle>
                <CardDescription>Detailed breakdown of your CRI components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resume Score */}
                <ComponentScoreRow
                  icon={FileText}
                  label="Resume Score"
                  score={cri.resumeScore}
                  description="Resume quality, skills listed, experience"
                  color="blue"
                />

                {/* Interview Score */}
                <ComponentScoreRow
                  icon={Users}
                  label="Interview Score"
                  score={cri.interviewScore}
                  description="Mock interviews, communication skills"
                  color="green"
                />

                {/* Skill-Role Fit */}
                <ComponentScoreRow
                  icon={GraduationCap}
                  label="Skill-Role Fit"
                  score={cri.skillRoleFitScore}
                  description="Skills matching target roles"
                  color="purple"
                />

                {/* Industry Exposure */}
                <ComponentScoreRow
                  icon={Building2}
                  label="Industry Exposure"
                  score={cri.industryExposureScore}
                  description="Internships, projects, certifications"
                  color="orange"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <CRISkillGapChart skillGaps={cri.skillGaps} />
        </TabsContent>

        {/* Roles & Companies Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium">{role.role || role.title || role}</h4>
                          {role.requirements && role.requirements.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Requires: {role.requirements.slice(0, 3).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {role.fitScore !== undefined && (
                            <Badge variant="secondary" className={getScoreColor(role.fitScore)}>
                              {Math.round(role.fitScore)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete assessments to identify target roles.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Matching Companies */}
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
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{company.company || company.name || company}</h4>
                            {company.industry && (
                              <p className="text-xs text-muted-foreground">{company.industry}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {company.fitScore !== undefined && (
                            <Badge variant="outline" className={getScoreColor(company.fitScore)}>
                              {Math.round(company.fitScore)}%
                            </Badge>
                          )}
                          {company.openings !== undefined && company.openings > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              {company.openings} openings
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete assessments to identify matching companies.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="action" className="space-y-6">
          <CRIActionPlan actionPlan={cri.actionPlan} />
        </TabsContent>
      </Tabs>

      {/* CRI History */}
      {criHistory && criHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>Your CRI progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {criHistory.slice(0, 6).map((item: CriData, index: number) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 p-4 rounded-lg border min-w-[140px] ${
                    index === 0 ? "bg-primary/5 border-primary" : "bg-card"
                  }`}
                >
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.assessmentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className={`text-2xl font-bold ${getScoreColor(item.criScore)}`}>
                    {Math.round(item.criScore)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs ${getProbabilityColor(item.placementProbability)}`}>
                      {Math.round(item.placementProbability * 100)}% probability
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Component Score Row
interface ComponentScoreRowProps {
  icon: React.ElementType;
  label: string;
  score: number;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function ComponentScoreRow({ icon: Icon, label, score, description, color }: ComponentScoreRowProps) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {Math.round(score)}
        </span>
      </div>
      <Progress value={score} className="h-2" />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
