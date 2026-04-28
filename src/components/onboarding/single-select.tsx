'use client'

import { cn } from '@/lib/utils'
import type { SingleSelectQuestion } from '@/config/onboarding-quiz'

interface SingleSelectProps {
  question: SingleSelectQuestion
  value: string | null
  onChange: (value: string) => void
}

export function SingleSelect({ question, value, onChange }: SingleSelectProps) {
  return (
    <fieldset>
      <legend className="sr-only">{question.title}</legend>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => {
          const selected = value === option.value
          return (
            <label
              key={option.value}
              className={cn(
                'group cursor-pointer rounded-xl border bg-card px-4 py-4 transition-all',
                'hover:border-primary/40 hover:bg-accent/40',
                selected
                  ? 'border-primary bg-accent ring-primary/20 ring-4'
                  : 'border-border',
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                {option.icon && (
                  <span className="text-2xl leading-none" aria-hidden>
                    {option.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-base font-medium',
                      selected ? 'text-foreground' : 'text-foreground',
                    )}
                  >
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-muted-foreground text-sm">{option.description}</p>
                  )}
                </div>
                <span
                  aria-hidden
                  className={cn(
                    'h-5 w-5 shrink-0 rounded-full border-2 transition-colors',
                    selected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
                  )}
                >
                  {selected && (
                    <span className="block h-full w-full scale-50 rounded-full bg-white" />
                  )}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
