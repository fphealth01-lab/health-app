import Image from 'next/image'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { Info, AlertTriangle, Lightbulb, ExternalLink, ShoppingCart } from 'lucide-react'
import type { Supplement } from '@/lib/supabase/supplements'

export type SupplementsMap = Record<string, Supplement>

// ── Custom block components ────────────────────────────────────────────────

const CALLOUT_STYLES = {
  info: {
    wrapper: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  tip: {
    wrapper: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800',
    icon: 'text-teal-600 dark:text-teal-400',
    Icon: Lightbulb,
  },
} as const

function ArticleCallout({
  value,
}: {
  value: { tone?: string; content?: PortableTextBlock[] }
}) {
  const tone = (value.tone ?? 'info') as keyof typeof CALLOUT_STYLES
  const style = CALLOUT_STYLES[tone] ?? CALLOUT_STYLES.info
  const { Icon } = style
  return (
    <div
      className={`not-prose my-6 flex gap-3 rounded-xl border p-4 ${style.wrapper}`}
      role="note"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} aria-hidden />
      <div className="prose prose-sm max-w-none">
        {value.content ? <PortableText value={value.content} /> : null}
      </div>
    </div>
  )
}

function SupplementCard({
  value,
  supplementsMap,
}: {
  value: { supplementSlug?: string }
  supplementsMap: SupplementsMap
}) {
  const slug = value.supplementSlug ?? ''
  const supplement = supplementsMap[slug]

  if (!supplement) {
    return (
      <Link
        href={`/supplements/${slug}`}
        className="not-prose my-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 underline underline-offset-2 hover:text-teal-600"
      >
        View supplement <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
    )
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {supplement.category}
          </span>
          <h4 className="text-base font-semibold tracking-tight">{supplement.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{supplement.short_description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
        <Link
          href={`/supplements/${supplement.slug}`}
          className="text-sm font-medium text-foreground hover:text-primary"
        >
          Learn more →
        </Link>
        <span className="text-muted-foreground">·</span>
        <a
          href={`/go/${supplement.slug}`}
          target="_blank"
          rel="noopener nofollow sponsored"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
          Buy
        </a>
      </div>
    </div>
  )
}

function PullQuote({ value }: { value: { quote?: string; attribution?: string } }) {
  return (
    <blockquote className="not-prose my-8 border-l-4 border-primary pl-6">
      <p className="text-xl font-medium italic leading-relaxed text-foreground">
        &ldquo;{value.quote}&rdquo;
      </p>
      {value.attribution && (
        <cite className="mt-2 block text-sm font-medium not-italic text-muted-foreground">
          — {value.attribution}
        </cite>
      )}
    </blockquote>
  )
}

function InlineImage({
  value,
}: {
  value: { asset?: { _ref?: string }; alt?: string; caption?: string; url?: string }
}) {
  const src = value.url ?? ''
  if (!src && !value.asset?._ref) return null

  return (
    <figure className="not-prose my-6">
      <div className="relative overflow-hidden rounded-xl">
        {/* If a Sanity asset ref exists the parent page should pass a resolved URL; */}
        {/* for simplicity we render via the url field added by the query projection  */}
        <Image
          src={src}
          alt={value.alt ?? ''}
          width={800}
          height={450}
          className="w-full object-cover"
        />
      </div>
      {value.caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {value.caption}
        </figcaption>
      )}
    </figure>
  )
}

// ── Component factory ──────────────────────────────────────────────────────

/**
 * Returns the PortableText component map for article body rendering.
 * Pass `supplementsMap` (keyed by slug) so supplement cards render
 * without a runtime fetch.
 */
export function makePortableTextComponents(
  supplementsMap: SupplementsMap = {},
): PortableTextComponents {
  return {
    types: {
      image: ({ value }) => <InlineImage value={value} />,
      articleCallout: ({ value }) => <ArticleCallout value={value} />,
      supplementReferenceCard: ({ value }) => (
        <SupplementCard value={value} supplementsMap={supplementsMap} />
      ),
      pullQuote: ({ value }) => <PullQuote value={value} />,
    },
    marks: {
      link: ({ value, children }) => {
        const href = value?.href ?? '#'
        const isExternal = href.startsWith('http')
        return (
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {children}
          </a>
        )
      },
    },
    block: {
      h1: ({ children }) => (
        <h1 className="mb-4 mt-10 text-3xl font-bold tracking-tight">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 mt-8 text-2xl font-semibold tracking-tight">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 mt-6 text-xl font-semibold tracking-tight">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="mb-2 mt-4 text-lg font-semibold">{children}</h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      ),
    },
  }
}
