import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Email confirmation / OAuth callback.
 *
 * Supabase redirects the user here after they click the confirmation link.
 * We exchange the one-time `?code` for an authenticated session (PKCE),
 * persist it via the cookie store, then redirect onward.
 *
 * Destination:
 *   ?next=…  → caller-supplied path (e.g. /pricing after a paywall)
 *   else     → /onboarding if the profile hasn't completed onboarding,
 *              /dashboard otherwise.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
    )
  }

  let destination = nextParam ?? '/dashboard'

  if (!nextParam && data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile && profile.onboarding_completed === false) {
      destination = '/onboarding'
    }
  }

  return NextResponse.redirect(new URL(destination, request.url))
}
