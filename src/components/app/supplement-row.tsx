'use client'

import { useOptimistic, useTransition } from 'react'
import { CheckCircle2, Circle, Pill } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { markSupplementTaken } from '@/lib/actions/tracking'

export interface SupplementRowItem {
  protocolItemId: string
  name: string
  doseMg: number | null
  doseUnit: string
  timing: string
  reasoning?: string
  /** Whether the supplement is already marked taken today */
  takenToday: boolean
  takenAt: string | null
}

interface SupplementRowProps {
  item: SupplementRowItem
  showReasoning?: boolean
}

function formatTiming(timing: string): string {
  return timing.split('_').join(' ')
}

function formatDose(doseMg: number | null, unit: string): string {
  if (!doseMg) return ''
  return `${doseMg} ${unit}`
}

function formatTakenAt(takenAt: string | null): string {
  if (!takenAt) return ''
  const date = new Date(takenAt)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function SupplementRow({ item, showReasoning = false }: SupplementRowProps) {
  const [optimisticTaken, setOptimisticTaken] = useOptimistic(item.takenToday)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const nextTaken = !optimisticTaken

    startTransition(async () => {
      setOptimisticTaken(nextTaken)

      const result = await markSupplementTaken(item.protocolItemId, nextTaken)

      if (!result.ok) {
        toast.error(result.error ?? "Couldn't save — try again.")
        return
      }

      // Milestone toasts
      const resultWithMilestone = result as { ok: true; milestone?: string }
      if (resultWithMilestone.milestone === 'first') {
        toast.success('Great start! 🌱', { description: 'First supplement tracked.' })
      } else if (resultWithMilestone.milestone === 'week') {
        toast.success('1 week streak! 🔥', { description: "You're on fire — keep it up!" })
      } else if (resultWithMilestone.milestone === 'month') {
        toast.success('30 days! Legend status 🏆', { description: 'Incredible consistency.' })
      } else if (nextTaken) {
        toast.success(`${item.name} marked as taken`, { duration: 1500 })
      }
    })
  }

  const dose = formatDose(item.doseMg, item.doseUnit)
  const takenAtStr = formatTakenAt(item.takenAt)

  return (
    <Card
      className={`bg-card transition-opacity ${optimisticTaken ? 'opacity-75' : 'opacity-100'}`}
    >
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        {/* Checkbox — 44px touch target */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={optimisticTaken ? `Unmark ${item.name} as taken` : `Mark ${item.name} as taken`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 disabled:opacity-60"
        >
          {optimisticTaken ? (
            <CheckCircle2 className="text-primary h-7 w-7 fill-current" aria-hidden />
          ) : (
            <Circle className="text-muted-foreground h-7 w-7" aria-hidden />
          )}
        </button>

        {/* Supplement icon */}
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
            optimisticTaken ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Pill className="h-5 w-5" aria-hidden />
        </span>

        {/* Details */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h3
              className={`truncate text-base font-semibold tracking-tight ${
                optimisticTaken ? 'text-muted-foreground line-through decoration-1' : ''
              }`}
            >
              {item.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              {dose && <span>{dose} · </span>}
              {formatTiming(item.timing)}
            </p>
          </div>
          {optimisticTaken && takenAtStr ? (
            <p className="text-primary text-xs font-medium">Taken at {takenAtStr}</p>
          ) : optimisticTaken ? (
            <p className="text-primary text-xs font-medium">Taken</p>
          ) : showReasoning && item.reasoning ? (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {item.reasoning}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
