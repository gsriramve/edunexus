"use client";

import { PersonaPageTemplate } from "@/components/marketing";
import {
  Users,
  Bell,
  BarChart3,
  MessageSquare,
  CreditCard,
  Calendar,
  AlertTriangle,
  Shield,
  Heart,
} from "lucide-react";


export default function ForParentsPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "Parent",
        subtitle: "Ward Monitoring & Engagement",
        description: "Stay connected to your child's success",
        icon: Users,
        color: "text-orange-500",
        gradient: "from-orange-600 to-red-600",
        email: "parent@nexus-ec.edu",
      }}
      heroHeadline="Know Before Problems"
      heroHighlight="Become Failures"
      heroDescription="Get warned 6 weeks before your child might fail, not after the results. Real-time attendance alerts, progress reports, and direct teacher messaging."
      metrics={[
        { value: "6 Weeks", label: "Early Warning" },
        { value: "Real-time", label: "Attendance Alerts" },
        { value: "Direct", label: "Teacher Access" },
        { value: "Online", label: "Fee Payment" },
      ]}
      painPoints={[
        "Finding out about problems only after exam results",
        "No idea if your child attended class today",
        "Can't easily reach teachers for updates",
        "Paper-based report cards take weeks",
        "Paying fees requires physical visits",
        "No visibility into daily academic progress",
      ]}
      features={[
        {
          title: "Real-time Attendance Alerts",
          description:
            "Get notified instantly if your child misses a class. No surprises.",
          icon: Bell,
        },
        {
          title: "Early Warning System",
          description:
            "AI alerts you 6 weeks before potential failures based on attendance and grade patterns.",
          icon: AlertTriangle,
        },
        {
          title: "Progress Dashboard",
          description:
            "See grades, attendance trends, and teacher feedback in one place.",
          icon: BarChart3,
        },
        {
          title: "Teacher Messaging",
          description:
            "Direct, secure communication with teachers. No need to visit campus.",
          icon: MessageSquare,
        },
        {
          title: "Online Fee Payment",
          description:
            "Pay fees, view receipts, and track payment history online.",
          icon: CreditCard,
        },
        {
          title: "Event Calendar",
          description:
            "Stay updated on exams, holidays, parent-teacher meetings, and events.",
          icon: Calendar,
        },
      ]}
      ahaFeatures={[
        {
          title: "Early Warning System",
          description:
            "AI detects patterns that predict failure - declining attendance, dropping assignment scores, disengagement signals. You're warned 6 weeks before failure, not after results.",
          metric: "78% pattern accuracy",
        },
        {
          title: "Smart Progress Insights",
          description:
            "Monthly AI-generated summaries of your child's progress. Highlights achievements, flags concerns, suggests conversations to have.",
          metric: "Automated monthly",
        },
        {
          title: "Instant Absence Alerts",
          description:
            "Push notification the moment attendance is marked. Know if your child reached class, not at the end of the day.",
          metric: "Real-time alerts",
        },
      ]}
    />
  );
}
