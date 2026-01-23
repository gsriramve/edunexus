"use client";

import Link from "next/link";
import { GraduationCap, Zap, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { label: "Features", href: "#features" },
      { label: "AI Showcase", href: "#ai-showcase" },
      { label: "Pricing", href: "#pricing" },
      { label: "Request Demo", href: "/contact" },
    ],
  },
  personas: {
    title: "For",
    links: [
      { label: "Principals", href: "/for-principals" },
      { label: "HODs", href: "/for-hods" },
      { label: "Administrators", href: "/for-administrators" },
      { label: "Teachers", href: "/for-teachers" },
      { label: "Students", href: "/for-students" },
      { label: "Parents", href: "/for-parents" },
      { label: "Alumni", href: "/for-alumni" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main footer content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">EduNexus</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The AI-powered college management platform for modern institutions.
              Transform your college into a tech-enabled success factory.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@edunexus.io"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@edunexus.io
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {footerLinks.platform.title}
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">
              {footerLinks.personas.title}
            </h4>
            <ul className="space-y-3">
              {footerLinks.personas.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">
              {footerLinks.company.title}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} EduNexus. All rights reserved.
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
      </div>
    </footer>
  );
}
