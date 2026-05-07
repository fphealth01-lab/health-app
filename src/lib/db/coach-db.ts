import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Tables } from '@/types/database'

export type MessageRow = Tables<'chat_messages'>

// ── Message persistence ────────────────────────────────────────────────────

export interface SaveMessageParams {
  conversationId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  model?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  estimatedCostUsd?: number | null
}

/**
 * Saves a message to the DB using the admin client.
 * Also updates conversation.last_message_at and auto-generates a title
 * from the first user message.
 *
 * Only callable from trusted server contexts (route handlers, not client
 * components — this file has no 'use server' directive intentionally).
 */
export async function saveMessage(params: SaveMessageParams): Promise<MessageRow> {
  const admin = createAdminClient()

  const { data: message, error } = await admin
    .from('chat_messages')
    .insert({
      conversation_id: params.conversationId,
      user_id: params.userId,
      role: params.role,
      content: params.content,
      model: params.model ?? null,
      input_tokens: params.inputTokens ?? null,
      output_tokens: params.outputTokens ?? null,
      estimated_cost_usd: params.estimatedCostUsd ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to save message: ${error.message}`)

  const now = new Date().toISOString()

  // Update conversation timestamps
  await admin
    .from('chat_conversations')
    .update({ last_message_at: now, updated_at: now })
    .eq('id', params.conversationId)

  // Auto-generate title from first user message (only when title is null)
  if (params.role === 'user') {
    await admin
      .from('chat_conversations')
      .update({ title: params.content.slice(0, 60) })
      .eq('id', params.conversationId)
      .is('title', null)
  }

  return message
}

/** Increments the daily usage counter for a user. */
export async function recordDailyUsage(userId: string): Promise<void> {
  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: existing } = await admin
    .from('chat_daily_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    await admin
      .from('chat_daily_usage')
      .update({ message_count: existing.message_count + 1 })
      .eq('user_id', userId)
      .eq('date', today)
  } else {
    await admin.from('chat_daily_usage').insert({ user_id: userId, date: today, message_count: 1 })
  }
}
