import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import type { Supplement } from '@/lib/supabase/supplements'

interface SupplementCardProps {
  supplement: Supplement
}

export function SupplementCard({ supplement }: SupplementCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Color band */}
      <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
              <Link href={`/supplements/${supplement.slug}`}>{supplement.name}</Link>
            </h2>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-0 text-xs">
            {supplement.category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{supplement.short_description}</p>

        {supplement.benefits.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-auto">
            {supplement.benefits.slice(0, 3).map((benefit) => (
              <li
                key={benefit}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {benefit}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t bg-muted/30 px-5 py-3">
        <Link
          href={`/supplements/${supplement.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <span className="ml-auto">
          <a
            href={`/go/${supplement.slug}`}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-3 w-3" aria-hidden />
            Buy
          </a>
        </span>
      </div>
    </article>
  )
}
