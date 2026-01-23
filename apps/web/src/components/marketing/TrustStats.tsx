"use client";

import { useState, useEffect, useRef } from "react";
import { Users, LayoutGrid, Clock, Shield } from "lucide-react";

interface StatItem {
  icon: typeof Building2;
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: LayoutGrid,
    value: 9,
    suffix: "",
    label: "Role-Based Portals",
  },
  {
    icon: Clock,
    value: 6,
    suffix: " Week",
    label: "Implementation",
  },
  {
    icon: Shield,
    value: 99.9,
    suffix: "%",
    label: "Uptime SLA",
  },
  {
    icon: Users,
    value: 20,
    suffix: "+",
    label: "AI Features",
  },
];

function AnimatedCounter({
  value,
  suffix,
  duration = 2000,
}: {
  value: number;
  suffix: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const start = 0;
    const end = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = start + (end - start) * easeOutQuart;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  const formatValue = (val: number) => {
    if (value >= 1000) {
      return Math.floor(val).toLocaleString();
    }
    if (value % 1 !== 0) {
      return val.toFixed(1);
    }
    return Math.floor(val).toString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatValue(count)}
      {suffix}
    </span>
  );
}

export function TrustStats() {
  return (
    <section className="py-8 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3 group-hover:bg-white/20 transition-colors">
                <stat.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
