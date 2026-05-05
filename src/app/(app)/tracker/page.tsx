import { redirect } from 'next/navigation'
import { StreakCard } from '@/components/app/streak-card'
import { WeeklyMetricsChart } from '@/components/app/weekly-metrics-chart'
import { SupplementAdherenceSection } from '@/components/app/supplement-adherence'
import { DailyCheckinCard } from '@/components/app/daily-checkin-card'
import { createClient } from '@/lib/supabase/server'
import {
  getStreakDays,
  getWeeklyMetrics,
  getSupplementAdherence,
} from '@/lib/actions/tracking'

export const metadata = { title: 'Tracker' }

/** Format a YYYY-MM-DD date string into a human-readable label */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export default async function TrackerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Fetch the user's current protocol
  const { data: protocol } = await supabase
    .from('protocols')
    .select(
      `
      id,
      protocol_items (
        id,
        dose_mg,
        dose_unit,
        timing,
        order_index,
        supplements ( name )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!protocol) redirect('/onboarding')

  const protocolItemIds = (protocol.protocol_items ?? []).map((item) => item.id)
  const today = new Date().toISOString().slice(0, 10)

  // Fetch all data in parallel
  const [streak, weeklyMetrics, adherence, { data: recentCheckins }, { data: todayCheckin }] =
    await Promise.all([
      getStreakDays(user.id),
      getWeeklyMetrics(user.id),
      getSupplementAdherence(user.id, protocolItemIds),
      supabase
        .from('daily_checkins')
        .select('date, energy_level, mood, sleep_quality, sleep_hours, stress_level, notes')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7),
      supabase
        .from('daily_checkins')
        .select('energy_level, mood, sleep_quality, sleep_hours, stress_level, notes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle(),
    ])

  // Count total supplements taken in the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const { count: takenCount } = await supabase
    .from('tracking_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('taken', true)
    .gte('date', sevenDaysAgo.toISOString().slice(0, 10))

  const checkinForCard = todayCheckin
    ? {
        energy: todayCheckin.energy_level,
        mood: todayCheckin.mood,
        sleep_quality: todayCheckin.sleep_quality,
        sleep_hours: todayCheckin.sleep_hours,
        stress_level: todayCheckin.stress_level,
        notes: todayCheckin.notes,
      }
    : null

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Header */}
      <header className="mb-8 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground text-sm">
          Track your consistency and see how your metrics trend over time.
        </p>
      </header>

      {/* Top stats row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCard streak={streak} />
        <DailyCheckinCard todayCheckin={checkinForCard} />
      </div>

      {/* 7-day summary */}
      <div className="mt-6">
        <p className="text-muted-foreground text-sm">
          You took{' '}
          <span className="text-foreground font-semibold">{takenCount ?? 0} supplements</span>{' '}
          over the last 7 days.
        </p>
      </div>

      {/* Weekly trend chart */}
      <div className="mt-6">
        <WeeklyMetricsChart data={weeklyMetrics} />
      </div>

      {/* Supplement adherence */}
      <div className="mt-6">
        <SupplementAdherenceSection supplements={adherence} />
      </div>

      {/* Recent check-ins */}
      <section aria-labelledby="recent-checkins" className="mt-8">
        <h2 id="recent-checkins" className="mb-4 text-lg font-semibold tracking-tight">
          Recent check-ins
        </h2>

        {!recentCheckins || recentCheckins.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            No check-ins yet. Log your first one from the dashboard.
          </div>
        ) : (
          <div className="space-y-3">
            {recentCheckins.map((checkin) => (
              <CheckinCard key={checkin.date} checkin={checkin} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline sub-component — small enough to not warrant its own file
// ---------------------------------------------------------------------------

interface CheckinRow {
  date: string
  energy_level: number
  mood: number
  sleep_quality: number
  sleep_hours: number | null
  stress_level: number
  notes: string | null
}

function CheckinCard({ checkin }: { checkin: CheckinRow }) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{formatDate(checkin.date)}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <MetricBadge label="Energy" value={checkin.energy_level} />
        <MetricBadge label="Mood" value={checkin.mood} />
        <MetricBadge label="Sleep" value={checkin.sleep_quality} />
        <MetricBadge label="Stress" value={checkin.stress_level} />
        {checkin.sleep_hours != null && (
          <MetricBadge label="Hrs slept" value={checkin.sleep_hours} />
        )}
      </div>

      {checkin.notes && (
        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm italic">
          &ldquo;{checkin.notes}&rdquo;
        </p>
      )}
    </div>
  )
}

function MetricBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5">
      <span className="text-foreground text-sm font-bold tabular-nums">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}
