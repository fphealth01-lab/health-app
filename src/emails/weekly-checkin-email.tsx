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
  statsGrid: {
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
    margin: '0 0 8px',
  },
  statLabel: {
    color: '#6b7280',
  },
  statValue: {
    color: '#0d9488',
    fontWeight: '700',
  },
  motivationBox: {
    backgroundColor: '#fefce8',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '14px 18px',
    margin: '20px 0',
  },
  motivationText: {
    color: '#78350f',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
    fontStyle: 'italic',
  },
  ctaRow: {
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  primaryButton: {
    backgroundColor: '#0d9488',
    borderRadius: '8px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 22px',
    textDecoration: 'none',
    marginRight: '10px',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #0d9488',
    borderRadius: '8px',
    color: '#0d9488',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 22px',
    textDecoration: 'none',
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

/** Pick a short motivational note based on adherence. */
function getMotivation(adherencePercent: number, streakDays: number): string {
  if (streakDays >= 14)
    return `${streakDays} days in a row — you're building a real habit. Most people see meaningful changes around 30 days of consistent supplementation.`
  if (adherencePercent >= 80)
    return `Strong week. Consistency is the most underrated health tool — keep showing up.`
  if (adherencePercent >= 50)
    return `You hit over half your targets this week. Every day you log builds the streak — aim for one more day this week.`
  return `Life gets busy. The goal isn't perfection — it's momentum. A few days of tracking is better than none.`
}

interface WeeklyCheckinEmailProps {
  firstName: string
  adherencePercent: number
  streakDays: number
  topSupplement: string | null
}

/**
 * Sent every Sunday morning to engaged users.
 * Triggered by the weekly cron job at /api/cron/send-weekly-checkin-emails.
 */
export function WeeklyCheckinEmail({
  firstName = 'there',
  adherencePercent = 0,
  streakDays = 0,
  topSupplement = null,
}: WeeklyCheckinEmailProps) {
  const motivation = getMotivation(adherencePercent, streakDays)

  return (
    <EmailLayout preview={`Your Lyvewell week — ${adherencePercent}% adherence, ${streakDays}-day streak.`}>
      <Heading style={styles.heading}>Your week with Lyvewell</Heading>

      <Text style={styles.body}>Hi {firstName},</Text>

      <Text style={styles.body}>Here&rsquo;s a quick look at your week:</Text>

      {/* Weekly stats */}
      <Section style={styles.statsGrid}>
        <Text style={styles.statRow}>
          <span style={styles.statLabel}>Tracking adherence: </span>
          <span style={styles.statValue}>{adherencePercent}%</span>
        </Text>
        <Text style={styles.statRow}>
          <span style={styles.statLabel}>Current streak: </span>
          <span style={styles.statValue}>{streakDays} day{streakDays !== 1 ? 's' : ''}</span>
        </Text>
        {topSupplement && (
          <Text style={{ ...styles.statRow, margin: 0 }}>
            <span style={styles.statLabel}>Most consistent supplement: </span>
            <span style={styles.statValue}>{topSupplement}</span>
          </Text>
        )}
      </Section>

      {/* Motivation */}
      <Section style={styles.motivationBox}>
        <Text style={styles.motivationText}>&ldquo;{motivation}&rdquo;</Text>
      </Section>

      <div style={styles.ctaRow}>
        <Button href={`${SITE_URL}/dashboard`} style={styles.primaryButton}>
          Log today
        </Button>
        <Button href={`${SITE_URL}/coach`} style={styles.secondaryButton}>
          Chat with coach
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={styles.muted}>
        You receive this every Sunday because you&rsquo;re an active Lyvewell user. To adjust your
        email preferences, visit{' '}
        <Link href={`${SITE_URL}/settings/notifications`} style={{ color: '#0d9488' }}>
          Settings → Notifications
        </Link>
        .
      </Text>
    </EmailLayout>
  )
}

export default WeeklyCheckinEmail
