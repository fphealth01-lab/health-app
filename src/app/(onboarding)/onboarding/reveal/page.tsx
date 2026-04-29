import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ProtocolReveal,
  type RevealCitation,
  type RevealSupplement,
} from '@/components/onboarding/protocol-reveal'
import { genericReasoningByGoal } from '@/lib/protocols/generic-protocols'
import type { Goal } from '@/types/user'

export const metadata = { title: 'Your protocol' }

function parseCitations(value: unknown): RevealCitation[] {
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

export default async function ProtocolRevealPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, primary_goal, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const { data: protocol } = await supabase
    .from('protocols')
    .select(
      `
      id,
      goal,
      ai_reasoning,
      ai_model,
      is_personalized,
      protocol_items (
        dose_mg,
        dose_unit,
        timing,
        ai_reasoning,
        citations,
        order_index,
        supplements ( name, short_description )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!protocol) {
    redirect('/onboarding')
  }

  const goal = (protocol.goal as Goal) ?? (profile.primary_goal as Goal) ?? 'longevity'
  const fallbackReasoning = genericReasoningByGoal[goal] ?? ''

  const supplements: RevealSupplement[] = [...(protocol.protocol_items ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({
      name: item.supplements?.name ?? 'Supplement',
      doseMg: item.dose_mg ?? null,
      doseUnit: item.dose_unit ?? 'mg',
      timing: item.timing ?? 'flexible',
      // Per-supplement AI reasoning is stored on the protocol_items row when
      // the AI generated the protocol; falls back to the generic catalog
      // description for hardcoded protocols.
      reasoning: item.ai_reasoning ?? item.supplements?.short_description ?? '',
      citations: parseCitations(item.citations),
    }))

  const greetingName = profile.full_name?.trim().split(/\s+/)[0] || 'friend'
  const tier: 'free' | 'premium' = protocol.is_personalized ? 'premium' : 'free'

  return (
    <ProtocolReveal
      goal={goal}
      greetingName={greetingName}
      supplements={supplements}
      aiReasoning={protocol.ai_reasoning ?? fallbackReasoning}
      aiModel={protocol.ai_model ?? null}
      tier={tier}
    />
  )
}
