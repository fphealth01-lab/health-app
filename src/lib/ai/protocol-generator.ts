import 'server-only'

import crypto from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database, Tables } from '@/types/database'
import {
  MODEL_FREE,
  MODEL_PREMIUM,
  calculateCostUsd,
  modelForTier,
  type ProtocolModel,
  type ProtocolTier,
} from './models'
import { applySafetyFilter, type CatalogSupplement, type SafetyRemoval } from './safety-filter'

// ── Types ──────────────────────────────────────────────────────────────────
export interface ProtocolGenerationProfile {
  primary_goal: string
  sex: string
  age: number
  activity_level: string
  baseline_energy: number
  baseline_sleep_quality: number
  baseline_stress: number
  dietary_preference: string
  medical_conditions: string[]
  current_supplements: string[]
}

export interface ProtocolGenerationInput {
  userId: string
  tier: ProtocolTier
  profile: ProtocolGenerationProfile
  /** When true, skip cache lookup and always call the model. */
  bypassCache?: boolean
}

export interface GeneratedProtocolItem {
  slug: string
  dose_mg: number
  dose_unit: string
  timing: string
  frequency: string
  reasoning: string
  citations: { title: string; url: string }[]
}

export interface GeneratedProtocol {
  ai_reasoning: string
  supplements: GeneratedProtocolItem[]
}

export interface ProtocolGenerationMeta {
  model: ProtocolModel | null
  input_tokens: number
  output_tokens: number
  cost_usd: number
  cache_hit: boolean
  duration_ms: number
  status: 'success' | 'fallback' | 'cache_hit'
  removed_for_safety: SafetyRemoval[]
  source_log_id?: string | null
}

export interface ProtocolGenerationResult {
  protocol: GeneratedProtocol
  meta: ProtocolGenerationMeta
  quizAnswersHash: string
}

// ── Constants ──────────────────────────────────────────────────────────────
const CACHE_TTL_DAYS = 30
const ALLOWED_TIMINGS = [
  'morning',
  'evening',
  'with_food',
  'empty_stomach',
  'before_bed',
  'flexible',
  'split_dose',
] as const
const ALLOWED_FREQUENCIES = ['daily', 'twice_daily', 'as_needed'] as const

const MAX_OUTPUT_TOKENS = 2000

// ── Cache key ──────────────────────────────────────────────────────────────
/**
 * Stable hash of the inputs that affect the protocol output. Field order is
 * fixed so JSON.stringify is deterministic — adding a new question requires
 * also adding it here so we don't accidentally serve stale cache.
 */
export function hashQuizAnswers(
  tier: ProtocolTier,
  profile: ProtocolGenerationProfile,
): string {
  const canonical = {
    tier,
    primary_goal: profile.primary_goal,
    sex: profile.sex,
    age: profile.age,
    activity_level: profile.activity_level,
    baseline_energy: profile.baseline_energy,
    baseline_sleep_quality: profile.baseline_sleep_quality,
    baseline_stress: profile.baseline_stress,
    dietary_preference: profile.dietary_preference,
    medical_conditions: [...profile.medical_conditions].sort(),
    current_supplements: [...profile.current_supplements].sort(),
  }
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
}

// ── Anthropic client (lazy so build doesn't require the key) ──────────────
let anthropicClient: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// ── Public entry point ────────────────────────────────────────────────────
export async function generateProtocol(
  input: ProtocolGenerationInput,
): Promise<ProtocolGenerationResult> {
  const hash = hashQuizAnswers(input.tier, input.profile)

  // 1) Cache lookup (per-user, last 30 days, status='success')
  if (!input.bypassCache) {
    const cached = await loadCachedProtocol(input.userId, hash)
    if (cached) {
      return {
        protocol: cached.protocol,
        quizAnswersHash: hash,
        meta: {
          model: cached.model,
          input_tokens: 0,
          output_tokens: 0,
          cost_usd: 0,
          cache_hit: true,
          duration_ms: 0,
          status: 'cache_hit',
          removed_for_safety: [],
          source_log_id: cached.logId,
        },
      }
    }
  }

  // 2) Fetch the full supplement catalog (the AI's grounding set)
  const catalog = await fetchCatalog()
  if (catalog.length === 0) {
    throw new Error('Supplement catalog is empty — cannot generate a protocol.')
  }

  // 3) Call Anthropic with tool_use for structured JSON
  const startedAt = Date.now()
  const model = modelForTier(input.tier)
  const supplementCount = input.tier === 'premium' ? '5-7' : '3'

  const systemPrompt = buildSystemPrompt(supplementCount)
  const userPrompt = buildUserPrompt(input.profile, catalog)

  const response = await getAnthropic().messages.create({
    model,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [PROTOCOL_TOOL],
    tool_choice: { type: 'tool', name: PROTOCOL_TOOL.name },
  })

  const durationMs = Date.now() - startedAt
  const { input_tokens: inputTokens, output_tokens: outputTokens } = response.usage
  const costUsd = calculateCostUsd(model, inputTokens, outputTokens)

  // 4) Parse + validate tool output
  const parsed = parseToolUseResponse(response)
  const grounded = enforceCatalogGrounding(parsed, catalog)

  // 5) Safety filter — last line of defense
  const safety = applySafetyFilter(
    grounded.supplements,
    catalog,
    input.profile.medical_conditions,
  )
  if (safety.removed.length > 0) {
    console.warn(
      `[protocol-generator] Safety filter removed ${safety.removed.length} supplement(s):`,
      safety.removed,
    )
  }

  const protocol: GeneratedProtocol = {
    ai_reasoning: grounded.ai_reasoning,
    supplements: safety.filtered,
  }

  return {
    protocol,
    quizAnswersHash: hash,
    meta: {
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      cache_hit: false,
      duration_ms: durationMs,
      status: 'success',
      removed_for_safety: safety.removed,
    },
  }
}

