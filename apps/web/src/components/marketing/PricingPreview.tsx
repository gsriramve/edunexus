"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Headphones,
  Brain,
  ScanFace,
  LayoutGrid,
} from "lucide-react";

const includedFeatures = [
  { icon: LayoutGrid, text: "All 9 role-based portals" },
  { icon: Brain, text: "Full AI suite (predictions, alerts)" },
  { icon: ScanFace, text: "Face recognition attendance" },
  { icon: Users, text: "Unlimited users" },
  { icon: Headphones, text: "24/7 dedicated support" },
  { icon: Shield, text: "Enterprise security & compliance" },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            One Price.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Everything Included.
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            No hidden fees, no module upsells, no surprises. Just comprehensive
            college management.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden">
            {/* Price header */}
            <div className="p-8 md:p-10 text-center border-b border-slate-700">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl md:text-6xl font-bold">₹500</span>
                <span className="text-slate-400 text-lg">/student/year</span>
              </div>
              <p className="text-slate-400">
                That&apos;s less than ₹42/month per student
              </p>

              {/* Volume discount note */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                <Sparkles className="w-4 h-4" />
                Volume discounts available for 2000+ students
              </div>
            </div>

            {/* Features grid */}
            <div className="p-8 md:p-10">
              <h4 className="text-lg font-semibold mb-6 text-center">
                Everything you need, included:
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {includedFeatures.map((feature) => (
                  <div
                    key={feature.text}
                    className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-slate-200">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Additional perks */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  "Free data migration",
                  "Unlimited training",
                  "No setup fees",
                  "Annual billing",
                ].map((perk) => (
                  <div
                    key={perk}
                    className="flex items-center justify-center gap-2 text-sm text-slate-400"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {perk}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA footer */}
            <div className="p-8 md:p-10 bg-slate-700/30 border-t border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8"
                  >
                    Get Custom Quote
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#roi-calculator">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Calculate Your ROI
                  </Button>
                </Link>
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                30-day free pilot • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
