import 'server-only'
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY not set — emails will not be sent')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

/** Verified sending address on lyvewell.fit domain. */
export const FROM_EMAIL = 'Lyvewell <noreply@lyvewell.fit>'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lyvewell.fit'

/** Used in footer copy. */
export const SUPPORT_EMAIL = 'support@lyvewell.fit'
