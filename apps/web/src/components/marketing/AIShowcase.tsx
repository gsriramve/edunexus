"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ScanFace,
  TrendingUp,
  Compass,
  Target,
  AlertTriangle,
  Play,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";

interface AIFeature {
  id: string;
  icon: typeof ScanFace;
  title: string;
  description: string;
  accuracy?: string;
  benefit: string;
  gradient: string;
}

const aiFeatures: AIFeature[] = [
  {
    id: "face-recognition",
    icon: ScanFace,
    title: "Face Recognition Attendance",
    description:
      "30-second attendance for 60+ students with anti-spoofing technology. No proxies, no manual marking.",
    accuracy: "99.2%",
    benefit: "Saves 40+ hours/month on attendance",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "score-prediction",
    icon: TrendingUp,
    title: "Score Prediction Engine",
    description:
      "Predicts student grades 6 weeks before exams based on attendance, assignments, and past performance patterns.",
    accuracy: "85%",
    benefit: "Early intervention saves careers",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "career-path",
    icon: Compass,
    title: "Career Path Visualizer",
    description:
      "Shows students exactly what skills they need, with alumni success stories as proof points.",
    benefit: "Students know their path to success",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "placement-prediction",
    icon: Target,
    title: "Placement Probability",
    description:
      "Calculates each student's likelihood of placement based on skills, projects, and market demand.",
    accuracy: "80%",
    benefit: "Focus resources on at-risk students",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "early-warning",
    icon: AlertTriangle,
    title: "Early Warning System",
    description:
      "Identifies at-risk students by detecting patterns: good attendance but declining grades, or sudden drops.",
    accuracy: "78%",
    benefit: "Catch problems 6 weeks before failure",
    gradient: "from-pink-500 to-rose-500",
  },
];

export function AIShowcase() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(
    null
  );

  return (
    <section id="ai-showcase" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Platform
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            The AI That Makes{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EduNexus Different
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Not just data dashboards. Predictive AI that tells you what will
            happen and what to do about it.
          </p>
        </div>

        {/* AI Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiFeatures.map((feature) => (
            <div
              key={feature.id}
              className="group relative bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer hover:-translate-y-1"
              onClick={() => setSelectedFeature(feature)}
            >
              {/* Gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {feature.description}
              </p>

              {/* Accuracy badge */}
              {feature.accuracy && (
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-sm font-semibold`}
                  >
                    {feature.accuracy} Accuracy
                  </div>
                </div>
              )}

              {/* Benefit */}
              <div className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{feature.benefit}</span>
              </div>

              {/* Play button overlay */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">
            See how AI transforms college management
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Book AI Demo
            <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Feature detail modal */}
      {selectedFeature && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-lg w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center mb-6`}
            >
              <selectedFeature.icon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold mb-3">{selectedFeature.title}</h3>
            <p className="text-slate-400 mb-6">{selectedFeature.description}</p>

            {selectedFeature.accuracy && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${selectedFeature.gradient} text-white font-semibold mb-6`}
              >
                <TrendingUp className="w-4 h-4" />
                {selectedFeature.accuracy} Accuracy
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-xl mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Key Benefit</p>
                <p className="text-sm text-slate-400">
                  {selectedFeature.benefit}
                </p>
              </div>
            </div>

            <Button
              className={`w-full bg-gradient-to-r ${selectedFeature.gradient}`}
            >
              See This In Action
              <Play className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
