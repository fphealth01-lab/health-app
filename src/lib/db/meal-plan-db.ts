import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Tables } from '@/types/database'
import type { GeneratedMealPlan, GeneratedMeal, MealPlanGenerationMeta } from '@/lib/ai/meal-plan-generator'

export type MealPlanRow = Tables<'meal_plans'>
export type MealPlanItemRow = Tables<'meal_plan_items'>

export interface MealPlanWithItems extends MealPlanRow {
  items: MealPlanItemRow[]
}

// ── Rate limit constants ───────────────────────────────────────────────────

export const REGEN_LIMIT_PER_WEEK = 4

// ── Read operations ────────────────────────────────────────────────────────

/**
 * Fetches the meal plan for the current week (Monday-based week start).
 * Returns null if no plan exists yet.
 */
export async function getMealPlanForWeek(
  userId: string,
  weekStartDate: string,
): Promise<MealPlanWithItems | null> {
  const admin = createAdminClient()

  const { data: plan } = await admin
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)
    .maybeSingle()

  if (!plan) return null

  const { data: items } = await admin
    .from('meal_plan_items')
    .select('*')
    .eq('meal_plan_id', plan.id)
    .order('day_of_week', { ascending: true })
    .order('display_order', { ascending: true })

  return { ...plan, items: items ?? [] }
}

/**
 * Returns the user's most recent meal plan (for viewing past plans).
 */
export async function getLatestMealPlan(userId: string): Promise<MealPlanWithItems | null> {
  const admin = createAdminClient()

  const { data: plan } = await admin
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!plan) return null

  const { data: items } = await admin
    .from('meal_plan_items')
    .select('*')
    .eq('meal_plan_id', plan.id)
    .order('day_of_week', { ascending: true })
    .order('display_order', { ascending: true })

  return { ...plan, items: items ?? [] }
}

// ── Write operations ───────────────────────────────────────────────────────

/**
 * Persists a generated meal plan + all items to the database.
 * Uses upsert on (user_id, week_start_date) so regeneration replaces the old plan.
 */
export async function saveMealPlan(
  userId: string,
  weekStartDate: string,
  plan: GeneratedMealPlan,
  meta: MealPlanGenerationMeta,
  profile: { goal: string | null; dietary_preference: string | null },
): Promise<MealPlanWithItems> {
  const admin = createAdminClient()

  // Upsert the plan header
  const { data: savedPlan, error: planError } = await admin
    .from('meal_plans')
    .upsert(
      {
        user_id: userId,
        week_start_date: weekStartDate,
        goal: profile.goal,
        dietary_preference: profile.dietary_preference,
        ai_reasoning: plan.ai_reasoning,
        ai_model: meta.model,
        ai_generated_at: new Date().toISOString(),
        shopping_list: plan.shopping_list as unknown as import('@/types/database').Json,
      },
      { onConflict: 'user_id,week_start_date' },
    )
    .select()
    .single()

  if (planError || !savedPlan) {
    throw new Error(`Failed to save meal plan: ${planError?.message ?? 'unknown'}`)
  }

  // Delete existing items (for regenerate scenario)
  await admin.from('meal_plan_items').delete().eq('meal_plan_id', savedPlan.id)

  // Batch insert all 35 meal items
  const mealTypeOrder: Record<string, number> = {
    breakfast: 1,
    snack_am: 2,
    lunch: 3,
    snack_pm: 4,
    dinner: 5,
  }

  const itemsToInsert = plan.days.flatMap((day) =>
    day.meals.map((meal) => ({
      meal_plan_id: savedPlan.id,
      day_of_week: day.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name,
      description: meal.description,
      ingredients: meal.ingredients as unknown as import('@/types/database').Json,
      prep_time_minutes: meal.prep_time_minutes,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      reasoning: meal.reasoning,
      display_order: mealTypeOrder[meal.meal_type] ?? 99,
    })),
  )

  const { data: savedItems, error: itemsError } = await admin
    .from('meal_plan_items')
    .insert(itemsToInsert)
    .select()

  if (itemsError) {
    throw new Error(`Failed to save meal items: ${itemsError.message}`)
  }

  return { ...savedPlan, items: savedItems ?? [] }
}

/**
 * Replaces a single meal item in the DB (for the Swap feature).
 */
export async function replaceMealItem(
  itemId: string,
  newMeal: GeneratedMeal,
): Promise<MealPlanItemRow> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('meal_plan_items')
    .update({
      name: newMeal.name,
      description: newMeal.description,
      ingredients: newMeal.ingredients as unknown as import('@/types/database').Json,
      prep_time_minutes: newMeal.prep_time_minutes,
      calories: newMeal.calories,
      protein_g: newMeal.protein_g,
      carbs_g: newMeal.carbs_g,
      fat_g: newMeal.fat_g,
      reasoning: newMeal.reasoning,
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to replace meal item: ${error?.message ?? 'unknown'}`)
  return data
}

// ── Rate limiting ──────────────────────────────────────────────────────────

/** Returns how many regenerations the user has left this week. */
export async function getRemainingRegenerations(userId: string): Promise<number> {
  const admin = createAdminClient()
  const weekStart = getWeekStart()

  const { data } = await admin
    .from('meal_plan_regenerations')
    .select('count')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  const used = data?.count ?? 0
  return Math.max(0, REGEN_LIMIT_PER_WEEK - used)
}

/** Increments the regeneration counter. Returns updated remaining count. */
export async function incrementRegenerationCount(userId: string): Promise<number> {
  const admin = createAdminClient()
  const weekStart = getWeekStart()

  const { data: existing } = await admin
    .from('meal_plan_regenerations')
    .select('count')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  const currentCount = existing?.count ?? 0
  const newCount = currentCount + 1

  if (existing) {
    await admin
      .from('meal_plan_regenerations')
      .update({ count: newCount })
      .eq('user_id', userId)
      .eq('week_start', weekStart)
  } else {
    await admin
      .from('meal_plan_regenerations')
      .insert({ user_id: userId, week_start: weekStart, count: 1 })
  }

  return Math.max(0, REGEN_LIMIT_PER_WEEK - newCount)
}

// ── AI cost logging ────────────────────────────────────────────────────────

/** Logs a meal plan generation to ai_protocol_logs for cost tracking. */
export async function logMealPlanGeneration(params: {
  userId: string
  mealPlanId: string | null
  meta: MealPlanGenerationMeta
}): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('ai_protocol_logs').insert({
      user_id: params.userId,
      protocol_id: null,
      tier: 'premium',
      log_type: 'meal_plan',
      model: params.meta.model,
      input_tokens: params.meta.input_tokens,
      output_tokens: params.meta.output_tokens,
      estimated_cost_usd: params.meta.cost_usd,
      cache_hit: params.meta.cache_hit,
      duration_ms: null,
      status: 'success',
      quiz_answers_hash: null,
    })
  } catch (err) {
    // Logging must never block the user flow
    console.error('[meal-plan-db] Failed to write ai_protocol_logs row', err)
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns this week's Monday as YYYY-MM-DD.
 * Used as the canonical week key for meal plans and rate limits.
 */
export function getWeekStart(date?: Date): string {
  const d = date ? new Date(date) : new Date()
  const day = d.getDay()
  // Shift to Monday (0=Sun → 6, 1=Mon → 0, ..., 6=Sat → 5)
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}
