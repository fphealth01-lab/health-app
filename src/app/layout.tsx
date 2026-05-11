import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig, themeColor } from '@/lib/seo/site-config'
import { PostHogProvider, PostHogPageView } from '@/components/analytics/posthog-provider'
import './globals.css'

// TODO: Add the following favicon files to /public/ before launch:
//   - favicon.ico (multi-resolution: 16x16, 32x32)
//   - icon-32.png
//   - icon-192.png  (also used by PWA manifest)
//   - icon-512.png  (also used by PWA manifest)
//   - apple-icon.png (180x180)
// Generate at: https://favicon.io/favicon-generator/
//   Text: "L", Background: #0d9488 (teal), Text color: #ffffff

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter.handle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: siteConfig.url,
  },
}

export const viewport: Viewport = {
  themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <PostHogProvider>
          {/* PostHogPageView uses useSearchParams — Suspense prevents build errors */}
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
          <Toaster richColors closeButton />
        </PostHogProvider>
      </body>
    </html>
  )
}
