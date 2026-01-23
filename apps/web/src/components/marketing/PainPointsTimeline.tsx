"use client";

import {
  Clock,
  FileSpreadsheet,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  Bell,
  BarChart3,
  Brain,
  ArrowRight,
} from "lucide-react";

const beforeItems = [
  {
    time: "7:00 AM",
    icon: FileSpreadsheet,
    title: "Manual attendance reconciliation",
    description: "Chasing proxies and spreadsheet errors",
  },
  {
    time: "9:00 AM",
    icon: TrendingDown,
    title: "Fee defaulter calls",
    description: "Chasing the same parents again",
  },
  {
    time: "11:00 AM",
    icon: AlertCircle,
    title: "Surprise: Student failing",
    description: "Discovered too late to help",
  },
  {
    time: "2:00 PM",
    icon: Clock,
    title: "Report generation",
    description: "Manually compiling data for management",
  },
];

const afterItems = [
  {
    time: "7:00 AM",
    icon: Sparkles,
    title: "AI flags 5 priority students",
    description: "Know exactly who needs attention today",
  },
  {
    time: "9:00 AM",
    icon: Bell,
    title: "Auto fee reminders sent",
    description: "Personalized based on payment history",
  },
  {
    time: "11:00 AM",
    icon: Brain,
    title: "Early warning: 3 students at risk",
    description: "6 weeks before failure, not after",
  },
  {
    time: "2:00 PM",
    icon: BarChart3,
    title: "Reports auto-generated",
    description: "Dashboard ready with one click",
  },
];

export function PainPointsTimeline() {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-3">
            The Difference
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Your Morning:{" "}
            <span className="text-red-400">Before</span> vs{" "}
            <span className="text-emerald-400">After</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Stop managing chaos. Start leading your institution with AI-powered
            insights.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Before column */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-400">
                  Your Morning Today
                </h3>
              </div>

              <div className="space-y-4">
                {beforeItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-red-500/20"
                  >
                    <div className="text-sm font-medium text-slate-500 w-16 flex-shrink-0">
                      {item.time}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <p className="text-red-300 text-sm">
                  <strong>Result:</strong> 60% of your day spent firefighting,
                  not leading
                </p>
              </div>
            </div>

            {/* After column */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-emerald-400">
                  Your Morning with EduNexus
                </h3>
              </div>

              <div className="space-y-4">
                {afterItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20"
                  >
                    <div className="text-sm font-medium text-slate-500 w-16 flex-shrink-0">
                      {item.time}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <p className="text-emerald-300 text-sm">
                  <strong>Result:</strong> Proactive leadership with 20+ hours
                  saved weekly
                </p>
              </div>
            </div>
          </div>

          {/* Arrow connector for desktop */}
          <div className="hidden md:flex justify-center -mt-[280px] mb-[200px] pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
