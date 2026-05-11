'use client'

import React, { useState, useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { swapMeal } from '@/lib/actions/meal-plan'
import type { MealPlanItemRow } from '@/lib/db/meal-plan-db'

interface SwapMealModalProps {
  meal: MealPlanItemRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwapped: (updatedItem: MealPlanItemRow) => void
}

export function SwapMealModal({ meal, open, onOpenChange, onSwapped }: SwapMealModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSwap() {
    if (!meal) return
    setError(null)

    startTransition(async () => {
      try {
        const updated = await swapMeal(meal.id, reason.trim() || undefined)
        onSwapped(updated)
        onOpenChange(false)
        setReason('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to swap meal. Please try again.')
      }
    })
  }

  function handleClose(open: boolean) {
    if (!isPending) {
      onOpenChange(open)
      if (!open) setReason('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap meal</DialogTitle>
          <DialogDescription>
            {meal ? (
              <>
                Replace <strong>&quot;{meal.name}&quot;</strong> with a personalized alternative.
                Optionally tell us why for a better match.
              </>
            ) : (
              'Generate an alternative meal.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="swap-reason">Reason (optional)</Label>
            <Textarea
              id="swap-reason"
              placeholder="e.g. don't like eggs, need something quicker, want more protein…"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              disabled={isPending}
              rows={3}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

          {isPending && (
            <div className="rounded-lg bg-teal-50 p-4 text-center dark:bg-teal-950">
              <RefreshCw className="mx-auto h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="mt-2 text-sm font-medium text-teal-700 dark:text-teal-300">
                Finding a great alternative…
              </p>
              <p className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-0.5">
                This takes about 5–10 seconds
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSwap}
              disabled={isPending || !meal}
              className="flex-1"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
              Swap meal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
