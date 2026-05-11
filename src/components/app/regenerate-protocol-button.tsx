'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { regenerateProtocol } from '@/lib/actions/regenerate-protocol'

interface RegenerateProtocolButtonProps {
  /** Free users have a 24h cooldown — pass remaining ms to disable the button. */
  cooldownRemainingMs?: number
  tier: 'free' | 'premium'
}

function formatCooldown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60_000)
  if (totalMinutes >= 60) {
    const hours = Math.ceil(totalMinutes / 60)
    return `${hours}h`
  }
  return `${totalMinutes}m`
}

export function RegenerateProtocolButton({
  cooldownRemainingMs = 0,
  tier,
}: RegenerateProtocolButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onCooldown = tier === 'free' && cooldownRemainingMs > 0

  function onConfirm() {
    startTransition(async () => {
      const result = await regenerateProtocol()
      if (!result.ok) {
        toast.error(result.error)
        if (result.cooldownRemainingMs) {
          setOpen(false)
        }
        return
      }
      toast.success('Your protocol has been refreshed.')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={onCooldown}
        title={
          onCooldown
            ? `Free plan can regenerate again in ${formatCooldown(cooldownRemainingMs)}.`
            : undefined
        }
      >
        <RefreshCw className="h-4 w-4" />
        Regenerate
        {onCooldown && (
          <span className="text-muted-foreground ml-1 text-xs font-normal">
            · {formatCooldown(cooldownRemainingMs)} left
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary h-4 w-4" aria-hidden />
              Regenerate your protocol?
            </DialogTitle>
            <DialogDescription>
              This will replace your current protocol with a fresh personalized stack
              based on your latest profile. Your tracking history is unaffected.
              {tier === 'free' && (
                <span className="text-muted-foreground mt-2 block text-xs">
                  Free plan: one regeneration per 24 hours. Premium is unlimited.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirm} disabled={isPending}>
              {isPending ? 'Generating…' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
