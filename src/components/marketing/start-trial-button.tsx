'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface StartTrialButtonProps {
  /**
   * Stripe price id to start checkout with. We accept the value rather than
   * looking it up from env so the same button works for the "Monthly" CTA on
   * the reveal screen and the "Yearly" CTA in upgrade banners.
   */
  priceId: string
  /** Where to send a logged-out clicker. Defaults to /signup with a resume hint. */
  loggedOutHref?: string
  /** Whether the user is signed in. The server-rendered parent decides. */
  isAuthenticated: boolean
  /** Visual variant + size pass-through. */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children: ReactNode
}

/**
 * Single-click "start trial" button that POSTs to /api/stripe/checkout and
 * redirects to the returned Stripe URL. Logged-out users get bounced to
 * /signup with a `next=…&plan=monthly` resume hint.
 */
export function StartTrialButton({
  priceId,
  loggedOutHref = '/signup?next=/pricing&plan=monthly',
  isAuthenticated,
  variant = 'default',
  size = 'lg',
  className,
  children,
}: StartTrialButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleClick() {
    if (!isAuthenticated) {
      router.push(loggedOutHref)
      return
    }

    setIsSubmitting(true)
    try {
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
      }
    } catch (err) {
      console.error('[start-trial] checkout error:', err)
      toast.error('Network error. Try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          One moment…
        </>
      ) : (
        children
      )}
    </Button>
  )
}
