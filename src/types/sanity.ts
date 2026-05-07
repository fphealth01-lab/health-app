import type { PortableTextBlock } from '@portabletext/types'

export type SanitySlug = { _type?: string; current?: string | null }

export type SanityImageWithAlt = {
  _type?: string
  asset?: { _ref?: string }
  alt?: string | null
  caption?: string | null
}

export type ArticleAuthor = {
  _id?: string
  name?: string | null
  bio?: string | null
  credentials?: string | null
  slug?: { current?: string | null }
  avatar?: SanityImageWithAlt | null
}

export type ArticleTaxonomy = {
  title?: string | null
  slug?: { current?: string | null }
}

export type ArticleListItem = {
  _id: string
  title: string
  slug: { current?: string | null }
  excerpt: string
  published_at: string
  updated_at?: string | null
  reading_time_minutes?: number | null
  featured_image?: SanityImageWithAlt | null
  author?: Pick<ArticleAuthor, 'name'> | null
  category?: ArticleTaxonomy | null
  goals?: ArticleTaxonomy[] | null
}

export type ArticleDetail = ArticleListItem & {
  body: PortableTextBlock[]
  meta_title?: string | null
  meta_description?: string | null
  supplements_mentioned?: string[] | null
  author?: ArticleAuthor | null
}
