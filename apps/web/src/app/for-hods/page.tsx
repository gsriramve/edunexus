"use client";

import { PersonaPageTemplate } from "@/components/marketing";
import {
  BookOpen,
  Users,
  BarChart3,
  Brain,
  Calendar,
  Target,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";


export default function ForHODsPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "HOD",
        subtitle: "Department Management",
        description: "Optimize your department with data",
        icon: BookOpen,
        color: "text-violet-500",
        gradient: "from-violet-600 to-purple-600",
        email: "hod.cse@nexus-ec.edu",
      }}
      heroHeadline="Lead Your Department"
      heroHighlight="with AI Insights"
      heroDescription="Identify silent strugglers, optimize faculty workload, analyze curriculum gaps, and track student skill development - all from one dashboard."
      metrics={[
        { value: "Silent", label: "Strugglers Detected" },
        { value: "Workload", label: "Optimization" },
        { value: "Curriculum", label: "Gap Analysis" },
        { value: "Real-time", label: "KPI Tracking" },
      ]}
      painPoints={[
        "Students with good attendance but failing grades go unnoticed",
        "Uneven faculty workload distribution",
        "No visibility into curriculum-industry alignment",
        "Manual feedback analysis takes too long",
        "Unable to identify skill gaps across batches",
        "Department reports require manual compilation",
      ]}
      features={[
        {
          title: "Department KPI Dashboard",
          description:
            "Track attendance, pass rates, placement rates, and faculty metrics in real-time.",
          icon: BarChart3,
        },
        {
          title: "Faculty Workload Manager",
          description:
            "Visualize and optimize teaching load distribution across your department.",
          icon: Users,
        },
        {
          title: "Curriculum Gap Analysis",
          description:
            "AI compares your curriculum against industry requirements and competitor institutions.",
          icon: Target,
        },
        {
          title: "Student Skill Tracking",
          description:
            "Monitor skill development across batches with personalized recommendations.",
          icon: Brain,
        },
        {
          title: "Timetable Optimization",
          description:
            "AI-assisted scheduling that balances faculty preferences and student needs.",
          icon: Calendar,
        },
        {
          title: "Feedback Intelligence",
          description:
            "NLP extracts actionable insights from student feedback automatically.",
          icon: MessageSquare,
        },
      ]}
      ahaFeatures={[
        {
          title: "Silent Strugglers Alert",
          description:
            "AI identifies students with 80%+ attendance but declining or failing grades. These are the ones who look fine but need help urgently.",
          metric: "Catches hidden failures",
        },
        {
          title: "Skill Gap Intelligence",
          description:
            "See exactly which skills your students lack compared to industry requirements. Get specific training recommendations.",
          metric: "Industry-aligned",
        },
        {
          title: "Feedback NLP Analysis",
          description:
            "Natural language processing extracts themes, sentiments, and action items from hundreds of feedback responses in seconds.",
          metric: "Automated insights",
        },
      ]}
    />
  );
}
