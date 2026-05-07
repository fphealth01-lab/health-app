'use client'

import { Brain } from 'lucide-react'
import { CoachSuggestedQuestions } from './coach-suggested-questions'

interface CoachEmptyStateProps {
  goal: string | null
  tier: 'free' | 'premium'
  onSelectQuestion: (question: string) => void
}

export function CoachEmptyState({ goal, tier, onSelectQuestion }: CoachEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-10">
      <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
        <Brain className="text-primary h-8 w-8" />
      </div>

      <div className="max-w-sm space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Your AI Health Coach</h2>
        <p className="text-muted-foreground text-sm">
          {tier === 'premium'
            ? 'Ask me anything about your protocol, supplements, or health goals. I know your full profile and tracking history.'
            : 'Ask me anything about supplements, health optimization, and your wellness goals.'}
        </p>
      </div>

      <div className="w-full max-w-lg">
        <CoachSuggestedQuestions goal={goal} onSelect={onSelectQuestion} />
      </div>
    </div>
  )
}
