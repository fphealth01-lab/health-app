import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles, getFeaturedArticles, getAllCategories, getAllGoals } from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/blog/article-card'
import { siteConfig } from '@/config/site'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog — Science-backed longevity & supplement research',
  description:
    'Research-backed articles on supplements, longevity protocols, testosterone, sleep, and skin health written by registered dietitians and longevity researchers.',
  openGraph: {
    title: 'Blog — Longevity Platform',
    description: 'Science-backed supplement and longevity research',
    url: `${siteConfig.url}/blog`,
    type: 'website',
  },
}

export default async function BlogPage() {
  const [featured, allArticles, categories, goals] = await Promise.all([
    getFeaturedArticles(3),
    getAllArticles(),
    getAllCategories(),
    getAllGoals(),
  ])

  const recent = allArticles.slice(3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Longevity Platform Blog',
    description: metadata.description,
    url: `${siteConfig.url}/blog`,
    blogPost: allArticles.slice(0, 10).map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.excerpt,
      url: `${siteConfig.url}/blog/${a.slug?.current}`,
      datePublished: a.published_at,
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
            Science-backed research
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Longevity & Supplement Research
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Evidence-based articles on supplements, protocols, and longevity strategies — written
            by registered dietitians and reviewed against current research.
          </p>
        </header>

        {/* Category chips */}
        {(categories.length > 0 || goals.length > 0) && (
          <nav aria-label="Article categories" className="mb-10 flex flex-wrap justify-center gap-2">
            <Link
              href="/blog"
              className="rounded-full border bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium transition-colors"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug?.current}
                href={`/blog/category/${cat.slug?.current}`}
                className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {cat.title}
              </Link>
            ))}
            {goals.map((goal) => (
              <Link
                key={goal.slug?.current}
                href={`/blog/goals/${goal.slug?.current}`}
                className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {goal.title}
              </Link>
            ))}
          </nav>
        )}

        {/* Featured articles */}
        {featured.length > 0 && (
          <section aria-labelledby="featured-heading" className="mb-14">
            <h2 id="featured-heading" className="mb-6 text-xl font-semibold tracking-tight">
              Featured
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <ArticleCard article={featured[0]} featured />
              </div>
              {featured.slice(1).map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Recent articles grid */}
        {recent.length > 0 && (
          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="mb-6 text-xl font-semibold tracking-tight">
              Recent articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {allArticles.length === 0 && (
          <div className="rounded-2xl border border-dashed p-16 text-center">
            <p className="text-muted-foreground">
              No articles yet. Check back soon — we&apos;re publishing weekly.
            </p>
          </div>
        )}

        {/* Build your protocol CTA */}
        <div className="mt-20 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to build your protocol?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Get a personalized supplement stack in under 3 minutes — free.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            Build my free protocol →
          </Link>
        </div>
      </div>
    </>
  )
}
