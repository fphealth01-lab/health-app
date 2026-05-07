/**
 * Shared Stripe constants and small pure helpers.
 *
 * Imported on both the server (checkout/webhook routes, server actions) and
 * the client (pricing card). Keep this file dependency-free — no Stripe SDK
 * imports, no secrets, no `server-only`.
 */

/**
 * Length of the introductory free trial Stripe applies to new subscriptions.
 * Industry-standard for SaaS — long enough to feel value, short enough to
 * convert. Mirrored in pricing copy.
 */
export const TRIAL_DAYS = 7

/**
 * Allowlisted Stripe price IDs. The checkout route validates incoming
 * `priceId` against this list so an attacker can't post arbitrary prices.
 *
 * These are NEXT_PUBLIC_* values — they're already exposed to the browser
 * by Next.js, so referencing them here is safe.
 */
export const PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? '',
  yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? '',
} as const

export type PriceTier = keyof typeof PRICE_IDS

/**
 * Map a Stripe price ID back to our internal tier label, or null if the ID
 * doesn't match either configured price. Used by the webhook to record
 * which plan the user is on for the settings page.
 */
export function priceIdToTier(priceId: string | null | undefined): PriceTier | null {
  if (!priceId) return null
  if (priceId === PRICE_IDS.monthly) return 'monthly'
  if (priceId === PRICE_IDS.yearly) return 'yearly'
  return null
}

/**
 * Returns true if a Stripe subscription `status` value should grant premium
 * access. We treat trial users the same as paying users — the credit card
 * is on file, they're inside the product, and degrading their experience
 * mid-trial would tank conversion.
 */
export function subscriptionStatusIsPremium(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing'
}

/**
 * Display label for a price tier, used in the pricing page + settings.
 */
export function priceTierLabel(tier: PriceTier): string {
  return tier === 'monthly' ? 'Premium Monthly' : 'Premium Yearly'
}
