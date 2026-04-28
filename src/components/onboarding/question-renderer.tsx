'use client'

import type { QuizAnswers, QuizQuestion } from '@/config/onboarding-quiz'
import { SingleSelect } from './single-select'
import { MultiSelect } from './multi-select'
import { SliderQuestion } from './slider-question'

interface QuestionRendererProps {
  question: QuizQuestion
  answers: QuizAnswers
  onAnswer: (field: keyof QuizAnswers, value: QuizAnswers[keyof QuizAnswers]) => void
}

/**
 * Routes a question to the right input by `type`. Single-selects and sliders
 * write their value directly to the field; multi-selects write an array.
 *
 * For Q3 (age) the option values are numeric strings — we coerce to int here
 * so `answers.age` is always `number | null`.
 */
export function QuestionRenderer({ question, answers, onAnswer }: QuestionRendererProps) {
  switch (question.type) {
    case 'single_select': {
      const raw = answers[question.field]
      const current = raw === null || raw === undefined ? null : String(raw)
      return (
        <SingleSelect
          question={question}
          value={current}
          onChange={(value) => {
            const coerced = question.field === 'age' ? Number(value) : value
            onAnswer(question.field, coerced as QuizAnswers[keyof QuizAnswers])
          }}
        />
      )
    }
    case 'multi_select': {
      const current = (answers[question.field] as string[] | null) ?? []
      return (
        <MultiSelect
          question={question}
          value={current}
          onChange={(value) => onAnswer(question.field, value)}
        />
      )
    }
    case 'slider': {
      const current = answers[question.field] as number | null
      return (
        <SliderQuestion
          question={question}
          value={current}
          onChange={(value) => onAnswer(question.field, value)}
        />
      )
    }
  }
}
