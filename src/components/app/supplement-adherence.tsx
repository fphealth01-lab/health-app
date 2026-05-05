import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SupplementAdherence } from '@/lib/actions/tracking'

interface SupplementAdherenceProps {
  supplements: SupplementAdherence[]
}

function AdherenceDots({ days }: { days: boolean[] }) {
  const dayLabels = ['6d', '5d', '4d', '3d', '2d', 'Yest', 'Today']

  return (
    <div className="flex gap-1.5" aria-label="Last 7 days">
      {days.map((taken, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={`h-5 w-5 rounded-full transition-colors ${
              taken ? 'bg-primary' : 'bg-muted border-2 border-muted-foreground/20'
            }`}
            title={`${dayLabels[i]}: ${taken ? 'taken' : 'not taken'}`}
            aria-label={`${dayLabels[i]}: ${taken ? 'taken' : 'not taken'}`}
          />
        </div>
      ))}
    </div>
  )
}

function AdherencePercent({ takenCount, totalDays }: { takenCount: number; totalDays: number }) {
  const pct = totalDays > 0 ? Math.round((takenCount / totalDays) * 100) : 0
  const color =
    pct >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : pct >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'

  return (
    <span className={`text-xs font-semibold tabular-nums ${color}`}>
      {takenCount}/{totalDays} days ({pct}%)
    </span>
  )
}

/**
 * Shows per-supplement adherence for the last 7 days as a row of dots
 * with a percentage breakdown.
 */
export function SupplementAdherenceSection({ supplements }: SupplementAdherenceProps) {
  if (supplements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supplement adherence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No protocol found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Supplement adherence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="text-muted-foreground flex justify-end gap-1.5 text-xs">
          {['6d ago', '5d', '4d', '3d', '2d', 'Yest', 'Today'].map((label) => (
            <span key={label} className="w-5 text-center text-[10px]">
              {label === '6d ago' ? '6d' : label}
            </span>
          ))}
        </div>

        {supplements.map((supplement) => (
          <div key={supplement.protocolItemId} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{supplement.name}</p>
                <p className="text-muted-foreground text-xs">
                  {supplement.doseMg} {supplement.doseUnit} · {supplement.timing.split('_').join(' ')}
                </p>
              </div>
              <AdherencePercent takenCount={supplement.takenCount} totalDays={7} />
            </div>
            <AdherenceDots days={supplement.days} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
