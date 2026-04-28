import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ProtocolReveal,
  type RevealSupplement,
} from '@/components/onboarding/protocol-reveal'
import { genericReasoningByGoal } from '@/lib/protocols/generic-protocols'
import type { Goal } from '@/types/user'

export const metadata = { title: 'Your protocol' }

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
      protocol_items (
        dose_mg,
        dose_unit,
        timing,
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
    // Edge case: profile says onboarding done but no protocol exists. Send
    // the user back through the quiz to rebuild it.
    redirect('/onboarding')
  }

  const goal = (protocol.goal as Goal) ?? (profile.primary_goal as Goal) ?? 'longevity'
  const reasoning = genericReasoningByGoal[goal] ?? ''

  const supplements: RevealSupplement[] = [...(protocol.protocol_items ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({
      name: item.supplements?.name ?? 'Supplement',
      doseMg: item.dose_mg ?? null,
      doseUnit: item.dose_unit ?? 'mg',
      timing: item.timing ?? 'flexible',
      reasoning: item.supplements?.short_description ?? reasoning,
    }))

  const greetingName = (profile.full_name?.trim().split(/\s+/)[0]) || 'friend'

  return <ProtocolReveal goal={goal} greetingName={greetingName} supplements={supplements} />
}
