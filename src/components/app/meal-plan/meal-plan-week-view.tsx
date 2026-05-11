'use client'

import { useState } from 'react'
import { Printer, ShoppingCart, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MealPlanDayCard } from './meal-plan-day-card'
import { ShoppingListSidebar } from './shopping-list-sidebar'
import { RegenerateButton } from './regenerate-button'
import { SwapMealModal } from './swap-meal-modal'
import type { MealPlanWithItems, MealPlanItemRow } from '@/lib/db/meal-plan-db'

interface MealPlanWeekViewProps {
  plan: MealPlanWithItems
  remainingRegenerations: number
  onRegenerate: () => void
  isRegenerating: boolean
}

const SHORT_DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type ShoppingItem = { item: string; quantity: string; category: string }

export function MealPlanWeekView({
  plan,
  remainingRegenerations,
  onRegenerate,
  isRegenerating,
}: MealPlanWeekViewProps) {
  const [activeDay, setActiveDay] = useState('1')
  const [items, setItems] = useState<MealPlanItemRow[]>(plan.items)
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null)
  const [swapModalMeal, setSwapModalMeal] = useState<MealPlanItemRow | null>(null)

  // Group items by day
  const byDay = new Map<number, MealPlanItemRow[]>()
  for (let d = 1; d <= 7; d++) byDay.set(d, [])
  for (const item of items) {
    const dayList = byDay.get(item.day_of_week)
    if (dayList) dayList.push(item)
  }

  const shoppingList = Array.isArray(plan.shopping_list)
    ? (plan.shopping_list as unknown as ShoppingItem[])
    : []

  function handleSwapClick(mealId: string) {
    const meal = items.find((m) => m.id === mealId) ?? null
    setSwapModalMeal(meal)
    setSwappingMealId(mealId)
  }

  function handleSwapped(updatedItem: MealPlanItemRow) {
    setItems((prev) => prev.map((m) => (m.id === updatedItem.id ? updatedItem : m)))
    setSwappingMealId(null)
    setSwapModalMeal(null)
  }

  function handleSwapModalClose(open: boolean) {
    if (!open) {
      setSwapModalMeal(null)
      setSwappingMealId(null)
    }
  }

  const weekLabel = plan.week_start_date
    ? new Date(plan.week_start_date + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
      })
    : 'This week'

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full min-h-0">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Meal Plan</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Week of {weekLabel}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <RegenerateButton
              remainingRegenerations={remainingRegenerations}
              onRegenerate={onRegenerate}
              isLoading={isRegenerating}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 gap-1.5 px-3"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
            {/* Shopping list button — mobile only */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3 lg:hidden">
                  <ShoppingCart className="h-4 w-4" />
                  <span>List</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 flex flex-col">
                <SheetHeader className="sr-only">
                  <SheetTitle>Shopping List</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  <ShoppingListSidebar items={shoppingList} planId={plan.id} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* AI reasoning */}
        {plan.ai_reasoning && (
          <div className="mx-4 mt-3 mb-1 flex gap-2 rounded-xl bg-teal-50 dark:bg-teal-950 p-3 print:hidden">
            <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
            <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">
              {plan.ai_reasoning}
            </p>
          </div>
        )}

        {/* Day tabs */}
        <Tabs value={activeDay} onValueChange={setActiveDay} className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-3">
            <TabsList className="w-full grid grid-cols-7 h-11">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                <TabsTrigger key={day} value={String(day)} className="text-xs px-0.5">
                  {SHORT_DAY_NAMES[day]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Print header (only shows in print mode) */}
          <div className="hidden print:block px-4 py-3 border-b">
            <h1 className="text-xl font-bold">7-Day Meal Plan — Week of {weekLabel}</h1>
            {plan.ai_reasoning && (
              <p className="text-sm mt-1 text-gray-600">{plan.ai_reasoning}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
              <TabsContent
                key={day}
                value={String(day)}
                className="px-4 pb-6 pt-3 m-0 print:block print:page-break-after-auto"
              >
                <MealPlanDayCard
                  dayOfWeek={day}
                  meals={byDay.get(day) ?? []}
                  isPremium={true}
                  swappingMealId={swappingMealId}
                  onSwap={handleSwapClick}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Shopping list sidebar — desktop only */}
      <div className="hidden lg:flex w-72 shrink-0 border-l flex-col">
        <ShoppingListSidebar items={shoppingList} planId={plan.id} />
      </div>

      {/* Swap meal modal */}
      <SwapMealModal
        meal={swapModalMeal}
        open={swapModalMeal !== null}
        onOpenChange={handleSwapModalClose}
        onSwapped={handleSwapped}
      />
    </div>
  )
}
