"use client";

import { PersonaPageTemplate } from "@/components/marketing";
import {
  UserCheck,
  ScanFace,
  AlertTriangle,
  FileText,
  MessageSquare,
  BookOpen,
  BarChart3,
  Upload,
  Users,
} from "lucide-react";


export default function ForTeachersPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "Teacher",
        subtitle: "Classroom Management",
        description: "Teach more, manage less",
        icon: UserCheck,
        color: "text-pink-500",
        gradient: "from-pink-600 to-rose-600",
        email: "teacher@nexus-ec.edu",
      }}
      heroHeadline="Know Which Students"
      heroHighlight="Need You Today"
      heroDescription="Face recognition attendance in 30 seconds. AI tells you exactly which 5 of your 120 students need attention today. Digital grading saves hours."
      metrics={[
        { value: "30 sec", label: "Attendance Time" },
        { value: "2+ hrs", label: "Saved Daily" },
        { value: "At-Risk", label: "Student Alerts" },
        { value: "Direct", label: "Parent Connect" },
      ]}
      painPoints={[
        "Manual attendance takes 10+ minutes per class",
        "No idea which students are silently struggling",
        "Grading assignments takes entire weekends",
        "Can't easily communicate with parents",
        "Course materials scattered across platforms",
        "Proxy attendance is a constant problem",
      ]}
      features={[
        {
          title: "Face Recognition Attendance",
          description:
            "60+ students marked in 30 seconds with anti-spoofing technology. No proxies.",
          icon: ScanFace,
        },
        {
          title: "At-Risk Student Alerts",
          description:
            "AI identifies students who need attention based on attendance and grade patterns.",
          icon: AlertTriangle,
        },
        {
          title: "Digital Assignment & Grading",
          description:
            "Create, distribute, and grade assignments online. Automated plagiarism checks.",
          icon: FileText,
        },
        {
          title: "Parent Communication",
          description:
            "Direct messaging to parents with attendance and performance updates.",
          icon: MessageSquare,
        },
        {
          title: "Learning Material Hub",
          description:
            "Upload and organize course materials. Students access everything in one place.",
          icon: BookOpen,
        },
        {
          title: "Performance Analytics",
          description:
            "Track class performance trends, identify weak topics, and plan interventions.",
          icon: BarChart3,
        },
      ]}
      ahaFeatures={[
        {
          title: "Daily Focus List",
          description:
            "Every morning, see exactly which 5 students from your 120 need attention TODAY. AI triages based on attendance drops, grade trends, and engagement signals.",
          metric: "2+ hours saved daily",
        },
        {
          title: "Face Recognition with Anti-Spoofing",
          description:
            "30-second attendance for 60+ students. Detects photo spoofing attempts. No more proxy attendance.",
          metric: "99.2% accuracy",
        },
        {
          title: "Intervention Recommendations",
          description:
            "For each at-risk student, get specific recommendations: call parent, extra tutoring, counselor referral, etc.",
          metric: "Actionable insights",
        },
      ]}
    />
  );
}
