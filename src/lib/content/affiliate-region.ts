/** ISO 3166-1 alpha-2 codes in the EU (used for region "eu"; RO is handled separately). */
const EU_COUNTRY_CODES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
])

export type AffiliateRegionKey = 'us' | 'eu' | 'uk' | 'ro' | 'global'

/**
 * Maps a 2-letter country (or null) to the affiliate `supplement_brands.region`
 * bucket we try first before fallbacks.
 */
export function primaryAffiliateRegion(countryCode: string | null | undefined): AffiliateRegionKey {
  if (!countryCode || countryCode.length !== 2) return 'global'
  const code = countryCode.toUpperCase()
  if (code === 'RO') return 'ro'
  if (code === 'GB') return 'uk'
  if (code === 'US') return 'us'
  if (EU_COUNTRY_CODES.has(code)) return 'eu'
  return 'global'
}

/** Preference order when exact region row is missing for this supplement. */
export function regionFallbackOrder(primary: AffiliateRegionKey): AffiliateRegionKey[] {
  switch (primary) {
    case 'ro':
      return ['ro', 'eu', 'global', 'uk', 'us']
    case 'uk':
      return ['uk', 'global', 'eu', 'us']
    case 'us':
      return ['us', 'global', 'eu', 'uk', 'ro']
    case 'eu':
      return ['eu', 'global', 'us', 'uk', 'ro']
    default:
      return ['global', 'us', 'eu', 'uk', 'ro']
  }
}

/** Best-effort country hint from Accept-Language (e.g. en-GB → GB). */
export function countryFromAcceptLanguage(headerValue: string | null | undefined): string | null {
  if (!headerValue) return null
  const first = headerValue.split(',')[0]?.trim()
  const tag = first?.split(';')[0]?.trim().toLowerCase()
  if (!tag) return null
  const parts = tag.split('-')
  const region = parts[1]?.toUpperCase()
  if (region && region.length === 2) return region
  if (parts[0] === 'ro') return 'RO'
  return null
}
