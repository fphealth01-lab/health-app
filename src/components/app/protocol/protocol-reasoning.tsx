'use client'

import { useState } from 'react'
import { ChevronDown, Wand2 } from 'lucide-react'

interface ProtocolReasoningProps {
  reasoning: string
}

export function ProtocolReasoning({ reasoning }: ProtocolReasoningProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="hover:bg-muted/40 flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
      >
        <span className="bg-primary/10 text-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Wand2 className="h-4 w-4" aria-hidden />
        </span>
        <span className="flex-1 text-sm font-medium">Why this protocol?</span>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground px-5 pb-5 text-sm leading-relaxed">{reasoning}</p>
        </div>
      </div>
    </div>
  )
}
