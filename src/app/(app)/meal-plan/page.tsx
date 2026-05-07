import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { features } from '@/config/features'
import { getMealPlanForWeek, getRemainingRegenerations, getWeekStart } from '@/lib/db/meal-plan-db'
import { MealPlanPaywall } from '@/components/app/meal-plan/meal-plan-paywall'
import { MealPlanClient } from '@/components/app/meal-plan/meal-plan-client'

export const metadata: Metadata = { title: 'Meal Plan' }

export default async function MealPlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!features.mealPlanEnabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-4">
        <h1 className="text-2xl font-semibold">Meal Plan coming soon</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          We&apos;re putting the finishing touches on your personalized meal planner. Check back
          shortly.
        </p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('primary_goal, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const tier = await getUserTier(user.id)
  const isPremium = tier === 'premium' && features.premiumMealPlanEnabled

  // Free users: show the paywall
  if (!isPremium) {
    return (
      <div className="overflow-y-auto">
        <MealPlanPaywall />
      </div>
    )
  }

  // Premium users: check for existing plan this week
  const weekStartDate = getWeekStart()
  const [existingPlan, remainingRegenerations] = await Promise.all([
    getMealPlanForWeek(user.id, weekStartDate),
    getRemainingRegenerations(user.id),
  ])

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">
      <MealPlanClient
        initialPlan={existingPlan}
        initialRemainingRegenerations={remainingRegenerations}
        goal={profile?.primary_goal ?? null}
      />
    </div>
  )
}
