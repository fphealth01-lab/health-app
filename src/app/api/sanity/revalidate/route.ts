import { type NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

/**
 * POST /api/sanity/revalidate
 *
 * Called by a Sanity webhook whenever an Article document is created,
 * updated, or deleted.
 *
 * Setup in Sanity Manage (https://sanity.io/manage/project/he8pdycr → API → Webhooks):
 *   - URL: {NEXT_PUBLIC_SITE_URL}/api/sanity/revalidate
 *   - Dataset: production
 *   - Trigger on: Create, Update, Delete
 *   - Filter: _type == "article"
 *   - HTTP Method: POST
 *   - Secret: paste the value of SANITY_REVALIDATE_SECRET from .env.local
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    console.error('[revalidate] SANITY_REVALIDATE_SECRET is not set')
    return NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 })
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME)
  const body = await request.text()

  const isValid = await isValidSignature(body, signature ?? '', secret)
  if (!isValid) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  let payload: { _type?: string; slug?: { current?: string } } = {}
  try {
    payload = JSON.parse(body)
  } catch {
    // payload isn't required — we revalidate broadly anyway
  }

  // Always revalidate the blog index
  revalidatePath('/blog')

  // Revalidate the specific slug if provided
  const slug = payload?.slug?.current
  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }

  // Revalidate category and goal index pages too
  revalidatePath('/blog/category/[slug]', 'page')
  revalidatePath('/blog/goals/[slug]', 'page')

  console.info('[revalidate] Revalidated blog paths', { slug, _type: payload?._type })

  return NextResponse.json({ revalidated: true, slug: slug ?? null })
}
