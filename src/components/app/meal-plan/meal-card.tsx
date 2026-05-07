'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, RefreshCw, Clock, Flame, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MealPlanItemRow } from '@/lib/db/meal-plan-db'

interface MealCardProps {
  meal: MealPlanItemRow
  isPremium: boolean
  onSwap?: (mealId: string) => void
  isSwapping?: boolean
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  snack_am: 'Morning Snack',
  lunch: 'Lunch',
  snack_pm: 'Afternoon Snack',
  dinner: 'Dinner',
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
  snack_am: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
  lunch: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300',
  snack_pm: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  dinner: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
}

type Ingredient = { name: string; quantity: string; unit: string }

export function MealCard({ meal, isPremium, onSwap, isSwapping }: MealCardProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const [showIngredients, setShowIngredients] = useState(false)

  const ingredients = Array.isArray(meal.ingredients)
    ? (meal.ingredients as unknown as Ingredient[])
    : []

  const imageSeed = meal.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)

  return (
    <div className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-sm">
      {/* Meal image */}
      <div className="relative h-32 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${imageSeed}/400/200`}
          alt={meal.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium border',
              MEAL_TYPE_COLORS[meal.meal_type] ?? 'bg-neutral-50',
            )}
          >
            {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
          </Badge>
          {meal.prep_time_minutes && (
            <span className="flex items-center gap-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {meal.prep_time_minutes}m
            </span>
          )}
        </div>
      </div>

      {/* Meal details */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-snug">{meal.name}</h3>
        {meal.description && (
          <p className="text-muted-foreground text-xs line-clamp-2">{meal.description}</p>
        )}

        {/* Macros row */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-medium">
            <Flame className="h-3 w-3 text-orange-500" />
            {meal.calories ?? '—'} kcal
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Dumbbell className="h-3 w-3 text-teal-500" />
            P: {meal.protein_g ?? '—'}g
          </span>
          <span className="text-muted-foreground">C: {meal.carbs_g ?? '—'}g</span>
          <span className="text-muted-foreground">F: {meal.fat_g ?? '—'}g</span>
        </div>

        {/* Expandable sections */}
        <div className="space-y-1 pt-1 border-t">
          {/* Ingredients */}
          <button
            onClick={() => setShowIngredients((v) => !v)}
            className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <span>Ingredients ({ingredients.length})</span>
            {showIngredients ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showIngredients && ingredients.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground pb-1">
              {ingredients.map((ing, i) => (
                <li key={i} className="truncate">
                  • {ing.quantity} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          )}

          {/* Why this meal */}
          {meal.reasoning && (
            <>
              <button
                onClick={() => setShowReasoning((v) => !v)}
                className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <span>Why this?</span>
                {showReasoning ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {showReasoning && (
                <p className="text-xs text-muted-foreground italic pb-1">{meal.reasoning}</p>
              )}
            </>
          )}
        </div>

        {/* Swap button (premium only) */}
        {isPremium && onSwap && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSwap(meal.id)}
            disabled={isSwapping}
            className="w-full h-7 text-xs mt-1"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1.5', isSwapping && 'animate-spin')} />
            {isSwapping ? 'Finding alternative…' : 'Swap meal'}
          </Button>
        )}
      </div>
    </div>
  )
}
