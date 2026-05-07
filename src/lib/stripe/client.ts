import 'server-only'

import Stripe from 'stripe'

/**
 * Server-side Stripe client. Singleton — re-using the connection pool across
 * route handlers and webhook deliveries.
 *
 * The API version is pinned so Stripe can't silently change response shapes
 * under us. Bump it deliberately along with a code review of typed fields.
 *
 * NEVER import this module from client code. The secret key has full access
 * to your Stripe account.
 */
let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  cached = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    appInfo: {
      name: 'longevity-app',
      version: '0.1.0',
    },
  })
  return cached
}
