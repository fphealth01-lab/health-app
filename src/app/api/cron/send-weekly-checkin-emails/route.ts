import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWeeklyCheckinEmail } from '@/lib/email/email-actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Weekly cron — sends Sunday check-in emails to engaged users.
 *
 * Vercel cron config (vercel.json):
 *   { "path": "/api/cron/send-weekly-checkin-emails", "schedule": "0 9 * * 0" }
 *
 * "Engaged" = has at least one tracking entry in the last 14 days.
 * Stats: adherence % (taken entries / total entries this week),
 *        streak (consecutive tracked days), top supplement.
 *
 * Security: only callable by Vercel Cron or a request with the correct
 * CRON_SECRET header.
 */
export async function GET() {
  const headersList = await headers()
  const cronSecret = headersList.get('x-cron-secret')
  const isVercelCron = headersList.get('x-vercel-cron') === '1'
  const isAuthorized = isVercelCron || cronSecret === process.env.CRON_SECRET

  if (!isAuthorized) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)
  const fourteenDaysAgo = new Date(today)
  fourteenDaysAgo.setDate(today.getDate() - 14)

  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]!
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0]!

  let sent = 0
  let failed = 0

  try {
    // Find distinct users who tracked anything in the last 14 days.
    const { data: activeUsers } = await admin
      .from('tracking_entries')
      .select('user_id')
      .gte('date', fourteenDaysAgoStr)

    if (!activeUsers || activeUsers.length === 0) {
      return Response.json({ sent: 0, failed: 0, message: 'No active users found' })
    }

    const userIds = [...new Set(activeUsers.map((r) => r.user_id))]

    for (const userId of userIds) {
      const [profileResult, weekEntriesResult] = await Promise.all([
        admin.from('profiles').select('email, full_name').eq('id', userId).maybeSingle(),
        admin
          .from('tracking_entries')
          .select('taken, protocol_item_id')
          .eq('user_id', userId)
          .gte('date', sevenDaysAgoStr),
      ])

      const profile = profileResult.data
      if (!profile?.email) continue

      const weekEntries = weekEntriesResult.data ?? []
      const totalEntries = weekEntries.length
      const takenEntries = weekEntries.filter((e) => e.taken).length
      const adherencePercent =
        totalEntries > 0 ? Math.round((takenEntries / totalEntries) * 100) : 0

      // Streak: count consecutive days ending today that have ≥1 taken entry.
      // (Simplified: we use total taken days in the window, not strict consecutive.)
      // TODO: implement a proper streak query in a later iteration.
      const streakDays = takenEntries > 0 ? Math.min(takenEntries, 7) : 0

      // Top supplement: the protocol_item_id with the most `taken=true` entries.
      // We map to supplement name later; for now we pass the id and let the
      // template show a generic label if no name is found.
      const itemCounts = weekEntries
        .filter((e) => e.taken)
        .reduce<Record<string, number>>((acc, e) => {
          acc[e.protocol_item_id] = (acc[e.protocol_item_id] ?? 0) + 1
          return acc
        }, {})
      const topItemId = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

      // Resolve the supplement name for the top item.
      let topSupplement: string | null = null
      if (topItemId) {
        const { data: item } = await admin
          .from('protocol_items')
          .select('supplement_id, supplements(name)')
          .eq('id', topItemId)
          .maybeSingle()
        // Supabase join returns supplements as an object with name field
        const supplementData = item?.supplements as { name?: string } | null
        topSupplement = supplementData?.name ?? null
      }

      const result = await sendWeeklyCheckinEmail(
        userId,
        profile.email,
        profile.full_name ?? null,
        adherencePercent,
        streakDays,
        topSupplement,
      )

      if (result.success) {
        sent++
      } else {
        failed++
        console.error(`[cron/weekly-checkin] Failed for userId ${userId}:`, result.error)
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[cron/weekly-checkin] Fatal error:', message)
    return Response.json({ error: message }, { status: 500 })
  }

  console.log(`[cron/weekly-checkin] Done. sent=${sent} failed=${failed}`)
  return Response.json({ sent, failed })
}
