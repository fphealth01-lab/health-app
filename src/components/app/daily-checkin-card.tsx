'use client'

import { useState } from 'react'
import { ClipboardCheck, Plus, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DailyCheckinModal } from './daily-checkin-modal'
import type { DailyCheckinInput } from '@/lib/actions/tracking'

interface TodayCheckin {
  energy: number
  mood: number
  sleep_quality: number
  sleep_hours: number | null
  stress_level: number
  notes: string | null
}

interface DailyCheckinCardProps {
  todayCheckin: TodayCheckin | null
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted px-3 py-2">
      <span className="text-foreground text-base font-bold tabular-nums">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

export function DailyCheckinCard({ todayCheckin }: DailyCheckinCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const defaultValues: Partial<DailyCheckinInput> | undefined = todayCheckin
    ? {
        energy: todayCheckin.energy,
        mood: todayCheckin.mood,
        sleep_quality: todayCheckin.sleep_quality,
        sleep_hours: todayCheckin.sleep_hours ?? undefined,
        stress_level: todayCheckin.stress_level,
        notes: todayCheckin.notes ?? undefined,
      }
    : undefined

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <ClipboardCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {todayCheckin ? "Today's check-in" : 'How are you feeling today?'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {todayCheckin
                    ? 'Logged for today'
                    : 'Log energy, mood, sleep and stress'}
                </p>
              </div>
            </div>

            <Button
              variant={todayCheckin ? 'outline' : 'default'}
              size="sm"
              onClick={() => setModalOpen(true)}
              className="shrink-0"
            >
              {todayCheckin ? (
                <>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Daily check-in
                </>
              )}
            </Button>
          </div>

          {todayCheckin && (
            <div className="mt-4 flex flex-wrap gap-2">
              <MetricPill label="Energy" value={todayCheckin.energy} />
              <MetricPill label="Mood" value={todayCheckin.mood} />
              <MetricPill label="Sleep" value={todayCheckin.sleep_quality} />
              <MetricPill label="Stress" value={todayCheckin.stress_level} />
              {todayCheckin.sleep_hours && (
                <MetricPill label="Hours" value={todayCheckin.sleep_hours} />
              )}
            </div>
          )}

          {todayCheckin?.notes && (
            <p className="text-muted-foreground mt-3 line-clamp-2 text-sm italic">
              &ldquo;{todayCheckin.notes}&rdquo;
            </p>
          )}
        </CardContent>
      </Card>

      <DailyCheckinModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultValues={defaultValues}
      />
    </>
  )
}
