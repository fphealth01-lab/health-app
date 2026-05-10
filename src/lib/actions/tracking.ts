'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/analytics/posthog-server'

/** Returns today's date as a YYYY-MM-DD string in the server's local time. */
function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// markSupplementTaken
// ---------------------------------------------------------------------------

export type MarkSupplementResult = { ok: true } | { ok: false; error: string }

/**
 * Toggle a supplement's taken status for today.
 *
 * Uses UPSERT so calling it multiple times is safe (idempotent). The RLS
 * policy on tracking_entries enforces user ownership at the DB level, but we
 * also verify the protocol_item belongs to the authenticated user here to
 * give a clear error message.
 */
export async function markSupplementTaken(
  protocolItemId: string,
  taken: boolean,
): Promise<MarkSupplementResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }

  // Verify ownership: the protocol_item must belong to one of this user's protocols.
  const { data: item, error: itemError } = await supabase
    .from('protocol_items')
    .select('id, protocol_id, protocols!inner(user_id)')
    .eq('id', protocolItemId)
    .maybeSingle()

  if (itemError || !item) {
    return { ok: false, error: 'Supplement not found.' }
  }

  const protocol = Array.isArray(item.protocols) ? item.protocols[0] : item.protocols
  if (protocol?.user_id !== user.id) {
    return { ok: false, error: 'You do not own this supplement.' }
  }

  const today = todayDateString()
  const { error: upsertError } = await supabase.from('tracking_entries').upsert(
    {
      user_id: user.id,
      protocol_item_id: protocolItemId,
      date: today,
      taken,
      taken_at: taken ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,protocol_item_id,date' },
  )

  if (upsertError) {
    console.error('[tracking] markSupplementTaken upsert error:', upsertError.message)
    return { ok: false, error: 'Failed to save. Try again.' }
  }

  // Check milestone: first ever supplement taken
  if (taken) {
    const { count } = await supabase
      .from('tracking_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('taken', true)

    if (count === 1) {
      // Return milestone info — the client will show the toast
      revalidatePath('/dashboard')
      revalidatePath('/tracker')
      return { ok: true, milestone: 'first' } as { ok: true; milestone: string }
    }

    // Check 7-day streak milestone
    const streak = await getStreakDays(user.id)

    // Track the entry along with streak data (fire-and-forget)
    const { count: supplementCount } = await supabase
      .from('tracking_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('date', todayDateString())
      .eq('taken', true)

    captureServerEvent({
      userId: user.id,
      event: 'tracker_entry_logged',
      properties: {
        streak_days: streak,
        supplements_taken_count: supplementCount ?? 1,
      },
    }).catch(() => {})

    if (streak === 7) {
      revalidatePath('/dashboard')
      revalidatePath('/tracker')
      return { ok: true, milestone: 'week' } as { ok: true; milestone: string }
    }
    if (streak === 30) {
      revalidatePath('/dashboard')
      revalidatePath('/tracker')
      return { ok: true, milestone: 'month' } as { ok: true; milestone: string }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tracker')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// submitDailyCheckin
// ---------------------------------------------------------------------------

const dailyCheckinSchema = z.object({
  energy: z.number().int().min(1).max(10),
  mood: z.number().int().min(1).max(10),
  sleep_quality: z.number().int().min(1).max(10),
  sleep_hours: z.number().min(4).max(12).optional(),
  stress_level: z.number().int().min(1).max(10),
  notes: z.string().max(1000).optional(),
})

export type DailyCheckinInput = z.infer<typeof dailyCheckinSchema>
export type SubmitCheckinResult = { ok: true } | { ok: false; error: string }

/**
 * Upsert a daily check-in for today. Only one check-in per user per day
 * (enforced by the UNIQUE(user_id, date) constraint).
 */
export async function submitDailyCheckin(
  input: DailyCheckinInput,
): Promise<SubmitCheckinResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated.' }

  const parsed = dailyCheckinSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const today = todayDateString()
  const { error } = await supabase.from('daily_checkins').upsert(
    {
      user_id: user.id,
      date: today,
      energy_level: parsed.data.energy,
      mood: parsed.data.mood,
      sleep_quality: parsed.data.sleep_quality,
      sleep_hours: parsed.data.sleep_hours ?? null,
      stress_level: parsed.data.stress_level,
      notes: parsed.data.notes ?? null,
    },
    { onConflict: 'user_id,date' },
  )

  if (error) {
    console.error('[tracking] submitDailyCheckin error:', error.message)
    return { ok: false, error: 'Failed to save check-in. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tracker')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// getStreakDays
// ---------------------------------------------------------------------------

/**
 * Calculates the current consecutive-day streak for a user.
 *
 * Rules:
 * - A day "counts" if there is at least one tracking_entry with taken=true.
 * - Today counts only if at least one supplement is already marked taken.
 * - If yesterday has no entry the streak is 0 (regardless of today).
 */
export async function getStreakDays(userId: string): Promise<number> {
  const supabase = await createClient()

  // Fetch distinct dates (last 60 days is more than enough for any real streak)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const { data: rows } = await supabase
    .from('tracking_entries')
    .select('date')
    .eq('user_id', userId)
    .eq('taken', true)
    .gte('date', sixtyDaysAgo.toISOString().slice(0, 10))
    .order('date', { ascending: false })

  if (!rows || rows.length === 0) return 0

  // Unique dates descending
  const takenDates = [...new Set(rows.map((r) => r.date))].sort().reverse()

  const today = todayDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  // Streak starts from today if taken today, else from yesterday
  const startDate = takenDates[0] === today ? today : yesterdayStr

  // If neither today nor yesterday has an entry → streak is 0
  if (startDate !== today && startDate !== yesterdayStr) return 0
  if (!takenDates.includes(startDate)) return 0

  let streak = 0
  let cursor = new Date(startDate)

  for (const date of takenDates.filter((d) => d <= startDate)) {
    const expected = cursor.toISOString().slice(0, 10)
    if (date === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// ---------------------------------------------------------------------------
// getWeeklyMetrics
// ---------------------------------------------------------------------------

export interface DailyMetric {
  date: string
  energy: number | null
  mood: number | null
  sleep_quality: number | null
  stress_level: number | null
}

/**
 * Returns the last 7 days of daily check-in metrics, filling missing days
 * with null so charts always have a full 7-point array.
 */
export async function getWeeklyMetrics(userId: string): Promise<DailyMetric[]> {
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const startDate = sevenDaysAgo.toISOString().slice(0, 10)

  const { data: rows } = await supabase
    .from('daily_checkins')
    .select('date, energy_level, mood, sleep_quality, stress_level')
    .eq('user_id', userId)
    .gte('date', startDate)
    .order('date', { ascending: true })

  // Build a map for O(1) lookups
  const byDate = new Map(
    (rows ?? []).map((r) => [
      r.date,
      {
        energy: r.energy_level,
        mood: r.mood,
        sleep_quality: r.sleep_quality,
        stress_level: r.stress_level,
      },
    ]),
  )

  // Generate all 7 days, filling gaps with nulls
  const result: DailyMetric[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = byDate.get(dateStr)
    result.push({
      date: dateStr,
      energy: entry?.energy ?? null,
      mood: entry?.mood ?? null,
      sleep_quality: entry?.sleep_quality ?? null,
      stress_level: entry?.stress_level ?? null,
    })
  }

  return result
}

// ---------------------------------------------------------------------------
// getSupplementAdherence (last 7 days, per protocol_item)
// ---------------------------------------------------------------------------

export interface SupplementAdherence {
  protocolItemId: string
  name: string
  doseMg: number
  doseUnit: string
  timing: string
  /** Array of 7 booleans: index 0 = 6 days ago, index 6 = today */
  days: boolean[]
  takenCount: number
}

/**
 * Returns per-supplement adherence for the last 7 days.
 */
export async function getSupplementAdherence(
  userId: string,
  protocolItemIds: string[],
): Promise<SupplementAdherence[]> {
  if (protocolItemIds.length === 0) return []

  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const startDate = sevenDaysAgo.toISOString().slice(0, 10)

  // Fetch all tracking entries for this user's protocol items in the last 7 days
  const { data: entries } = await supabase
    .from('tracking_entries')
    .select('protocol_item_id, date, taken')
    .eq('user_id', userId)
    .in('protocol_item_id', protocolItemIds)
    .gte('date', startDate)

  // Also fetch supplement details
  const { data: items } = await supabase
    .from('protocol_items')
    .select('id, dose_mg, dose_unit, timing, supplements(name)')
    .in('id', protocolItemIds)
    .eq('protocol_id', await getUserProtocolId(userId, supabase))

  const entriesByItem = new Map<string, Map<string, boolean>>()
  for (const entry of entries ?? []) {
    if (!entriesByItem.has(entry.protocol_item_id)) {
      entriesByItem.set(entry.protocol_item_id, new Map())
    }
    entriesByItem.get(entry.protocol_item_id)!.set(entry.date, entry.taken)
  }

  const dateLabels: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    dateLabels.push(d.toISOString().slice(0, 10))
  }

  return (items ?? []).map((item) => {
    const dateMap = entriesByItem.get(item.id) ?? new Map()
    const days = dateLabels.map((date) => dateMap.get(date) === true)
    const supplement = Array.isArray(item.supplements) ? item.supplements[0] : item.supplements
    return {
      protocolItemId: item.id,
      name: supplement?.name ?? 'Supplement',
      doseMg: item.dose_mg,
      doseUnit: item.dose_unit,
      timing: item.timing,
      days,
      takenCount: days.filter(Boolean).length,
    }
  })
}

async function getUserProtocolId(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data } = await supabase
    .from('protocols')
    .select('id')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.id ?? ''
}
