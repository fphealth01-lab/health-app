'use client'

import { useRef, useEffect, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const MAX_CHARS = 2000

interface CoachInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isStreaming: boolean
  isDisabled: boolean
  remaining: number
  limit: number
  tier: 'free' | 'premium'
}

export function CoachInput({
  value,
  onChange,
  onSend,
  isStreaming,
  isDisabled,
  remaining,
  limit,
  tier,
}: CoachInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea as content grows
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isDisabled && !isStreaming && value.trim()) {
        onSend()
      }
    }
  }

  const overLimit = remaining <= 0 && tier === 'free'
  const charsLeft = MAX_CHARS - value.length
  const canSend = !isDisabled && !isStreaming && value.trim().length > 0 && !overLimit

  return (
    <div className="border-t px-4 py-3">
      {tier === 'free' && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {overLimit ? (
              <span className="text-destructive font-medium">Daily limit reached</span>
            ) : (
              <>
                <span className="font-medium">{remaining}</span> of {limit} messages remaining today
              </>
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            Free tier ·{' '}
            <a href="/pricing" className="text-primary underline underline-offset-2">
              Upgrade
            </a>
          </p>
        </div>
      )}

      <div
        className={cn(
          'border-input focus-within:ring-ring flex items-end gap-2 rounded-xl border bg-white px-3 py-2 focus-within:ring-2 dark:bg-zinc-950',
          (isDisabled || overLimit) && 'opacity-60',
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder={overLimit ? 'Daily limit reached — upgrade for more' : 'Ask your coach…'}
          disabled={isDisabled || overLimit}
          rows={1}
          className="max-h-48 min-h-[2rem] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed"
          aria-label="Message to coach"
        />

        <div className="flex shrink-0 items-center gap-2 pb-0.5">
          {value.length > MAX_CHARS * 0.8 && (
            <span
              className={cn(
                'text-xs',
                charsLeft < 100 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {charsLeft}
            </span>
          )}
          <Button
            size="icon"
            onClick={onSend}
            disabled={!canSend}
            className="h-11 w-11 shrink-0 rounded-lg"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mt-1.5 text-center text-xs">
        Not medical advice. Always consult a healthcare professional.
      </p>
    </div>
  )
}
