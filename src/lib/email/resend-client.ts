import 'server-only'
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY not set — emails will not be sent')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sending address. Once lyvewell.fit is verified in Resend (Step 9.8),
 * swap to 'Lyvewell <hello@lyvewell.fit>'.
 */
export const FROM_EMAIL = 'Lyvewell <onboarding@resend.dev>'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lyvewell.fit'

/** Used in footer copy — aspirational until Step 9.8 sets up the domain. */
export const SUPPORT_EMAIL = 'support@lyvewell.fit'
