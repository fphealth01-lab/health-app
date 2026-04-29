'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { features } from '@/config/features'
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
import type { Goal } from '@/types/user'

const FREE_TIER_COOLDOWN_HOURS = 24

export type RegenerateResult =
  | { ok: true; protocolId: string }
  | { ok: false; error: string; cooldownRemainingMs?: number }

/**
 * "Regenerate my protocol" entry point.
 *
 * - Re-uses the user's stored profile (no quiz re-take needed)
 * - Bypasses the cache so you get a fresh AI answer
 * - Rate-limits free users to one regeneration every 24h
 * - Premium users are unlimited (this is a perk for paying users)
 *
 * On success, the dashboard cache is revalidated so the next render shows
 * the new protocol immediately.
 */
export async function regenerateProtocol(): Promise<RegenerateResult> {
  if (!features.aiProtocolGenerationEnabled) {
    return {
      ok: false,
      error: 'AI protocol generation is currently disabled.',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'You need to be signed in to regenerate.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'primary_goal, sex, age, activity_level, baseline_energy, baseline_sleep_quality, baseline_stress, dietary_preference, medical_conditions, current_supplements, onboarding_completed',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return { ok: false, error: 'Could not load your profile.' }
  }
  if (!profile.onboarding_completed) {
    return { ok: false, error: 'Finish onboarding before regenerating.' }
  }

  // Pull every required field defensively — we won't call the model if any
  // are still null.
  if (
    !profile.primary_goal ||
    !profile.sex ||
    profile.age === null ||
    !profile.activity_level ||
    profile.baseline_energy === null ||
    profile.baseline_sleep_quality === null ||
    profile.baseline_stress === null ||
    !profile.dietary_preference
  ) {
    return {
      ok: false,
      error: 'Some onboarding answers are missing. Re-take the quiz first.',
    }
  }

  const tier: ProtocolTier = features.premiumPersonalizedProtocolEnabled
    ? await resolveTier(user.id)
    : 'free'

  // Rate limit free tier — protect the API budget. Premium has no limit.
  if (tier === 'free') {
    const cooldownMs = await freeTierCooldownRemainingMs(user.id)
    if (cooldownMs > 0) {
      return {
        ok: false,
        error: `Free plan can regenerate once every ${FREE_TIER_COOLDOWN_HOURS} hours.`,
        cooldownRemainingMs: cooldownMs,
      }
    }
  }

  const generatorProfile = {
    primary_goal: profile.primary_goal,
    sex: profile.sex,
    age: profile.age,
    activity_level: profile.activity_level,
    baseline_energy: profile.baseline_energy,
    baseline_sleep_quality: profile.baseline_sleep_quality,
    baseline_stress: profile.baseline_stress,
    dietary_preference: profile.dietary_preference,
    medical_conditions: profile.medical_conditions ?? [],
    current_supplements: profile.current_supplements ?? [],
  }

  const goal = profile.primary_goal as Goal
  const startedAt = Date.now()

  let generated: GeneratedProtocol
  let meta: ProtocolGenerationMeta
  let quizAnswersHash: string

  try {
    const result = await generateProtocol({
      userId: user.id,
      tier,
      profile: generatorProfile,
      bypassCache: true,
    })
    generated = result.protocol
    meta = result.meta
    quizAnswersHash = result.quizAnswersHash

    if (generated.supplements.length === 0) {
      throw new Error('AI returned no usable supplements after safety filtering')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error'
    console.error('[regenerate] AI generation failed, falling back:', message)
    generated = await buildFallbackProtocol(goal)
    quizAnswersHash = hashQuizAnswers(tier, generatorProfile)
    meta = {
      model: null,
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
      cache_hit: false,
      duration_ms: Date.now() - startedAt,
      status: 'fallback',
      removed_for_safety: [],
    }
    await logFallback({
      userId: user.id,
      protocolId: null,
      tier,
      quizAnswersHash,
      errorMessage: message,
      durationMs: Date.now() - startedAt,
    })
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
    revalidatePath('/dashboard')
    revalidatePath('/protocol')
    return { ok: true, protocolId }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to save your protocol.',
    }
  }
}

async function resolveTier(userId: string): Promise<ProtocolTier> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.status === 'active' || data?.status === 'trialing' ? 'premium' : 'free'
}

/**
 * Free users get one *real* regeneration per 24h. We measure from the most
 * recent successful (non-cache) generation so cache hits don't reset the
 * timer artificially.
 */
async function freeTierCooldownRemainingMs(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data: lastSuccess } = await supabase
    .from('ai_protocol_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('status', 'success')
    .eq('cache_hit', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastSuccess?.created_at) return 0
  const last = new Date(lastSuccess.created_at).getTime()
  const elapsed = Date.now() - last
  const cooldownMs = FREE_TIER_COOLDOWN_HOURS * 60 * 60 * 1000
  return Math.max(0, cooldownMs - elapsed)
}
