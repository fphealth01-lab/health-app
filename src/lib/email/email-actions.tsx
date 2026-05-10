import 'server-only'

import { render } from '@react-email/render'
import { resend, FROM_EMAIL } from './resend-client'
import { createAdminClient } from '@/lib/supabase/admin'
import { WelcomeEmail } from '@/emails/welcome-email'
import { OnboardingCompleteEmail } from '@/emails/onboarding-complete-email'
import { SubscriptionConfirmationEmail } from '@/emails/subscription-confirmation-email'
import { WeeklyCheckinEmail } from '@/emails/weekly-checkin-email'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EmailType =
  | 'welcome'
  | 'onboarding_complete'
  | 'subscription_confirmation'
  | 'weekly_checkin'

export type EmailResult =
  | { success: true; resendId: string }
  | { success: false; error: string }

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract a first name from a full name or email address prefix.
 * Falls back to "there" so email greetings always read naturally.
 */
export function extractFirstName(email: string, fullName?: string | null): string {
  if (fullName) {
    const first = fullName.split(' ')[0]
    if (first && first.length > 0) return first
  }
  const prefix = email.split('@')[0] ?? ''
  const cleaned = prefix.replace(/[._-]/g, ' ').split(' ')[0] ?? ''
  return cleaned.replace(/^\w/, (c) => c.toUpperCase()) || 'there'
}

/** Log a send result to the email_log table. Never throws. */
async function logEmail({
  userId,
  emailType,
  recipientEmail,
  resendId,
  status,
  errorMessage,
}: {
  userId: string | null
  emailType: EmailType
  recipientEmail: string
  resendId?: string
  status: 'sent' | 'failed'
  errorMessage?: string
}): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('email_log').insert({
    user_id: userId,
    email_type: emailType,
    recipient_email: recipientEmail,
    resend_id: resendId ?? null,
    status,
    error_message: errorMessage ?? null,
  })
  if (error) {
    console.error(`[email] email_log insert failed for ${emailType}:`, error.message)
  }
}

/**
 * Check whether an email of this type has already been sent to this user.
 * Used to make welcome / onboarding emails idempotent.
 */
async function alreadySent(userId: string, emailType: EmailType): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('email_log')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .eq('status', 'sent')
    .limit(1)
    .maybeSingle()
  return data !== null
}

/**
 * Core send helper — renders a React Email template, sends via Resend,
 * and logs the result. All errors are caught; email failure NEVER throws
 * into the caller.
 */
async function sendEmail({
  userId,
  to,
  subject,
  emailType,
  reactElement,
}: {
  userId: string | null
  to: string
  subject: string
  emailType: EmailType
  reactElement: React.ReactElement
}): Promise<EmailResult> {
  try {
    const html = await render(reactElement)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error || !data) {
      const message = error?.message ?? 'Unknown Resend error'
      console.error(`[email] Failed to send ${emailType} to ${to}:`, message)
      await logEmail({ userId, emailType, recipientEmail: to, status: 'failed', errorMessage: message })
      return { success: false, error: message }
    }

    await logEmail({ userId, emailType, recipientEmail: to, resendId: data.id, status: 'sent' })
    return { success: true, resendId: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error sending email'
    console.error(`[email] Exception sending ${emailType} to ${to}:`, message)
    await logEmail({ userId, emailType, recipientEmail: to, status: 'failed', errorMessage: message })
    return { success: false, error: message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public send functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fires once after a user confirms their email address.
 * Idempotent — safe to call multiple times.
 */
export async function sendWelcomeEmail(
  userId: string,
  email: string,
  fullName?: string | null,
): Promise<EmailResult> {
  if (await alreadySent(userId, 'welcome')) {
    return { success: true, resendId: 'deduped' }
  }
  const firstName = extractFirstName(email, fullName)
  return sendEmail({
    userId,
    to: email,
    subject: `Welcome to Lyvewell, ${firstName}`,
    emailType: 'welcome',
    reactElement: <WelcomeEmail firstName={firstName} />,
  })
}

/**
 * Fires once when the user finishes the onboarding quiz.
 * Idempotent — safe to call multiple times.
 */
export async function sendOnboardingCompleteEmail(
  userId: string,
  email: string,
  fullName?: string | null,
): Promise<EmailResult> {
  if (await alreadySent(userId, 'onboarding_complete')) {
    return { success: true, resendId: 'deduped' }
  }
  const firstName = extractFirstName(email, fullName)
  return sendEmail({
    userId,
    to: email,
    subject: 'Your Lyvewell protocol is ready',
    emailType: 'onboarding_complete',
    reactElement: <OnboardingCompleteEmail firstName={firstName} />,
  })
}

/**
 * Fires when a Stripe subscription becomes active or trialing.
 * One send per subscription event is intentional (not deduped).
 */
export async function sendSubscriptionConfirmationEmail(
  userId: string,
  email: string,
  fullName: string | null,
  planName: string,
  amount: string,
  trialEndDate: string | null,
): Promise<EmailResult> {
  const firstName = extractFirstName(email, fullName)
  return sendEmail({
    userId,
    to: email,
    subject: 'Welcome to Lyvewell Premium',
    emailType: 'subscription_confirmation',
    reactElement: (
      <SubscriptionConfirmationEmail
        firstName={firstName}
        planName={planName}
        amount={amount}
        trialEndDate={trialEndDate}
      />
    ),
  })
}

/**
 * Fires every Sunday for engaged users.
 * Called by the weekly cron job at /api/cron/send-weekly-checkin-emails.
 */
export async function sendWeeklyCheckinEmail(
  userId: string,
  email: string,
  fullName: string | null,
  adherencePercent: number,
  streakDays: number,
  topSupplement: string | null,
): Promise<EmailResult> {
  const firstName = extractFirstName(email, fullName)
  return sendEmail({
    userId,
    to: email,
    subject: 'Your Lyvewell week',
    emailType: 'weekly_checkin',
    reactElement: (
      <WeeklyCheckinEmail
        firstName={firstName}
        adherencePercent={adherencePercent}
        streakDays={streakDays}
        topSupplement={topSupplement}
      />
    ),
  })
}
