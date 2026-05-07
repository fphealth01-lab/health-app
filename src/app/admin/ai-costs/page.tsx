import { Card, CardContent } from '@/components/ui/card'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'AI cost monitoring' }

interface CostStats {
  totalCallsThisMonth: number
  totalCostThisMonth: number
  freeCallsThisMonth: number
  freeCostThisMonth: number
  premiumCallsThisMonth: number
  premiumCostThisMonth: number
  cacheHitsThisMonth: number
  fallbacksThisMonth: number
  // Meal plan breakdown
  mealPlanCallsThisMonth: number
  mealPlanCostThisMonth: number
  protocolCallsThisMonth: number
  protocolCostThisMonth: number
}

interface TopUser {
  user_id: string | null
  email: string | null
  total_cost: number
  call_count: number
  meal_plan_cost: number
}

async function loadStats(): Promise<{ stats: CostStats; topUsers: TopUser[] }> {
  const admin = createAdminClient()

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthStartIso = monthStart.toISOString()

  const { data: rows, error } = await admin
    .from('ai_protocol_logs')
    .select('user_id, tier, log_type, estimated_cost_usd, cache_hit, status')
    .gte('created_at', monthStartIso)

  if (error) {
    throw new Error(`Failed to read ai_protocol_logs: ${error.message}`)
  }

  const stats: CostStats = {
    totalCallsThisMonth: 0,
    totalCostThisMonth: 0,
    freeCallsThisMonth: 0,
    freeCostThisMonth: 0,
    premiumCallsThisMonth: 0,
    premiumCostThisMonth: 0,
    cacheHitsThisMonth: 0,
    fallbacksThisMonth: 0,
    mealPlanCallsThisMonth: 0,
    mealPlanCostThisMonth: 0,
    protocolCallsThisMonth: 0,
    protocolCostThisMonth: 0,
  }
  const byUser = new Map<string, { cost: number; calls: number; mealPlanCost: number }>()

  for (const row of rows ?? []) {
    const cost = Number(row.estimated_cost_usd ?? 0)
    const logType = row.log_type ?? 'protocol'
    stats.totalCallsThisMonth += 1
    stats.totalCostThisMonth += cost
    if (row.tier === 'premium') {
      stats.premiumCallsThisMonth += 1
      stats.premiumCostThisMonth += cost
    } else {
      stats.freeCallsThisMonth += 1
      stats.freeCostThisMonth += cost
    }
    if (row.cache_hit) stats.cacheHitsThisMonth += 1
    if (row.status === 'fallback') stats.fallbacksThisMonth += 1

    if (logType === 'meal_plan') {
      stats.mealPlanCallsThisMonth += 1
      stats.mealPlanCostThisMonth += cost
    } else {
      stats.protocolCallsThisMonth += 1
      stats.protocolCostThisMonth += cost
    }

    if (row.user_id) {
      const prev = byUser.get(row.user_id) ?? { cost: 0, calls: 0, mealPlanCost: 0 }
      byUser.set(row.user_id, {
        cost: prev.cost + cost,
        calls: prev.calls + 1,
        mealPlanCost: prev.mealPlanCost + (logType === 'meal_plan' ? cost : 0),
      })
    }
  }

  const ranked = Array.from(byUser.entries())
    .map(([user_id, agg]) => ({ user_id, ...agg }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)

  let topUsers: TopUser[] = []
  if (ranked.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email')
      .in(
        'id',
        ranked.map((r) => r.user_id),
      )
    const emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]))
    topUsers = ranked.map((r) => ({
      user_id: r.user_id,
      email: emailById.get(r.user_id) ?? null,
      total_cost: r.cost,
      call_count: r.calls,
      meal_plan_cost: r.mealPlanCost,
    }))
  }

  return { stats, topUsers }
}

const usd = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 })

export default async function AdminAiCostsPage() {
  const { stats, topUsers } = await loadStats()

  const cacheRate =
    stats.totalCallsThisMonth > 0
      ? Math.round((stats.cacheHitsThisMonth / stats.totalCallsThisMonth) * 100)
      : 0

  const mealPlanAvgCost =
    stats.mealPlanCallsThisMonth > 0
      ? stats.mealPlanCostThisMonth / stats.mealPlanCallsThisMonth
      : 0

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">AI cost monitoring</h1>
        <p className="text-muted-foreground text-sm">
          Month-to-date Anthropic spend across all AI features.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total cost (MTD)" value={usd(stats.totalCostThisMonth)} />
        <Stat label="Total calls (MTD)" value={stats.totalCallsThisMonth.toString()} />
        <Stat label="Cache hit rate" value={`${cacheRate}%`} />
        <Stat label="Fallbacks (MTD)" value={stats.fallbacksThisMonth.toString()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BreakdownCard
          title="Free tier"
          calls={stats.freeCallsThisMonth}
          cost={stats.freeCostThisMonth}
        />
        <BreakdownCard
          title="Premium tier"
          calls={stats.premiumCallsThisMonth}
          cost={stats.premiumCostThisMonth}
        />
      </div>

      {/* Meal plan section */}
      <div>
        <h2 className="text-base font-semibold mb-3">Meal Plan Generator (MTD)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Meal plan generations" value={stats.mealPlanCallsThisMonth.toString()} />
          <Stat label="Total meal plan cost" value={usd(stats.mealPlanCostThisMonth)} />
          <Stat label="Avg cost per generation" value={usd(mealPlanAvgCost)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BreakdownCard
          title="Protocol generator"
          calls={stats.protocolCallsThisMonth}
          cost={stats.protocolCostThisMonth}
        />
        <BreakdownCard
          title="Meal plan generator"
          calls={stats.mealPlanCallsThisMonth}
          cost={stats.mealPlanCostThisMonth}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <h2 className="border-b px-5 py-3 text-sm font-semibold">Top users (MTD)</h2>
          {topUsers.length === 0 ? (
            <p className="text-muted-foreground p-5 text-sm">No AI calls this month yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted-foreground bg-neutral-50/50 text-xs dark:bg-neutral-900/40">
                <tr>
                  <th className="px-5 py-2 text-left font-medium">Email</th>
                  <th className="px-5 py-2 text-right font-medium">Calls</th>
                  <th className="px-5 py-2 text-right font-medium">Total cost</th>
                  <th className="px-5 py-2 text-right font-medium">Meal plan cost</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u) => (
                  <tr key={u.user_id ?? 'unknown'} className="border-t">
                    <td className="px-5 py-2.5">
                      <span className="font-mono text-xs">{u.email ?? '—'}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{u.call_count}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{usd(u.total_cost)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {u.meal_plan_cost > 0 ? usd(u.meal_plan_cost) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

function BreakdownCard({
  title,
  calls,
  cost,
}: {
  title: string
  calls: number
  cost: number
}) {
  const avg = calls > 0 ? cost / calls : 0
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <p className="text-sm font-semibold">{title}</p>
        <div className="grid grid-cols-3 gap-3">
          <Mini label="Calls" value={calls.toString()} />
          <Mini label="Total" value={usd(cost)} />
          <Mini label="Avg" value={usd(avg)} />
        </div>
      </CardContent>
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-base font-medium tabular-nums">{value}</p>
    </div>
  )
}
