export const siteConfig = {
  name: 'Lyvewell',
  tagline: 'Optimize your energy, sleep, and longevity.',
  description:
    'Lyvewell builds personalized supplement protocols based on your goals and biology. Daily tracking, expert coaching, weekly meal plans.',
  url:
    process.env.NODE_ENV === 'production'
      ? 'https://lyvewell.fit'
      : 'http://localhost:3000',
  ogImage: '/og-image.png',
  twitter: {
    handle: '@lyvewell',
    cardType: 'summary_large_image' as const,
  },
  keywords: [
    'supplement protocol',
    'personalized supplements',
    'supplement tracker',
    'longevity',
    'sleep supplements',
    'energy supplements',
    'health optimization',
    'meal plan',
    'science-backed supplements',
  ],
}

export const themeColor = '#0d9488'
