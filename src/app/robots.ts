import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Don't index authenticated app surfaces or onboarding flow
        disallow: [
          '/dashboard',
          '/protocol',
          '/tracker',
          '/coach',
          '/meal-plan',
          '/settings',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
