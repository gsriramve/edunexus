import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Brain,
  BarChart3,
  Users,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Quote,
  Play,
  ChevronRight,
  Building2,
  Award,
  Headphones,
} from "lucide-react";

// Pain points that create "Aha moments"
const painPoints = [
  {
    before: "Spending 40+ hours/month on manual attendance tracking",
    after: "Automated attendance with real-time parent notifications",
    metric: "95% time saved",
  },
  {
    before: "Chasing fee defaulters with spreadsheets",
    after: "Automated reminders with one-click online payments",
    metric: "35% faster collection",
  },
  {
    before: "Discovering at-risk students too late",
    after: "AI alerts identify struggling students in week 2",
    metric: "40% dropout reduction",
  },
];

// Benefit-focused features (not feature-focused)
const features = [
  {
    icon: Brain,
    title: "Predict Before Problems Arise",
    description:
      "Our AI identifies at-risk students weeks before they fail. Get actionable insights, not just data dumps.",
    stat: "40%",
    statLabel: "fewer dropouts",
  },
  {
    icon: Clock,
    title: "Give Administrators Their Time Back",
    description:
      "Automate attendance, fee collection, and report generation. Your staff focuses on students, not spreadsheets.",
    stat: "20hrs",
    statLabel: "saved weekly",
  },
  {
    icon: BarChart3,
    title: "See the Full Picture, Finally",
    description:
      "One dashboard for academics, finance, hostel, transport, and placements. No more switching between 5 systems.",
    stat: "1",
    statLabel: "unified platform",
  },
  {
    icon: Users,
    title: "Connect Every Stakeholder",
    description:
      "Students, parents, faculty, and administrators on one platform. Real-time updates keep everyone aligned.",
    stat: "8",
    statLabel: "role-based portals",
  },
  {
    icon: Shield,
    title: "Sleep Well With Enterprise Security",
    description:
      "Bank-grade encryption, granular permissions, and complete audit trails. Your data stays yours.",
    stat: "99.9%",
    statLabel: "uptime SLA",
  },
  {
    icon: TrendingUp,
    title: "Turn Data Into Placements",
    description:
      "AI-powered career matching, skill gap analysis, and company recommendations boost placement rates.",
    stat: "25%",
    statLabel: "placement increase",
  },
];

// Social proof testimonials - populated by real customers
const testimonials: Array<{
  quote: string;
  author: string;
  role: string;
  org: string;
}> = [];

// Why choose us - B2B focused
const whyChooseUs = [
  {
    icon: Building2,
    title: "Built for Scale",
    description: "From 500 to 50,000 students. Our architecture grows with you without performance drops.",
  },
  {
    icon: Headphones,
    title: "Dedicated Success Team",
    description: "Your own implementation manager, 24/7 support, and quarterly business reviews.",
  },
  {
    icon: Award,
    title: "Proven ROI",
    description: "Average 300% ROI in year one. We help you build the business case.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II, GDPR compliant, with single sign-on and audit logging.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">EduNexus</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#problem" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Why EduNexus
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Platform
            </Link>
            <Link href="#enterprise" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Results
            </Link>
            <Link href="#enterprise" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Enterprise
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/contact">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Request Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Benefit-first headline */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-8">
              <CheckCircle2 className="h-4 w-4" />
              Trusted by 50+ institutions worldwide
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Stop Managing Chaos.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Start Leading Your Institution.
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform that replaces your spreadsheets, disconnected systems,
              and manual processes. So you can focus on what matters: <strong>student success</strong>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 px-8">
                  Request a Demo
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#problem">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 px-8">
                  See How It Works
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Social proof stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto">
              {[
                { value: "50+", label: "Institutions" },
                { value: "120K+", label: "Students Managed" },
                { value: "99.9%", label: "Uptime" },
                { value: "4.9/5", label: "Customer Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs md:text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Agitation Section - "Aha Moments" */}
      <section id="problem" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Sound Familiar?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              You&apos;re Not Running an Institution.
              <br />
              <span className="text-slate-400">You&apos;re Fighting Fires.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {painPoints.map((point, index) => (
              <div key={index} className="relative h-full">
                <div className="bg-slate-800/50 rounded-2xl p-6 lg:p-8 border border-slate-700 h-full flex flex-col">
                  {/* Before state */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                      <div className="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                      Before
                    </div>
                    <p className="text-slate-300 text-base lg:text-lg leading-snug">{point.before}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center my-3">
                    <ArrowRight className="h-5 w-5 text-blue-400" />
                  </div>

                  {/* After state */}
                  <div className="mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0" />
                      With EduNexus
                    </div>
                    <p className="text-white text-base lg:text-lg font-medium leading-snug">{point.after}</p>
                  </div>

                  {/* Metric highlight - fixed positioning */}
                  <div className="mt-auto">
                    <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg px-4 py-2">
                      <span className="text-white font-bold text-sm">{point.metric}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Benefit-focused */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
              The Platform
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Everything You Need. Nothing You Don&apos;t.
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Purpose-built for higher education. No bloated enterprise software, no missing features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-slate-50 rounded-2xl p-6 lg:p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-200"
              >
                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>

                <h3 className="font-bold text-lg lg:text-xl text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-5 text-sm lg:text-base">{feature.description}</p>

                {/* Stat highlight */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {feature.stat}
                  </span>
                  <span className="text-xs lg:text-sm text-slate-500">{feature.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Only show if we have real testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
                Real Results
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Don&apos;t Take Our Word For It
              </h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                See what education leaders say about transforming their institutions with EduNexus.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <Quote className="h-6 w-6 lg:h-8 lg:w-8 text-blue-100 mb-3" />

                  <p className="text-slate-700 text-base lg:text-lg leading-relaxed mb-6 flex-grow">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 mt-auto">
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.author.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm lg:text-base">{testimonial.author}</p>
                      <p className="text-xs lg:text-sm text-slate-500">{testimonial.role}, {testimonial.org}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enterprise Section - Replaces Pricing for B2B */}
      <section id="enterprise" className="py-20 bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Enterprise Ready
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Why Leaders Choose EduNexus
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              We don&apos;t just sell software. We partner with you to transform your institution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 py-8 border-t border-b border-slate-100">
            {[
              { label: "SOC 2 Type II", icon: Shield },
              { label: "99.9% Uptime SLA", icon: CheckCircle2 },
              { label: "GDPR Compliant", icon: Shield },
              { label: "24/7 Priority Support", icon: Headphones },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-slate-600">
                <badge.icon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-sm">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Join 50+ institutions that have already made the switch.
            Let&apos;s discuss how EduNexus can work for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100 shadow-lg px-8">
                Schedule a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 bg-white/10 px-8">
                Contact Sales
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-blue-200">
            No commitment required. See EduNexus in action in 30 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 lg:gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">EduNexus</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                The modern campus management platform trusted by institutions worldwide.
                Built for education, designed for results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="#testimonials" className="hover:text-white transition-colors">Results</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Request Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; 2026 EduNexus. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Powered by</span>
              <a
                href="https://www.quantumlayerplatform.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Zap className="h-4 w-4" />
                QuantumLayer Platform
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
