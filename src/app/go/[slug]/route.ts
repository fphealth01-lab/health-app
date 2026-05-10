import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  primaryAffiliateRegion,
  regionFallbackOrder,
  countryFromAcceptLanguage,
} from '@/lib/content/affiliate-region'
import { captureServerEvent } from '@/lib/analytics/posthog-server'

type Params = Promise<{ slug: string }>

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { slug } = await params
  const adminClient = createAdminClient()

  // ── 1. Look up the supplement ────────────────────────────────────────────
  const { data: supplement } = await adminClient
    .from('supplements')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle()

  if (!supplement) {
    return NextResponse.redirect(
      new URL(`/supplements?error=not-found`, request.url),
      { status: 302 },
    )
  }

  // ── 2. Detect country ────────────────────────────────────────────────────
  let countryCode: string | null = null

  // Priority 1: logged-in user's profile
  try {
    const serverClient = await createClient()
    const {
      data: { session },
    } = await serverClient.auth.getSession()
    if (session?.user?.id) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('country_code')
        .eq('id', session.user.id)
        .maybeSingle()
      countryCode = profile?.country_code ?? null
    }
  } catch {
    // auth client may throw in edge cases — fall through
  }

  // Priority 2–4: request headers
  if (!countryCode) {
    countryCode =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      countryFromAcceptLanguage(request.headers.get('accept-language'))
  }

  // ── 3. Find the best affiliate brand for this region ────────────────────
  const { data: brands } = await adminClient
    .from('supplement_brands')
    .select('id, affiliate_url, region')
    .eq('supplement_id', supplement.id)
    .order('is_recommended', { ascending: false })

  type BrandRow = { id: string; affiliate_url: string; region: string }

  const primaryRegion = primaryAffiliateRegion(countryCode)
  const fallbackOrder = regionFallbackOrder(primaryRegion)
  const brandsByRegion: Record<string, BrandRow> = Object.fromEntries(
    (brands ?? []).map((b) => [b.region, b]),
  )

  let selectedBrand: BrandRow | null = null
  for (const region of fallbackOrder) {
    if (brandsByRegion[region]) {
      selectedBrand = brandsByRegion[region]
      break
    }
  }

  // No brand found at all
  if (!selectedBrand) {
    return NextResponse.redirect(
      new URL(`/supplements/${slug}?error=no-brand`, request.url),
      { status: 302 },
    )
  }

  // ── 4. Log the affiliate click (RLS bypass via admin client) ─────────────
  await adminClient.from('affiliate_clicks').insert({
    supplement_id: supplement.id,
    brand_id: selectedBrand.id,
    affiliate_url: selectedBrand.affiliate_url,
    region: selectedBrand.region,
    country_code: countryCode ?? null,
    user_agent: request.headers.get('user-agent'),
    referrer: request.headers.get('referer'),
    // user_id intentionally omitted — resolved from session server-side later if needed
  })

  // ── 4b. Track in PostHog (fire-and-forget, requires a known user) ────────
  try {
    const serverClient = await createClient()
    const {
      data: { session },
    } = await serverClient.auth.getSession()
    if (session?.user?.id) {
      captureServerEvent({
        userId: session.user.id,
        event: 'affiliate_click',
        properties: {
          supplement_slug: slug,
          country: countryCode ?? 'unknown',
        },
      }).catch(() => {})
    }
  } catch {
    // Non-fatal — affiliate click was already logged to DB
  }

  // ── 5. Redirect ──────────────────────────────────────────────────────────
  return NextResponse.redirect(selectedBrand.affiliate_url, { status: 302 })
}
