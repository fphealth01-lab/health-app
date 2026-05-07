import Link from 'next/link'
import { Pill, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface DashboardSupplement {
  name: string
  /** Slug from the supplements catalog — enables /supplements/[slug] and /go/[slug] links. */
  slug?: string
  doseMg: number | null
  doseUnit: string
  timing: string
  /** Per-supplement reasoning. Premium-tier protocols get a real AI sentence;
   * free-tier protocols get the catalog description. Empty string hides it. */
  reasoning?: string
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
  showTrackingPlaceholder?: boolean
  showReasoning?: boolean
}

export function DashboardProtocolCard({
  supplement,
  showTrackingPlaceholder = true,
  showReasoning = false,
}: DashboardProtocolCardProps) {
  const dose = formatDose(supplement.doseMg, supplement.doseUnit)
  return (
    <Card className="bg-card">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="bg-primary/10 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Pill className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {supplement.slug ? (
                <Link
                  href={`/supplements/${supplement.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {supplement.name}
                </Link>
              ) : (
                supplement.name
              )}
            </h3>
            <p className="text-muted-foreground text-sm">
              {dose && <span>{dose} · </span>}
              {formatTiming(supplement.timing)}
            </p>
          </div>
          {showReasoning && supplement.reasoning && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {supplement.reasoning}
            </p>
          )}
          {supplement.slug && (
            <a
              href={`/go/${supplement.slug}`}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 font-medium"
            >
              <ShoppingCart className="h-3 w-3" aria-hidden />
              Buy
            </a>
          )}
        </div>
        {showTrackingPlaceholder && (
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Tracking comes in the next build step"
            className="hidden shrink-0 sm:inline-flex"
          >
            Mark taken
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
