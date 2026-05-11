'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MESSAGES = [
  'Analyzing your goal and protocol…',
  'Crafting nutrient-dense meals…',
  'Calculating your weekly macros…',
  'Pairing meals with your supplement timing…',
  'Building your shopping list…',
  'Finalizing your 7-day plan…',
]

interface MealPlanLoadingProps {
  onCancel?: () => void
}

export function MealPlanLoading({ onCancel }: MealPlanLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [showLongWait, setShowLongWait] = useState(false)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length)
    }, 6000)
    return () => clearInterval(msgInterval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1
        if (next >= 60) setShowLongWait(true)
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const estimatedTotal = 45
  const progress = Math.min((elapsed / estimatedTotal) * 100, 95)

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      {/* Animated spinner */}
      <div className="relative mb-8">
        <div className="h-20 w-20 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Creating your meal plan</h2>
      <p className="text-muted-foreground text-sm mb-6 min-h-[1.25rem]">
        {MESSAGES[messageIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {elapsed < estimatedTotal
            ? `~${Math.max(0, estimatedTotal - elapsed)}s remaining`
            : 'Almost there…'}
        </p>
      </div>

      {/* Skeleton grid */}
      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 opacity-40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-neutral-100 dark:bg-neutral-800 animate-pulse h-32"
          />
        ))}
      </div>

      {/* Long-wait message */}
      {showLongWait && (
        <div className="mt-8 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            Hmm, taking longer than usual. Generating 35 meals with full nutrition data…
          </p>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel and try again later
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
