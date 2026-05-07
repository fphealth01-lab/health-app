import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { buildContextForUser, buildSystemPrompt, modelForCoachTier } from '@/lib/ai/coach'
import { getRemainingMessages } from '@/lib/actions/coach'
import { saveMessage, recordDailyUsage } from '@/lib/db/coach-db'
import { calculateCostUsd } from '@/lib/ai/models'
import type { ProtocolModel } from '@/lib/ai/models'

const MAX_HISTORY_MESSAGES = 20
const MAX_INPUT_LENGTH = 2000

/** Sanitizes user input — strips null bytes, trims excess whitespace. */
function sanitizeInput(text: string): string {
  return text.replace(/\0/g, '').trim().slice(0, MAX_INPUT_LENGTH)
}

function sseChunk(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

let anthropicClient: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body: { conversationId: string; message: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { conversationId, message } = body
  if (!conversationId || !message) {
    return new Response(JSON.stringify({ error: 'conversationId and message are required' }), {
      status: 400,
    })
  }

  const sanitizedMessage = sanitizeInput(message)
  if (!sanitizedMessage) {
    return new Response(JSON.stringify({ error: 'Message cannot be empty' }), { status: 400 })
  }

  // Rate limit check
  const { remaining } = await getRemainingMessages(user.id)
  if (remaining <= 0) {
    return new Response(JSON.stringify({ error: 'Daily message limit reached' }), { status: 429 })
  }

  // Verify conversation belongs to user
  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!conversation) {
    return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 })
  }

  // Load user tier and context
  const tier = await getUserTier(user.id)
  const context = await buildContextForUser(user.id, tier)
  const systemPrompt = buildSystemPrompt(context)
  const model = modelForCoachTier(tier)

  // Build message history (premium gets full history, free gets just current message)
  let history: { role: 'user' | 'assistant'; content: string }[] = []
  if (tier === 'premium') {
    const { data: pastMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .in('role', ['user', 'assistant'])
      .order('created_at', { ascending: true })
      .limit(MAX_HISTORY_MESSAGES)

    history = (pastMessages ?? []) as { role: 'user' | 'assistant'; content: string }[]
  }

  // Save the user message first
  await saveMessage({
    conversationId,
    userId: user.id,
    role: 'user',
    content: sanitizedMessage,
  })
  await recordDailyUsage(user.id)

  // Set up the streaming response
  const encoder = new TextEncoder()
  const abortController = new AbortController()

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''
      let inputTokens = 0
      let outputTokens = 0

      try {
        const messages: { role: 'user' | 'assistant'; content: string }[] = [
          ...history,
          { role: 'user', content: sanitizedMessage },
        ]

        const anthropicStream = await getAnthropic().messages.stream({
          model,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        })

        // Abort the Anthropic stream if client disconnects
        request.signal.addEventListener('abort', () => {
          abortController.abort()
          anthropicStream.abort()
        })

        for await (const event of anthropicStream) {
          if (abortController.signal.aborted) break

          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullText += text
            controller.enqueue(
              encoder.encode(sseChunk({ type: 'chunk', text })),
            )
          }

          if (event.type === 'message_delta' && event.usage) {
            outputTokens = event.usage.output_tokens
          }

          if (event.type === 'message_start' && event.message.usage) {
            inputTokens = event.message.usage.input_tokens
          }
        }

        // Stream ended — save assistant message
        const costUsd = calculateCostUsd(model as ProtocolModel, inputTokens, outputTokens)
        const savedMessage = await saveMessage({
          conversationId,
          userId: user.id,
          role: 'assistant',
          content: fullText,
          model,
          inputTokens,
          outputTokens,
          estimatedCostUsd: costUsd,
        })

        const { remaining: newRemaining } = await getRemainingMessages(user.id)
        controller.enqueue(
          encoder.encode(
            sseChunk({
              type: 'done',
              messageId: savedMessage.id,
              remaining: newRemaining,
            }),
          ),
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Streaming error'
        controller.enqueue(
          encoder.encode(sseChunk({ type: 'error', message: errorMessage })),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
