'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DailyMetric } from '@/lib/actions/tracking'

interface WeeklyMetricsChartProps {
  data: DailyMetric[]
}

const METRICS = [
  { key: 'energy', label: 'Energy', color: '#0d9488' },       // teal-600
  { key: 'mood', label: 'Mood', color: '#d97706' },           // amber-600
  { key: 'sleep_quality', label: 'Sleep', color: '#6366f1' }, // indigo-500
  { key: 'stress_level', label: 'Stress', color: '#f43f5e' }, // rose-500
] as const

type MetricKey = (typeof METRICS)[number]['key']

/** Short weekday label from a YYYY-MM-DD string */
function toWeekday(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00') // noon avoids timezone edge cases
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

/**
 * Returns true if the dataset has at least 3 days with at least one
 * non-null metric — enough to draw a meaningful trend line.
 */
function hasEnoughData(data: DailyMetric[]): boolean {
  return data.filter((d) => d.energy !== null || d.mood !== null || d.sleep_quality !== null || d.stress_level !== null).length >= 3
}

export function WeeklyMetricsChart({ data }: WeeklyMetricsChartProps) {
  const [hidden, setHidden] = useState<Set<MetricKey>>(new Set())

  function toggleMetric(key: MetricKey) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (!hasEnoughData(data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly trends</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground text-center text-sm">
            Track for 3 days to see trends
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    name: toWeekday(d.date),
    energy: d.energy,
    mood: d.mood,
    sleep_quality: d.sleep_quality,
    stress_level: d.stress_level,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weekly trends</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend toggle buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMetric(m.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity ${
                hidden.has(m.key) ? 'opacity-40' : 'opacity-100'
              }`}
              style={{ backgroundColor: `${m.color}20`, color: m.color }}
              aria-pressed={!hidden.has(m.key)}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              {m.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 10]}
              ticks={[1, 5, 10]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            {METRICS.map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: m.color }}
                activeDot={{ r: 5 }}
                connectNulls
                hide={hidden.has(m.key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
