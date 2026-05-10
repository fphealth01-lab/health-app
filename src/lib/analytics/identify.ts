'use client'

import posthog from 'posthog-js'

export type UserIdentityProps = {
  id: string
  email: string
  tier?: 'free' | 'premium' | 'trialing'
  goal?: string
  createdAt?: string
}

/**
 * Associates subsequent events with a specific user.
 * Call this after a successful sign-in or email confirmation.
 * Properties use PostHog's recommended naming — they map directly
 * to the People section in the PostHog dashboard.
 */
export function identifyUser(user: UserIdentityProps) {
  if (!posthog.__loaded) return

  posthog.identify(user.id, {
    email: user.email,
    tier: user.tier,
    goal: user.goal,
    created_at: user.createdAt,
  })
}

/**
 * Resets the PostHog identity (anonymous ID + person properties).
 * Call this immediately before or after sign-out so the next
 * session starts fresh and cannot be linked to the previous user.
 */
export function resetUser() {
  if (!posthog.__loaded) return
  posthog.reset()
}
