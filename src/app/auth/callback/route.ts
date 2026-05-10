import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/email-actions'

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
/**
 * Reject anything that's not a same-origin path. Without this an attacker
 * could craft `?next=https://evil.example` to phish via the email link.
 */
function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = safeNext(url.searchParams.get('next'))

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

  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, full_name, email')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!nextParam && profile && profile.onboarding_completed === false) {
      destination = '/onboarding'
    }

    // Send the welcome email once per user (idempotent — email_log dedupes it).
    // Fire-and-forget: we don't await, so the redirect is not delayed.
    const userEmail = profile?.email ?? data.user.email
    if (userEmail) {
      sendWelcomeEmail(data.user.id, userEmail, profile?.full_name ?? null).catch((err) => {
        console.error('[auth/callback] welcome email failed:', err)
      })
    }
  }

  return NextResponse.redirect(new URL(destination, request.url))
}
