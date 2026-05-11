import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, AlertTriangle, Info, ShoppingCart, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/blog/article-card'
import { getSupplementBySlug, getAllSupplementSlugs } from '@/lib/supabase/supplements'
import { getArticlesBySupplementSlug } from '@/lib/sanity/queries'
import { siteConfig } from '@/lib/seo/site-config'

export const revalidate = 86400

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const slugs = await getAllSupplementSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const supplement = await getSupplementBySlug(slug)
  if (!supplement) return {}
  const title = `${supplement.name} — Benefits, Dosing, Side Effects`
  const canonical = `${siteConfig.url}/supplements/${slug}`
  return {
    title,
    description: supplement.short_description,
    alternates: { canonical },
    openGraph: { title, description: supplement.short_description, url: canonical },
  }
}

export default async function SupplementPage({ params }: { params: Params }) {
  const { slug } = await params
  const [supplement, relatedArticles] = await Promise.all([
    getSupplementBySlug(slug),
    getArticlesBySupplementSlug(slug),
  ])
  if (!supplement) notFound()

  const citations = Array.isArray(supplement.citations)
    ? (supplement.citations as { title?: string; url?: string }[])
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: supplement.name,
    description: supplement.long_description ?? supplement.short_description,
    url: `${siteConfig.url}/supplements/${slug}`,
    category: supplement.category,
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/go/${slug}`,
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <div className="py-8">
          <Link
            href="/supplements"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> All supplements
          </Link>
        </div>

        {/* Hero */}
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/10 text-primary border-0">{supplement.category}</Badge>
            {supplement.goals_targeted.map((goal) => (
              <Link key={goal} href={`/blog/goals/${goal.toLowerCase().replace(/\s+/g, '-')}`}>
                <Badge variant="outline" className="text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                  {goal}
                </Badge>
              </Link>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{supplement.name}</h1>
          <p className="text-lg text-muted-foreground">{supplement.short_description}</p>

          <a
            href={`/go/${slug}`}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Buy {supplement.name}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </header>

        {/* What it does */}
        {supplement.long_description && (
          <section className="mb-8 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">What it does</h2>
            <p className="text-muted-foreground leading-relaxed">{supplement.long_description}</p>
          </section>
        )}

        {/* Benefits */}
        {supplement.benefits.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Primary benefits</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {supplement.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* How to take it */}
        <section className="mb-8 rounded-2xl border bg-muted/30 p-6 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">How to take it</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(supplement.dosing_low_mg || supplement.dosing_high_mg) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Dosing range
                </p>
                <p className="font-semibold text-sm">
                  {supplement.dosing_low_mg ?? '?'}
                  {supplement.dosing_high_mg ? `–${supplement.dosing_high_mg}` : ''}{' '}
                  {supplement.dosing_unit}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Timing
              </p>
              <p className="font-semibold text-sm capitalize">
                {supplement.timing.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </section>

        {/* Interactions & contraindications */}
        {(supplement.interactions.length > 0 || supplement.contraindications.length > 0) && (
          <section className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
              Interactions & contraindications
            </h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              {supplement.contraindications.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    Avoid if:
                  </p>
                  <ul className="space-y-1">
                    {supplement.contraindications.map((item) => (
                      <li key={item} className="text-sm text-amber-700 dark:text-amber-400">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {supplement.interactions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    Drug interactions:
                  </p>
                  <ul className="space-y-1">
                    {supplement.interactions.map((item) => (
                      <li key={item} className="text-sm text-amber-700 dark:text-amber-400">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
              Always consult a healthcare provider before starting any new supplement, especially if
              you take prescription medications.
            </p>
          </section>
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Research citations</h2>
            <ol className="space-y-2">
              {citations.map((cite, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">[{i + 1}]</span>
                  {cite.url ? (
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline underline-offset-2"
                    >
                      {cite.title ?? cite.url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{cite.title}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Buy CTA */}
        <div className="mb-12 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h3 className="text-xl font-bold tracking-tight">Ready to try {supplement.name}?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We link to vetted brands with third-party testing.
          </p>
          <a
            href={`/go/${slug}`}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Buy {supplement.name} →
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Affiliate link — we may earn a commission. Price and availability set by the retailer.
          </p>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section aria-labelledby="related-articles-heading">
            <h3 id="related-articles-heading" className="text-xl font-semibold mb-6">
              Articles about {supplement.name}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
