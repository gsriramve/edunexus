"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Crown,
  GraduationCap,
  BookOpen,
  Briefcase,
  UserCheck,
  FlaskConical,
  User,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface Persona {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Crown;
  color: string;
  bgColor: string;
  borderColor: string;
  benefits: string[];
  ahaFeature: string;
  ahaDescription: string;
  link: string;
}

const personas: Persona[] = [
  {
    id: "principal",
    title: "Principal",
    subtitle: "Strategic Leadership",
    icon: GraduationCap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    benefits: [
      "Institution-wide analytics dashboard",
      "AI dropout prediction 6 weeks early",
      "Auto-generated NAAC/NBA reports",
      "Staff performance tracking",
    ],
    ahaFeature: "Institutional Pulse",
    ahaDescription: "See your 3000-student institution's health in 30 seconds",
    link: "/for-principals",
  },
  {
    id: "hod",
    title: "HOD",
    subtitle: "Department Management",
    icon: BookOpen,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    benefits: [
      "Department KPI tracking",
      "Curriculum gap analysis",
      "Faculty workload optimization",
      "Student skill gap identification",
    ],
    ahaFeature: "Silent Strugglers Alert",
    ahaDescription: "Catches students with 80%+ attendance but failing grades",
    link: "/for-hods",
  },
  {
    id: "admin",
    title: "Admin Staff",
    subtitle: "Operations Hub",
    icon: Briefcase,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    benefits: [
      "35% faster fee collection",
      "One-click certificate generation",
      "Bulk student import/export",
      "AI-powered smart search",
    ],
    ahaFeature: "Fee Risk Predictor",
    ahaDescription: "Identifies likely defaulters for proactive intervention",
    link: "/for-administrators",
  },
  {
    id: "teacher",
    title: "Teacher",
    subtitle: "Classroom Excellence",
    icon: UserCheck,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    benefits: [
      "Face recognition attendance",
      "At-risk student alerts",
      "Digital grading & assignments",
      "Direct parent communication",
    ],
    ahaFeature: "Daily Focus List",
    ahaDescription: "AI triages 120 students to 5 who need attention today",
    link: "/for-teachers",
  },
  {
    id: "lab",
    title: "Lab Assistant",
    subtitle: "Lab Management",
    icon: FlaskConical,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    benefits: [
      "Equipment tracking & inventory",
      "Predictive maintenance alerts",
      "Lab session scheduling",
      "Practical marks entry",
    ],
    ahaFeature: "Predictive Maintenance",
    ahaDescription: "Prevents 2-week lab closures with timely alerts",
    link: "/for-teachers",
  },
  {
    id: "student",
    title: "Student",
    subtitle: "Academic Journey",
    icon: User,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    benefits: [
      "Career path visualization",
      "85% accuracy score prediction",
      "Alumni mentor matching",
      "Goal tracking dashboard",
    ],
    ahaFeature: "Career Path Visualizer",
    ahaDescription: "See exactly what skills you need with alumni success proof",
    link: "/for-students",
  },
  {
    id: "parent",
    title: "Parent",
    subtitle: "Peace of Mind",
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    benefits: [
      "Real-time attendance alerts",
      "Progress insights & reports",
      "Direct teacher messaging",
      "Online fee payment",
    ],
    ahaFeature: "Early Warning System",
    ahaDescription: "Get warned 6 weeks before failure, not after",
    link: "/for-parents",
  },
  {
    id: "alumni",
    title: "Alumni",
    subtitle: "Give Back",
    icon: Trophy,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    benefits: [
      "Mentorship program access",
      "Alumni network directory",
      "Event registration",
      "Contribution tracking",
    ],
    ahaFeature: "Impact Story",
    ahaDescription: "See '5 placements from your mentorship' - real impact",
    link: "/for-alumni",
  },
  {
    id: "platform-owner",
    title: "Platform Owner",
    subtitle: "Multi-tenant SaaS",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    benefits: [
      "Multi-college management",
      "Cross-institution benchmarking",
      "Churn prediction AI",
      "Revenue & billing dashboard",
    ],
    ahaFeature: "Tenant Health Monitor",
    ahaDescription: "Identifies at-risk institutions before they leave",
    link: "/contact",
  },
];

export function PersonaTabs() {
  const [activePersona, setActivePersona] = useState(personas[0]);

  return (
    <section id="personas" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
            9 Personas, 1 Platform
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Tailored for Every Stakeholder
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From Principal to Parent, everyone gets an AI-powered dashboard
            designed for their unique needs.
          </p>
        </div>

        {/* Persona tabs - horizontal scrollable on mobile */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setActivePersona(persona)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activePersona.id === persona.id
                  ? `${persona.bgColor} ${persona.color} ring-2 ring-offset-2 ring-current`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <persona.icon className="w-4 h-4" />
              {persona.title}
            </button>
          ))}
        </div>

        {/* Active persona content */}
        <div
          className={`grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-10 rounded-3xl border-2 ${activePersona.borderColor} ${activePersona.bgColor} transition-all duration-500`}
        >
          {/* Left: Benefits */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-14 h-14 rounded-2xl ${activePersona.bgColor} flex items-center justify-center`}
              >
                <activePersona.icon
                  className={`w-7 h-7 ${activePersona.color}`}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {activePersona.title}
                </h3>
                <p className="text-slate-600">{activePersona.subtitle}</p>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {activePersona.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${activePersona.color} flex-shrink-0 mt-0.5`}
                  />
                  <span className="text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <Link href={activePersona.link}>
              <Button
                className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700`}
              >
                Explore {activePersona.title} Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Right: Aha Moment */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`w-5 h-5 ${activePersona.color}`} />
                <span
                  className={`text-sm font-semibold ${activePersona.color} uppercase tracking-wider`}
                >
                  Aha Moment
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900 mb-3">
                {activePersona.ahaFeature}
              </h4>

              <p className="text-slate-600 leading-relaxed mb-6">
                &ldquo;{activePersona.ahaDescription}&rdquo;
              </p>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${activePersona.bgColor} ${activePersona.color} text-sm font-medium`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activePersona.color.replace("text-", "bg-")} opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${activePersona.color.replace("text-", "bg-")}`}
                  />
                </span>
                AI-Powered Feature
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
