import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/client'

export const runtime = 'nodejs'

/**
 * Open a Stripe Billing Portal session so the user can:
 *   - update their payment method
 *   - switch monthly ↔ yearly
 *   - cancel (at end of period or immediately, per portal config)
 *   - download invoices
 *
 * Body: {} (empty)
 * Response: { url: string } — the client redirects to it.
 *
 * 400 if the user has never had a Stripe customer record. That shouldn't
 * happen in normal flow (settings only renders this button when premium),
 * but we surface a friendly error rather than a 500.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'You need to sign in first.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "You don't have a billing account yet — start a subscription first." },
      { status: 400 },
    )
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin.replace(/\/$/, '')

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${siteUrl}/settings`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    console.error('[stripe/portal] Session create failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