// ── Logging helper (called by onboarding action after persisting protocol) ──
export interface LogParams {
  userId: string
  protocolId: string | null
  tier: ProtocolTier
  meta: ProtocolGenerationMeta
  quizAnswersHash: string
  errorMessage?: string | null
}

export async function logProtocolGeneration(params: LogParams): Promise<void> {
  try {
    const admin = createAdminClient()
    const status: Database['public']['Tables']['ai_protocol_logs']['Insert']['status'] =
      params.meta.status === 'cache_hit'
        ? 'success'
        : params.meta.status === 'fallback'
          ? 'fallback'
          : 'success'
    await admin.from('ai_protocol_logs').insert({
      user_id: params.userId,
      protocol_id: params.protocolId,
      tier: params.tier,
      model: params.meta.model ?? 'fallback',
      input_tokens: params.meta.input_tokens,
      output_tokens: params.meta.output_tokens,
      estimated_cost_usd: params.meta.cost_usd,
      cache_hit: params.meta.cache_hit,
      duration_ms: params.meta.duration_ms,
      status,
      error_message: params.errorMessage ?? null,
      quiz_answers_hash: params.quizAnswersHash,
    })
  } catch (err) {
    // Logging must never block the user's flow.
    console.error('[protocol-generator] Failed to write ai_protocol_logs row', err)
  }
}

export async function logFallback(params: {
  userId: string
  protocolId: string | null
  tier: ProtocolTier
  quizAnswersHash: string
  errorMessage: string
  durationMs: number
}): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('ai_protocol_logs').insert({
      user_id: params.userId,
      protocol_id: params.protocolId,
      tier: params.tier,
      model: 'fallback',
      input_tokens: 0,
      output_tokens: 0,
      estimated_cost_usd: 0,
      cache_hit: false,
      duration_ms: params.durationMs,
      status: 'fallback',
      error_message: params.errorMessage,
      quiz_answers_hash: params.quizAnswersHash,
    })
  } catch (err) {
    console.error('[protocol-generator] Failed to write fallback log', err)
  }
}

// ── Internals ─────────────────────────────────────────────────────────────
type CatalogRow = Pick<
  Tables<'supplements'>,
  | 'slug'
  | 'name'
  | 'category'
  | 'short_description'
  | 'benefits'
  | 'goals_targeted'
  | 'dosing_low_mg'
  | 'dosing_high_mg'
  | 'dosing_unit'
  | 'timing'
  | 'interactions'
  | 'contraindications'
>

async function fetchCatalog(): Promise<CatalogRow[]> {
  // Service-role read so we always get the full catalog regardless of RLS
  // policy edge cases. The supplements table is public-read anyway.
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('supplements')
    .select(
      'slug, name, category, short_description, benefits, goals_targeted, dosing_low_mg, dosing_high_mg, dosing_unit, timing, interactions, contraindications',
    )
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw new Error(`Failed to load supplement catalog: ${error.message}`)
  return data ?? []
}

interface CachedProtocol {
  protocol: GeneratedProtocol
  model: ProtocolModel
  logId: string
}

