import 'server-only'

import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

/**
 * Returns a singleton PostHog server client.
 * Returns null if NEXT_PUBLIC_POSTHOG_KEY is not set (e.g. local dev without env var).
 */
function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      // In serverless, send immediately rather than batching
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogClient
}

/**
 * Captures a server-side analytics event and flushes immediately.
 *
 * Use this from Server Actions, API routes, and webhooks. It creates the
 * PostHog client as a singleton (safe for serverless warm re-use), captures
 * the event, then calls flushAsync() to guarantee delivery before the
 * function exits.
 *
 * Never include raw PII in `properties` — use bucketed values (age_bucket
 * instead of age, tier instead of email, etc.).
 */
export async function captureServerEvent({
  userId,
  event,
  properties = {},
}: {
  userId: string
  event: string
  properties?: Record<string, unknown>
}): Promise<void> {
  if (process.env.NODE_ENV === 'development') return

  const client = getPostHogClient()
  if (!client) return

  try {
    client.capture({
      distinctId: userId,
      event,
      properties,
    })

    // flush() sends queued events without destroying the client,
    // which is critical in serverless where the process may exit immediately.
    await client.flush()
  } catch (err) {
    // Analytics must never break the main flow — log and continue
    console.error('[posthog-server] captureServerEvent failed:', err)
  }
}
