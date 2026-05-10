import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTrialEndingEmail } from '@/lib/email/email-actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Daily cron — sends "trial ending in 2 days" emails.
 *
 * Vercel cron config (vercel.json):
 *   { "path": "/api/cron/send-trial-ending-emails", "schedule": "0 9 * * *" }
 *
 * Security: only callable by Vercel Cron or a request with the correct
 * CRON_SECRET header. Returns 401 for anything else.
 *
 * TODO: configure CRON_SECRET in Vercel environment variables before deploy.
 */
export async function GET() {
  const headersList = await headers()
  const cronSecret = headersList.get('x-cron-secret')
  const isVercelCron = headersList.get('x-vercel-cron') === '1'
  const isAuthorized = isVercelCron || cronSecret === process.env.CRON_SECRET

  if (!isAuthorized) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = getStripe()
  const admin = createAdminClient()

  // Target: trial_end is between 47h and 49h from now (2-day window with buffer).
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now + 47 * 3600
  const windowEnd = now + 49 * 3600

  let sent = 0
  let failed = 0

  try {
    // Fetch trialing subscriptions whose trial ends in the 2-day window.
    const subscriptions = await stripe.subscriptions.list({
      status: 'trialing',
      limit: 100,
    })

    for (const sub of subscriptions.data) {
      if (!sub.trial_end) continue
      if (sub.trial_end < windowStart || sub.trial_end > windowEnd) continue

      const userId = sub.metadata?.user_id
      if (!userId) continue

      // Look up user's email and usage stats.
      const [profileResult, coachCountResult, protocolCountResult] = await Promise.all([
        admin.from('profiles').select('email, full_name').eq('id', userId).maybeSingle(),
        admin
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('role', 'user'),
        admin
          .from('protocols')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ])

      const profile = profileResult.data
      if (!profile?.email) continue

      const trialEndDate = new Date(sub.trial_end * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

      const result = await sendTrialEndingEmail(
        userId,
        profile.email,
        profile.full_name ?? null,
        trialEndDate,
        coachCountResult.count ?? 0,
        protocolCountResult.count ?? 0,
      )

      if (result.success) {
        sent++
      } else {
        failed++
        console.error(`[cron/trial-ending] Failed for userId ${userId}:`, result.error)
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[cron/trial-ending] Fatal error:', message)
    return Response.json({ error: message }, { status: 500 })
  }

  console.log(`[cron/trial-ending] Done. sent=${sent} failed=${failed}`)
  return Response.json({ sent, failed })
}
