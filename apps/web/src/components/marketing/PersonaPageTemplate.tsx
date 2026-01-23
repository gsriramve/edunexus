"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  LucideIcon,
} from "lucide-react";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
import { ContactCTAs } from "./ContactCTAs";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AhaFeature {
  title: string;
  description: string;
  metric?: string;
}

interface PersonaPageProps {
  persona: {
    title: string;
    subtitle: string;
    description: string;
    icon: LucideIcon;
    color: string;
    gradient: string;
    email: string;
  };
  heroHeadline: string;
  heroHighlight: string;
  heroDescription: string;
  features: Feature[];
  ahaFeatures: AhaFeature[];
  painPoints: string[];
  metrics: { value: string; label: string }[];
}

export function PersonaPageTemplate({
  persona,
  heroHeadline,
  heroHighlight,
  heroDescription,
  features,
  ahaFeatures,
  painPoints,
  metrics,
}: PersonaPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      {/* Hero Section */}
      <section
        className={`relative py-20 md:py-28 overflow-hidden bg-gradient-to-br ${persona.gradient}`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8">
              <persona.icon className="h-4 w-4" />
              For {persona.title}s
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heroHeadline}{" "}
              <span className="block text-white/90">{heroHighlight}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              {heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-white/90 shadow-xl px-8"
                >
                  Book a Demo
                  <Play className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 bg-white/5 px-8"
                >
                  See Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics bar */}
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="text-sm text-slate-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
              Sound Familiar?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {painPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-sm font-bold">!</span>
                  </div>
                  <p className="text-slate-600">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className={`${persona.color} font-semibold text-sm uppercase tracking-wider mb-3`}
            >
              Your Dashboard
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need in One Place
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-200"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features / Aha Moments */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your &quot;Aha&quot; Moments
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              AI features that make you say &quot;I need this NOW&quot;
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ahaFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className={`w-5 h-5 ${persona.color}`} />
                  <span
                    className={`text-sm font-semibold ${persona.color} uppercase tracking-wider`}
                  >
                    AI Feature
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 mb-4">{feature.description}</p>
                {feature.metric && (
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${persona.gradient} text-white text-sm font-semibold`}
                  >
                    {feature.metric}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo credentials */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Try the Live Demo
            </h2>
            <p className="text-slate-600 mb-6">
              Experience the {persona.title} dashboard yourself
            </p>
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">Login Email</span>
                <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                  {persona.email}
                </code>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-slate-500">Password</span>
                <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                  Nexus@1104
                </code>
              </div>
              <Link href="/login">
                <Button className={`w-full bg-gradient-to-r ${persona.gradient}`}>
                  Login to Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ContactCTAs />

      <MarketingFooter />
      <FloatingWhatsApp />
    </div>
  );
}
