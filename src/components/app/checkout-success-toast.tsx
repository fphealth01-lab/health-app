'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Listens for `?checkout=success` on the dashboard. If present:
 *   1. Show a celebratory toast.
 *   2. Strip the query param via router.replace so a refresh doesn't
 *      re-fire the toast.
 *
 * Mounted unconditionally on the dashboard — the effect is a no-op when
 * the param isn't there.
 */
export function CheckoutSuccessToast() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasShown = useRef(false)

  useEffect(() => {
    if (hasShown.current) return
    if (searchParams.get('checkout') !== 'success') return
    hasShown.current = true

    toast.success('Welcome to Premium!', {
      description:
        'Regenerate your protocol to unlock 5–7 personalized supplements and detailed reasoning.',
      duration: 8000,
    })

    // Clear the query param so refreshing doesn't re-fire the toast.
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.delete('checkout')
    const query = params.toString()
    router.replace(query ? `/dashboard?${query}` : '/dashboard', { scroll: false })
  }, [router, searchParams])

  return null
}
