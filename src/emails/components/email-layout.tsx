import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Section,
  Text,
  Font,
  Hr,
} from '@react-email/components'
import type { ReactNode } from 'react'

const SITE_URL = 'https://lyvewell.fit'

const styles = {
  body: {
    backgroundColor: '#fdfcfa',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    margin: '32px auto',
    maxWidth: '560px',
    padding: '0',
    border: '1px solid #e5e7eb',
  },
  header: {
    backgroundColor: '#0d9488',
    borderRadius: '12px 12px 0 0',
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    textDecoration: 'none',
  },
  content: {
    padding: '32px 32px 24px',
  },
  footer: {
    borderTop: '1px solid #f3f4f6',
    padding: '20px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0 0 6px',
  },
  footerLink: {
    color: '#9ca3af',
    textDecoration: 'underline',
  },
}

interface EmailLayoutProps {
  preview: string
  children: ReactNode
  unsubscribeUrl?: string
}

/**
 * Shared wrapper for all Lyvewell transactional emails.
 * Provides consistent header, footer, and base styling.
 */
export function EmailLayout({ preview, children, unsubscribeUrl }: EmailLayoutProps) {
  const unsubUrl = unsubscribeUrl ?? `${SITE_URL}/settings/notifications`

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={styles.body}>
        {/* Preview text — shown in inbox previews */}
        <Text
          style={{
            display: 'none',
            maxHeight: 0,
            overflow: 'hidden',
            fontSize: '1px',
            lineHeight: '1px',
            color: '#fdfcfa',
          }}
        >
          {preview}
        </Text>

        <Container style={styles.container}>
          {/* Brand header */}
          <Section style={styles.header}>
            <Link href={SITE_URL} style={styles.logo}>
              Lyvewell
            </Link>
          </Section>

          {/* Email body */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You&rsquo;re receiving this because you have a Lyvewell account.
            </Text>
            <Text style={styles.footerText}>
              <Link href={unsubUrl} style={styles.footerLink}>
                Manage email preferences
              </Link>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <Link href={`${SITE_URL}/legal/privacy`} style={styles.footerLink}>
                Privacy policy
              </Link>
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Lyvewell. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
