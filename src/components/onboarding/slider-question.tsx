'use client'

import { Slider } from '@/components/ui/slider'
import type { SliderQuestion as SliderQuestionType } from '@/config/onboarding-quiz'

interface SliderQuestionProps {
  question: SliderQuestionType
  value: number | null
  onChange: (value: number) => void
}

export function SliderQuestion({ question, value, onChange }: SliderQuestionProps) {
  const current = value ?? question.defaultValue

  return (
    <fieldset className="space-y-8">
      <legend className="sr-only">{question.title}</legend>

      <div className="flex flex-col items-center gap-2">
        <div
          className="text-primary text-7xl font-semibold tracking-tight tabular-nums"
          aria-live="polite"
        >
          {current}
        </div>
        <div className="text-muted-foreground text-sm">
          out of {question.max}
        </div>
      </div>

      <div className="px-2">
        <Slider
          value={[current]}
          min={question.min}
          max={question.max}
          step={question.step}
          onValueChange={(values) => {
            const next = values[0]
            if (typeof next === 'number') onChange(next)
          }}
          aria-label={question.title}
        />
        <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs font-medium">
          <span>
            {question.min} · {question.minLabel}
          </span>
          <span>
            {question.maxLabel} · {question.max}
          </span>
        </div>
      </div>
    </fieldset>
  )
}
