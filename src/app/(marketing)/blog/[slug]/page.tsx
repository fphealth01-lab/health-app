import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { Calendar, Clock, User, ChevronLeft, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/blog/article-card'
import { ShareButtons } from '@/components/blog/share-buttons'
import {
  getArticleBySlug,
  getAllArticleSlugs,
  getRelatedArticles,
} from '@/lib/sanity/queries'
import { getArticlePhoto } from '@/lib/article-photos'
import { estimateReadingMinutesFromPortableText } from '@/lib/sanity/reading-time'
import { makePortableTextComponents } from '@/lib/sanity/portable-text'
import { getSupplementsBySlugs } from '@/lib/supabase/supplements'
import { siteConfig } from '@/lib/seo/site-config'

export const revalidate = 60

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  const title = article.meta_title ?? article.title
  const description = article.meta_description ?? article.excerpt
  const canonical = `${siteConfig.url}/blog/${slug}`
  const ogImagePath = getArticlePhoto(article.category?.slug?.current, slug)
  const ogImageUrl = `${siteConfig.url}${ogImagePath}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at ?? article.published_at,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const categorySlug = article.category?.slug?.current ?? null
  const supplementSlugs = article.supplements_mentioned ?? []

  const [relatedArticles, supplements] = await Promise.all([
    getRelatedArticles(slug, categorySlug),
    getSupplementsBySlugs(supplementSlugs),
  ])

  const supplementsMap = Object.fromEntries(supplements.map((s) => [s.slug, s]))
  const components = makePortableTextComponents(supplementsMap)
  const readingTime = estimateReadingMinutesFromPortableText(
    article.body,
    article.reading_time_minutes,
  )
  const heroImageSrc = getArticlePhoto(article.category?.slug?.current, slug)
  const pageUrl = `${siteConfig.url}/blog/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.meta_description ?? article.excerpt,
    image: `${siteConfig.url}${heroImageSrc}`,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    author: article.author?.name
      ? { '@type': 'Person', name: article.author.name }
      : undefined,
    publisher: { '@type': 'Organization', name: siteConfig.name },
    url: pageUrl,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        {/* Back link */}
        <div className="py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back to blog
          </Link>
        </div>

        {/* Article header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {article.category && categorySlug && (
              <Link href={`/blog/category/${categorySlug}`}>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {article.category.title}
                </Badge>
              </Link>
            )}
            {article.goals?.map((goal) => (
              <Link key={goal.slug?.current} href={`/blog/goals/${goal.slug?.current}`}>
                <Badge variant="outline" className="text-xs">
                  {goal.title}
                </Badge>
              </Link>
            ))}
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
            {article.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.author?.name && (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <User className="h-4 w-4" aria-hidden />
                  {article.author.name}
                  {article.author.credentials && (
                    <span className="font-normal text-muted-foreground">
                      · {article.author.credentials}
                    </span>
                  )}
                </span>
              )}
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden />
                  {new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {readingTime} min read
              </span>
            </div>
            <ShareButtons title={article.title} url={pageUrl} />
          </div>
        </header>

        {/* Hero image */}
        <div className="mb-10 overflow-hidden rounded-2xl">
          <Image
            src={heroImageSrc}
            alt={article.title}
            width={1200}
            height={630}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* Article body */}
        <div className="prose prose-lg prose-teal max-w-none">
          <PortableText value={article.body ?? []} components={components} />
        </div>

        {/* Author bio */}
        {article.author?.bio && (
          <div className="mt-12 rounded-2xl border bg-muted/30 p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              About the author
            </h3>
            <p className="font-semibold">{article.author.name}</p>
            {article.author.credentials && (
              <p className="text-sm text-primary mt-0.5">{article.author.credentials}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {article.author.bio}
            </p>
          </div>
        )}

        {/* Related supplements */}
        {supplements.length > 0 && (
          <section className="mt-12" aria-labelledby="related-supplements-heading">
            <h3 id="related-supplements-heading" className="text-lg font-semibold mb-4">
              Supplements mentioned in this article
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {supplements.map((supplement) => (
                <div
                  key={supplement.id}
                  className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{supplement.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {supplement.short_description}
                    </p>
                  </div>
                  <a
                    href={`/go/${supplement.slug}`}
                    target="_blank"
                    rel="noopener nofollow sponsored"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="h-3 w-3" aria-hidden />
                    Buy
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Build your protocol CTA */}
        <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h3 className="text-xl font-bold tracking-tight">
            Build your free longevity protocol
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get a personalized supplement stack based on your goals — takes 3 minutes.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            Get my free protocol →
          </Link>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16" aria-labelledby="related-articles-heading">
            <h3 id="related-articles-heading" className="text-xl font-semibold mb-6">
              Related articles
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <ArticleCard key={related._id} article={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
