import { Button, Heading, Link, Text, Hr, Section } from '@react-email/components'
import { EmailLayout } from './components/email-layout'

const SITE_URL = 'https://lyvewell.fit'

const styles = {
  heading: {
    color: '#111827',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0 0 16px',
  },
  body: {
    color: '#374151',
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0 0 16px',
  },
  button: {
    backgroundColor: '#0d9488',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '600',
    padding: '12px 28px',
    textDecoration: 'none',
  },
  buttonWrapper: {
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  receiptBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '20px 0',
  },
  receiptRow: {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 6px',
  },
  receiptLabel: {
    color: '#6b7280',
  },
  featureText: {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 8px',
  },
  divider: {
    borderColor: '#f3f4f6',
    margin: '24px 0',
  },
  muted: {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0',
  },
  tealAccent: {
    color: '#0d9488',
    fontWeight: '600',
  },
}

interface SubscriptionConfirmationEmailProps {
  firstName: string
  planName: string
  amount: string
  trialEndDate: string | null
}

/**
 * Sent when a Stripe subscription is created/activated (trialing or active).
 */
export function SubscriptionConfirmationEmail({
  firstName = 'there',
  planName = 'Premium Monthly',
  amount = '$9.99/month',
  trialEndDate = null,
}: SubscriptionConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Welcome to Lyvewell Premium, ${firstName} — you're all set.`}>
      <Heading style={styles.heading}>Welcome to Premium ✨</Heading>

      <Text style={styles.body}>Hi {firstName},</Text>

      <Text style={styles.body}>
        Your Lyvewell Premium subscription is now active. You have full access to every feature.
      </Text>

      {trialEndDate && (
        <Text style={styles.body}>
          Your <strong>7-day free trial</strong> ends on <strong>{trialEndDate}</strong>. You
          won&rsquo;t be charged until then — cancel anytime before that date with no cost.
        </Text>
      )}

      {/* Receipt */}
      <Section style={styles.receiptBox}>
        <Text style={styles.receiptRow}>
          <span style={styles.receiptLabel}>Plan: </span>
          <strong>{planName}</strong>
        </Text>
        <Text style={styles.receiptRow}>
          <span style={styles.receiptLabel}>Amount: </span>
          <strong>{amount}</strong>
        </Text>
        {trialEndDate && (
          <Text style={{ ...styles.receiptRow, margin: 0 }}>
            <span style={styles.receiptLabel}>First charge: </span>
            <strong>{trialEndDate}</strong>
          </Text>
        )}
      </Section>

      <Text style={{ ...styles.body, fontWeight: '600', margin: '0 0 12px' }}>
        What&rsquo;s unlocked with Premium:
      </Text>

      <Text style={styles.featureText}>
        <span style={styles.tealAccent}>✦</span> Full personalized supplement protocols powered by
        AI
      </Text>
      <Text style={styles.featureText}>
        <span style={styles.tealAccent}>✦</span> Unlimited AI Coach conversations
      </Text>
      <Text style={styles.featureText}>
        <span style={styles.tealAccent}>✦</span> 7-day personalized meal plans
      </Text>
      <Text style={styles.featureText}>
        <span style={styles.tealAccent}>✦</span> Advanced tracking and weekly insights
      </Text>
      <Text style={{ ...styles.featureText, margin: '0 0 20px' }}>
        <span style={styles.tealAccent}>✦</span> Priority support
      </Text>

      <div style={styles.buttonWrapper}>
        <Button href={`${SITE_URL}/dashboard`} style={styles.button}>
          Open Lyvewell →
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={styles.muted}>
        Need to cancel? Go to{' '}
        <Link href={`${SITE_URL}/settings/billing`} style={{ color: '#0d9488' }}>
          Settings → Billing
        </Link>{' '}
        at any time. Questions?{' '}
        <Link href="mailto:support@lyvewell.fit" style={{ color: '#0d9488' }}>
          support@lyvewell.fit
        </Link>
      </Text>
    </EmailLayout>
  )
}

export default SubscriptionConfirmationEmail
