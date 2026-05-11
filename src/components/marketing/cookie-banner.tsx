'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'lyvewell_cookies_accepted'

/**
 * Soft cookie consent banner that appears on first visit.
 * Persists acceptance to localStorage so it stays hidden on return visits.
 * Not shown when preference is already stored.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      if (!accepted) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable (private browsing with strict settings) — hide banner
    }
  }, [])

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
      // Notify PostHogProvider (and any other listeners) that consent was granted.
      // We dispatch a real StorageEvent so the provider's storage listener fires
      // even in the same tab (native storage events don't fire for the origin tab).
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'true' }),
      )
    } catch {
      // silent — banner will reappear next visit, which is acceptable
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          We use cookies to keep you logged in and understand how the app is used. Essential cookies
          are always active.{' '}
          <Link
            href="/legal/cookies"
            className="font-medium text-teal-600 underline underline-offset-2 hover:text-teal-700"
          >
            Learn more
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
