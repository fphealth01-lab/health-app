import { createAdminClient } from './admin'
import type { Tables } from '@/types/database'

export type Supplement = Tables<'supplements'>

/** All supplements sorted alphabetically. Uses admin client (supplements are public data). */
export async function getAllSupplements(): Promise<Supplement[]> {
  const client = createAdminClient()
  const { data, error } = await client.from('supplements').select('*').order('name')
  if (error) {
    console.error('[supplements] getAllSupplements error:', error.message)
    return []
  }
  return data ?? []
}

/** Supplement by slug. Returns null if not found. */
export async function getSupplementBySlug(slug: string): Promise<Supplement | null> {
  const client = createAdminClient()
  const { data, error } = await client
    .from('supplements')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error('[supplements] getSupplementBySlug error:', error.message)
    return null
  }
  return data
}

/** All supplement slugs for generateStaticParams. */
export async function getAllSupplementSlugs(): Promise<string[]> {
  const client = createAdminClient()
  const { data } = await client.from('supplements').select('slug')
  return (data ?? []).map((s) => s.slug)
}

/**
 * Fetch multiple supplements by an array of slugs.
 * Used to build the supplement map for inline PortableText cards.
 */
export async function getSupplementsBySlugs(slugs: string[]): Promise<Supplement[]> {
  if (!slugs.length) return []
  const client = createAdminClient()
  const { data } = await client.from('supplements').select('*').in('slug', slugs)
  return data ?? []
}
