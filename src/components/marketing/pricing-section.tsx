import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description: 'Get started with a generic stack and core content.',
    cta: { label: 'Create free account', href: '/signup' },
    highlighted: false,
    features: [
      'Generic 3-supplement starter stack',
      'Track up to 5 supplements',
      '5 coach questions per day',
      'Full content library',
    ],
  },
  {
    name: 'Premium',
    price: '$9.99',
    cadence: '/month',
    annualNote: 'or $59.99 / year — save 50%',
    description: 'Personalized for your body and goals. Cancel anytime.',
    cta: { label: 'Start 7-day free trial', href: '/pricing' },
    highlighted: true,
    features: [
      'Personalized 5–7 supplement protocol',
      'Monthly personalized meal plan',
      'Member supplement discounts (15–30% off)',
      'Unlimited coach with conversation memory',
    ],
  },
] as const

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple pricing. Real results.
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Free to start. Upgrade when you want full personalization.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-stretch">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlighted
                ? 'border-primary ring-primary/10 bg-card relative shadow-lg ring-4'
                : 'bg-card relative'
            }
          >
            {tier.highlighted && (
              <span className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium">
                Most popular
              </span>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.cadence}</span>
              </div>
              {'annualNote' in tier && tier.annualNote && (
                <p className="text-primary mt-1 text-xs font-medium">{tier.annualNote}</p>
              )}
              <CardDescription className="mt-3">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span className="bg-primary/10 text-primary mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={tier.highlighted ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href={tier.cta.href}>{tier.cta.label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
