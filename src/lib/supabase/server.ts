import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Reads/writes auth cookies via Next.js' cookie store so
 * sessions persist across requests.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // `set` may be called from a Server Component — that's fine if
            // a middleware refreshes the session, since the middleware will
            // set the cookies for the next request.
          }
        },
      },
    },
  )
}
