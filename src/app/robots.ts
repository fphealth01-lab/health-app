import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Authenticated app surfaces
          '/dashboard',
          '/protocol',
          '/tracker',
          '/coach',
          '/meal-plan',
          '/settings',
          '/onboarding',
          // Admin and internal
          '/admin',
          '/studio',
          // API routes
          '/api/',
          // Affiliate redirects — don't index, and prevent link equity leakage
          '/go/',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
