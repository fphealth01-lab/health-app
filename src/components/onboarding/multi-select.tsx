'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MultiSelectQuestion } from '@/config/onboarding-quiz'

interface MultiSelectProps {
  question: MultiSelectQuestion
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiSelect({ question, value, onChange }: MultiSelectProps) {
  const noneSelected =
    question.noneValue !== undefined && value.includes(question.noneValue)

  function toggle(optionValue: string) {
    // Selecting "none" wipes everything else; selecting anything else clears
    // "none". This makes the answer self-consistent without yelling at users.
    if (question.noneValue !== undefined && optionValue === question.noneValue) {
      onChange(noneSelected ? [] : [question.noneValue])
      return
    }

    const without = value.filter((v) => v !== question.noneValue)
    const next = without.includes(optionValue)
      ? without.filter((v) => v !== optionValue)
      : [...without, optionValue]
    onChange(next)
  }

  return (
    <fieldset>
      <legend className="sr-only">{question.title}</legend>
      <div className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const isNoneOption =
            question.noneValue !== undefined && option.value === question.noneValue
          const selected = value.includes(option.value)
          const disabled = !selected && noneSelected && !isNoneOption

          return (
            <label
              key={option.value}
              className={cn(
                'group rounded-xl border bg-card px-4 py-3.5 transition-all',
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:border-primary/40 hover:bg-accent/40 cursor-pointer',
                selected
                  ? 'border-primary bg-accent ring-primary/20 ring-4'
                  : 'border-border',
              )}
            >
              <input
                type="checkbox"
                name={question.id}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => toggle(option.value)}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                    selected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-white" />}
                </span>
                <span className="text-base font-medium">{option.label}</span>
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
