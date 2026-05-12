'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Citation = { title: string; url: string }

export interface ProtocolSupplementCardItem {
  id: string
  name: string
  slug: string
  category: string
  doseMg: number | null
  doseUnit: string
  timing: string
  reasoning: string
  citations: Citation[]
  isPremium: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  vitamin: 'Vitamin',
  mineral: 'Mineral',
  adaptogen: 'Adaptogen',
  amino_acid: 'Amino acid',
  plant_compound: 'Plant compound',
  fatty_acid: 'Fatty acid',
  hormone: 'Hormone',
  probiotic: 'Probiotic',
  mushroom: 'Mushroom',
  antioxidant: 'Antioxidant',
}

function formatCategory(raw: string): string {
  return CATEGORY_LABELS[raw] ?? raw.replace(/_/g, ' ')
}

function formatTiming(raw: string): string {
  return raw.replace(/_/g, ' ')
}

function formatDose(mg: number | null, unit: string): string | null {
  if (!mg) return null
  return `${mg} ${unit}`
}

export function ProtocolSupplementCard({ item }: { item: ProtocolSupplementCardItem }) {
  const dose = formatDose(item.doseMg, item.doseUnit)
  const hasSlug = Boolean(item.slug)

  const CardWrapper = hasSlug
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={`/supplements/${item.slug}`} className="group block">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return (
    <CardWrapper>
      <Card className="group-hover:border-primary/40 group-hover:shadow-sm transition-all duration-150">
        <CardContent className="space-y-3 p-5 sm:p-6">
          {/* Name row + category badge */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="group-hover:text-primary text-base font-semibold tracking-tight transition-colors">
              {item.name}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs font-medium">
              {formatCategory(item.category)}
            </Badge>
          </div>

          {/* Dose + timing chips */}
          <div className="flex flex-wrap gap-2">
            {dose && (
              <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium">
                {dose}
              </span>
            )}
            <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium capitalize">
              {formatTiming(item.timing)}
            </span>
          </div>

          {/* AI reasoning */}
          {item.reasoning && (
            <p className="text-muted-foreground text-sm leading-relaxed">{item.reasoning}</p>
          )}

          {/* Citations — premium only */}
          {item.isPremium && item.citations.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {item.citations.slice(0, 3).map((cite, i) => (
                <li key={`${cite.url}-${i}`}>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary/70 hover:text-primary inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                    {cite.title}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* Learn more link */}
          {hasSlug && (
            <p className="text-primary pt-1 text-xs font-medium">
              Learn more →
            </p>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
