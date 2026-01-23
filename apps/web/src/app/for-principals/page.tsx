import { PersonaPageTemplate } from "@/components/marketing";
import {
  GraduationCap,
  BarChart3,
  Brain,
  FileText,
  Users,
  TrendingUp,
  Target,
  Shield,
  Award,
} from "lucide-react";

export const metadata = {
  title: "EduNexus for Principals | AI-Powered Institution Leadership",
  description:
    "See your entire institution's health in 30 seconds. AI predicts dropouts 6 weeks early. Auto-generated NAAC reports save 100+ hours.",
};

export default function ForPrincipalsPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "Principal",
        subtitle: "Strategic Institutional Leadership",
        description: "Lead with data, not gut feelings",
        icon: GraduationCap,
        color: "text-blue-500",
        gradient: "from-blue-600 to-indigo-600",
        email: "principal@nexus-ec.edu",
      }}
      heroHeadline="See Your Institution's Health"
      heroHighlight="in 30 Seconds"
      heroDescription="The AI-powered dashboard that transforms how you lead. Predict problems before they happen, track every KPI, and generate reports automatically."
      metrics={[
        { value: "40%", label: "Dropout Reduction" },
        { value: "100+", label: "Hours Saved on Reports" },
        { value: "6 Weeks", label: "Early Warning" },
        { value: "3000+", label: "Students per Dashboard" },
      ]}
      painPoints={[
        "Discovering at-risk students too late to help them",
        "Spending weeks preparing NAAC/NBA documentation",
        "No visibility into department-level performance",
        "Manual compilation of institutional reports",
        "Chasing faculty for data and updates",
        "Unable to benchmark against similar institutions",
      ]}
      features={[
        {
          title: "Institutional Pulse Dashboard",
          description:
            "See attendance, grades, fees, placements - everything in one view with department comparisons.",
          icon: BarChart3,
        },
        {
          title: "AI Dropout Prediction",
          description:
            "Identify at-risk students 6 weeks before they fail. Get actionable intervention recommendations.",
          icon: Brain,
        },
        {
          title: "Auto NAAC/NBA Reports",
          description:
            "One-click generation of accreditation documentation. Save 100+ hours per cycle.",
          icon: FileText,
        },
        {
          title: "Staff Performance Tracking",
          description:
            "Monitor faculty workload, feedback scores, and teaching effectiveness across departments.",
          icon: Users,
        },
        {
          title: "Trend Analysis",
          description:
            "Historical data visualization showing improvement areas and forecasting future metrics.",
          icon: TrendingUp,
        },
        {
          title: "Compliance Dashboard",
          description:
            "Track AICTE, UGC, and regulatory compliance with automated alerts for deadlines.",
          icon: Shield,
        },
      ]}
      ahaFeatures={[
        {
          title: "Institutional Pulse",
          description:
            "Open your dashboard and see your 3000-student institution's complete health in 30 seconds. Attendance, grades, fees, placements - all in one view.",
          metric: "30-second overview",
        },
        {
          title: "Predictive Dropout Analytics",
          description:
            "AI identifies students likely to drop out based on 15+ behavioral signals. Get names, risk scores, and recommended interventions.",
          metric: "78% accuracy",
        },
        {
          title: "Smart Report Generation",
          description:
            "NAAC/NBA reports auto-generated from your data. What used to take weeks now takes one click.",
          metric: "100+ hours saved",
        },
      ]}
    />
  );
}
