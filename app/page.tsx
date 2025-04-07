import { HeroSection } from "@/components/landing-page/hero-section"
import { FeatureSection } from "@/components/landing-page/feature-section"
import { TestimonialSection } from "@/components/landing-page/testimonial-section"
import { OutreachSection } from "@/components/landing-page/outreach-section"
import { InsightsSection } from "@/components/landing-page/insights-section"
import { WorkflowSection } from "@/components/landing-page/workflow-section"
import { TestimonialsGrid } from "@/components/landing-page/testimonials-grid"
import { CTASection } from "@/components/landing-page/cta-section"
import { Footer } from "@/components/landing-page/footer"
import { Navbar } from "@/components/landing-page/navbar"
import { FloatingCTA } from "@/components/landing-page/floating-cta"
import { BackToTop } from "@/components/landing-page/back-to-top"

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden scroll-smooth">
      <div className="bg-gradient-to-r from-rose-500 via-violet-500 to-blue-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animated-gradient relative">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/10 to-violet-600/10 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/10 to-blue-500/10 rounded-full filter blur-[100px] animate-pulse delay-1000"></div>
        </div>
        <Navbar />
        <HeroSection />
      </div>

      <FeatureSection />
      <TestimonialSection />
      <OutreachSection />
      <InsightsSection />
      <WorkflowSection />
      <TestimonialsGrid />
      <CTASection />
      <Footer />
      <FloatingCTA />
      <BackToTop />
    </div>
  )
}