async function loadCachedProtocol(
  userId: string,
  hash: string,
): Promise<CachedProtocol | null> {
  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: log } = await admin
    .from('ai_protocol_logs')
    .select('id, protocol_id, model, status')
    .eq('user_id', userId)
    .eq('quiz_answers_hash', hash)
    .eq('status', 'success')
    .eq('cache_hit', false) // only seed from a real generation
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!log?.protocol_id) return null

  const { data: protocol } = await admin
    .from('protocols')
    .select(
      `
      id,
      ai_reasoning,
      protocol_items (
        dose_mg,
        dose_unit,
        timing,
        frequency,
        ai_reasoning,
        citations,
        order_index,
        supplements ( slug )
      )
    `,
    )
    .eq('id', log.protocol_id)
    .maybeSingle()

  if (!protocol) return null

  const supplements = [...(protocol.protocol_items ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({
      slug: item.supplements?.slug ?? '',
      dose_mg: Number(item.dose_mg ?? 0),
      dose_unit: item.dose_unit ?? 'mg',
      timing: item.timing ?? 'flexible',
      frequency: item.frequency ?? 'daily',
      reasoning: item.ai_reasoning ?? '',
      citations: parseCitations(item.citations),
    }))
    .filter((s) => s.slug)

  // If we somehow can't reconstruct the protocol, treat it as a cache miss
  // rather than returning a degraded response.
  if (supplements.length === 0) return null

  const model: ProtocolModel = log.model === MODEL_PREMIUM ? MODEL_PREMIUM : MODEL_FREE

  return {
    logId: log.id,
    model,
    protocol: {
      ai_reasoning: protocol.ai_reasoning ?? '',
      supplements,
    },
  }
}

function parseCitations(value: unknown): { title: string; url: string }[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (entry): entry is { title: string; url: string } =>
        !!entry &&
        typeof entry === 'object' &&
        'title' in entry &&
        'url' in entry &&
        typeof (entry as { title: unknown }).title === 'string' &&
        typeof (entry as { url: unknown }).url === 'string',
    )
    .map((entry) => ({ title: entry.title, url: entry.url }))
}

// ── Prompt construction ───────────────────────────────────────────────────
function buildSystemPrompt(supplementCount: string): string {
  return `You are an expert in evidence-based supplement protocols for longevity and health optimization. You will recommend supplements ONLY from the provided catalog — never invent supplements.

Your job:
1. Analyze the user's quiz answers
2. Recommend ${supplementCount} supplements from the catalog
3. For each, provide: slug (must EXACTLY match a slug in the catalog), dose, dose_unit, timing, frequency, and brief reasoning tied to the user's specific data
4. Avoid supplements that interact with their stated conditions or current supplements
5. Avoid recommending supplements they're already taking unless dosing needs adjustment
6. Provide an overall reasoning paragraph (2-3 sentences) summarizing the protocol approach

CRITICAL SAFETY RULES (these are tripwires — never violate):
- High blood pressure → no stimulants, no yohimbine
- Blood thinners (or "on prescription medication") → no high-dose omega-3, no vitamin E, no ginkgo, no St. John's Wort
- SSRIs/MAOIs (anxiety/depression on prescription) → no 5-HTP, no tryptophan, no St. John's Wort
- Pregnant or breastfeeding → only foundational, prenatal-safe basics (omega-3 DHA, prenatal-dosed vitamin D, choline, folate). Avoid adaptogens, hormone modulators, and high-dose anything.
- Thyroid disorder → no ashwagandha, no high iodine
- Type 2 diabetes → use lower-end dosing if recommending chromium, berberine, or alpha-lipoic acid
- 55+ or any chronic condition → recommend the lower end of the dosing range

Output rules:
- timing MUST be one of: ${ALLOWED_TIMINGS.join(', ')}
- frequency MUST be one of: ${ALLOWED_FREQUENCIES.join(', ')}
- dose_mg is a number; dose_unit matches the catalog entry's dosing_unit
- Citations are optional; if you include them, use real {title, url} objects (PubMed search URLs are acceptable)
- Return ONLY the tool call. No prose, no preamble, no markdown.`
}

function buildUserPrompt(
  profile: ProtocolGenerationProfile,
  catalog: CatalogRow[],
): string {
  const catalogLines = catalog.map((s) => {
    const dose =
      s.dosing_low_mg && s.dosing_high_mg
        ? `${s.dosing_low_mg}-${s.dosing_high_mg}${s.dosing_unit}`
        : 'see notes'
    const goals = (s.goals_targeted ?? []).join(', ') || '—'
    return `- ${s.slug} :: ${s.name} (${s.category}) — ${s.short_description} | dose ${dose} | timing ${s.timing} | goals: ${goals}`
  })

  const conditions =
    profile.medical_conditions.length > 0 ? profile.medical_conditions.join(', ') : 'None'
  const currentSupps =
    profile.current_supplements.length > 0 ? profile.current_supplements.join(', ') : 'None'

  return `User profile:
- Primary goal: ${profile.primary_goal}
- Sex: ${profile.sex}, Age: ${profile.age}
- Activity: ${profile.activity_level}
- Baseline energy: ${profile.baseline_energy}/10
- Baseline sleep quality: ${profile.baseline_sleep_quality}/10
- Baseline stress: ${profile.baseline_stress}/10
- Diet: ${profile.dietary_preference}
- Medical conditions: ${conditions}
- Currently taking: ${currentSupps}

Available supplement catalog (you MUST pick from these slugs — exact match):
${catalogLines.join('\n')}

Generate the protocol now using the recommend_protocol tool.`
}

