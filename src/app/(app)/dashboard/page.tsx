import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Sparkles, Wand2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DashboardProtocolCard,
  type DashboardSupplement,
} from '@/components/app/dashboard-protocol-card'
import { RegenerateProtocolButton } from '@/components/app/regenerate-protocol-button'
import { createClient } from '@/lib/supabase/server'
import { features } from '@/config/features'

export const metadata = { title: 'Dashboard' }

const FREE_TIER_COOLDOWN_HOURS = 24

function formatRelative(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()
  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing'

  const { data: protocol } = await supabase
    .from('protocols')
    .select(
      `
      id,
      name,
      goal,
      is_personalized,
      ai_reasoning,
      ai_model,
      ai_generated_at,
      protocol_items (
        dose_mg,
        dose_unit,
        timing,
        ai_reasoning,
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

  // Free users get a 24h cooldown — measure from the most recent successful,
  // non-cache generation so cache hits don't reset the timer.
  let cooldownRemainingMs = 0
  if (!isPremium) {
    const { data: lastGen } = await supabase
      .from('ai_protocol_logs')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('status', 'success')
      .eq('cache_hit', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lastGen?.created_at) {
      const elapsed = Date.now() - new Date(lastGen.created_at).getTime()
      const cooldownMs = FREE_TIER_COOLDOWN_HOURS * 60 * 60 * 1000
      cooldownRemainingMs = Math.max(0, cooldownMs - elapsed)
    }
  }

  const supplements: DashboardSupplement[] = [...(protocol.protocol_items ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({
      name: item.supplements?.name ?? 'Supplement',
      doseMg: item.dose_mg ?? null,
      doseUnit: item.dose_unit ?? 'mg',
      timing: item.timing ?? 'flexible',
      reasoning: item.ai_reasoning ?? item.supplements?.short_description ?? '',
    }))

  const greetingName = profile.full_name?.trim().split(/\s+/)[0] || profile.email || 'there'
  const tier: 'free' | 'premium' = protocol.is_personalized ? 'premium' : 'free'
  const lastUpdated = formatRelative(protocol.ai_generated_at)
  const showRegenerate = features.aiProtocolGenerationEnabled

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <header className="space-y-1">
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {greetingName}</h1>
      </header>

      {!isPremium && (
        <Card className="border-primary/30 from-primary/5 to-secondary/30 mt-6 bg-gradient-to-r via-transparent">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">You&apos;re on the Free plan</p>
                <p className="text-muted-foreground text-sm">
                  Upgrade for personalized protocols, meal plans, and member discounts.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/pricing">See Premium</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {protocol.ai_reasoning && (
        <Accordion type="single" collapsible className="mt-8 w-full">
          <AccordionItem value="why" className="bg-card rounded-xl border px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Wand2 className="text-primary h-4 w-4" aria-hidden />
                Why this protocol?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground pb-1 text-sm leading-relaxed">
                {protocol.ai_reasoning}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <section aria-labelledby="todays-stack" className="mt-8 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 id="todays-stack" className="text-xl font-semibold tracking-tight">
              Today&apos;s stack
            </h2>
            {lastUpdated && (
              <p className="text-muted-foreground text-xs">
                {protocol.ai_model ? 'AI-generated' : 'Curated'} · last updated {lastUpdated}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showRegenerate && (
              <RegenerateProtocolButton
                tier={tier}
                cooldownRemainingMs={cooldownRemainingMs}
              />
            )}
            <Link
              href="/protocol"
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              View full protocol
            </Link>
          </div>
        </div>
        <ul className="space-y-3">
          {supplements.map((supplement, index) => (
            <li key={`${supplement.name}-${index}`}>
              <DashboardProtocolCard
                supplement={supplement}
                showReasoning={tier === 'premium'}
              />
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs">
          Daily tracking and weekly reports arrive in the next build step.
        </p>
      </section>
    </div>
  )
}
