import Link from 'next/link'
import { ArrowRight, ShieldCheck, FlaskConical, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const trustSignals = [
  { icon: ShieldCheck, label: 'Reviewed with healthcare professionals' },
  { icon: FlaskConical, label: 'Based on peer-reviewed research' },
  { icon: Users, label: 'Cites 100+ scientific studies' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand gradient backdrop */}
      <div
        aria-hidden
        className="from-secondary/40 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -top-24 left-1/2 -z-10 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            Personalized health, built on research
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Your personalized longevity protocol
          </h1>

          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-balance sm:text-xl">
            Tell us your goal. Get a science-backed supplement stack and meal plan tailored to you
            in 3 minutes.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/signup">
                Build my free protocol
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link href="/#how-it-works">See how it works</Link>
            </Button>
          </div>

          <ul className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {trustSignals.map((signal) => (
              <li key={signal.label} className="flex items-center gap-2">
                <signal.icon className="text-primary h-4 w-4" aria-hidden />
                {signal.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
