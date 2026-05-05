'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { submitDailyCheckin, type DailyCheckinInput } from '@/lib/actions/tracking'

const checkinSchema = z.object({
  energy: z.number().int().min(1).max(10),
  mood: z.number().int().min(1).max(10),
  sleep_quality: z.number().int().min(1).max(10),
  sleep_hours: z.number().min(4).max(12).optional(),
  stress_level: z.number().int().min(1).max(10),
  notes: z.string().max(1000).optional(),
})

type CheckinFormValues = {
  energy: number
  mood: number
  sleep_quality: number
  sleep_hours?: number
  stress_level: number
  notes?: string
}

interface DailyCheckinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-fill values when editing an existing check-in */
  defaultValues?: Partial<DailyCheckinInput>
  onSuccess?: () => void
}

interface SliderFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  lowLabel: string
  highLabel: string
}

function SliderField({ label, value, onChange, lowLabel, highLabel }: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="bg-primary/10 text-primary min-w-[2.5rem] rounded-md px-2 py-0.5 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
        className="py-1"
      />
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export function DailyCheckinModal({
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: DailyCheckinModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, register, formState } = useForm<CheckinFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkinSchema) as any,
    defaultValues: {
      energy: defaultValues?.energy ?? 5,
      mood: defaultValues?.mood ?? 5,
      sleep_quality: defaultValues?.sleep_quality ?? 5,
      sleep_hours: defaultValues?.sleep_hours,
      stress_level: defaultValues?.stress_level ?? 5,
      notes: defaultValues?.notes ?? '',
    },
  })

  async function onSubmit(values: CheckinFormValues) {
    setIsSubmitting(true)
    try {
      const result = await submitDailyCheckin({
        energy: values.energy,
        mood: values.mood,
        sleep_quality: values.sleep_quality,
        sleep_hours: values.sleep_hours,
        stress_level: values.stress_level,
        notes: values.notes || undefined,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success('Check-in saved!')
      onOpenChange(false)
      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-full max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Daily check-in</DialogTitle>
          <DialogDescription>
            How are you feeling today? Rate each on a scale of 1–10.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-7">
          <Controller
            control={control}
            name="energy"
            render={({ field }) => (
              <SliderField
                label="Energy"
                value={field.value}
                onChange={field.onChange}
                lowLabel="Exhausted"
                highLabel="Full energy"
              />
            )}
          />

          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <SliderField
                label="Mood"
                value={field.value}
                onChange={field.onChange}
                lowLabel="Very low"
                highLabel="Great"
              />
            )}
          />

          <Controller
            control={control}
            name="sleep_quality"
            render={({ field }) => (
              <SliderField
                label="Sleep quality"
                value={field.value}
                onChange={field.onChange}
                lowLabel="Terrible"
                highLabel="Perfect"
              />
            )}
          />

          <Controller
            control={control}
            name="stress_level"
            render={({ field }) => (
              <SliderField
                label="Stress"
                value={field.value}
                onChange={field.onChange}
                lowLabel="Calm"
                highLabel="Very stressed"
              />
            )}
          />

          {/* Optional sleep hours */}
          <div className="space-y-2">
            <Label htmlFor="sleep-hours" className="text-sm font-medium">
              Hours of sleep{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="sleep-hours"
              type="number"
              min={4}
              max={12}
              step={0.5}
              placeholder="e.g. 7.5"
              className="max-w-[120px]"
              {...register('sleep_hours', { valueAsNumber: true })}
            />
            {formState.errors.sleep_hours && (
              <p className="text-destructive text-xs">
                {formState.errors.sleep_hours.message}
              </p>
            )}
          </div>

          {/* Optional notes */}
          <div className="space-y-2">
            <Label htmlFor="checkin-notes" className="text-sm font-medium">
              Notes{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <textarea
              id="checkin-notes"
              rows={3}
              maxLength={1000}
              placeholder="Anything notable about today?"
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              {...register('notes')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save check-in'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
