"use client";

import {
  Search,
  Upload,
  Settings,
  Users,
  Rocket,
  Headphones,
  CheckCircle2,
} from "lucide-react";

const phases = [
  {
    week: "Week 1-2",
    title: "Discovery & Data Migration",
    icon: Search,
    tasks: [
      "Requirements gathering call",
      "System configuration",
      "Data import & validation",
      "User accounts setup",
    ],
    color: "blue",
  },
  {
    week: "Week 3-4",
    title: "Configuration & Training",
    icon: Settings,
    tasks: [
      "Custom workflows setup",
      "Admin training sessions",
      "Faculty training sessions",
      "Integration testing",
    ],
    color: "violet",
  },
  {
    week: "Week 5-6",
    title: "Go Live & Support",
    icon: Rocket,
    tasks: [
      "Soft launch with pilot users",
      "Full rollout to all users",
      "On-site support",
      "Success review meeting",
    ],
    color: "emerald",
  },
];

export function ImplementationTimeline() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
            6-Week Implementation
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Go Live in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              6 Weeks
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our proven implementation process gets you up and running fast with
            minimal disruption.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {phases.map((phase, index) => {
              const colorClasses = {
                blue: {
                  bg: "bg-blue-500",
                  bgLight: "bg-blue-50",
                  text: "text-blue-600",
                  border: "border-blue-200",
                },
                violet: {
                  bg: "bg-violet-500",
                  bgLight: "bg-violet-50",
                  text: "text-violet-600",
                  border: "border-violet-200",
                },
                emerald: {
                  bg: "bg-emerald-500",
                  bgLight: "bg-emerald-50",
                  text: "text-emerald-600",
                  border: "border-emerald-200",
                },
              }[phase.color];

              return (
                <div key={phase.week} className="relative">
                  {/* Connector line */}
                  {index < phases.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                  )}

                  <div
                    className={`relative ${colorClasses?.bgLight} rounded-2xl p-6 border ${colorClasses?.border}`}
                  >
                    {/* Week badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 ${colorClasses?.bg} text-white text-sm font-semibold rounded-full mb-4`}
                    >
                      {phase.week}
                    </div>

                    {/* Icon and title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${colorClasses?.bg} flex items-center justify-center`}
                      >
                        <phase.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {phase.title}
                      </h3>
                    </div>

                    {/* Tasks */}
                    <ul className="space-y-2">
                      {phase.tasks.map((task) => (
                        <li
                          key={task}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${colorClasses?.text} flex-shrink-0 mt-0.5`}
                          />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Support badge */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Dedicated Success Team
                </p>
                <p className="text-sm text-slate-500">
                  24/7 support throughout implementation
                </p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Unlimited Training
                </p>
                <p className="text-sm text-slate-500">
                  For all your faculty and staff
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
