import 'server-only'

import { createClient } from '@/lib/supabase/server'

/**
 * True if the current request is from a user whose email is in ADMIN_EMAILS
 * (comma-separated, lowercased). Returns false when not signed in. Throws
 * if the env var is missing in production-like environments — a misconfigured
 * admin gate should fail loudly.
 */
export async function isAdminUser(): Promise<{ isAdmin: boolean; email: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email?.toLowerCase() ?? null
  if (!email) return { isAdmin: false, email: null }

  const raw = process.env.ADMIN_EMAILS ?? ''
  const allowed = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowed.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[admin] ADMIN_EMAILS is empty in production — denying access.')
    }
    return { isAdmin: false, email }
  }

  return { isAdmin: allowed.includes(email), email }
}
