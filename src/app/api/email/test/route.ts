import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sendWelcomeEmail,
  sendOnboardingCompleteEmail,
  sendSubscriptionConfirmationEmail,
  sendWeeklyCheckinEmail,
  type EmailType,
} from '@/lib/email/email-actions'

export const dynamic = 'force-dynamic'

const VALID_TYPES: EmailType[] = [
  'welcome',
  'onboarding_complete',
  'subscription_confirmation',
  'weekly_checkin',
]

/**
 * Admin-only endpoint for testing each email template.
 *
 * Usage: GET /api/email/test?type=welcome
 *
 * Requires the caller to be authenticated and their email to be in
 * ADMIN_EMAILS. Sends the email to the admin's own address so you can
 * verify the template visually in your inbox.
 */
export async function GET(request: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())

  if (!adminEmails.includes(user.email.toLowerCase())) {
    return Response.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  // ── Validate ?type param ─────────────────────────────────────────────────
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as EmailType | null

  if (!type || !VALID_TYPES.includes(type)) {
    return Response.json(
      { error: `Missing or invalid ?type. Valid values: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  // ── Send the requested test email to the admin ───────────────────────────
  const userId = user.id
  const email = user.email
  const fullName = user.user_metadata?.full_name ?? null

  let result

  switch (type) {
    case 'welcome':
      result = await sendWelcomeEmail(userId, email, fullName)
      break

    case 'onboarding_complete':
      result = await sendOnboardingCompleteEmail(userId, email, fullName)
      break

    case 'subscription_confirmation':
      result = await sendSubscriptionConfirmationEmail(
        userId,
        email,
        fullName,
        'Premium Monthly',
        '$9.99/month',
        new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      )
      break

    case 'weekly_checkin':
      result = await sendWeeklyCheckinEmail(userId, email, fullName, 78, 5, 'Magnesium Glycinate')
      break
  }

  if (result.success) {
    return Response.json({ sent: true, resendId: result.resendId, type, to: email })
  }
  return Response.json({ sent: false, error: result.error, type }, { status: 500 })
}
