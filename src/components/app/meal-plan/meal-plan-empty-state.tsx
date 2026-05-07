'use client'

import { UtensilsCrossed, Sparkles, Clock, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MealPlanEmptyStateProps {
  onGenerate: () => void
  isLoading?: boolean
  goal?: string | null
}

export function MealPlanEmptyState({ onGenerate, isLoading, goal }: MealPlanEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950">
        <UtensilsCrossed className="h-10 w-10 text-teal-600 dark:text-teal-400" />
      </div>

      <h2 className="text-2xl font-semibold mb-3">Your meal plan awaits</h2>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        {goal
          ? `Generate a personalized 7-day meal plan optimized for your ${goal} goal — with macros, recipes, and a complete shopping list.`
          : 'Generate a personalized 7-day meal plan with macros, recipes, and a complete shopping list — all tailored to your health profile.'}
      </p>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 gap-3 w-full mb-8 text-left">
        {[
          {
            icon: Sparkles,
            title: '35 personalized meals',
            desc: 'Breakfast, snacks, lunch & dinner — all 7 days',
          },
          {
            icon: Clock,
            title: 'Quick & practical',
            desc: 'Realistic prep times you can actually stick to',
          },
          {
            icon: ShoppingCart,
            title: 'Auto shopping list',
            desc: 'Aggregated across the full week, grouped by category',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border bg-card p-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950">
              <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full max-w-xs h-12 text-base"
      >
        {isLoading ? (
          <>Generating your plan…</>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate my meal plan
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-3">Takes 30–60 seconds · Updated weekly</p>
    </div>
  )
}
