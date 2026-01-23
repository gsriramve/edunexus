"use client";

import { PersonaPageTemplate } from "@/components/marketing";
import {
  User,
  Compass,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  BookOpen,
  Award,
  Calendar,
} from "lucide-react";


export default function ForStudentsPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "Student",
        subtitle: "Academic Journey & Career",
        description: "Your path to success, visualized",
        icon: User,
        color: "text-indigo-500",
        gradient: "from-indigo-600 to-violet-600",
        email: "student@nexus-ec.edu",
      }}
      heroHeadline="Know Exactly Where"
      heroHighlight="Your Path Leads"
      heroDescription="See career possibilities based on your profile. Predict your grades with 85% accuracy. Connect with alumni who've walked your path."
      metrics={[
        { value: "85%", label: "Score Prediction Accuracy" },
        { value: "Career", label: "Path Visualization" },
        { value: "Alumni", label: "Mentor Network" },
        { value: "80%", label: "Placement Prediction" },
      ]}
      painPoints={[
        "No idea what career options match your skills",
        "Surprise exam results - no way to predict",
        "Can't find alumni working in your dream company",
        "Goal tracking scattered across apps",
        "No visibility into skill gaps for placements",
        "Last-minute realization about missing skills",
      ]}
      features={[
        {
          title: "Career Path Visualizer",
          description:
            "See exactly what careers match your skills, with alumni success stories as proof.",
          icon: Compass,
        },
        {
          title: "Score Prediction",
          description:
            "Know your expected grades 6 weeks before exams. Time to improve if needed.",
          icon: TrendingUp,
        },
        {
          title: "Alumni Mentor Matching",
          description:
            "AI connects you with alumni in your target companies and career paths.",
          icon: Users,
        },
        {
          title: "Goal Tracking Dashboard",
          description:
            "Set career goals, track progress, get AI recommendations for next steps.",
          icon: Target,
        },
        {
          title: "Skill Gap Analysis",
          description:
            "See exactly what skills you need for placements and how to acquire them.",
          icon: BarChart3,
        },
        {
          title: "Academic Performance",
          description:
            "Track your grades, attendance, and progress across all subjects.",
          icon: BookOpen,
        },
      ]}
      ahaFeatures={[
        {
          title: "Career Path Visualizer",
          description:
            "See exactly what skills you need for your dream job. Find alumni who started where you are and ended up where you want to be. Real success stories, not hypotheticals.",
          metric: "78% placement match",
        },
        {
          title: "Score Prediction Engine",
          description:
            "Know your expected grades 6 weeks before exams based on your attendance, assignment scores, and learning patterns. Time to improve if needed.",
          metric: "85% accuracy",
        },
        {
          title: "Smart Alumni Matching",
          description:
            "AI matches you with alumni mentors based on your career goals, skills, and interests. Get advice from people who've been exactly where you are.",
          metric: "Personalized mentorship",
        },
      ]}
    />
  );
}
