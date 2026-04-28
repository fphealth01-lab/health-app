import { Pill, UtensilsCrossed, Droplet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Pill,
    title: 'Personalized Supplement Protocol',
    description:
      'A 5–7 supplement stack matched to your goal, dosed and timed for your body and lifestyle.',
    badge: null,
  },
  {
    icon: UtensilsCrossed,
    title: 'Monthly Meal Plan',
    description:
      'A fresh, goal-aligned meal plan every month. Recipes, shopping lists, macros — done for you.',
    badge: null,
  },
  {
    icon: Droplet,
    title: 'Bloodwork Analysis',
    description:
      'Upload your labs and get plain-language insights with concrete, evidence-based next steps.',
    badge: 'Coming soon',
  },
]

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Three pillars. One protocol.
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          We combine the inputs that matter most into one coherent plan you can actually follow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="bg-card hover:border-primary/30 relative overflow-hidden transition-colors"
          >
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg">
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                {feature.badge && (
                  <Badge variant="secondary" className="shrink-0">
                    {feature.badge}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
