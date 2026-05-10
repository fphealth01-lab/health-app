'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'
const CONSENT_KEY = 'lyvewell_cookies_accepted'

function initPostHog() {
  if (!POSTHOG_KEY || posthog.__loaded) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    capture_pageview: false, // handled manually in PostHogPageView
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-mask]',
    },
    respect_dnt: true,
    loaded: (client) => {
      if (process.env.NODE_ENV === 'development') {
        // Don't pollute analytics with dev traffic
        client.opt_out_capturing()
      }
    },
  })
}

/**
 * Wraps the app in PostHog's React context.
 *
 * Only initialises PostHog after the user has accepted the cookie banner
 * (consent stored as `lyvewell_cookies_accepted=true` in localStorage).
 * Listens for the synthetic `storage` event that the cookie banner fires
 * when the user accepts mid-session.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [hasConsent, setHasConsent] = useState(false)

  // Check consent on first render
  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_KEY) === 'true') {
        setHasConsent(true)
        initPostHog()
      }
    } catch {
      // localStorage unavailable — skip tracking
    }
  }, [])

  // Re-check consent whenever the storage event fires (cookie banner accept)
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CONSENT_KEY && event.newValue === 'true') {
        setHasConsent(true)
        initPostHog()
      }

      // Also handle the synthetic event dispatched by the cookie banner
      // (window.dispatchEvent(new StorageEvent('storage', ...)))
      if (!event.key && localStorage.getItem(CONSENT_KEY) === 'true') {
        setHasConsent(true)
        initPostHog()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  if (!hasConsent) return <>{children}</>

  return <PHProvider client={posthog}>{children}</PHProvider>
}

/**
 * Fires a `$pageview` event on every client-side navigation.
 * Must be wrapped in <Suspense> at the call site because it uses
 * useSearchParams() which opts the component out of static rendering.
 */
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return

    let url = window.location.origin + pathname
    const queryString = searchParams?.toString()
    if (queryString) {
      url = `${url}?${queryString}`
    }

    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}
