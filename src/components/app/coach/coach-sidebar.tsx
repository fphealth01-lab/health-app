'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createConversation, deleteConversation } from '@/lib/actions/coach'
import type { ConversationRow } from '@/lib/actions/coach'

interface CoachSidebarProps {
  conversations: ConversationRow[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: (conversation: ConversationRow) => void
  onDelete: (id: string) => void
  onNavigate?: () => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function CoachSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onNavigate,
}: CoachSidebarProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleNew() {
    startTransition(async () => {
      const conversation = await createConversation()
      onNew(conversation)
      onNavigate?.()
    })
  }

  function handleDelete(event: React.MouseEvent, id: string) {
    event.stopPropagation()
    setDeletingId(id)
    startTransition(async () => {
      await deleteConversation(id)
      onDelete(id)
      setDeletingId(null)
    })
  }

  return (
    <aside className="bg-sidebar flex h-full flex-col border-r">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleNew}
          disabled={isPending}
          className="h-9 gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-xs">
            No conversations yet.
            <br />
            Start a new chat above.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => {
                    onSelect(conv.id)
                    onNavigate?.()
                  }}
                  className={cn(
                    'group flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    conv.id === activeId
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {conv.title ?? 'New conversation'}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {formatDate(conv.last_message_at)}
                    </span>
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className={cn(
                      'mt-0.5 shrink-0 rounded p-1.5 opacity-0 transition-opacity group-hover:opacity-100',
                      'hover:bg-destructive/10 hover:text-destructive',
                    )}
                    aria-label={`Delete conversation`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
