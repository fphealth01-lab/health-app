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
  statsBox: {
    backgroundColor: '#f0fdfa',
    border: '1px solid #99f6e4',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '20px 0',
  },
  statRow: {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 6px',
  },
  statLabel: {
    color: '#6b7280',
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
  cancelNote: {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '12px 0 0',
    textAlign: 'center' as const,
  },
}

interface TrialEndingEmailProps {
  firstName: string
  trialEndDate: string
  coachMessages: number
  protocolsGenerated: number
}

/**
 * Sent 2 days before a user's trial ends.
 * Triggered by the daily cron job at /api/cron/send-trial-ending-emails.
 */
export function TrialEndingEmail({
  firstName = 'there',
  trialEndDate,
  coachMessages = 0,
  protocolsGenerated = 1,
}: TrialEndingEmailProps) {
  return (
    <EmailLayout preview={`Your Lyvewell trial ends in 2 days — here's what you've built.`}>
      <Heading style={styles.heading}>Your trial ends in 2 days</Heading>

      <Text style={styles.body}>Hi {firstName},</Text>

      <Text style={styles.body}>
        Your free Lyvewell trial ends on <strong>{trialEndDate}</strong>. After that, your card will
        be charged at your plan rate. You can cancel before then with no charge.
      </Text>

      {/* Usage stats */}
      <Section style={styles.statsBox}>
        <Text style={{ ...styles.statRow, fontWeight: '600', marginBottom: '10px' }}>
          What you&rsquo;ve built this week:
        </Text>
        <Text style={styles.statRow}>
          <span style={styles.statLabel}>Protocols generated: </span>
          <strong>{protocolsGenerated}</strong>
        </Text>
        <Text style={{ ...styles.statRow, margin: 0 }}>
          <span style={styles.statLabel}>AI Coach messages: </span>
          <strong>{coachMessages}</strong>
        </Text>
      </Section>

      <Text style={styles.body}>
        Keep access to your personalized protocol, AI Coach, and meal plans by continuing with
        Premium at just <strong>$9.99/month</strong> or <strong>$59.99/year</strong>.
      </Text>

      <div style={styles.buttonWrapper}>
        <Button href={`${SITE_URL}/dashboard`} style={styles.button}>
          Continue with Premium →
        </Button>
      </div>

      <Text style={styles.cancelNote}>
        Don&rsquo;t want to continue?{' '}
        <Link href={`${SITE_URL}/settings/billing`} style={{ color: '#0d9488' }}>
          Cancel in Settings → Billing
        </Link>{' '}
        before your trial ends.
      </Text>

      <Hr style={styles.divider} />

      <Text style={styles.muted}>
        Questions?{' '}
        <Link href="mailto:support@lyvewell.fit" style={{ color: '#0d9488' }}>
          support@lyvewell.fit
        </Link>
      </Text>
    </EmailLayout>
  )
}

export default TrialEndingEmail
