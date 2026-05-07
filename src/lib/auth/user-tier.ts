import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { features } from '@/config/features'
import { subscriptionStatusIsPremium } from '@/lib/stripe/config'

export type UserTier = 'free' | 'premium'

/**
 * Single source of truth for whether a user is premium.
 *
 * Reads the user's row from `subscriptions` and considers `trialing` and
 * `active` as premium (per `subscriptionStatusIsPremium`). Anything else
 * — `canceled`, `past_due`, `incomplete_expired`, no row at all — is free.
 *
 * Respects the master kill-switch `premiumPersonalizedProtocolEnabled`. When
 * that flag is false, EVERYONE is downgraded to free regardless of their
 * subscription state. Use that to disable the premium experience without
 * touching the database (e.g. if Sonnet is broken).
 *
 * MUST be called everywhere the AI generator decides which model to use,
 * and anywhere a premium feature is gated. Don't read `subscriptions.status`
 * directly elsewhere — go through this helper so the kill-switch is honored.
 */
export async function getUserTier(userId: string): Promise<UserTier> {
  if (!features.premiumPersonalizedProtocolEnabled) {
    return 'free'
  }

  const supabase = await createClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sub) return 'free'
  return subscriptionStatusIsPremium(sub.status) ? 'premium' : 'free'
}
