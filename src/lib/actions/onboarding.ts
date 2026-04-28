'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { genericProtocolMap, genericReasoningByGoal } from '@/lib/protocols/generic-protocols'
import type { QuizAnswers } from '@/config/onboarding-quiz'
import type { Goal } from '@/types/user'

/**
 * Server-side validation of the quiz payload. Mirrors the question schema —
 * if you add a question in `src/config/onboarding-quiz.ts`, also extend this.
 */
const submitSchema = z.object({
  primary_goal: z.enum(['testosterone', 'sleep', 'skin', 'energy', 'focus', 'longevity']),
  sex: z.enum(['male', 'female', 'other']),
  age: z.number().int().min(13).max(120),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  baseline_energy: z.number().int().min(1).max(10),
  baseline_sleep_quality: z.number().int().min(1).max(10),
  baseline_stress: z.number().int().min(1).max(10),
  dietary_preference: z.enum([
    'omnivore',
    'vegetarian',
    'vegan',
    'pescatarian',
    'keto',
    'carnivore',
  ]),
  medical_conditions: z.array(z.string()),
  current_supplements: z.array(z.string()),
})

export type OnboardingResult =
  | { ok: true; protocolId: string }
  | { ok: false; error: string }

/**
 * Save the quiz answers to `profiles`, mark onboarding complete, and create
 * a free-tier (generic) Protocol + ProtocolItems based on the user's primary
 * goal. Returns the new protocol id on success.
 */
export async function submitOnboarding(answers: QuizAnswers): Promise<OnboardingResult> {
  const parsed = submitSchema.safeParse(answers)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    }
  }
  const data = parsed.data

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'You need to be signed in to complete onboarding.' }
  }

  // Strip the "none" sentinel — its only role is to express "I have nothing
  // here" in the UI; we don't store it.
  const medicalConditions = data.medical_conditions.filter((value) => value !== 'none')
  const currentSupplements = data.current_supplements.filter((value) => value !== 'none')

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      primary_goal: data.primary_goal,
      sex: data.sex,
      age: data.age,
      activity_level: data.activity_level,
      baseline_energy: data.baseline_energy,
      baseline_sleep_quality: data.baseline_sleep_quality,
      baseline_stress: data.baseline_stress,
      dietary_preference: data.dietary_preference,
      medical_conditions: medicalConditions,
      current_supplements: currentSupplements,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (profileError) {
    return { ok: false, error: `Couldn't save your answers: ${profileError.message}` }
  }

  // ── Build the generic protocol ────────────────────────────────────────
  const goal = data.primary_goal as Goal
  const slugs = genericProtocolMap[goal] ?? []

  const { data: supplements, error: supplementsError } = await supabase
    .from('supplements')
    .select('id, slug, name, dosing_low_mg, dosing_high_mg, dosing_unit, timing')
    .in('slug', slugs)

  if (supplementsError) {
    return { ok: false, error: `Couldn't load supplement catalog: ${supplementsError.message}` }
  }

  // Warn (don't crash) if some slugs were missing from the catalog.
  const foundSlugs = new Set((supplements ?? []).map((row) => row.slug))
  const missing = slugs.filter((slug) => !foundSlugs.has(slug))
  if (missing.length > 0) {
    console.warn(
      `[onboarding] Generic protocol slugs missing from supplements table: ${missing.join(', ')}`,
    )
  }

  // Replace any pre-existing free-tier protocol so the user always sees the
  // protocol that matches their *current* goal.
  await supabase
    .from('protocols')
    .delete()
    .eq('user_id', user.id)
    .eq('is_personalized', false)

  const { data: protocol, error: protocolError } = await supabase
    .from('protocols')
    .insert({
      user_id: user.id,
      goal,
      name: 'My Starter Protocol',
      is_personalized: false,
      ai_reasoning: genericReasoningByGoal[goal],
    })
    .select('id')
    .single()

  if (protocolError || !protocol) {
    return {
      ok: false,
      error: `Couldn't create your protocol: ${protocolError?.message ?? 'unknown error'}`,
    }
  }

  // Insert protocol items in the order specified by the goal mapping so the
  // reveal screen renders supplements in a deterministic, intentional order.
  const slugOrder = new Map(slugs.map((slug, index) => [slug, index]))
  const items = (supplements ?? [])
    .map((supplement) => {
      const dose = supplement.dosing_low_mg ?? supplement.dosing_high_mg ?? 0
      return {
        protocol_id: protocol.id,
        supplement_id: supplement.id,
        dose_mg: Number(dose),
        dose_unit: supplement.dosing_unit ?? 'mg',
        timing: supplement.timing,
        frequency: 'daily',
        ai_reasoning: null,
        order_index: slugOrder.get(supplement.slug) ?? 99,
      }
    })
    .sort((a, b) => a.order_index - b.order_index)

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('protocol_items').insert(items)
    if (itemsError) {
      return { ok: false, error: `Couldn't save protocol items: ${itemsError.message}` }
    }
  }

  return { ok: true, protocolId: protocol.id }
}
