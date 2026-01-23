"use client";

import { Building2 } from "lucide-react";

// Placeholder for institution logos
// These would be replaced with real institution logos
const institutions = [
  { name: "Institution 1", placeholder: true },
  { name: "Institution 2", placeholder: true },
  { name: "Institution 3", placeholder: true },
  { name: "Institution 4", placeholder: true },
  { name: "Institution 5", placeholder: true },
  { name: "Institution 6", placeholder: true },
  { name: "Institution 7", placeholder: true },
  { name: "Institution 8", placeholder: true },
];

export function LogoCarousel() {
  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 mb-8">
          Trusted by forward-thinking institutions across India
        </p>

        {/* Infinite scroll animation */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling container */}
          <div className="flex animate-scroll">
            {/* First set */}
            {institutions.map((institution, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 mx-8 flex flex-col items-center justify-center"
              >
                <div className="w-32 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400 mt-2 text-center">
                  Partner Institution
                </span>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {institutions.map((institution, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 mx-8 flex flex-col items-center justify-center"
              >
                <div className="w-32 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400 mt-2 text-center">
                  Partner Institution
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
