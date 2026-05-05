import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StreakCardProps {
  streak: number
}

/**
 * Displays the user's current consecutive-day supplement streak.
 * Styling escalates at 7 and 30 days to reward consistency.
 */
export function StreakCard({ streak }: StreakCardProps) {
  const isLegend = streak >= 30
  const isOnFire = streak >= 7 && streak < 30
  const hasStreak = streak > 0

  let subtitle = "Don't break the chain"
  if (isLegend) subtitle = 'Legend status'
  else if (isOnFire) subtitle = "You're on fire!"
  else if (!hasStreak) subtitle = 'Log your first supplement to start'

  return (
    <Card
      className={
        isLegend
          ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30'
          : isOnFire
            ? 'border-orange-400/50 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30'
            : ''
      }
    >
      <CardContent className="flex items-center gap-5 p-5">
        <span
          className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${
            isLegend
              ? 'bg-yellow-100 dark:bg-yellow-900/40'
              : isOnFire
                ? 'bg-orange-100 dark:bg-orange-900/40'
                : 'bg-primary/10'
          }`}
          aria-hidden
        >
          {isLegend ? '🏆' : <Flame className={`h-7 w-7 ${isOnFire ? 'text-orange-500' : 'text-primary'}`} />}
        </span>

        <div className="flex-1">
          {hasStreak ? (
            <>
              <p
                className={`text-4xl font-bold tabular-nums ${
                  isLegend ? 'text-yellow-600 dark:text-yellow-400' : isOnFire ? 'text-orange-500' : 'text-foreground'
                }`}
              >
                {streak}
              </p>
              <p
                className={`text-sm font-medium ${
                  isLegend
                    ? 'text-yellow-600/80 dark:text-yellow-400/80'
                    : isOnFire
                      ? 'text-orange-500/80'
                      : 'text-muted-foreground'
                }`}
              >
                Day streak · {subtitle}
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground text-lg font-semibold">Start your streak today</p>
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
