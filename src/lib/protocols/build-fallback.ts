import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { genericProtocolMap, genericReasoningByGoal } from './generic-protocols'
import type { GeneratedProtocol } from '@/lib/ai/protocol-generator'
import type { Goal } from '@/types/user'

/**
 * Build a `GeneratedProtocol`-shaped object from the hardcoded goal-to-slug
 * map. Used when:
 *   - the AI flag is off,
 *   - the AI call fails,
 *   - or the AI returns nothing usable after safety filtering.
 *
 * Pulls dosing/timing from the catalog so the values match what the user
 * sees in the supplement detail page.
 */
export async function buildFallbackProtocol(goal: Goal): Promise<GeneratedProtocol> {
  const admin = createAdminClient()
  const slugs = genericProtocolMap[goal] ?? []
  if (slugs.length === 0) {
    return { ai_reasoning: '', supplements: [] }
  }

  const { data: rows } = await admin
    .from('supplements')
    .select('slug, name, short_description, dosing_low_mg, dosing_high_mg, dosing_unit, timing')
    .in('slug', slugs)

  const bySlug = new Map((rows ?? []).map((row) => [row.slug, row]))

  const supplements = slugs
    .map((slug) => {
      const row = bySlug.get(slug)
      if (!row) {
        console.warn(`[fallback] Generic slug "${slug}" missing from catalog.`)
        return null
      }
      const dose = Number(row.dosing_low_mg ?? row.dosing_high_mg ?? 0)
      return {
        slug: row.slug,
        dose_mg: dose,
        dose_unit: row.dosing_unit ?? 'mg',
        timing: row.timing ?? 'flexible',
        frequency: 'daily',
        reasoning: row.short_description ?? '',
        citations: [],
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  return {
    ai_reasoning: genericReasoningByGoal[goal] ?? '',
    supplements,
  }
}
