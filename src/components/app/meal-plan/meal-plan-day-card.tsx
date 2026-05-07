'use client'

import { MealCard } from './meal-card'
import type { MealPlanItemRow } from '@/lib/db/meal-plan-db'

interface MealPlanDayCardProps {
  dayOfWeek: number
  meals: MealPlanItemRow[]
  isPremium: boolean
  swappingMealId: string | null
  onSwap: (mealId: string) => void
}

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_ORDER: Record<string, number> = {
  breakfast: 1,
  snack_am: 2,
  lunch: 3,
  snack_pm: 4,
  dinner: 5,
}

export function MealPlanDayCard({
  dayOfWeek,
  meals,
  isPremium,
  swappingMealId,
  onSwap,
}: MealPlanDayCardProps) {
  const sortedMeals = [...meals].sort(
    (a, b) => (MEAL_ORDER[a.meal_type] ?? 99) - (MEAL_ORDER[b.meal_type] ?? 99),
  )

  const totalCalories = sortedMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0)
  const totalProtein = sortedMeals.reduce((sum, m) => sum + (m.protein_g ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-lg font-semibold">{DAY_NAMES[dayOfWeek] ?? `Day ${dayOfWeek}`}</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {sortedMeals.length} meals · {totalCalories} kcal · {totalProtein}g protein
          </p>
        </div>
        <span className="text-3xl font-bold text-neutral-100 dark:text-neutral-800 select-none">
          {dayOfWeek}
        </span>
      </div>

      {/* Meal grid */}
      {sortedMeals.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No meals found for this day.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 print:grid-cols-2">
          {sortedMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isPremium={isPremium}
              onSwap={isPremium ? onSwap : undefined}
              isSwapping={swappingMealId === meal.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
