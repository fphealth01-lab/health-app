import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How is the protocol personalized?',
    answer:
      'Your answers in the onboarding quiz go through a research-backed process that filters supplements by goal, age, sex, current medications, dietary preferences, and known contraindications. Premium members get a 5–7 supplement stack with dosing and timing tuned to their inputs. Free users get a curated generic stack for their goal.',
  },
  {
    question: 'Is this medical advice?',
    answer:
      "No. Lyvewell is an informational and educational platform. Nothing in the app constitutes medical advice. Always consult a licensed healthcare professional before starting, stopping, or changing any supplement, medication, or treatment — especially if you're pregnant, nursing, or managing a chronic condition.",
  },
  {
    question: 'Do you sell the supplements?',
    answer:
      'No. We are independent of supplement brands. We recommend a small set of vetted third-party brands per region, and Premium members get a 15–30% member discount through our partners. We may earn affiliate revenue, but recommendations are based on quality, evidence, and value — never sponsorship.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. The 7-day Premium trial is free, and you can cancel before it ends with one click — no charge. After that, monthly and annual plans cancel anytime from your account settings.',
  },
  {
    question: 'What are your sources?',
    answer:
      "Every recommendation in your protocol links to the underlying research — typically a peer-reviewed study, systematic review, or meta-analysis. We bias toward stronger evidence (human RCTs, replication) over animal or in-vitro work. If the science isn't strong enough, we don't recommend it.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Short answers to the obvious questions.
        </p>
      </div>
      <Accordion type="single" collapsible className="mt-10 w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
