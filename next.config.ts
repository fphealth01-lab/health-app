import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Sanity Studio uses styled-components which accesses `window` at module level.
  // transpilePackages forces Next.js to compile these through SWC/babel so that
  // their ESM-only code lands in the client bundle, not in the SSR pass.
  transpilePackages: [
    'next-sanity',
    'sanity',
    'styled-components',
    '@sanity/ui',
    '@sanity/icons',
    '@sanity/vision',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      // picsum.photos placeholder images used by the seed script
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
}

export default nextConfig
