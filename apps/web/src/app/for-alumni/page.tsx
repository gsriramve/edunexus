import { PersonaPageTemplate } from "@/components/marketing";
import {
  Trophy,
  Users,
  Heart,
  Calendar,
  Search,
  MessageSquare,
  Target,
  Award,
  Building2,
} from "lucide-react";

export const metadata = {
  title: "EduNexus for Alumni | Give Back & Connect",
  description:
    "See the real impact of your mentorship. Connect with batchmates, mentor students, and stay engaged with your alma mater.",
};

export default function ForAlumniPage() {
  return (
    <PersonaPageTemplate
      persona={{
        title: "Alumni",
        subtitle: "Lifelong Connection & Giving Back",
        description: "Make a difference, stay connected",
        icon: Trophy,
        color: "text-teal-500",
        gradient: "from-teal-600 to-cyan-600",
        email: "alumni@nexus-ec.edu",
      }}
      heroHeadline="See the Impact"
      heroHighlight="You're Making"
      heroDescription="Mentor students who want to follow your path. See '5 placements from your mentorship' - real impact metrics. Stay connected with batchmates and your alma mater."
      metrics={[
        { value: "Impact", label: "Story Dashboard" },
        { value: "Smart", label: "Mentor Matching" },
        { value: "Alumni", label: "Network Access" },
        { value: "Event", label: "Registration" },
      ]}
      painPoints={[
        "No way to know if your mentorship helped students",
        "Lost touch with college friends and batchmates",
        "Want to give back but don't know how",
        "Miss important alumni events",
        "Can't find alumni in your industry",
        "Contributions feel disconnected from outcomes",
      ]}
      features={[
        {
          title: "Alumni Directory",
          description:
            "Find batchmates, industry peers, and juniors with advanced search filters.",
          icon: Search,
        },
        {
          title: "Mentorship Program",
          description:
            "AI matches you with students based on career paths and interests.",
          icon: Users,
        },
        {
          title: "Impact Dashboard",
          description:
            "See exactly how many students you've helped get placed or mentored.",
          icon: Target,
        },
        {
          title: "Event Hub",
          description:
            "Discover and register for reunions, networking events, and homecomings.",
          icon: Calendar,
        },
        {
          title: "Contribution Portal",
          description:
            "Donate to scholarships, infrastructure, or specific causes with tracking.",
          icon: Heart,
        },
        {
          title: "Professional Network",
          description:
            "Connect with alumni in your industry for job referrals and collaboration.",
          icon: Building2,
        },
      ]}
      ahaFeatures={[
        {
          title: "Impact Story Dashboard",
          description:
            "See '5 students got placed from your mentorship sessions'. Real, measurable impact - not just feel-good volunteer hours.",
          metric: "Measurable outcomes",
        },
        {
          title: "Smart Mentor Matching",
          description:
            "AI matches you with students who want to follow your career path. Your advice goes to people who'll actually use it.",
          metric: "Targeted mentorship",
        },
        {
          title: "Network Intelligence",
          description:
            "Find alumni in your target company, industry, or city instantly. The network you need when you need it.",
          metric: "Advanced filtering",
        },
      ]}
    />
  );
}
