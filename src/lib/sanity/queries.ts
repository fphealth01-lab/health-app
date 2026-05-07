import { groq } from 'next-sanity'
import { getSanityClient } from './client'
import type { ArticleListItem, ArticleDetail, ArticleTaxonomy } from '@/types/sanity'

const ARTICLE_LIST_FIELDS = groq`
  _id,
  title,
  slug,
  excerpt,
  published_at,
  updated_at,
  reading_time_minutes,
  featured_image,
  featured_image_url,
  "author": author->{name, credentials},
  "category": category->{title, slug},
  "goals": goals[]->{title, slug}
`

export async function getAllArticles(): Promise<ArticleListItem[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(
    groq`*[_type == "article"] | order(published_at desc) { ${ARTICLE_LIST_FIELDS} }`,
  )
}

export async function getFeaturedArticles(count = 3): Promise<ArticleListItem[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(
    groq`*[_type == "article"] | order(published_at desc) [0...$count] { ${ARTICLE_LIST_FIELDS} }`,
    { count },
  )
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(
    groq`*[_type == "article" && slug.current == $slug][0] {
      ${ARTICLE_LIST_FIELDS},
      body,
      meta_title,
      meta_description,
      supplements_mentioned,
      "author": author->{ _id, name, bio, credentials, avatar, "slug": slug.current }
    }`,
    { slug },
  )
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const client = getSanityClient()
  if (!client) return []
  const results = await client.fetch<{ slug: string }[]>(
    groq`*[_type == "article" && defined(slug.current)] { "slug": slug.current }`,
  )
  return results.map((r) => r.slug)
}

export async function getArticlesByCategory(categorySlug: string): Promise<ArticleListItem[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(
    groq`*[_type == "article" && category->slug.current == $categorySlug] | order(published_at desc) { ${ARTICLE_LIST_FIELDS} }`,
    { categorySlug },
  )
}

export async function getArticlesByGoal(goalSlug: string): Promise<ArticleListItem[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(
    groq`*[_type == "article" && $goalSlug in goals[]->slug.current] | order(published_at desc) { ${ARTICLE_LIST_FIELDS} }`,
    { goalSlug },
  )
}

export async function getRelatedArticles(
  currentSlug: string,
  categorySlug: string | null | undefined,
): Promise<ArticleListItem[]> {
  const client = getSanityClient()
  if (!client || !categorySlug) return []
  return client.fetch(
    groq`*[_type == "article" && slug.current != $currentSlug && category->slug.current == $categorySlug] | order(published_at desc) [0...3] { ${ARTICLE_LIST_FIELDS} }`,
    { currentSlug, categorySlug },
  )
}

export async function getArticlesBySupplementSlug(
  supplementSlug: string,
): Promise<ArticleListItem[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(
    groq`*[_type == "article" && $supplementSlug in supplements_mentioned] | order(published_at desc) [0...3] { ${ARTICLE_LIST_FIELDS} }`,
    { supplementSlug },
  )
}

export async function getAllCategories(): Promise<ArticleTaxonomy[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(groq`*[_type == "category"] | order(title asc) { title, slug }`)
}

export async function getCategoryBySlug(slug: string): Promise<ArticleTaxonomy | null> {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(
    groq`*[_type == "category" && slug.current == $slug][0] { title, slug }`,
    { slug },
  )
}

export async function getGoalBySlug(slug: string): Promise<ArticleTaxonomy | null> {
  const client = getSanityClient()
  if (!client) return null
  return client.fetch(
    groq`*[_type == "goal" && slug.current == $slug][0] { title, slug }`,
    { slug },
  )
}

export async function getAllGoals(): Promise<ArticleTaxonomy[]> {
  const client = getSanityClient()
  if (!client) return []
  return client.fetch(groq`*[_type == "goal"] | order(title asc) { title, slug }`)
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const client = getSanityClient()
  if (!client) return []
  const results = await client.fetch<{ slug: string }[]>(
    groq`*[_type == "category" && defined(slug.current)] { "slug": slug.current }`,
  )
  return results.map((r) => r.slug)
}

export async function getAllGoalSlugs(): Promise<string[]> {
  const client = getSanityClient()
  if (!client) return []
  const results = await client.fetch<{ slug: string }[]>(
    groq`*[_type == "goal" && defined(slug.current)] { "slug": slug.current }`,
  )
  return results.map((r) => r.slug)
}
