import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PricingCard, type PricingCardMode } from '@/components/marketing/pricing-card'
import { createClient } from '@/lib/supabase/server'
import { features } from '@/config/features'
import { PRICE_IDS, subscriptionStatusIsPremium } from '@/lib/stripe/config'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free and Premium Plans',
  description:
    'Start free with a basic protocol. Upgrade to Lyvewell Premium for personalized 5-7 supplement protocols, unlimited coach access, and weekly meal plans. $9.99/month with 7-day free trial.',
  alternates: { canonical: '/pricing' },
}

const freeFeatures = [
  'Generic 3-supplement starter stack',
  'Daily tracker with streaks',
  'Daily check-ins (energy, mood, sleep, stress)',
  'Full content library + supplement encyclopedia',
  '5 coach questions per day',
  '1 protocol regeneration per 24h',
]

interface PricingPageProps {
  searchParams: Promise<{ plan?: string; checkout?: string }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const initialTier: 'monthly' | 'yearly' =
    params.plan === 'yearly' ? 'yearly' : 'monthly'
  const checkoutCanceled = params.checkout === 'canceled'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let mode: PricingCardMode = { kind: 'logged_out' }
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()
    mode = subscriptionStatusIsPremium(subscription?.status)
      ? { kind: 'logged_in_premium' }
      : { kind: 'logged_in_free' }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple pricing. Real results.
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Free to start. Upgrade when you want full personalization.
        </p>
      </div>

      {checkoutCanceled && (
        <div className="border-muted-foreground/20 bg-muted/40 text-muted-foreground mx-auto mt-8 max-w-2xl rounded-xl border px-4 py-3 text-center text-sm">
          Checkout canceled — no charge was made. Pick a plan below whenever
          you&apos;re ready.
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-stretch">
        {/* ── Free card ─────────────────────────────────────────────── */}
        <Card className="bg-card relative">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Free</CardTitle>
            <CardDescription>
              Get started with a generic stack and core content.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">$0</span>
                <span className="text-muted-foreground text-sm">forever</span>
              </div>
            </div>

            <ul className="space-y-2.5">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span className="bg-primary/10 text-primary mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href={user ? '/dashboard' : '/signup'}>
                {user ? 'Go to dashboard' : 'Sign up free'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* ── Premium card ──────────────────────────────────────────── */}
        <PricingCard
          priceIds={{ monthly: PRICE_IDS.monthly, yearly: PRICE_IDS.yearly }}
          initialTier={initialTier}
          mode={mode}
          disabled={!features.stripeCheckoutEnabled}
        />
      </div>

      <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-xs">
        Prices in USD. Sales tax may apply based on your location. Premium
        renews automatically until canceled — manage your subscription anytime
        from Settings.
      </p>
    </div>
  )
}
