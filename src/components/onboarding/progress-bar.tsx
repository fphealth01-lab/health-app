'use client'

import { Progress } from '@/components/ui/progress'

interface ProgressBarProps {
  current: number
  total: number
}

export function QuizProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100)

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <span>
          Question {current} of {total}
        </span>
        <span>{percent}%</span>
      </div>
      <Progress
        value={percent}
        className="h-1.5"
        aria-label={`Quiz progress: ${current} of ${total} questions complete`}
      />
    </div>
  )
}
