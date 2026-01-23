"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  TrendingUp,
  Clock,
  IndianRupee,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function ROICalculator() {
  const [studentCount, setStudentCount] = useState(3000);

  const calculations = useMemo(() => {
    const pricePerStudent = 500;
    const annualCost = studentCount * pricePerStudent;

    // ROI calculations based on strategic plan data
    const adminTimeSavings = Math.round((studentCount / 3000) * 1200000); // ₹12L for 3000 students
    const feeCollectionImprovement = Math.round(studentCount * 50 * 0.05); // 5% of ₹50K avg fee
    const dropoutReduction = Math.round(studentCount * 0.02 * 50000); // 2% dropout reduction x ₹50K fee
    const complianceSavings = Math.round((studentCount / 3000) * 500000); // ₹5L for 3000 students

    const totalBenefit =
      adminTimeSavings +
      feeCollectionImprovement +
      dropoutReduction +
      complianceSavings;
    const netROI = totalBenefit - annualCost;
    const roiPercentage = Math.round((netROI / annualCost) * 100);
    const paybackMonths = Math.round((annualCost / totalBenefit) * 12 * 10) / 10;

    return {
      annualCost,
      adminTimeSavings,
      feeCollectionImprovement,
      dropoutReduction,
      complianceSavings,
      totalBenefit,
      netROI,
      roiPercentage,
      paybackMonths,
    };
  }, [studentCount]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  return (
    <section id="roi-calculator" className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Calculator className="h-4 w-4" />
            ROI Calculator
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Calculate Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Annual Savings
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See exactly how much your institution can save with EduNexus
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border p-6 md:p-10">
            {/* Slider section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold text-slate-900">
                  Number of Students
                </label>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {studentCount.toLocaleString()}
                </div>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-sm text-slate-500 mt-2">
                <span>500</span>
                <span>5,000</span>
                <span>10,000</span>
              </div>
            </div>

            {/* Results grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Cost */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-slate-600">Annual Investment</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(calculations.annualCost)}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  ₹500/student/year (all inclusive)
                </p>
              </div>

              {/* ROI percentage */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-white/80">Return on Investment</span>
                </div>
                <div className="text-4xl font-bold">
                  {calculations.roiPercentage}%
                </div>
                <p className="text-sm text-white/70 mt-1">
                  Payback in {calculations.paybackMonths} months
                </p>
              </div>
            </div>

            {/* Benefits breakdown */}
            <div className="space-y-4 mb-10">
              <h4 className="text-lg font-semibold text-slate-900">
                Annual Benefits Breakdown
              </h4>
              <div className="grid gap-3">
                {[
                  {
                    label: "Admin Time Savings",
                    value: calculations.adminTimeSavings,
                    desc: "40 hrs/month x staff",
                  },
                  {
                    label: "Fee Collection Improvement",
                    value: calculations.feeCollectionImprovement,
                    desc: "5% improvement",
                  },
                  {
                    label: "Dropout Reduction Value",
                    value: calculations.dropoutReduction,
                    desc: "2% fewer dropouts",
                  },
                  {
                    label: "Compliance Automation",
                    value: calculations.complianceSavings,
                    desc: "Audit prep savings",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <span className="font-medium text-slate-900">
                        {item.label}
                      </span>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                  <div>
                    <span className="font-bold text-emerald-900">
                      Total Annual Benefit
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(calculations.totalBenefit)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div>
                    <span className="font-bold text-blue-900">
                      Net Annual Savings
                    </span>
                    <p className="text-sm text-blue-600">
                      Benefits minus investment
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculations.netROI)}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-slate-900">
                  Want a custom ROI analysis?
                </h4>
                <p className="text-sm text-slate-600">
                  Get a detailed breakdown for your institution
                </p>
              </div>
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Get Custom Analysis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
