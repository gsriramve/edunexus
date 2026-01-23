"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Phone, ArrowRight } from "lucide-react";

export function ContactCTAs() {
  const phoneNumber = "919876543210";
  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in learning more about EduNexus for my institution."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Experience the future of college management with AI-powered
            insights and automation.
          </p>
        </div>

        {/* CTA buttons grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Book Demo */}
          <Link href="/contact" className="group">
            <div className="bg-white rounded-2xl p-6 text-center h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Book a Demo
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                30-minute personalized walkthrough
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Schedule Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Link>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white rounded-2xl p-6 text-center h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <MessageCircle className="w-7 h-7 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                WhatsApp Us
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Quick questions? Chat with us
              </p>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                Start Chat
                <MessageCircle className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </a>

          {/* Call */}
          <a href="tel:+919876543210" className="group">
            <div className="bg-white rounded-2xl p-6 text-center h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Phone className="w-7 h-7 text-violet-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Call Now
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Speak with our team directly
              </p>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                +91 98765 43210
                <Phone className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </a>
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-blue-200 mt-10">
          No commitment required • See EduNexus in action in 30 minutes
        </p>
      </div>
    </section>
  );
}
