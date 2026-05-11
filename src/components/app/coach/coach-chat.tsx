'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Menu, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CoachMessage, StreamingMessage } from './coach-message'
import { CoachInput } from './coach-input'
import { CoachTypingIndicator } from './coach-typing-indicator'
import { CoachEmptyState } from './coach-empty-state'
import { CoachSidebar } from './coach-sidebar'
import { CoachRateLimitModal } from './coach-rate-limit-modal'
import { getConversationMessages, createConversation } from '@/lib/actions/coach'
import type { ConversationRow, MessageRow } from '@/lib/actions/coach'

interface CoachChatProps {
  userId: string
  tier: 'free' | 'premium'
  goal: string | null
  initialConversations: ConversationRow[]
  initialConversationId: string | null
  initialMessages: MessageRow[]
  initialRemaining: number
  rateLimit: number
}

type StreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done'; messageId: string; remaining: number }
  | { type: 'error'; message: string }

export function CoachChat({
  userId,
  tier,
  goal,
  initialConversations,
  initialConversationId,
  initialMessages,
  initialRemaining,
  rateLimit,
}: CoachChatProps) {
  const [conversations, setConversations] = useState<ConversationRow[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId,
  )
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [showRateLimitModal, setShowRateLimitModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, startTransition] = useTransition()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return
    startTransition(async () => {
      const loaded = await getConversationMessages(activeConversationId)
      setMessages(loaded)
    })
  }, [activeConversationId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      if (remaining <= 0 && tier === 'free') {
        setShowRateLimitModal(true)
        return
      }

      // Ensure we have an active conversation
      let conversationId = activeConversationId
      if (!conversationId) {
        const newConv = await createConversation()
        conversationId = newConv.id
        setActiveConversationId(newConv.id)
        setConversations((prev) => [newConv, ...prev])
      }

      setInputValue('')
      setIsStreaming(true)
      setStreamingText('')

      // Optimistically add user message to UI
      const tempUserMessage: MessageRow = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content,
        model: null,
        input_tokens: null,
        output_tokens: null,
        estimated_cost_usd: null,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempUserMessage])

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const response = await fetch('/api/coach/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message: content }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
          if (response.status === 429) {
            setShowRateLimitModal(true)
            setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
            return
          }
          throw new Error(errorData.error ?? 'Request failed')
        }

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finalText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const jsonStr = line.slice(6).trim()
            if (!jsonStr) continue

            try {
              const event = JSON.parse(jsonStr) as StreamEvent

              if (event.type === 'chunk') {
                finalText += event.text
                setStreamingText(finalText)
              } else if (event.type === 'done') {
                setRemaining(event.remaining)
                // Replace streaming text with the saved message
                const savedMessage: MessageRow = {
                  id: event.messageId,
                  conversation_id: conversationId!,
                  user_id: userId,
                  role: 'assistant',
                  content: finalText,
                  model: null,
                  input_tokens: null,
                  output_tokens: null,
                  estimated_cost_usd: null,
                  created_at: new Date().toISOString(),
                }
                setMessages((prev) => [
                  ...prev.filter((m) => m.id !== tempUserMessage.id),
                  tempUserMessage,
                  savedMessage,
                ])
                setStreamingText(null)
              } else if (event.type === 'error') {
                throw new Error(event.message)
              }
            } catch (parseError) {
              // Skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        // Revert optimistic update on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
        setStreamingText(null)
      } finally {
        setIsStreaming(false)
        setStreamingText(null)
        abortControllerRef.current = null
      }
    },
    [activeConversationId, isStreaming, remaining, tier, userId],
  )

  function handleSelectQuestion(question: string) {
    setInputValue(question)
  }

  function handleSuggestProtocolChange(messageContent: string) {
    const prompt = `Based on your last message, please generate a specific protocol change recommendation. What supplement should I add, remove, or swap, and why?`
    sendMessage(prompt)
  }

  function handleSelectConversation(id: string) {
    setActiveConversationId(id)
    setStreamingText(null)
    setSidebarOpen(false)
  }

  function handleNewConversation(conv: ConversationRow) {
    setConversations((prev) => [conv, ...prev])
    setActiveConversationId(conv.id)
    setMessages([])
    setStreamingText(null)
    setSidebarOpen(false)
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) {
      const next = conversations.find((c) => c.id !== id)
      setActiveConversationId(next?.id ?? null)
      setMessages([])
    }
  }

  const hasMessages = messages.length > 0 || streamingText !== null

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop sidebar (premium only) */}
      {tier === 'premium' && (
        <div className="hidden w-64 shrink-0 lg:block">
          <CoachSidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={handleSelectConversation}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
          />
        </div>
      )}

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Chat header */}
        <header className="bg-background/80 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md">
          {/* Mobile sidebar toggle (premium only) */}
          {tier === 'premium' && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open conversations">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Conversations</SheetTitle>
                </SheetHeader>
                <CoachSidebar
                  conversations={conversations}
                  activeId={activeConversationId}
                  onSelect={handleSelectConversation}
                  onNew={handleNewConversation}
                  onDelete={handleDeleteConversation}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold">Your Coach</h1>
            {tier === 'premium' && (
              <p className="text-muted-foreground text-xs">
                Knows your protocol + 7-day tracking
              </p>
            )}
          </div>

          {tier === 'premium' && (
            <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 dark:bg-teal-950">
              <Shield className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                Full context
              </span>
            </div>
          )}
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4">
          {!hasMessages ? (
            <CoachEmptyState
              goal={goal}
              tier={tier}
              onSelectQuestion={handleSelectQuestion}
            />
          ) : (
            <div className="space-y-1 pb-4">
              {messages.map((message) => (
                <CoachMessage
                  key={message.id}
                  message={message}
                  onSuggestProtocolChange={
                    tier === 'premium' ? handleSuggestProtocolChange : undefined
                  }
                />
              ))}
              {streamingText !== null && <StreamingMessage content={streamingText} />}
              {isStreaming && streamingText === '' && <CoachTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <CoachInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => sendMessage(inputValue)}
          isStreaming={isStreaming}
          isDisabled={isStreaming}
          remaining={remaining}
          limit={rateLimit}
          tier={tier}
        />
      </div>

      <CoachRateLimitModal
        open={showRateLimitModal}
        onOpenChange={setShowRateLimitModal}
      />
    </div>
  )
}
