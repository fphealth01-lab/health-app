'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendOnboardingCompleteEmail } from '@/lib/email/email-actions'
import { features } from '@/config/features'
import { getUserTier } from '@/lib/auth/user-tier'
import {
  generateProtocol,
  hashQuizAnswers,
  logFallback,
  type GeneratedProtocol,
  type ProtocolGenerationMeta,
} from '@/lib/ai/protocol-generator'
import type { ProtocolTier } from '@/lib/ai/models'
import { persistGeneratedProtocol } from '@/lib/protocols/persist'
import { buildFallbackProtocol } from '@/lib/protocols/build-fallback'
import type { QuizAnswers } from '@/config/onboarding-quiz'
import type { Goal } from '@/types/user'
import { captureServerEvent } from '@/lib/analytics/posthog-server'

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

  const goal = data.primary_goal as Goal
  const tier: ProtocolTier = await getUserTier(user.id)

  // Build the profile slice the generator needs.
  const generatorProfile = {
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
  }

  let generated: GeneratedProtocol
  let meta: ProtocolGenerationMeta
  let quizAnswersHash: string

  const startedAt = Date.now()

  if (features.aiProtocolGenerationEnabled) {
    try {
      const result = await generateProtocol({
        userId: user.id,
        tier,
        profile: generatorProfile,
      })
      generated = result.protocol
      meta = result.meta
      quizAnswersHash = result.quizAnswersHash

      // Edge case: AI returned nothing usable after grounding + safety filter.
      // Fall through to the hardcoded fallback rather than ship an empty stack.
      if (generated.supplements.length === 0) {
        console.warn(
          '[onboarding] AI produced 0 supplements after filtering — falling back.',
        )
        throw new Error('AI returned no usable supplements after safety filtering')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown AI error'
      console.error('[onboarding] AI generation failed, falling back:', message)
      generated = await buildFallbackProtocol(goal)
      quizAnswersHash = hashQuizAnswers(tier, generatorProfile)
      meta = buildFallbackMeta(Date.now() - startedAt)
      // Log the fallback up front (without protocol_id; we'll add the row
      // below and another log entry isn't necessary for cost tracking).
      await logFallback({
        userId: user.id,
        protocolId: null,
        tier,
        quizAnswersHash,
        errorMessage: message,
        durationMs: Date.now() - startedAt,
      })
      // The persist step will log a second "fallback" row with protocol_id;
      // that's intentional — gives us full traceability of every attempt.
    }
  } else {
    generated = await buildFallbackProtocol(goal)
    quizAnswersHash = hashQuizAnswers(tier, generatorProfile)
    meta = buildFallbackMeta(Date.now() - startedAt)
  }

  try {
    const { protocolId } = await persistGeneratedProtocol({
      userId: user.id,
      tier,
      goal,
      generated,
      meta,
      quizAnswersHash,
    })

    // Fire-and-forget — email failure must not break the onboarding flow.
    const userEmail = user.email
    if (userEmail) {
      sendOnboardingCompleteEmail(user.id, userEmail, null).catch((err) => {
        console.error('[onboarding] onboarding_complete email failed:', err)
      })
    }

    // Track onboarding completion and protocol generation (fire-and-forget)
    const ageBucket = getBucket(data.age)
    captureServerEvent({
      userId: user.id,
      event: 'onboarding_completed',
      properties: {
        goal: data.primary_goal,
        sex: data.sex,
        age_bucket: ageBucket,
      },
    }).catch(() => {})

    captureServerEvent({
      userId: user.id,
      event: 'protocol_generated',
      properties: {
        tier,
        goal: data.primary_goal,
        supplement_count: generated.supplements.length,
        model: meta.model ?? 'fallback',
        cache_hit: meta.cache_hit,
      },
    }).catch(() => {})

    return { ok: true, protocolId }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to save your protocol.',
    }
  }
}

function buildFallbackMeta(durationMs: number): ProtocolGenerationMeta {
  return {
    model: null,
    input_tokens: 0,
    output_tokens: 0,
    cost_usd: 0,
    cache_hit: false,
    duration_ms: durationMs,
    status: 'fallback',
    removed_for_safety: [],
  }
}

/** Converts a raw age to a privacy-safe age bucket string. */
function getBucket(age: number): string {
  if (age <= 25) return '18-25'
  if (age <= 35) return '26-35'
  if (age <= 45) return '36-45'
  if (age <= 55) return '46-55'
  return '56+'
}
