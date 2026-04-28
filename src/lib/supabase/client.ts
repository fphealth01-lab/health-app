import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Browser-side Supabase client (Client Components, event handlers).
 * Uses public env vars only — never expose the service-role key here.
 *
 * Typed with `<Database>` so `.from('profiles')` etc. autocomplete and
 * return rows shaped to the live schema.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
