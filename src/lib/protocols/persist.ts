import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  logFallback,
  logProtocolGeneration,
  type GeneratedProtocol,
  type ProtocolGenerationMeta,
} from '@/lib/ai/protocol-generator'
import type { ProtocolTier } from '@/lib/ai/models'
import type { Goal } from '@/types/user'

interface PersistArgs {
  userId: string
  tier: ProtocolTier
  goal: Goal
  generated: GeneratedProtocol
  meta: ProtocolGenerationMeta
  quizAnswersHash: string
  /** When provided, the persisted protocol's name; defaults sensibly. */
  protocolName?: string
}

export interface PersistResult {
  protocolId: string
}

/**
 * Save a freshly generated (or cached) protocol to the database. Always:
 *
 *   1. Removes the user's prior free-tier protocol so the dashboard always
 *      shows their current intent.
 *   2. Inserts a new `protocols` row with AI metadata.
 *   3. Inserts the matching `protocol_items` (resolving slug → supplement_id
 *      from the catalog).
 *   4. Writes a row to `ai_protocol_logs` for cost tracking + caching.
 *
 * Uses the service-role admin client so server-only fields like
 * `ai_protocol_logs` (no INSERT policy) and `protocols.ai_model` /
 * `ai_generated_at` (set by us, not the user) get written cleanly.
 */
export async function persistGeneratedProtocol(args: PersistArgs): Promise<PersistResult> {
  const admin = createAdminClient()

  const slugs = args.generated.supplements.map((s) => s.slug)
  const { data: catalog, error: catalogError } = await admin
    .from('supplements')
    .select('id, slug, timing, dosing_unit')
    .in('slug', slugs.length > 0 ? slugs : ['__none__'])

  if (catalogError) {
    throw new Error(`Failed to resolve supplement IDs: ${catalogError.message}`)
  }
  const bySlug = new Map((catalog ?? []).map((row) => [row.slug, row]))

  // Replace any prior protocol for this user. We keep this aggressive (vs.
  // versioned history) until the tracker arrives — there's nothing yet that
  // pins to an old protocol_item id.
  await admin.from('protocols').delete().eq('user_id', args.userId)

  const isPersonalized = args.tier === 'premium' && args.meta.status !== 'fallback'
  const aiModel = args.meta.model ?? null
  const aiGeneratedAt = args.meta.cache_hit
    ? // For cache hits we want to surface the *original* generation time —
      // but we don't have it cheaply here, so we use "now" so users can still
      // see "Last updated" reflect when their protocol was assigned.
      new Date().toISOString()
    : args.meta.status === 'success' || args.meta.status === 'cache_hit'
      ? new Date().toISOString()
      : null

  const { data: protocol, error: protocolError } = await admin
    .from('protocols')
    .insert({
      user_id: args.userId,
      goal: args.goal,
      name: args.protocolName ?? (args.tier === 'premium' ? 'My Personalized Protocol' : 'My Starter Protocol'),
      is_personalized: isPersonalized,
      ai_reasoning: args.generated.ai_reasoning || null,
      ai_model: aiModel,
      ai_generated_at: aiGeneratedAt,
    })
    .select('id')
    .single()

  if (protocolError || !protocol) {
    throw new Error(
      `Failed to insert protocol: ${protocolError?.message ?? 'unknown error'}`,
    )
  }

  const items = args.generated.supplements
    .map((rec, index) => {
      const cat = bySlug.get(rec.slug)
      if (!cat) {
        console.warn(`[persist] Skipping item with unknown slug "${rec.slug}"`)
        return null
      }
      return {
        protocol_id: protocol.id,
        supplement_id: cat.id,
        dose_mg: rec.dose_mg,
        dose_unit: rec.dose_unit || cat.dosing_unit || 'mg',
        timing: rec.timing || cat.timing,
        frequency: rec.frequency,
        ai_reasoning: rec.reasoning || null,
        order_index: index,
        citations: rec.citations,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (items.length > 0) {
    const { error: itemsError } = await admin.from('protocol_items').insert(items)
    if (itemsError) {
      throw new Error(`Failed to insert protocol items: ${itemsError.message}`)
    }
  }

  await logProtocolGeneration({
    userId: args.userId,
    protocolId: protocol.id,
    tier: args.tier,
    meta: args.meta,
    quizAnswersHash: args.quizAnswersHash,
  })

  return { protocolId: protocol.id }
}

/**
 * Re-export a small wrapper so callers don't need to import from two places
 * when they decide to log a pure fallback (no AI call attempted, e.g. when
 * the master flag is off).
 */
export { logFallback }
