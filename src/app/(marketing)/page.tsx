import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/hero'
import { FeatureCards } from '@/components/marketing/feature-cards'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Goals } from '@/components/marketing/goals'
import { Testimonials } from '@/components/marketing/testimonials'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FAQ } from '@/components/marketing/faq'
import { OrganizationSchema, WebSiteSchema } from '@/components/seo/structured-data'

export const metadata: Metadata = {
  title: 'Personalized Supplement Protocols',
  description:
    'Build a science-backed supplement protocol tailored to your energy, sleep, and longevity goals. Track daily, get coaching, weekly meal plans.',
  alternates: { canonical: '/' },
}

export default function LandingPage() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
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
