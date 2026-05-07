import createImageUrlBuilder, { type SanityImageSource } from '@sanity/image-url'
import { getSanityClient, isSanityConfigured } from '@/lib/sanity/client'
import type { SanityImageWithAlt } from '@/types/sanity'

export function urlForImage(source: SanityImageSource) {
  if (!isSanityConfigured()) {
    throw new Error('Sanity is not configured')
  }
  const client = getSanityClient()!
  return createImageUrlBuilder(client).image(source)
}

/**
 * Returns the best available image URL for an article.
 * Prefers the Sanity CDN image; falls back to the external URL placeholder.
 */
export function getArticleImageUrl(
  featuredImage: SanityImageWithAlt | null | undefined,
  featuredImageUrl: string | null | undefined,
  width = 800,
  height = 450,
): string | null {
  if (featuredImage?.asset?._ref) {
    try {
      return urlForImage(featuredImage).width(width).height(height).fit('crop').url()
    } catch {
      // fall through to external URL
    }
  }
  return featuredImageUrl ?? null
}
