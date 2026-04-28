import { ClipboardList, Sparkles, LineChart } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    title: 'Take the quiz',
    description:
      'Answer a few questions about your goals, lifestyle, current supplements, and medications. Three minutes, no fluff.',
  },
  {
    icon: Sparkles,
    title: 'Get your personalized plan',
    description:
      'Our AI engine builds a supplement stack and meal plan tailored to you, with citations for every recommendation.',
  },
  {
    icon: LineChart,
    title: 'Track and optimize',
    description:
      'Log how you feel, refine your protocol every month, and watch your trends move in the right direction.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <p className="text-muted-foreground mt-4 text-lg">
            From assessment to optimization in three simple steps.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="bg-card relative rounded-2xl border p-6 sm:p-8">
              <div className="bg-primary text-primary-foreground absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </div>
              <div className="bg-primary/10 text-primary mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg">
                <step.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
