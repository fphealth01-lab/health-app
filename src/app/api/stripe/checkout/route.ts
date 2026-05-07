import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/client'
import { PRICE_IDS, TRIAL_DAYS } from '@/lib/stripe/config'
import { features } from '@/config/features'

export const runtime = 'nodejs'

/**
 * Create a Stripe Checkout Session for the authenticated user.
 *
 * Body: { priceId: string }
 * Response: { url: string } — the client redirects window.location to this.
 *
 * Flow:
 *   1. Authenticate via Supabase cookie session.
 *   2. Validate priceId against the server-side allowlist (don't trust the
 *      client to send arbitrary Stripe price IDs).
 *   3. Look up or create a Stripe Customer for this user, persisting
 *      stripe_customer_id on the subscriptions row so future checkout +
 *      portal sessions reuse it.
 *   4. Create a Checkout Session with a 7-day trial and tag both the
 *      session and the resulting subscription with user_id metadata so
 *      webhooks can map back to our user.
 */
export async function POST(req: NextRequest) {
  if (!features.stripeCheckoutEnabled) {
    return NextResponse.json({ error: 'Checkout is currently disabled.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const priceId =
    body && typeof body === 'object' && 'priceId' in body
      ? String((body as { priceId: unknown }).priceId)
      : ''

  const allowedPriceIds = Object.values(PRICE_IDS).filter(Boolean)
  if (!priceId || !allowedPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Unknown priceId' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'You need to sign in first.' }, { status: 401 })
  }

  const stripe = getStripe()
  const admin = createAdminClient()

  // Try to reuse an existing Customer for this user. We use the admin client
  // so we can read AND upsert without RLS roadblocks.
  const { data: existingSub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  // If they're already premium, send them through the billing portal instead
  // of stacking a second subscription.
  if (
    existingSub &&
    (existingSub.status === 'active' || existingSub.status === 'trialing')
  ) {
    return NextResponse.json(
      { error: 'You already have an active subscription.' },
      { status: 409 },
    )
  }

  let customerId = existingSub?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id

    // Upsert so we don't lose the customer ID even if the user abandons
    // checkout. The webhook will fill in the rest of the row when the
    // subscription is actually created.
    const { error: upsertError } = await admin.from('subscriptions').upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: existingSub?.status ?? 'incomplete',
      },
      { onConflict: 'user_id' },
    )
    if (upsertError) {
      console.error('[stripe/checkout] Failed to persist customer id:', upsertError)
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin.replace(/\/$/, '')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { user_id: user.id },
      },
      // Belt-and-braces: also tag the session itself so webhooks that fire
      // before the subscription object is fully populated can still match.
      metadata: { user_id: user.id },
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=canceled`,
      automatic_tax: { enabled: false },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL' },
        { status: 500 },
      )
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    console.error('[stripe/checkout] Session create failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
