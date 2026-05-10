import { Button, Heading, Link, Text, Hr } from '@react-email/components'
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
  tipBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '24px 0',
  },
  tipText: {
    color: '#166534',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
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
}

interface OnboardingCompleteEmailProps {
  firstName: string
}

/**
 * Sent after a user successfully completes the onboarding quiz
 * and their first protocol is generated.
 */
export function OnboardingCompleteEmail({ firstName = 'there' }: OnboardingCompleteEmailProps) {
  return (
    <EmailLayout preview={`Your protocol is ready, ${firstName} — start tracking today.`}>
      <Heading style={styles.heading}>Your protocol is ready 🎉</Heading>

      <Text style={styles.body}>Hi {firstName},</Text>

      <Text style={styles.body}>
        You&rsquo;ve completed your Lyvewell onboarding. Your AI-generated supplement protocol is
        live and ready to view — built specifically for your goals, biology, and lifestyle.
      </Text>

      <div style={styles.buttonWrapper}>
        <Button href={`${SITE_URL}/protocol`} style={styles.button}>
          View my protocol →
        </Button>
      </div>

      <Text style={styles.body}>Here&rsquo;s what to explore next:</Text>

      <Text style={{ ...styles.body, margin: '0 0 8px' }}>
        <strong>📋 Your protocol</strong> — review each supplement, dosage, and timing
        recommendation.
      </Text>
      <Text style={{ ...styles.body, margin: '0 0 8px' }}>
        <strong>🤖 AI Coach</strong> — ask follow-up questions about your protocol, or anything
        health-related.
      </Text>
      <Text style={{ ...styles.body, margin: '0 0 8px' }}>
        <strong>🍽️ Meal plans</strong> — get a personalized weekly meal plan aligned with your
        dietary goals.
      </Text>
      <Text style={{ ...styles.body, margin: '0 0 16px' }}>
        <strong>📊 Daily tracking</strong> — log your supplements every day to build your adherence
        streak.
      </Text>

      <div style={styles.tipBox}>
        <Text style={styles.tipText}>
          💡 <strong>Pro tip:</strong> Track your supplements daily for the first 30 days. That
          &rsquo;s when most users report noticeable changes in energy, sleep, and focus.
        </Text>
      </div>

      <Hr style={styles.divider} />

      <Text style={styles.muted}>
        Questions about your protocol?{' '}
        <Link href={`${SITE_URL}/coach`} style={{ color: '#0d9488' }}>
          Ask your AI Coach
        </Link>{' '}
        or contact us at{' '}
        <Link href="mailto:support@lyvewell.fit" style={{ color: '#0d9488' }}>
          support@lyvewell.fit
        </Link>
        .
      </Text>
    </EmailLayout>
  )
}

export default OnboardingCompleteEmail
