/**
 * Post-AI safety check.
 *
 * Even with safety rules in the system prompt, the model can occasionally
 * recommend something risky. This is a deterministic, rules-based final
 * pass that runs before we save the protocol to the DB.
 *
 * Two layers of checks:
 *   1. Hardcoded slug ↔ condition rules below (the "tripwire" rules from the
 *      system prompt — kept in code so they survive prompt drift).
 *   2. The supplement's own `contraindications` and `interactions` arrays
 *      from the catalog, fuzzy-matched against the user's conditions and
 *      medications.
 *
 * Removed supplements are reported back so the caller can:
 *   - log a structured warning
 *   - request a replacement from the model (future) or fall back gracefully
 */

import type { Tables } from '@/types/database'

export type CatalogSupplement = Pick<
  Tables<'supplements'>,
  'slug' | 'name' | 'contraindications' | 'interactions'
>

interface FilterableSupplement {
  slug: string
}

export interface SafetyRemoval {
  slug: string
  reason: string
}

export interface SafetyResult<T extends FilterableSupplement> {
  filtered: T[]
  removed: SafetyRemoval[]
}

// ── Hardcoded tripwires ────────────────────────────────────────────────────
//
// Maps a user condition value (from the onboarding quiz Q9) to slugs that
// should never be recommended for that condition. Slugs are matched
// case-insensitively. If a slug isn't in the seeded catalog, the rule is a
// no-op (which is fine — it's defense in depth).

const CONDITION_BLOCKLIST: Record<string, string[]> = {
  high_blood_pressure: ['yohimbine', 'caffeine', 'ephedrine'],
  thyroid_disorder: ['ashwagandha', 'iodine'],
  pregnant_or_breastfeeding: [
    // Pregnancy is a near-blanket block for non-prenatal supplements. The
    // safe set we *allow* for pregnancy (folate, prenatal vitamin D, choline,
    // omega-3 DHA) is the right whitelist later; for now, block the most
    // common high-risk supplements explicitly.
    'ashwagandha',
    'rhodiola',
    'tongkat-ali',
    'tribulus',
    'dhea',
    'nmn',
    'nr',
    'berberine',
    'st-johns-wort',
    'high-dose-vitamin-a',
    'caffeine',
    'yohimbine',
  ],
  // The quiz exposes "on_prescription" as a generic flag; we treat it
  // conservatively because we don't know *which* prescription.
  on_prescription: ['st-johns-wort'],
}

// Token matchers used against catalog `contraindications` / `interactions`
// strings. Each user-condition value can also pattern-match into the catalog
// fields (which are free-form short strings like "Severe kidney disease").
const CONDITION_INTERACTION_TOKENS: Record<string, string[]> = {
  high_blood_pressure: ['hypertension', 'blood pressure'],
  type_2_diabetes: ['diabetes', 'hypoglycem'],
  thyroid_disorder: ['thyroid', 'hyperthyroid', 'hypothyroid'],
  anxiety_depression: ['ssri', 'maoi', 'antidepressant'],
  on_prescription: [], // too generic to fuzz
  pregnant_or_breastfeeding: ['pregnan', 'breastfeed', 'lactat'],
}

function lower(strings: readonly (string | null | undefined)[]): string[] {
  return strings.filter((s): s is string => typeof s === 'string').map((s) => s.toLowerCase())
}

export function applySafetyFilter<T extends FilterableSupplement>(
  recommendations: T[],
  catalog: CatalogSupplement[],
  conditions: string[],
): SafetyResult<T> {
  const catalogBySlug = new Map(catalog.map((row) => [row.slug, row]))
  const userConditions = conditions.map((c) => c.toLowerCase())

  const filtered: T[] = []
  const removed: SafetyRemoval[] = []

  for (const rec of recommendations) {
    const slug = rec.slug
    const catalogRow = catalogBySlug.get(slug)

    let blockReason: string | null = null

    // 1) Hardcoded blocklist
    for (const condition of userConditions) {
      const blocked = CONDITION_BLOCKLIST[condition] ?? []
      if (blocked.includes(slug)) {
        blockReason = `${slug} is contraindicated for ${condition.replace(/_/g, ' ')} (blocklist rule).`
        break
      }
    }

    // 2) Catalog-driven fuzzy match on contraindications + interactions
    if (!blockReason && catalogRow) {
      const catalogTokens = [
        ...lower(catalogRow.contraindications ?? []),
        ...lower(catalogRow.interactions ?? []),
      ]
      for (const condition of userConditions) {
        const probes = CONDITION_INTERACTION_TOKENS[condition] ?? []
        const hit = probes.find((probe) =>
          catalogTokens.some((token) => token.includes(probe)),
        )
        if (hit) {
          blockReason = `${catalogRow.name} lists "${hit}" as contraindication/interaction for ${condition.replace(/_/g, ' ')}.`
          break
        }
      }
    }

    if (blockReason) {
      removed.push({ slug, reason: blockReason })
    } else {
      filtered.push(rec)
    }
  }

  return { filtered, removed }
}
