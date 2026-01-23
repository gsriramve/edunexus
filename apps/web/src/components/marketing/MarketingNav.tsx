"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Users,
  Brain,
  Building2,
  Calculator,
} from "lucide-react";

const navLinks = [
  {
    label: "For",
    hasDropdown: true,
    items: [
      { label: "Principals", href: "/for-principals", description: "Strategic leadership dashboard" },
      { label: "HODs", href: "/for-hods", description: "Department management" },
      { label: "Administrators", href: "/for-administrators", description: "Operations & records" },
      { label: "Teachers", href: "/for-teachers", description: "Classroom excellence" },
      { label: "Students", href: "/for-students", description: "Academic journey" },
      { label: "Parents", href: "/for-parents", description: "Peace of mind" },
      { label: "Alumni", href: "/for-alumni", description: "Give back & connect" },
    ],
  },
  { label: "Features", href: "#personas" },
  { label: "AI Showcase", href: "#ai-showcase" },
  { label: "Contact", href: "/contact" },
];

export function MarketingNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">EduNexus</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  link.hasDropdown && setActiveDropdown(link.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.hasDropdown ? (
                  <>
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100">
                      {link.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Dropdown */}
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 pt-2 w-64">
                        <div className="bg-white rounded-xl shadow-xl border p-2">
                          {link.items?.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex flex-col px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <span className="font-medium text-slate-900">
                                {item.label}
                              </span>
                              <span className="text-xs text-slate-500">
                                {item.description}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href!}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Request Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.hasDropdown ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      {link.label}
                    </p>
                    {link.items?.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={link.href!}
                    className="block px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-4 border-t space-y-2">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/contact" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
