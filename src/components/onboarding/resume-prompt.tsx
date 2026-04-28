'use client'

import { Button } from '@/components/ui/button'

interface ResumePromptProps {
  onResume: () => void
  onDiscard: () => void
}

export function ResumePrompt({ onResume, onDiscard }: ResumePromptProps) {
  return (
    <div className="bg-card mx-auto w-full max-w-md rounded-2xl border p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight">Pick up where you left off?</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        We saved your progress from your last session. Resume to keep your answers, or start
        fresh.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onResume} className="flex-1">
          Resume quiz
        </Button>
        <Button onClick={onDiscard} variant="outline" className="flex-1">
          Start over
        </Button>
      </div>
    </div>
  )
}
