import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

/**
 * Stripe webhook handler — the most security-sensitive code in the app.
 *
 * Required posture:
 *  - Run on the Node runtime so we can read the raw body (Stripe's
 *    signature is computed over the literal request bytes, not parsed JSON).
 *  - Verify every request via stripe.webhooks.constructEvent. Anything that
 *    fails verification is rejected with 400 — DO NOT process it.
 *  - Service-role Supabase client only. The subscriptions table is RLS-locked
 *    against user writes, which is exactly what we want: only this route
 *    (and admin tooling) can modify subscription state.
 *  - Idempotent: Stripe retries deliveries on failure and may re-send under
 *    rare network conditions. We dedup on event.id via the
 *    stripe_webhook_events table — if we've already processed an id, we
 *    return 200 without doing anything.
 *
 * Setup: in dev, run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 * and copy the printed `whsec_...` into STRIPE_WEBHOOK_SECRET.
 */
export const runtime = 'nodejs'
// Skip Next's body parser; we need the raw bytes for signature verification.
// (Route handlers don't auto-parse JSON, but we want to be explicit that
// dynamic = "force-dynamic" — webhooks must always run, never cache.)
export const dynamic = 'force-dynamic'

type SubscriptionStatusValue =
  Database['public']['Tables']['subscriptions']['Row']['status']

/**
 * Map Stripe's full subscription status taxonomy to the smaller set we
 * actually persist. We collapse "incomplete*" into "incomplete" so the
 * settings page and getUserTier() don't have to know about every Stripe
 * intermediate state.
 */
function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatusValue {
  switch (status) {
    case 'trialing':
      return 'trialing'
    case 'active':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled'
    case 'incomplete':
    case 'paused':
    default:
      return 'incomplete'
  }
}

function timestampToIso(seconds: number | null | undefined): string | null {
  if (!seconds) return null
  return new Date(seconds * 1000).toISOString()
}

/**
 * Pull the user_id we attached at checkout time. We tag both the
 * Subscription metadata and the Customer metadata, in that priority order.
 */
async function userIdForSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromSub = subscription.metadata?.user_id
  if (fromSub) return fromSub

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && customer.metadata?.user_id) {
      return customer.metadata.user_id
    }
  } catch (err) {
    console.error('[stripe/webhook] customers.retrieve failed:', err)
  }
  return null
}

/**
 * Centralized writer. Everything that affects subscription state funnels
 * here so we don't have three slightly-different upserts in three handlers.
 */
async function upsertSubscriptionRow(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const status = mapStripeStatus(subscription.status)
  const priceId = subscription.items.data[0]?.price.id ?? null
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  // Newer API versions moved current_period_end onto the subscription item.
  // Read both locations defensively so this keeps working across Stripe
  // API version bumps.
  const subAny = subscription as unknown as { current_period_end?: number | null }
  const currentPeriodEnd =
    subscription.items.data[0]?.current_period_end ?? subAny.current_period_end ?? null

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status,
      price_id: priceId,
      current_period_end: timestampToIso(currentPeriodEnd),
      trial_end: timestampToIso(subscription.trial_end),
    },
    { onConflict: 'user_id' },
  )
  if (error) {
    throw new Error(`subscriptions upsert failed: ${error.message}`)
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature'
    console.error('[stripe/webhook] Signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency check. If this event id has already been processed, ack and
  // skip. Stripe just needs a 2xx — it doesn't care that we did nothing.
  const { data: existing } = await admin
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ received: true, deduped: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.subscription) break

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId =
          session.metadata?.user_id ??
          (await userIdForSubscription(stripe, subscription))
        if (!userId) {
          console.error(
            '[stripe/webhook] checkout.session.completed: no user_id resolved',
            { sessionId: session.id },
          )
          break
        }
        await upsertSubscriptionRow(admin, userId, subscription)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = await userIdForSubscription(stripe, subscription)
        if (!userId) {
          console.error('[stripe/webhook] no user_id for subscription event', {
            eventType: event.type,
            subscriptionId: subscription.id,
          })
          break
        }
        await upsertSubscriptionRow(admin, userId, subscription)
        break
      }

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // The Invoice<>Subscription link moved to invoice.parent on the
        // 2026-04-22.dahlia API version. Read both for resilience.
        const inv = invoice as unknown as {
          subscription?: string | Stripe.Subscription | null
          parent?: { subscription_details?: { subscription?: string | null } | null } | null
        }
        const subscriptionRef =
          (typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id) ??
          inv.parent?.subscription_details?.subscription ??
          null

        if (!subscriptionRef) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionRef)
        const userId = await userIdForSubscription(stripe, subscription)
        if (!userId) break

        // For payment events we want the *current* status (which Stripe has
        // already updated to past_due / active accordingly).
        await upsertSubscriptionRow(admin, userId, subscription)
        break
      }

      default:
        // Other event types are ignored on purpose — keeps the surface
        // area small. Add cases here as we grow the product.
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('[stripe/webhook] Processing failed:', message, { eventId: event.id })
    // Tell Stripe to retry by returning 500. We deliberately DON'T insert
    // into stripe_webhook_events on failure so the next retry will run.
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Mark this event id processed so retries are silent no-ops.
  const { error: insertError } = await admin
    .from('stripe_webhook_events')
    .insert({ id: event.id, type: event.type })
  if (insertError && insertError.code !== '23505') {
    // 23505 = unique_violation; means a concurrent retry won the race —
    // that's fine, we already processed.
    console.error('[stripe/webhook] failed to mark event processed:', insertError)
  }

  return NextResponse.json({ received: true })
}
