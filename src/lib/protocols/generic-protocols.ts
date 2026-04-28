import type { Goal } from '@/types/user'

/**
 * Generic top-3 supplement protocols mapped to user goals.
 *
 * Each entry is a list of `slug` values from the `public.supplements` table.
 * Used as the free-tier protocol until the AI generator is built (Step 5+).
 *
 * Slugs MUST exist in `supabase/seed.sql`. If a lookup fails at runtime, the
 * server action logs a warning rather than crashing the user's flow.
 */
export const genericProtocolMap: Record<Goal, string[]> = {
  testosterone: ['vitamin-d3', 'magnesium-glycinate', 'zinc-picolinate'],
  sleep: ['magnesium-glycinate', 'l-theanine', 'glycine'],
  skin: ['collagen-peptides', 'vitamin-c', 'omega-3-epa-dha'],
  energy: ['vitamin-d3', 'creatine-monohydrate', 'b-complex'],
  focus: ['omega-3-epa-dha', 'l-theanine', 'creatine-monohydrate'],
  longevity: ['vitamin-d3', 'omega-3-epa-dha', 'nmn'],
}

/**
 * One-line, generic reasoning per goal — used while we don't have the AI
 * generator. The reveal screen shows this under each supplement card.
 */
export const genericReasoningByGoal: Record<Goal, string> = {
  testosterone:
    'Foundational stack for healthy testosterone, daytime drive, and recovery.',
  sleep:
    'Calms the nervous system, lowers core body temperature, and supports deep sleep.',
  skin:
    'Targets collagen production, hydration, and oxidative defense from the inside out.',
  energy: 'Restores foundational nutrient gaps and supports cellular ATP production.',
  focus:
    'Brain-bioavailable nutrients that support neurotransmission and calm focus.',
  longevity:
    'Evidence-leaning stack for mitochondrial function, NAD+ levels, and inflammation.',
}
