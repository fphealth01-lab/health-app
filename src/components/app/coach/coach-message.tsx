'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { MessageRow } from '@/lib/actions/coach'

interface CoachMessageProps {
  message: MessageRow
  onSuggestProtocolChange?: (content: string) => void
}

export function CoachMessage({ message, onSuggestProtocolChange }: CoachMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-3 px-4 py-2">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-none px-4 py-3 text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  // Check if the message contains a protocol suggestion pattern
  const hasSuggestion =
    onSuggestProtocolChange &&
    /\b(suggest|recommend|consider|swap|replace|add|switch)\b/i.test(message.content) &&
    /\b(supplement|protocol|stack|vitamin|mineral|omega|magnesium|zinc|vitamin\s+\w+)\b/i.test(
      message.content,
    )

  return (
    <div className="flex items-end gap-3 px-4 py-2">
      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        AI
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 text-sm">
          <div
            className={cn(
              'prose prose-sm dark:prose-invert max-w-none',
              '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
              '[&_code]:bg-background [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs',
              '[&_pre]:bg-background [&_pre]:rounded-lg [&_pre]:p-3',
              '[&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5',
              '[&_p]:my-1 first:[&_p]:mt-0 last:[&_p]:mb-0',
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </div>
        {hasSuggestion && (
          <button
            onClick={() => onSuggestProtocolChange(message.content)}
            className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 py-1 text-xs font-medium transition-colors"
          >
            Apply suggested protocol change →
          </button>
        )}
      </div>
    </div>
  )
}

/** Streaming assistant message (content accumulates in real-time). */
export function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex items-end gap-3 px-4 py-2">
      <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        AI
      </div>
      <div className="bg-muted max-w-[85%] rounded-2xl rounded-bl-none px-4 py-3 text-sm">
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none',
            '[&_a]:text-primary [&_a]:underline',
            '[&_p]:my-1 first:[&_p]:mt-0 last:[&_p]:mb-0',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        <span className="bg-primary ml-0.5 inline-block h-4 w-0.5 animate-pulse" />
      </div>
    </div>
  )
}
