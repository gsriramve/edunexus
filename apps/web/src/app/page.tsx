import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, BarChart3, Users, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Predict student performance, identify at-risk students, and personalize learning paths with advanced ML models.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Architecture",
    description:
      "Serve multiple colleges with complete data isolation, custom branding, and role-based access control.",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics",
    description:
      "Real-time dashboards for attendance, fees, placements, and academic performance across all stakeholders.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption, RBAC with 8 user roles, audit logging, and compliance with data protection standards.",
  },
  {
    icon: Zap,
    title: "Career Hub & Placements",
    description:
      "AI-driven placement predictions, skill gap analysis, resume builder, and company matching for students.",
  },
  {
    icon: GraduationCap,
    title: "Complete Campus Management",
    description:
      "Attendance, exams, fees, hostel, transport, library, and sports - everything in one unified platform.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">EduNexus</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            AI-First College Management Platform for{" "}
            <span className="text-primary">Indian Engineering Colleges</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Empower your institution with predictive analytics, smart automation, and
            comprehensive campus management. Built for scale, designed for students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>12+ Colleges</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>45,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A complete solution for modern engineering colleges, from admissions to placements.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-background rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-muted-foreground">
              Pay per student, scale as you grow.
            </p>
          </div>
          <div className="max-w-lg mx-auto bg-background rounded-2xl border p-8 shadow-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-primary">Per Student / Year</p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">₹500</span>
                <span className="text-muted-foreground">/student/year</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Volume discounts available for 5,000+ students
              </p>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "All 8 user portals included",
                "AI predictions & analytics",
                "Unlimited departments",
                "Payment gateway integration",
                "SMS & WhatsApp notifications",
                "24/7 support",
                "Custom branding",
                "Data export & compliance reports",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="block mt-8">
              <Button className="w-full" size="lg">
                Start 30-Day Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold">EduNexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 EduNexus. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
          {/* Powered By Section */}
          <div className="mt-8 pt-8 border-t flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Built on Enterprise-Grade Infrastructure
            </p>
            <a
              href="https://www.quantumlayerplatform.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline transition-colors"
            >
              <Zap className="h-4 w-4" />
              Powered by QuantumLayer Platform
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
