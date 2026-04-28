import { Hero } from '@/components/marketing/hero'
import { FeatureCards } from '@/components/marketing/feature-cards'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Goals } from '@/components/marketing/goals'
import { Testimonials } from '@/components/marketing/testimonials'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FAQ } from '@/components/marketing/faq'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <Goals />
      <Testimonials />
      <PricingSection />
      <FAQ />
    </>
  )
}
