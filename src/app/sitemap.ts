import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const base = siteConfig.url

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/supplements`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/login`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/signup`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ]
}
