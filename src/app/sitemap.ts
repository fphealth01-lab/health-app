import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/site-config'
import { getAllArticleSlugs } from '@/lib/sanity/queries'
import { getAllSupplementSlugs } from '@/lib/supabase/supplements'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url
  const now = new Date()

  // Fetch dynamic slugs in parallel; fall back to [] on error
  const [articleSlugs, supplementSlugs] = await Promise.all([
    getAllArticleSlugs().catch(() => [] as string[]),
    getAllSupplementSlugs().catch(() => [] as string[]),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/supplements`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    // Legal pages — low priority, infrequently changing
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/medical-disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const supplementPages: MetadataRoute.Sitemap = supplementSlugs.map((slug) => ({
    url: `${base}/supplements/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...articlePages, ...supplementPages]
}
