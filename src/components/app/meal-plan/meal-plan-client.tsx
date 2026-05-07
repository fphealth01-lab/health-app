'use client'

import { useState, useTransition } from 'react'
import { MealPlanEmptyState } from './meal-plan-empty-state'
import { MealPlanLoading } from './meal-plan-loading'
import { MealPlanWeekView } from './meal-plan-week-view'
import { generateOrGetCurrentPlan, regenerateCurrentPlan } from '@/lib/actions/meal-plan'
import type { MealPlanWithItems } from '@/lib/db/meal-plan-db'

interface MealPlanClientProps {
  initialPlan: MealPlanWithItems | null
  initialRemainingRegenerations: number
  goal: string | null
}

export function MealPlanClient({
  initialPlan,
  initialRemainingRegenerations,
  goal,
}: MealPlanClientProps) {
  const [plan, setPlan] = useState<MealPlanWithItems | null>(initialPlan)
  const [remainingRegenerations, setRemainingRegenerations] = useState(
    initialRemainingRegenerations,
  )
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, startGenerate] = useTransition()
  const [isRegenerating, startRegenerate] = useTransition()

  function handleGenerate() {
    setError(null)
    startGenerate(async () => {
      try {
        const result = await generateOrGetCurrentPlan()
        if (result.plan) {
          setPlan(result.plan)
          setRemainingRegenerations(result.remainingRegenerations)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate meal plan. Please try again.',
        )
      }
    })
  }

  function handleRegenerate() {
    setError(null)
    startRegenerate(async () => {
      try {
        const result = await regenerateCurrentPlan()
        setPlan(result.plan)
        setRemainingRegenerations(result.remainingRegenerations)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to regenerate meal plan. Please try again.',
        )
      }
    })
  }

  // Show loading screen during initial generation
  if (isGenerating) {
    return <MealPlanLoading />
  }

  // Show loading screen during regeneration (full page for consistency)
  if (isRegenerating) {
    return <MealPlanLoading />
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="rounded-xl bg-destructive/10 p-6 max-w-md">
          <p className="font-medium text-destructive mb-1">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              if (!plan) handleGenerate()
            }}
            className="text-sm underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // No plan yet: show empty state
  if (!plan) {
    return (
      <MealPlanEmptyState
        onGenerate={handleGenerate}
        isLoading={isGenerating}
        goal={goal}
      />
    )
  }

  // Full plan view
  return (
    <MealPlanWeekView
      plan={plan}
      remainingRegenerations={remainingRegenerations}
      onRegenerate={handleRegenerate}
      isRegenerating={isRegenerating}
    />
  )
}
