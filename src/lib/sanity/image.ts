import createImageUrlBuilder, { type SanityImageSource } from '@sanity/image-url'
import { getSanityClient, isSanityConfigured } from '@/lib/sanity/client'

export function urlForImage(source: SanityImageSource) {
  if (!isSanityConfigured()) {
    throw new Error('Sanity is not configured')
  }
  const client = getSanityClient()!
  return createImageUrlBuilder(client).image(source)
}
