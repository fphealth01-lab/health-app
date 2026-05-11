'use client'

import { Sparkles } from 'lucide-react'

export function CoachTypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2">
      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <Sparkles className="h-4 w-4" aria-hidden />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
        <div className="flex gap-1.5">
          <span className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]" />
          <span className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:150ms]" />
          <span className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}
