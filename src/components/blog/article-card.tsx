import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getArticleImageUrl } from '@/lib/sanity/image'
import type { ArticleListItem } from '@/types/sanity'

interface ArticleCardProps {
  article: ArticleListItem
  featured?: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const slug = article.slug?.current ?? ''
  const imageUrl = getArticleImageUrl(article.featured_image, article.featured_image_url)
  const categorySlug = article.category?.slug?.current

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${featured ? 'md:flex-row' : ''}`}
    >
      {/* Image */}
      <Link
        href={`/blog/${slug}`}
        className={`relative block overflow-hidden bg-muted ${featured ? 'md:w-2/5 md:shrink-0' : 'aspect-[16/9]'}`}
        aria-hidden="true"
        tabIndex={-1}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.featured_image?.alt ?? article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={featured ? '(max-width: 768px) 100vw, 40vw' : '(max-width: 768px) 100vw, 33vw'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl font-bold text-primary/20">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.category && categorySlug && (
            <Link href={`/blog/category/${categorySlug}`}>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {article.category.title}
              </Badge>
            </Link>
          )}
          {article.goals?.slice(0, 1).map((goal) => (
            <Link key={goal.slug?.current} href={`/blog/goals/${goal.slug?.current}`}>
              <Badge variant="outline" className="text-xs">
                {goal.title}
              </Badge>
            </Link>
          ))}
        </div>

        <h2
          className={`font-semibold tracking-tight ${featured ? 'text-2xl' : 'text-lg'} leading-snug`}
        >
          <Link
            href={`/blog/${slug}`}
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </h2>

        <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
          {article.author?.name && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" aria-hidden />
              {article.author.name}
            </span>
          )}
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {formatDate(article.published_at)}
            </span>
          )}
          {article.reading_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {article.reading_time_minutes} min read
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
