'use client'

import { useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

/**
 * Opens a Stripe Billing Portal session for the current user. The portal
 * is the canonical place to cancel, swap plans, update card, see invoices,
 * etc. — keeping that logic in Stripe means we don't have to rebuild it.
 */
export function ManageSubscriptionButton({
  variant = 'default',
  size = 'default',
  className,
  children,
}: {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = await response.json().catch(() => ({}) as Record<string, unknown>)
      if (!response.ok) {
        toast.error(
          typeof payload.error === 'string'
            ? payload.error
            : 'Could not open the billing portal.',
        )
        return
      }
      if (typeof payload.url === 'string') {
        window.location.href = payload.url
      }
    } catch (err) {
      console.error('[manage-subscription] portal error:', err)
      toast.error('Network error. Try again in a moment.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Opening…
        </>
      ) : (
        <>
          {children ?? 'Manage subscription'}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </>
      )}
    </Button>
  )
}
