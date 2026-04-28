export const siteConfig = {
  name: 'Longevity', // Placeholder, will rename
  description: 'Your personalized longevity protocol, built by AI',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og.png',
  links: {
    twitter: '',
    github: '',
  },
} as const

export type SiteConfig = typeof siteConfig