// ── Tool schema (Anthropic structured output) ──────────────────────────────
const PROTOCOL_TOOL: Anthropic.Tool = {
  name: 'recommend_protocol',
  description: 'Returns the supplement protocol recommendation as structured JSON.',
  input_schema: {
    type: 'object',
    properties: {
      ai_reasoning: {
        type: 'string',
        description:
          '2-3 sentence overall reasoning for the protocol, written directly to the user.',
      },
      supplements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Exact slug from the catalog.' },
            dose_mg: { type: 'number' },
            dose_unit: { type: 'string' },
            timing: {
              type: 'string',
              enum: [...ALLOWED_TIMINGS],
            },
            frequency: {
              type: 'string',
              enum: [...ALLOWED_FREQUENCIES],
            },
            reasoning: {
              type: 'string',
              description:
                "1-2 sentences explaining why this supplement was chosen for THIS user's data.",
            },
            citations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                },
                required: ['title', 'url'],
              },
              description: 'Optional. Empty array is fine for free-tier protocols.',
            },
          },
          required: ['slug', 'dose_mg', 'dose_unit', 'timing', 'frequency', 'reasoning'],
        },
      },
    },
    required: ['ai_reasoning', 'supplements'],
  },
}

// ── Response parsing ──────────────────────────────────────────────────────
function parseToolUseResponse(response: Anthropic.Message): GeneratedProtocol {
  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
  )
  if (!toolUse) {
    throw new Error('Anthropic response did not contain a tool_use block.')
  }
  const raw = toolUse.input as unknown
  if (!raw || typeof raw !== 'object') {
    throw new Error('tool_use input is not an object.')
  }

  const obj = raw as Record<string, unknown>
  const reasoning = typeof obj.ai_reasoning === 'string' ? obj.ai_reasoning : ''
  const supplementsRaw = Array.isArray(obj.supplements) ? obj.supplements : []

  const supplements: GeneratedProtocolItem[] = []
  for (const item of supplementsRaw) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    const slug = typeof s.slug === 'string' ? s.slug : ''
    const doseMg = typeof s.dose_mg === 'number' ? s.dose_mg : Number(s.dose_mg ?? 0)
    const doseUnit = typeof s.dose_unit === 'string' ? s.dose_unit : 'mg'
    const timing = typeof s.timing === 'string' ? s.timing : 'flexible'
    const frequency = typeof s.frequency === 'string' ? s.frequency : 'daily'
    const itemReasoning = typeof s.reasoning === 'string' ? s.reasoning : ''
    const citations = parseCitations(s.citations)

    if (!slug) continue
    supplements.push({
      slug,
      dose_mg: Number.isFinite(doseMg) ? doseMg : 0,
      dose_unit: doseUnit,
      timing: ALLOWED_TIMINGS.includes(timing as (typeof ALLOWED_TIMINGS)[number])
        ? timing
        : 'flexible',
      frequency: ALLOWED_FREQUENCIES.includes(
        frequency as (typeof ALLOWED_FREQUENCIES)[number],
      )
        ? frequency
        : 'daily',
      reasoning: itemReasoning,
      citations,
    })
  }

  if (supplements.length === 0) {
    throw new Error('Anthropic response had no usable supplements.')
  }

  return { ai_reasoning: reasoning, supplements }
}

/**
 * Drop any supplement whose slug isn't in the catalog. The model occasionally
 * hallucinates a near-miss slug ("vitamin-d" instead of "vitamin-d3"). We
 * log loudly so it's debuggable, and trust the safety filter / generator
 * caller to handle a possibly-shorter list.
 */
function enforceCatalogGrounding(
  protocol: GeneratedProtocol,
  catalog: CatalogRow[],
): GeneratedProtocol {
  const validSlugs = new Set(catalog.map((row) => row.slug))
  const filtered = protocol.supplements.filter((s) => {
    if (validSlugs.has(s.slug)) return true
    console.warn(
      `[protocol-generator] AI returned slug "${s.slug}" not in catalog — dropped.`,
    )
    return false
  })
  return { ...protocol, supplements: filtered }
}
