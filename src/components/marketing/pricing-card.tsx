'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type PricingCardMode =
  | { kind: 'logged_out' }
  // User is signed in and free; clicking starts checkout for the chosen tier.
  | { kind: 'logged_in_free' }
  // User is signed in and already premium; clicking opens the billing portal.
  | { kind: 'logged_in_premium' }

interface PricingCardProps {
  /** Stripe price IDs from env, passed in by the server. */
  priceIds: { monthly: string; yearly: string }
  /** Initial tier to show selected. We default to "monthly". */
  initialTier?: 'monthly' | 'yearly'
  mode: PricingCardMode
  /** Disables both buttons + shows a "coming soon" message. */
  disabled?: boolean
}

const premiumFeatures = [
  'Personalized 5–7 supplement protocol (Claude Sonnet)',
  'Per-supplement reasoning with research citations',
  'Unlimited regenerations as your goals evolve',
  'Member supplement discounts (15–30% off)',
  'Monthly personalized meal plan',
  'Unlimited AI coach with memory',
  'Cancel anytime — keep access through end of period',
]

export function PricingCard({
  priceIds,
  initialTier = 'monthly',
  mode,
  disabled = false,
}: PricingCardProps) {
  const router = useRouter()
  const [tier, setTier] = useState<'monthly' | 'yearly'>(initialTier)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function startCheckout() {
    setIsSubmitting(true)
    try {
      const priceId = priceIds[tier]
      if (!priceId) {
        toast.error('Pricing not configured. Please try again later.')
        return
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const payload = await response.json().catch(() => ({}) as Record<string, unknown>)

      if (!response.ok) {
        toast.error(
          typeof payload.error === 'string' ? payload.error : 'Checkout failed.',
        )
        return
      }

      if (typeof payload.url === 'string') {
        window.location.href = payload.url
      } else {
        toast.error('No checkout URL returned.')
      }
    } catch (err) {
      console.error('[pricing-card] checkout error:', err)
      toast.error('Network error. Try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function openPortal() {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = await response.json().catch(() => ({}) as Record<string, unknown>)
      if (!response.ok) {
        toast.error(
          typeof payload.error === 'string' ? payload.error : 'Could not open billing portal.',
        )
        return
      }
      if (typeof payload.url === 'string') {
        window.location.href = payload.url
      }
    } catch (err) {
      console.error('[pricing-card] portal error:', err)
      toast.error('Network error. Try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePrimaryClick() {
    if (disabled) return
    if (mode.kind === 'logged_out') {
      router.push(`/signup?next=/pricing&plan=${tier}`)
      return
    }
    if (mode.kind === 'logged_in_premium') {
      void openPortal()
      return
    }
    void startCheckout()
  }

  const priceDisplay =
    tier === 'monthly'
      ? { amount: '$9.99', cadence: '/ month', sub: 'Cancel anytime' }
      : {
          amount: '$59.99',
          cadence: '/ year',
          sub: 'Save 50% — billed annually',
        }

  const ctaLabel = (() => {
    if (mode.kind === 'logged_in_premium') return 'Manage subscription'
    if (disabled) return 'Coming soon'
    return 'Start 7-day free trial'
  })()

  return (
    <Card className="border-primary ring-primary/10 bg-card relative shadow-lg ring-4">
      <span className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium">
        Most popular
      </span>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Premium</CardTitle>
        <CardDescription>
          Personalized for your body and goals. Cancel anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Billing cadence"
          className="bg-muted/60 inline-flex rounded-full p-1 text-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tier === 'monthly'}
            onClick={() => setTier('monthly')}
            disabled={isSubmitting}
            className={
              tier === 'monthly'
                ? 'bg-background text-foreground rounded-full px-4 py-1.5 font-medium shadow-sm'
                : 'text-muted-foreground rounded-full px-4 py-1.5 font-medium'
            }
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tier === 'yearly'}
            onClick={() => setTier('yearly')}
            disabled={isSubmitting}
            className={
              tier === 'yearly'
                ? 'bg-background text-foreground rounded-full px-4 py-1.5 font-medium shadow-sm'
                : 'text-muted-foreground rounded-full px-4 py-1.5 font-medium'
            }
          >
            Yearly
            <span className="text-primary ml-2 text-xs font-semibold">−50%</span>
          </button>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight">
              {priceDisplay.amount}
            </span>
            <span className="text-muted-foreground text-sm">{priceDisplay.cadence}</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{priceDisplay.sub}</p>
        </div>

        <ul className="space-y-2.5">
          {premiumFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <span className="bg-primary/10 text-primary mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <Check className="h-3 w-3" aria-hidden />
              </span>
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={disabled || isSubmitting}
            onClick={handlePrimaryClick}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                One moment…
              </>
            ) : (
              ctaLabel
            )}
          </Button>
          {mode.kind !== 'logged_in_premium' && !disabled && (
            <p className="text-muted-foreground text-center text-xs">
              7-day free trial · No charge until day 8 · Cancel anytime
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
