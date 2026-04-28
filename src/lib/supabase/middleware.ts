import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refresh the Supabase auth session on every matched request and forward
 * any updated cookies back to the browser. Call this from the project-root
 * `middleware.ts`.
 *
 * Route protection for `/(app)` is intentionally a TODO until we wire up
 * a real Supabase project — for now we just refresh and pass through.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Touch the session so it gets refreshed if needed. Errors are swallowed
  // because we still want to forward the request even if Supabase is down.
  try {
    await supabase.auth.getUser()
  } catch {
    // TODO: log to observability stack once we have one
  }

  // TODO: protect /(app) routes once auth is wired up. Example:
  //   const { data: { user } } = await supabase.auth.getUser()
  //   if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }

  return response
}
