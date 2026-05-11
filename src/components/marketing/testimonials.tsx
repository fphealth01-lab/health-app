import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Founder, 38',
    initials: 'MT',
    quote:
      'I had been taking 12 supplements based on random podcasts. Lyvewell cut it down to 6 that actually move the needle for me. My energy stabilized within two weeks.',
  },
  {
    name: 'Aisha K.',
    role: 'Physician, 41',
    initials: 'AK',
    quote:
      "As a clinician, I'm picky about evidence. The citation-first approach won me over — every recommendation links to the literature so I can verify it.",
  },
  {
    name: 'Daniel R.',
    role: 'Engineer, 34',
    initials: 'DR',
    quote:
      'The meal plan was the unlock for me. I stopped overthinking food and just executed the plan. Lost 11 lbs and my sleep score is the highest it has ever been.',
  },
]

export function Testimonials() {
  return (
    <section className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            People are seeing real changes
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Stories from members on personalized protocols.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card h-full">
              <CardContent className="flex h-full flex-col gap-5 p-6 sm:p-7">
                <div
                  className="flex items-center gap-1 text-amber-500"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                  ))}
                </div>
                <p className="leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
