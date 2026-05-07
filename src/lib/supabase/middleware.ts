import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Fully public paths — accessible by everyone whether logged in or not.
 * The middleware never redirects away from these regardless of auth state.
 */
const PUBLIC_PATH_PREFIXES = [
  '/',
  '/blog',
  '/supplements',
  '/go',
  '/pricing',
  '/auth',
  '/api',
] as const

/**
 * Path prefixes that require an authenticated session. Mirrors the route
 * group `src/app/(app)/`. Anonymous users hitting these get bounced to
 * `/login?next=<original-path>`.
 */
const APP_PATH_PREFIXES = [
  '/dashboard',
  '/protocol',
  '/tracker',
  '/coach',
  '/meal-plan',
  '/settings',
  '/onboarding', // also covers /onboarding/reveal
] as const

/**
 * Path prefixes for the auth pages that anonymous users belong on. If a
 * signed-in user lands here, send them to the dashboard. We keep
 * `/onboarding` OUT of this list — that page is for signed-in users
 * who haven't finished the quiz yet.
 */
const AUTH_PATH_PREFIXES = ['/login', '/signup'] as const

function matchesPrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some(
    (prefix) =>
      pathname === prefix ||
      (prefix !== '/' && pathname.startsWith(`${prefix}/`)),
  )
}

/**
 * Refresh the Supabase session for every request the middleware matches and,
 * based on the user's auth state, redirect to the appropriate gate:
 *   - Public paths (/, /blog, /supplements, /go, /pricing) → always pass through.
 *   - Unauthenticated user hitting an `(app)` page → `/login?next=…`
 *   - Authenticated user hitting `/login` or `/signup` → `/dashboard`
 *   - Everything else → pass through.
 *
 * The Supabase client wired here writes refreshed cookies onto BOTH the
 * incoming request (so downstream RSCs see the new session) and the outgoing
 * response (so the browser stores them). This is the @supabase/ssr-recommended
 * pattern; see https://supabase.com/docs/guides/auth/server-side/nextjs.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname

  // Public routes: always pass through — no auth check or redirect possible.
  // This explicitly covers /, /blog/*, /supplements/*, /go/*, /pricing.
  if (matchesPrefix(pathname, PUBLIC_PATH_PREFIXES)) {
    return response
  }

  const supabase = createServerClient<Database>(
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

  // IMPORTANT: getUser() must be called between createServerClient and any
  // redirect/return so the session is actually refreshed/validated, not just
  // read from cookies. Per Supabase docs, do NOT replace with getSession()
  // here — it doesn't validate against the auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (matchesPrefix(pathname, APP_PATH_PREFIXES) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (matchesPrefix(pathname, AUTH_PATH_PREFIXES) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
