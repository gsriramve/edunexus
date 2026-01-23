import {
  MarketingNav,
  HeroCarousel,
  TrustStats,
  PainPointsTimeline,
  PersonaTabs,
  AIShowcase,
  ImplementationTimeline,
  ContactCTAs,
  MarketingFooter,
  FloatingWhatsApp,
} from "@/components/marketing";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <MarketingNav />

      {/* Hero Carousel - 4 rotating slides */}
      <HeroCarousel />

      {/* Trust Stats Bar - Platform features */}
      <TrustStats />

      {/* Pain Points Timeline - Before vs After */}
      <PainPointsTimeline />

      {/* Persona Tabs - 9 personas with benefits */}
      <PersonaTabs />

      {/* AI Showcase - 5 AI features */}
      <AIShowcase />

      {/* Implementation Timeline - 6-week process */}
      <ImplementationTimeline />

      {/* Multi-Channel CTAs */}
      <ContactCTAs />

      {/* Footer */}
      <MarketingFooter />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </div>
  );
}
