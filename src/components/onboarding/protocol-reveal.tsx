import Link from 'next/link'
import { Check, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Goal } from '@/types/user'

export interface RevealSupplement {
  name: string
  doseMg: number | null
  doseUnit: string
  timing: string
  reasoning: string
}

interface ProtocolRevealProps {
  goal: Goal
  greetingName: string
  supplements: RevealSupplement[]
}

const goalLabels: Record<Goal, string> = {
  testosterone: 'testosterone & energy',
  sleep: 'sleep & recovery',
  skin: 'skin & anti-aging',
  energy: 'daily energy',
  focus: 'focus & cognition',
  longevity: 'longevity',
}

const premiumBullets = [
  '4 more supplements tailored to YOU specifically',
  'Monthly meal plan included',
  'Member supplement discounts (15–30% off)',
  'Unlimited AI coach with memory',
  'Cancel anytime',
]

function formatTiming(timing: string): string {
  return timing.split('_').join(' ')
}

function formatDose(doseMg: number | null, unit: string): string {
  if (!doseMg) return ''
  return `${doseMg} ${unit}`
}

export function ProtocolReveal({ goal, greetingName, supplements }: ProtocolRevealProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-3 text-center">
        <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Your protocol is ready
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Here&apos;s your {goalLabels[goal]} protocol, {greetingName}
        </h1>
        <p className="text-muted-foreground">
          Three foundational supplements selected for your goal. Take consistently for at least
          4–6 weeks before judging results.
        </p>
      </header>

      <ol className="space-y-3">
        {supplements.map((supplement, index) => (
          <li key={`${supplement.name}-${index}`}>
            <Card className="bg-card">
              <CardContent className="flex items-start gap-4 p-5">
                <span className="bg-primary/10 text-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight">{supplement.name}</h3>
                    {formatDose(supplement.doseMg, supplement.doseUnit) && (
                      <span className="text-muted-foreground text-sm">
                        {formatDose(supplement.doseMg, supplement.doseUnit)} ·{' '}
                        {formatTiming(supplement.timing)}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {supplement.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      {/* Locked premium preview */}
      <div className="relative overflow-hidden rounded-2xl border border-dashed">
        <div
          aria-hidden
          className="from-background/0 via-background/60 to-background pointer-events-none absolute inset-0 z-10 bg-gradient-to-b"
        />
        <ul className="space-y-3 p-5 blur-[3px]" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="bg-muted/50 flex items-center gap-4 rounded-xl border p-4"
            >
              <span className="bg-muted h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-1/3 rounded" />
                <div className="bg-muted h-3 w-2/3 rounded" />
              </div>
            </li>
          ))}
        </ul>
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center pb-5">
          <span className="bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm">
            <Lock className="h-3.5 w-3.5" aria-hidden />4 more supplements in your personalized
            stack
          </span>
        </div>
      </div>

      {/* Premium CTA */}
      <Card className="border-primary/30 from-primary/5 to-secondary/30 bg-gradient-to-br via-transparent">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-balance text-2xl font-semibold tracking-tight">
              Unlock your fully personalized 7-supplement stack
            </h2>
            <p className="text-muted-foreground">
              Premium members get a deeper protocol tuned to their inputs, ongoing AI coaching,
              and member-only supplement discounts.
            </p>
          </div>

          <ul className="space-y-2.5">
            {premiumBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm">
                <span className="bg-primary/10 text-primary mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/pricing">Start 7-day free trial — $9.99/mo after</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/dashboard">Continue with free protocol</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
