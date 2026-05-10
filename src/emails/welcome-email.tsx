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
  featureList: {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 4px',
    paddingLeft: '0',
  },
  featureItem: {
    margin: '0 0 8px',
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
  muted: {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '16px 0 0',
  },
  divider: {
    borderColor: '#f3f4f6',
    margin: '24px 0',
  },
  tealAccent: {
    color: '#0d9488',
    fontWeight: '600',
  },
}

interface WelcomeEmailProps {
  firstName: string
}

/**
 * Sent immediately after a user confirms their email address.
 */
export function WelcomeEmail({ firstName = 'there' }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to Lyvewell, ${firstName} — your personalized protocol awaits.`}>
      <Heading style={styles.heading}>Welcome to Lyvewell</Heading>

      <Text style={styles.body}>Hi {firstName},</Text>

      <Text style={styles.body}>
        We&rsquo;re glad you&rsquo;re here. Lyvewell helps you build a personalized supplement
        protocol backed by science — then tracks, coaches, and adapts as you go.
      </Text>

      <Text style={styles.body}>
        <strong>Your next step:</strong> complete the 2-minute onboarding quiz and get your
        personalized protocol.
      </Text>

      <div style={styles.buttonWrapper}>
        <Button href={`${SITE_URL}/onboarding`} style={styles.button}>
          Complete onboarding →
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.body, fontWeight: '600', margin: '0 0 12px' }}>
        What you can do with Lyvewell:
      </Text>

      <Text style={styles.featureList}>
        <span style={styles.tealAccent}>✦</span>{' '}
        <strong>Personalized supplement protocol</strong> — built around your goals, biology, and
        lifestyle
      </Text>
      <Text style={styles.featureList}>
        <span style={styles.tealAccent}>✦</span>{' '}
        <strong>Your Coach</strong> — ask anything about nutrition, sleep, and supplementation
      </Text>
      <Text style={styles.featureList}>
        <span style={styles.tealAccent}>✦</span>{' '}
        <strong>Personalized meal plans</strong> — generated around your dietary preferences
      </Text>
      <Text style={styles.featureList}>
        <span style={styles.tealAccent}>✦</span>{' '}
        <strong>Daily tracking</strong> — log supplements, meals, and biomarkers
      </Text>

      <Hr style={styles.divider} />

      <Text style={styles.muted}>
        Questions? Reply to this email or contact us at{' '}
        <Link href="mailto:support@lyvewell.fit" style={{ color: '#0d9488' }}>
          support@lyvewell.fit
        </Link>
        .
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail
