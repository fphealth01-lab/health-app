'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/auth/user-tier'
import { createAdminClient } from '@/lib/supabase/admin'
import { RATE_LIMIT_FREE, RATE_LIMIT_PREMIUM } from '@/lib/ai/coach'
import type { Tables } from '@/types/database'

export type ConversationRow = Tables<'chat_conversations'>
export type MessageRow = Tables<'chat_messages'>

// ── Rate limiting ──────────────────────────────────────────────────────────

/**
 * Returns today's message count and the user's daily limit.
 */
export async function getRemainingMessages(
  userId: string,
): Promise<{ used: number; limit: number; remaining: number }> {
  const tier = await getUserTier(userId)
  const limit = tier === 'premium' ? RATE_LIMIT_PREMIUM : RATE_LIMIT_FREE

  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await admin
    .from('chat_daily_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  const used = data?.message_count ?? 0
  return { used, limit, remaining: Math.max(0, limit - used) }
}

// ── Conversation management ────────────────────────────────────────────────

/** Creates a new conversation and returns it. */
export async function createConversation(): Promise<ConversationRow> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({ user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(`Failed to create conversation: ${error.message}`)
  return data
}

/** Lists the user's conversations (last 30 days, for premium sidebar). */
export async function listConversations(): Promise<ConversationRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('chat_conversations')
    .select('*')
    .gte('last_message_at', cutoff)
    .order('last_message_at', { ascending: false })

  return data ?? []
}

/** Loads all messages for a conversation (auth enforced by RLS). */
export async function getConversationMessages(
  conversationId: string,
): Promise<MessageRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return data ?? []
}

/** Deletes a conversation (auth enforced by RLS). */
export async function deleteConversation(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('chat_conversations').delete().eq('id', conversationId)
}
