/**
 * Anthropic model strings + pricing.
 *
 * Verified against the Anthropic Models reference (April 2026 release):
 *   - Sonnet 4.6:  $3.00 input / $15.00 output per 1M tokens
 *   - Haiku 4.5:   $1.00 input /  $5.00 output per 1M tokens
 *
 * Update both fields together when you bump the model (a new id with stale
 * pricing would silently mis-attribute cost).
 */

export const MODEL_FREE = 'claude-haiku-4-5-20251001' as const
export const MODEL_PREMIUM = 'claude-sonnet-4-6' as const

export type ProtocolTier = 'free' | 'premium'
export type ProtocolModel = typeof MODEL_FREE | typeof MODEL_PREMIUM

/** USD per 1,000,000 tokens. */
export const PRICING_PER_MTOK: Record<ProtocolModel, { input: number; output: number }> = {
  [MODEL_FREE]: { input: 1, output: 5 },
  [MODEL_PREMIUM]: { input: 3, output: 15 },
}

export function modelForTier(tier: ProtocolTier): ProtocolModel {
  return tier === 'premium' ? MODEL_PREMIUM : MODEL_FREE
}

export function calculateCostUsd(
  model: ProtocolModel,
  inputTokens: number,
  outputTokens: number,
): number {
  const price = PRICING_PER_MTOK[model]
  const cost = (inputTokens * price.input + outputTokens * price.output) / 1_000_000
  // Round to 6 decimals — matches the precision of ai_protocol_logs.estimated_cost_usd.
  return Math.round(cost * 1_000_000) / 1_000_000
}
