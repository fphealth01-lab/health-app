import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Lyvewell',
  description: 'How Lyvewell uses cookies and similar technologies on its platform.',
}

const LAST_UPDATED = '10 May 2026'

export default function CookiesPage() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <p className="text-muted-foreground not-prose -mt-4 mb-8 text-sm">Last updated: {LAST_UPDATED}</p>

      <p>
        This Cookie Policy explains how Lyvewell Ltd (&ldquo;Lyvewell&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;) uses cookies and similar technologies when you visit our website at{' '}
        <strong>lyvewell.fit</strong> or use our web application. It should be read alongside our{' '}
        <a href="/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that are placed on your device (computer, phone, or tablet) when you visit
        a website. They are widely used to make websites work correctly and efficiently, to remember your
        preferences, and to provide information to website owners.
      </p>
      <p>
        Similar technologies include local storage (data stored in your browser), session storage, and pixel
        tags. For simplicity, we refer to all of these as &ldquo;cookies&rdquo; in this policy.
      </p>

      <h2>2. Cookies We Use</h2>

      <h3>2.1 Essential Cookies</h3>
      <p>
        These cookies are <strong>strictly necessary</strong> for the Service to function. Without them, you
        could not log in, use the application, or process a payment. They cannot be disabled.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie / Storage Key</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sb-*-auth-token</code></td>
            <td>Supabase authentication session — keeps you logged in</td>
            <td>Session / persistent (7 days)</td>
          </tr>
          <tr>
            <td><code>sb-*-auth-token-code-verifier</code></td>
            <td>PKCE code verifier for secure OAuth flows</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><code>lyvewell_cookies_accepted</code></td>
            <td>Remembers your cookie consent preference (stored in localStorage)</td>
            <td>Persistent (no expiry)</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Analytics Cookies</h3>
      <p>
        We use <strong>PostHog</strong> to understand how visitors interact with Lyvewell so we can improve the
        Service. PostHog collects anonymised data about page views, button clicks, and feature usage. No
        personally identifiable information is sent to PostHog by default.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie / Storage Key</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>ph_*</code></td>
            <td>PostHog analytics session and distinct user identifier (anonymised)</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td><code>posthog_*</code></td>
            <td>PostHog feature flags and A/B test assignments</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>
      <p>
        You can opt out of PostHog analytics by enabling your browser&rsquo;s Do Not Track setting. PostHog
        respects DNT signals.
      </p>

      <h3>2.3 Payment Cookies</h3>
      <p>
        When you visit our checkout or billing portal, <strong>Stripe</strong> may set cookies to enable secure
        payment processing and fraud prevention. These are set by Stripe directly and are necessary to complete
        subscription transactions.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>__stripe_mid</code></td>
            <td>Stripe fraud detection and payment risk analysis</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td><code>__stripe_sid</code></td>
            <td>Stripe session identifier for payment flow continuity</td>
            <td>30 minutes</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Third-Party Cookies</h2>
      <p>
        In addition to the cookies set directly by Lyvewell, the following third-party services may set cookies
        when you use our platform:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication and database provider. Privacy policy:{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            supabase.com/privacy
          </a>
        </li>
        <li>
          <strong>Stripe</strong> — payment processing. Privacy policy:{' '}
          <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer">
            stripe.com/gb/privacy
          </a>
        </li>
        <li>
          <strong>PostHog</strong> — analytics. Privacy policy:{' '}
          <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
            posthog.com/privacy
          </a>
        </li>
      </ul>

      <h2>4. How to Manage Cookies</h2>
      <p>
        Most web browsers allow you to control cookies through their settings. You can choose to:
      </p>
      <ul>
        <li>View cookies that are set on your device.</li>
        <li>Delete some or all cookies.</li>
        <li>Block third-party cookies.</li>
        <li>Block all cookies (note: this will prevent you from logging in to Lyvewell).</li>
      </ul>
      <p>Browser-specific guidance:</p>
      <ul>
        <li>
          <strong>Chrome</strong>:{' '}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.google.com/chrome/answer/95647
          </a>
        </li>
        <li>
          <strong>Safari</strong>:{' '}
          <a
            href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.apple.com — Safari cookie settings
          </a>
        </li>
        <li>
          <strong>Firefox</strong>:{' '}
          <a
            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.mozilla.org — Firefox cookie settings
          </a>
        </li>
        <li>
          <strong>Edge</strong>:{' '}
          <a
            href="https://support.microsoft.com/en-gb/windows/delete-and-manage-cookies"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.microsoft.com — Edge cookie settings
          </a>
        </li>
      </ul>
      <p>
        Please note that disabling essential cookies will prevent Lyvewell from working correctly and you will
        not be able to log in to the Service.
      </p>

      <h2>5. Do Not Track</h2>
      <p>
        Some browsers include a &ldquo;Do Not Track&rdquo; (DNT) feature that signals to websites that you do
        not wish to be tracked. PostHog respects DNT signals. Essential cookies will still be set regardless of
        DNT status, as they are necessary to operate the Service.
      </p>

      <h2>6. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in our practices or applicable
        law. We will post the updated policy on this page with a revised &ldquo;Last updated&rdquo; date.
        Material changes will be communicated via the cookie banner or email.
      </p>

      <h2>7. Contact</h2>
      <p>
        For questions about our use of cookies, please contact:{' '}
        <a href="mailto:privacy@lyvewell.fit">privacy@lyvewell.fit</a>
      </p>
    </>
  )
}
