import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSupplements } from '@/lib/supabase/supplements'
import { SupplementCard } from '@/components/supplements/supplement-card'
import { siteConfig } from '@/config/site'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Supplement Catalog — 40+ Science-backed Supplements',
  description:
    'Browse our catalog of science-backed supplements. Evidence-based dosing, timing, interactions, and goal-specific recommendations.',
  openGraph: {
    title: 'Supplement Catalog — Longevity Platform',
    description: '40+ science-backed supplements with evidence-based guidance.',
    url: `${siteConfig.url}/supplements`,
    type: 'website',
  },
}

export default async function SupplementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; goal?: string }>
}) {
  const { category, goal } = await searchParams
  const allSupplements = await getAllSupplements()

  // Client-side filtering via URL params
  const filtered = allSupplements.filter((supplement) => {
    if (category && supplement.category.toLowerCase() !== category.toLowerCase()) return false
    if (goal && !supplement.goals_targeted.map((g) => g.toLowerCase()).includes(goal.toLowerCase()))
      return false
    return true
  })

  // Unique categories and goals for filter chips
  const categories = [...new Set(allSupplements.map((s) => s.category))].sort()
  const goals = [
    ...new Set(allSupplements.flatMap((s) => s.goals_targeted)),
  ].sort()

  const activeFilter = category ?? goal ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Longevity Supplement Catalog',
    description: metadata.description,
    url: `${siteConfig.url}/supplements`,
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 20).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: s.name,
        description: s.short_description,
        url: `${siteConfig.url}/supplements/${s.slug}`,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {allSupplements.length}+ supplements
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Science-backed Supplement Catalog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every supplement in our catalog is reviewed against current research. Dosing ranges,
            timing, interactions, and goal-specific guidance included.
          </p>
        </header>

        {/* Filter chips */}
        {(categories.length > 0 || goals.length > 0) && (
          <nav aria-label="Filter supplements" className="mb-10 flex flex-wrap justify-center gap-2">
            <Link
              href="/supplements"
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                !activeFilter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/supplements?category=${encodeURIComponent(cat)}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {cat}
              </Link>
            ))}
            {goals.map((g) => (
              <Link
                key={g}
                href={`/supplements?goal=${encodeURIComponent(g)}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  goal === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {g}
              </Link>
            ))}
          </nav>
        )}

        {/* Results count */}
        {activeFilter && (
          <p className="mb-6 text-sm text-muted-foreground">
            Showing {filtered.length} supplement{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((supplement) => (
              <SupplementCard key={supplement.id} supplement={supplement} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-16 text-center">
            <p className="text-muted-foreground">
              No supplements found for this filter.{' '}
              <Link href="/supplements" className="text-primary hover:underline">
                View all
              </Link>
            </p>
          </div>
        )}

        {/* Build protocol CTA */}
        <div className="mt-20 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Not sure where to start?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Answer 5 questions and get a personalized stack — free.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            Build my protocol →
          </Link>
        </div>
      </div>
    </>
  )
}
