'use client'

interface CoachSuggestedQuestionsProps {
  goal: string | null
  onSelect: (question: string) => void
}

function buildQuestions(goal: string | null): string[] {
  const goalLabel = goal ?? 'my health'
  return [
    `What does my protocol do for ${goalLabel}?`,
    'How should I take my supplements for best absorption?',
    'What lifestyle changes complement my current protocol?',
    'What should I track to measure my progress?',
    'Are there any supplements I should consider adding or removing?',
  ]
}

export function CoachSuggestedQuestions({ goal, onSelect }: CoachSuggestedQuestionsProps) {
  const questions = buildQuestions(goal)

  return (
    <div className="flex flex-col gap-2 px-4">
      <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
        Suggested questions
      </p>
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="border-border bg-card hover:bg-muted text-foreground rounded-xl border px-4 py-3 text-left text-sm transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
