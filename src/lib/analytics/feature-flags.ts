'use client'

// Use for A/B tests post-launch. Configure flags in PostHog dashboard.
import posthog from 'posthog-js'

/**
 * Returns whether a feature flag is enabled for the current user.
 * Returns false if PostHog hasn't been initialised yet (e.g. before consent).
 *
 * Example:
 *   if (isFeatureEnabled('new-onboarding-flow')) { ... }
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (!posthog.__loaded) return false
  return posthog.isFeatureEnabled(flagKey) ?? false
}
