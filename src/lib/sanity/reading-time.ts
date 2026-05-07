import type { PortableTextBlock } from '@portabletext/types'

function blockPlainText(block: PortableTextBlock): string {
  if (!block.children?.length) return ''
  return block.children.map((span) => ('text' in span ? span.text : '')).join('')
}

/**
 * Rough reading time from Portable Text (same order of magnitude as Medium).
 */
export function estimateReadingMinutesFromPortableText(
  body: PortableTextBlock[] | null | undefined,
  override: number | null | undefined,
): number {
  if (typeof override === 'number' && override > 0) return Math.round(override)
  if (!body?.length) return 1
  const words = body
    .filter((b) => b._type === 'block')
    .map((b) => blockPlainText(b).trim())
    .join(' ')
    .split(/\s+/u)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
