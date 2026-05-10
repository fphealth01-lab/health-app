/**
 * Maps article categories to curated local photos in /public/article-photos/.
 *
 * Photo variant selection is deterministic: the same article slug always
 * returns the same photo so images never flicker across refreshes or navigation.
 * Different articles within the same category get different variants.
 */

const ARTICLE_PHOTO_MAP: Record<string, string[]> = {
  testosterone: [
    '/article-photos/testosterone-1.jpg',
    '/article-photos/testosterone-2.jpg',
    '/article-photos/testosterone-3.jpg',
  ],
  sleep: [
    '/article-photos/sleep-1.jpg',
    '/article-photos/sleep-2.jpg',
    '/article-photos/sleep-3.jpg',
  ],
  skin: [
    '/article-photos/skin-1.jpg',
    '/article-photos/skin-2.jpg',
    '/article-photos/skin-3.jpg',
  ],
  energy: [
    '/article-photos/energy-1.jpg',
    '/article-photos/energy-2.jpg',
  ],
}

const FALLBACK_PHOTO = '/article-photos/testosterone-1.jpg'

/**
 * Deterministic hash of a string → non-negative integer.
 * Same input always returns the same number so article photos never flicker.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Returns a deterministic local photo path for an article.
 *
 * The `slug` parameter seeds the variant selection so the same article always
 * shows the same photo, while different articles in the same category show
 * different variants.
 *
 * @param category - The article's category slug (e.g. "testosterone", "sleep").
 * @param slug     - The article's own slug, used to select the variant.
 *
 * @example
 * getArticlePhoto('testosterone', 'best-supplements-for-testosterone') // testosterone-2.jpg
 * getArticlePhoto('sleep', 'magnesium-for-sleep')                      // sleep-1.jpg
 * getArticlePhoto(null, 'some-article')                                // testosterone-1.jpg (fallback)
 */
export function getArticlePhoto(
  category: string | null | undefined,
  slug: string,
): string {
  const cat = (category ?? '').toLowerCase().trim()
  const variants = ARTICLE_PHOTO_MAP[cat]

  if (variants && variants.length > 0) {
    return variants[hashString(slug || cat) % variants.length]!
  }

  return FALLBACK_PHOTO
}
