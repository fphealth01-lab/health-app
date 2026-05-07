import { createClient, type SanityClient } from 'next-sanity'

export const sanityApiVersion = '2025-05-01'

let cachedClient: SanityClient | null = null

export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim())
}

/**
 * CDN-backed client for published content. Returns null when env is not set
 * (local stub builds without CMS).
 */
export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) return null
  if (cachedClient) return cachedClient
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!.trim()
  const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production').trim()
  cachedClient = createClient({
    projectId,
    dataset,
    apiVersion: sanityApiVersion,
    useCdn: true,
    perspective: 'published',
    token: process.env.SANITY_API_READ_TOKEN?.trim() || undefined,
  })
  return cachedClient
}
