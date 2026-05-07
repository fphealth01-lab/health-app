'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateMealPlan, generateSingleMeal } from '@/lib/ai/meal-plan-generator'
import type { MealPlanProfile } from '@/lib/ai/meal-plan-generator'
import {
  getMealPlanForWeek,
  saveMealPlan,
  replaceMealItem,
  getRemainingRegenerations,
  incrementRegenerationCount,
  logMealPlanGeneration,
  getWeekStart,
  type MealPlanWithItems,
} from '@/lib/db/meal-plan-db'
import { features } from '@/config/features'

// ── Profile loader ─────────────────────────────────────────────────────────

async function loadProfile(userId: string): Promise<MealPlanProfile> {
  const admin = createAdminClient()

  const [profileResult, protocolResult] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'primary_goal, sex, age, activity_level, dietary_preference, medical_conditions',
      )
      .eq('id', userId)
      .maybeSingle(),
    admin
      .from('protocols')
      .select(`
        protocol_items (
          dose_mg,
          dose_unit,
          timing,
          supplements ( slug )
        )
      `)
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const currentProtocol = (protocolResult.data?.protocol_items ?? [])
    .map((item) => ({
      slug: item.supplements?.slug ?? '',
      timing: item.timing,
      dose_mg: item.dose_mg,
      dose_unit: item.dose_unit,
    }))
    .filter((item) => item.slug)

  return {
    primary_goal: profile?.primary_goal ?? 'general health',
    sex: profile?.sex ?? 'not specified',
    age: profile?.age ?? 30,
    activity_level: profile?.activity_level ?? 'moderate',
    dietary_preference: profile?.dietary_preference ?? 'omnivore',
    medical_conditions: profile?.medical_conditions ?? [],
    current_protocol: currentProtocol,
  }
}

// ── Actions ────────────────────────────────────────────────────────────────

/**
 * Gets the current week's meal plan if it exists, or generates a new one.
 * Free users get null (use the hardcoded sample in the UI).
 * Premium users get a generated plan or their cached one.
 */
export async function generateOrGetCurrentPlan(): Promise<{
  plan: MealPlanWithItems | null
  isPremium: boolean
  remainingRegenerations: number
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tier = await getUserTier(user.id)
  const isPremium = tier === 'premium' && features.premiumMealPlanEnabled

  if (!isPremium) {
    return { plan: null, isPremium: false, remainingRegenerations: 0 }
  }

  const weekStartDate = getWeekStart()

  // Return cached plan for this week if it exists
  const existing = await getMealPlanForWeek(user.id, weekStartDate)
  if (existing) {
    const remaining = await getRemainingRegenerations(user.id)
    return { plan: existing, isPremium: true, remainingRegenerations: remaining }
  }

  // Generate a new plan
  const profile = await loadProfile(user.id)
  const { plan: generatedPlan, meta } = await generateMealPlan({
    userId: user.id,
    profile,
    weekStartDate,
  })

  const savedPlan = await saveMealPlan(user.id, weekStartDate, generatedPlan, meta, {
    goal: profile.primary_goal,
    dietary_preference: profile.dietary_preference,
  })

  await logMealPlanGeneration({ userId: user.id, mealPlanId: savedPlan.id, meta })

  const remaining = await getRemainingRegenerations(user.id)
  return { plan: savedPlan, isPremium: true, remainingRegenerations: remaining }
}

/**
 * Regenerates the current week's plan (premium only, rate limited to 4/week).
 */
export async function regenerateCurrentPlan(): Promise<{
  plan: MealPlanWithItems
  remainingRegenerations: number
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tier = await getUserTier(user.id)
  if (tier !== 'premium' || !features.premiumMealPlanEnabled) {
    throw new Error('Premium subscription required to regenerate meal plans.')
  }

  // Check rate limit
  const remaining = await getRemainingRegenerations(user.id)
  if (remaining <= 0) {
    throw new Error('You have used all 4 regenerations for this week. Try again next Monday.')
  }

  const weekStartDate = getWeekStart()
  const profile = await loadProfile(user.id)

  const { plan: generatedPlan, meta } = await generateMealPlan({
    userId: user.id,
    profile,
    weekStartDate,
  })

  const savedPlan = await saveMealPlan(user.id, weekStartDate, generatedPlan, meta, {
    goal: profile.primary_goal,
    dietary_preference: profile.dietary_preference,
  })

  await logMealPlanGeneration({ userId: user.id, mealPlanId: savedPlan.id, meta })

  // Count this as a regeneration
  const newRemaining = await incrementRegenerationCount(user.id)

  return { plan: savedPlan, remainingRegenerations: newRemaining }
}

/**
 * Returns regenerations remaining this week for the current user.
 */
export async function fetchRemainingRegenerations(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  return getRemainingRegenerations(user.id)
}

/**
 * Swaps a single meal with an AI-generated alternative (premium only).
 * Returns the updated meal item.
 */
export async function swapMeal(
  mealItemId: string,
  reason?: string,
): Promise<import('@/lib/db/meal-plan-db').MealPlanItemRow> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tier = await getUserTier(user.id)
  if (tier !== 'premium' || !features.premiumMealPlanEnabled) {
    throw new Error('Premium subscription required to swap meals.')
  }

  // Verify the meal item belongs to this user
  const admin = createAdminClient()
  const { data: item } = await admin
    .from('meal_plan_items')
    .select(`
      id,
      meal_type,
      day_of_week,
      name,
      meal_plan_id,
      meal_plans!inner ( user_id )
    `)
    .eq('id', mealItemId)
    .maybeSingle()

  const mealPlan = item?.meal_plans as { user_id: string } | null
  if (!item || !mealPlan || mealPlan.user_id !== user.id) {
    throw new Error('Meal item not found or unauthorized.')
  }

  const profile = await loadProfile(user.id)

  const newMeal = await generateSingleMeal({
    profile,
    mealType: item.meal_type,
    dayOfWeek: item.day_of_week,
    currentMealName: item.name,
    reason,
  })

  return replaceMealItem(mealItemId, newMeal)
}
