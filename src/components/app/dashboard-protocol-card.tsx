import { Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface DashboardSupplement {
  name: string
  doseMg: number | null
  doseUnit: string
  timing: string
}

function formatTiming(timing: string): string {
  return timing.split('_').join(' ')
}

function formatDose(doseMg: number | null, unit: string): string {
  if (!doseMg) return ''
  return `${doseMg} ${unit}`
}

interface DashboardProtocolCardProps {
  supplement: DashboardSupplement
  /**
   * Whether the "Mark taken" button is visually present. Wired-up tracking
   * comes in Step 4 — for now this is a no-op placeholder.
   */
  showTrackingPlaceholder?: boolean
}

export function DashboardProtocolCard({
  supplement,
  showTrackingPlaceholder = true,
}: DashboardProtocolCardProps) {
  const dose = formatDose(supplement.doseMg, supplement.doseUnit)
  return (
    <Card className="bg-card">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Pill className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="truncate text-base font-semibold tracking-tight">{supplement.name}</h3>
          <p className="text-muted-foreground text-sm">
            {dose && <span>{dose} · </span>}
            {formatTiming(supplement.timing)}
          </p>
        </div>
        {showTrackingPlaceholder && (
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Tracking comes in the next build step"
            className="hidden sm:inline-flex"
          >
            Mark taken
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
