'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { Lock, Sparkles, UtensilsCrossed, ShoppingCart, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// ── Sample data (free tier hardcoded preview) ─────────────────────────────

const SAMPLE_DAY_1 = [
  {
    meal_type: 'breakfast',
    name: 'Greek Yogurt Power Bowl',
    description: 'Creamy Greek yogurt with berries, granola, and a drizzle of honey',
    calories: 420,
    protein_g: 28,
    carbs_g: 52,
    fat_g: 10,
    prep_time_minutes: 5,
    label: 'Breakfast',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    meal_type: 'snack_am',
    name: 'Almond & Apple Snack',
    description: '1 medium apple with 2 tbsp almond butter for sustained energy',
    calories: 210,
    protein_g: 5,
    carbs_g: 27,
    fat_g: 11,
    prep_time_minutes: 2,
    label: 'Morning Snack',
    color: 'bg-green-50 text-green-700',
  },
  {
    meal_type: 'lunch',
    name: 'Grilled Chicken & Quinoa Bowl',
    description: 'Grilled chicken breast over quinoa with roasted veggies and tahini dressing',
    calories: 520,
    protein_g: 45,
    carbs_g: 48,
    fat_g: 14,
    prep_time_minutes: 25,
    label: 'Lunch',
    color: 'bg-sky-50 text-sky-700',
  },
  {
    meal_type: 'snack_pm',
    name: 'Cottage Cheese & Walnuts',
    description: 'High-protein afternoon snack with healthy fats to power through the day',
    calories: 190,
    protein_g: 16,
    carbs_g: 8,
    fat_g: 11,
    prep_time_minutes: 3,
    label: 'Afternoon Snack',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    meal_type: 'dinner',
    name: 'Salmon with Roasted Asparagus',
    description: 'Pan-seared salmon fillet with lemon garlic asparagus and brown rice',
    calories: 580,
    protein_g: 42,
    carbs_g: 35,
    fat_g: 22,
    prep_time_minutes: 30,
    label: 'Dinner',
    color: 'bg-rose-50 text-rose-700',
  },
]

const SAMPLE_DAYS_BLURRED = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SAMPLE_SHOPPING_PREVIEW = [
  'Greek yogurt (1kg)',
  'Blueberries (400g)',
  'Granola (300g)',
  'Chicken breast (800g)',
  'Quinoa (500g)',
  'Salmon fillets (4×150g)',
]

// ── Components ────────────────────────────────────────────────────────────

function SampleMealCard({ meal }: { meal: (typeof SAMPLE_DAY_1)[number] }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="relative h-28 overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${meal.name.slice(0, 20)}/400/200`}
          alt={meal.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Badge
          variant="outline"
          className={`absolute bottom-2 left-2 text-xs border ${meal.color}`}
        >
          {meal.label}
        </Badge>
      </div>
      <div className="p-3 space-y-1.5">
        <p className="font-semibold text-sm">{meal.name}</p>
        <p className="text-muted-foreground text-xs line-clamp-2">{meal.description}</p>
        <div className="flex items-center gap-2 text-xs pt-0.5">
          <span className="font-medium">{meal.calories} kcal</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">P: {meal.protein_g}g</span>
          <span className="text-muted-foreground">C: {meal.carbs_g}g</span>
          <span className="text-muted-foreground">F: {meal.fat_g}g</span>
        </div>
      </div>
    </div>
  )
}

export function MealPlanPaywall() {
  // Track that a free user saw this paywall
  useEffect(() => {
    if (posthog.__loaded) {
      posthog.capture('paywall_viewed', { feature: 'meal_plan' })
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 dark:bg-teal-950">
          <UtensilsCrossed className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
            Premium Feature
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Your 7-Day Meal Plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Personalized meals tailored to your goal, supplement protocol, and dietary preferences.
          Here&apos;s a sample of what you&apos;d get:
        </p>
      </div>

      {/* Day 1 — fully visible sample */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Monday</h2>
          <Badge variant="secondary">Preview</Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            1,920 kcal · 136g protein
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_DAY_1.map((meal) => (
            <SampleMealCard key={meal.meal_type} meal={meal} />
          ))}
        </div>
      </div>

      {/* Days 2-7 blurred */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 blur-sm pointer-events-none select-none" aria-hidden>
          {SAMPLE_DAYS_BLURRED.map((day) => (
            <div key={day} className="rounded-xl border bg-card p-4 space-y-3 h-40">
              <div className="font-semibold text-sm">{day}</div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-neutral-200 dark:bg-neutral-700 w-3/4" />
                <div className="h-3 rounded bg-neutral-200 dark:bg-neutral-700 w-1/2" />
                <div className="h-3 rounded bg-neutral-200 dark:bg-neutral-700 w-2/3" />
                <div className="h-3 rounded bg-neutral-200 dark:bg-neutral-700 w-3/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl border shadow-lg p-6 text-center max-w-sm mx-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950 mx-auto mb-3">
              <Lock className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-base mb-1">Unlock the full 7 days</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Plus shopping list, meal swaps, and 4 regenerations per week.
            </p>
            <Button asChild className="w-full">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Shopping list preview */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-4 w-4 text-teal-600" />
          <h3 className="font-semibold text-sm">Shopping list preview</h3>
          <Badge variant="outline" className="text-xs">Week 1 sample</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {SAMPLE_SHOPPING_PREVIEW.map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 rounded border border-neutral-300 shrink-0" />
              {item}
            </div>
          ))}
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Lock className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="italic">+ 40 more items (premium only)</span>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="rounded-2xl border bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 p-6">
        <h3 className="font-semibold mb-4 text-center">Everything you get with Premium</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { icon: '🥗', text: '35 meals per week (7 days × 5 meals)' },
            { icon: '🧪', text: 'Meals timed around your supplement protocol' },
            { icon: '🛒', text: 'Auto-aggregated weekly shopping list' },
            { icon: RefreshCw, text: '4 regenerations per week' },
            { icon: '📊', text: 'Full macros: calories, protein, carbs, fat' },
            { icon: '🔄', text: 'Swap any meal with one tap' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <span className="text-lg">{typeof f.icon === 'string' ? f.icon : '🔄'}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
