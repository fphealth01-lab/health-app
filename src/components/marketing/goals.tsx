import { Flame, Moon, Sparkle } from 'lucide-react'

const goals = [
  {
    icon: Flame,
    title: 'Testosterone & Energy',
    description:
      'Optimize natural testosterone, daytime drive, and physical performance with evidence-based stacks.',
    accentClass: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10',
  },
  {
    icon: Moon,
    title: 'Sleep & Recovery',
    description:
      'Fall asleep faster, sleep deeper, and wake up actually rested — no grogginess, no dependence.',
    accentClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    icon: Sparkle,
    title: 'Skin & Anti-aging',
    description:
      'Support collagen, mitochondrial health, and cellular longevity from the inside out.',
    accentClass: 'text-primary bg-primary/10',
  },
]

export function Goals() {
  return (
    <section id="science" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for the goals that matter
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Pick a primary goal at signup. Your protocol is shaped around it from day one.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {goals.map((goal) => (
          <article
            key={goal.title}
            className="bg-card hover:border-primary/30 group rounded-2xl border p-6 transition-colors sm:p-8"
          >
            <div
              className={`${goal.accentClass} mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg`}
            >
              <goal.icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{goal.title}</h3>
            <p className="text-muted-foreground mt-2 leading-relaxed">{goal.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
