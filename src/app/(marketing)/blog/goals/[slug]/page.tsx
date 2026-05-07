import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import {
  getArticlesByGoal,
  getGoalBySlug,
  getAllGoalSlugs,
} from '@/lib/sanity/queries'
import { ArticleCard } from '@/components/blog/article-card'
import { siteConfig } from '@/config/site'

export const revalidate = 60

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const slugs = await getAllGoalSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const goal = await getGoalBySlug(slug)
  if (!goal) return {}
  const title = `${goal.title} — Longevity Blog`
  return {
    title,
    description: `All articles on ${goal.title} — evidence-based supplement and longevity research.`,
    alternates: { canonical: `${siteConfig.url}/blog/goals/${slug}` },
  }
}

export default async function GoalPage({ params }: { params: Params }) {
  const { slug } = await params
  const [goal, articles] = await Promise.all([
    getGoalBySlug(slug),
    getArticlesByGoal(slug),
  ])
  if (!goal) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="py-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> All articles
        </Link>
      </div>

      <header className="mb-12">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Goal
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {goal.title}
        </h1>
      </header>

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">No articles tagged with this goal yet.</p>
        </div>
      )}
    </div>
  )
}
