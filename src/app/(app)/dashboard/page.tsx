import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DashboardProtocolCard,
  type DashboardSupplement,
} from '@/components/app/dashboard-protocol-card'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Dashboard' }

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
      protocol_items (
        dose_mg,
        dose_unit,
        timing,
        order_index,
        supplements ( name )
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

  const supplements: DashboardSupplement[] = [...(protocol.protocol_items ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({
      name: item.supplements?.name ?? 'Supplement',
      doseMg: item.dose_mg ?? null,
      doseUnit: item.dose_unit ?? 'mg',
      timing: item.timing ?? 'flexible',
    }))

  const greetingName = profile.full_name?.trim().split(/\s+/)[0] || profile.email || 'there'

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

      <section aria-labelledby="todays-stack" className="mt-10 space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="todays-stack" className="text-xl font-semibold tracking-tight">
            Today&apos;s stack
          </h2>
          <Link
            href="/protocol"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            View full protocol
          </Link>
        </div>
        <ul className="space-y-3">
          {supplements.map((supplement, index) => (
            <li key={`${supplement.name}-${index}`}>
              <DashboardProtocolCard supplement={supplement} />
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
