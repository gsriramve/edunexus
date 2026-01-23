"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  ArrowRight,
  Brain,
  Users,
  Rocket,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const slides = [
  {
    id: 1,
    headline: "Run Your College",
    highlight: "Like a Tech Company",
    description:
      "The all-in-one AI platform that transforms how you manage students, faculty, and operations.",
    cta: "Watch 2-min Demo",
    ctaLink: "#demo",
    secondaryCta: "Request Demo",
    secondaryLink: "/contact",
    icon: Rocket,
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
  },
  {
    id: 2,
    headline: "Predict Dropouts",
    highlight: "6 Weeks Early",
    description:
      "AI identifies at-risk students before they fail. Give your faculty time to intervene and save careers.",
    cta: "See Principal Dashboard",
    ctaLink: "/for-principals",
    secondaryCta: "Learn More",
    secondaryLink: "#personas",
    icon: Target,
    gradient: "from-blue-500 via-blue-600 to-blue-700",
  },
  {
    id: 3,
    headline: "85% Score Prediction",
    highlight: "Accuracy",
    description:
      "Our AI predicts student performance with 85% accuracy. Know who needs help before exam results.",
    cta: "Explore AI Features",
    ctaLink: "#ai-showcase",
    secondaryCta: "See How It Works",
    secondaryLink: "#personas",
    icon: Brain,
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
  },
  {
    id: 4,
    headline: "9 Personas.",
    highlight: "One Platform.",
    description:
      "From Principal to Parent, every stakeholder gets a dedicated AI-powered dashboard tailored to their needs.",
    cta: "Explore All Dashboards",
    ctaLink: "#personas",
    secondaryCta: "Book Demo",
    secondaryLink: "/contact",
    icon: Users,
    gradient: "from-orange-500 via-red-500 to-pink-600",
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Auto-advance every 5 seconds
    const interval = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background gradient that changes with slide */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slides[selectedIndex]?.gradient || slides[0].gradient} transition-all duration-700`}
      />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]" />
      </div>

      {/* Carousel */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="max-w-4xl mx-auto text-center py-20 md:py-28">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-8">
                    <slide.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>

                  {/* Headline */}
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                    {slide.headline}{" "}
                    <span className="block md:inline text-white/90">
                      {slide.highlight}
                    </span>
                  </h1>

                  {/* Description */}
                  <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-10">
                    {slide.description}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href={slide.ctaLink}>
                      <Button
                        size="lg"
                        className="bg-white text-slate-900 hover:bg-white/90 shadow-xl shadow-black/20 px-8 py-6 text-lg font-semibold"
                      >
                        {slide.cta}
                        <Play className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href={slide.secondaryLink}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-white/30 text-white hover:bg-white/10 bg-white/5 px-8 py-6 text-lg"
                      >
                        {slide.secondaryCta}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-white w-8"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
