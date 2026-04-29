import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Server-only Supabase client using the service role key.
 *
 * BYPASSES Row Level Security. Only use this in trusted server contexts:
 *   - the AI generator (writing to `ai_protocol_logs`, which has no user
 *     INSERT policy)
 *   - the admin cost dashboard (cross-user reads)
 *   - future Stripe webhooks
 *
 * Never import this file from client code or pass its instance through to
 * the browser. The key has full DB access.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var',
    )
  }
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
