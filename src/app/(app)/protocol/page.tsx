import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { RegenerateProtocolButton } from '@/components/app/regenerate-protocol-button'
import { ProtocolReasoning } from '@/components/app/protocol/protocol-reasoning'
import { ProtocolSupplementCard } from '@/components/app/protocol/protocol-supplement-card'
import { ProtocolEmptyState } from '@/components/app/protocol/protocol-empty-state'
import type { ProtocolSupplementCardItem } from '@/components/app/protocol/protocol-supplement-card'

export const metadata: Metadata = { title: 'My Protocol' }

const GOAL_LABELS: Record<string, string> = {
  testosterone: 'Testosterone & energy',
  sleep: 'Sleep & recovery',
  skin: 'Skin & anti-aging',
  energy: 'Daily energy',
  focus: 'Focus & cognition',
  longevity: 'Longevity',
}

const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-6': 'Claude Sonnet 4.6',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
}

function formatRelativeDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Generated today'
  if (diffDays === 1) return 'Generated yesterday'
  if (diffDays < 7) return `Generated ${diffDays} days ago`
  return `Generated on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

type Citation = { title: string; url: string }

function parseCitations(value: unknown): Citation[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is Citation =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as Citation).title === 'string' &&
      typeof (entry as Citation).url === 'string',
  )
}

/** Compute how many ms remain in the free-tier 24h cooldown. */
async function getFreeCooldownMs(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data: lastGen } = await supabase
    .from('ai_protocol_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('status', 'success')
    .eq('cache_hit', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastGen?.created_at) return 0
  const elapsed = Date.now() - new Date(lastGen.created_at).getTime()
  const cooldownMs = 24 * 60 * 60 * 1000
  return Math.max(0, cooldownMs - elapsed)
}

export default async function ProtocolPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, tier] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, primary_goal, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle(),
    getUserTier(user.id),
  ])

  const profile = profileResult.data

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: protocol } = await supabase
    .from('protocols')
    .select(
      `
      id,
      goal,
      name,
      is_personalized,
      ai_reasoning,
      ai_model,
      ai_generated_at,
      protocol_items (
        id,
        dose_mg,
        dose_unit,
        timing,
        ai_reasoning,
        order_index,
        citations,
        supplements ( id, slug, name, category, short_description )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isPremium = tier === 'premium'

  const cooldownRemainingMs = !isPremium ? await getFreeCooldownMs(user.id) : 0

  if (!protocol) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <ProtocolEmptyState onboardingComplete={Boolean(profile?.onboarding_completed)} />
      </div>
    )
  }

  const goalLabel = GOAL_LABELS[protocol.goal ?? ''] ?? protocol.goal ?? 'Your goal'

  // ai_model / ai_generated_at were added by migration; cast via unknown for safety
  const aiModel = (protocol as unknown as { ai_model: string | null }).ai_model
  const aiGeneratedAt = (protocol as unknown as { ai_generated_at: string | null }).ai_generated_at
  const aiModelLabel = aiModel ? (MODEL_LABELS[aiModel] ?? aiModel) : null
  const generatedLabel = formatRelativeDate(aiGeneratedAt)

  const supplements: ProtocolSupplementCardItem[] = (protocol.protocol_items ?? [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => {
      const sup = item.supplements
      return {
        id: item.id,
        name: sup?.name ?? 'Supplement',
        slug: sup?.slug ?? '',
        category: sup?.category ?? '',
        doseMg: item.dose_mg ?? null,
        doseUnit: item.dose_unit ?? 'mg',
        timing: item.timing ?? 'flexible',
        reasoning: item.ai_reasoning ?? sup?.short_description ?? '',
        citations: parseCitations(item.citations),
        isPremium,
      }
    })

  const aiReasoning = protocol.ai_reasoning

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your protocol</h1>
          <p className="text-muted-foreground text-sm">
            Personalised for:{' '}
            <span className="text-foreground font-medium">{goalLabel}</span>
          </p>
          {generatedLabel && (
            <p className="text-muted-foreground text-xs">{generatedLabel}</p>
          )}
        </div>

        <RegenerateProtocolButton tier={tier} cooldownRemainingMs={cooldownRemainingMs} />
      </div>

      {/* AI Reasoning */}
      {aiReasoning && (
        <div className="mt-6">
          <ProtocolReasoning reasoning={aiReasoning} />
        </div>
      )}

      {/* Supplement cards */}
      <section aria-labelledby="supplements-heading" className="mt-8 space-y-4">
        <h2 id="supplements-heading" className="sr-only">
          Supplements
        </h2>

        {supplements.length === 0 ? (
          <p className="text-muted-foreground text-sm">No supplements in this protocol.</p>
        ) : (
          <ol className="space-y-3">
            {supplements.map((item, index) => (
              <li key={item.id}>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="bg-primary/10 text-primary mt-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <ProtocolSupplementCard item={item} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-10 space-y-1.5 border-t pt-6">
        <p className="text-muted-foreground text-xs leading-relaxed">
          This protocol is generated by AI based on your goals and profile. It is not medical
          advice. Consult a healthcare provider before starting any supplement regimen.
        </p>
        {aiModelLabel && (
          <p className="text-muted-foreground text-xs">Generated by {aiModelLabel}</p>
        )}
      </footer>
    </div>
  )
}
