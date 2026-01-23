"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function FloatingWhatsApp() {
  const [isExpanded, setIsExpanded] = useState(false);

  const phoneNumber = "919876543210"; // Replace with actual WhatsApp number
  const defaultMessage = encodeURIComponent(
    "Hi! I'm interested in learning more about EduNexus for my institution."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded popup */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-xl border w-72 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">EduNexus Support</p>
                <p className="text-xs text-white/80">
                  Typically replies instantly
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50">
            <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
              <p className="text-sm text-slate-700">
                Hi there! 👋
                <br />
                <br />
                Want to see how EduNexus can transform your institution? Book a
                free demo or ask us anything!
              </p>
              <p className="text-xs text-slate-400 mt-2">Just now</p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
      >
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />

        {/* Icon */}
        <MessageCircle className="w-7 h-7 text-white" />

        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">1</span>
        </span>
      </button>
    </div>
  );
}
