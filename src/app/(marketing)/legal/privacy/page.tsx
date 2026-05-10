import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Lyvewell',
  description: 'How Lyvewell collects, uses, and protects your personal data.',
}

const LAST_UPDATED = '10 May 2026'

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground not-prose -mt-4 mb-8 text-sm">Last updated: {LAST_UPDATED}</p>

      <p>
        Lyvewell (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal data and
        respecting your privacy. This Privacy Policy explains what data we collect, why we collect it, how we
        use it, and what rights you may have under applicable data protection laws in your jurisdiction.
      </p>

      <h2>1. Data Controller</h2>
      <p>
        The entity responsible for your personal data is <strong>Lyvewell</strong>.
        <br />
        Contact: <a href="mailto:privacy@lyvewell.fit">privacy@lyvewell.fit</a>
      </p>

      <h2>2. Data We Collect</h2>

      <h3>2.1 Account Data</h3>
      <p>
        When you create an account, we collect your <strong>email address</strong>. Your password is hashed
        using bcrypt by Supabase Auth and never stored in plaintext. We do not have access to your raw password.
      </p>

      <h3>2.2 Health Profile Data</h3>
      <p>
        To generate personalised supplement protocols and meal plans, we collect health-related information that
        you provide voluntarily, including:
      </p>
      <ul>
        <li>Age, biological sex, and weight/height</li>
        <li>Primary health goal (e.g. longevity, energy, sleep, fat loss)</li>
        <li>Dietary preferences and restrictions (e.g. vegan, gluten-free)</li>
        <li>Self-reported medical conditions and medications</li>
        <li>Activity level and sleep patterns</li>
      </ul>
      <p>
        This data is treated as <strong>sensitive health information</strong>. We process it only with your
        explicit consent, obtained at onboarding, and only for the purpose of providing the Service.
      </p>

      <h3>2.3 Usage Data</h3>
      <p>When you use Lyvewell, we may collect:</p>
      <ul>
        <li>AI coach conversation history (messages you send and responses received)</li>
        <li>Supplement protocol generations and selections</li>
        <li>Meal plans generated and saved</li>
        <li>Daily tracking entries (meals logged, biomarkers recorded)</li>
        <li>Feature usage patterns to improve the Service</li>
      </ul>

      <h3>2.4 Payment Data</h3>
      <p>
        Payment processing is handled entirely by <strong>Stripe, Inc.</strong> We do not store your card
        number, CVV, or full payment details. We retain only: subscription status (active, trialing, cancelled),
        subscription plan, and Stripe customer ID for billing administration.
      </p>

      <h3>2.5 Analytics Data</h3>
      <p>
        We use PostHog to collect anonymised analytics: page views, feature clicks, session duration, and
        conversion events. PostHog is configured with IP anonymisation. You can opt out of analytics tracking
        via your browser&rsquo;s Do Not Track setting or by contacting us.
      </p>

      <h3>2.6 Technical Data</h3>
      <p>
        We automatically collect certain technical information: IP address, browser type and version, device
        type, operating system, referring URLs, and access timestamps. This data is used for security,
        performance monitoring, and fraud prevention.
      </p>

      <h2>3. Legal Basis for Processing</h2>
      <p>We collect and use your data on the following grounds:</p>
      <ul>
        <li>
          <strong>Contract performance</strong>: processing necessary to provide the Service you have
          subscribed to, including generating protocols and processing billing.
        </li>
        <li>
          <strong>Explicit consent</strong>: for processing sensitive health data, which you provide at
          onboarding. You may withdraw consent at any time by deleting your account.
        </li>
        <li>
          <strong>Legitimate interests</strong>: for security monitoring, fraud prevention, and improving the
          accuracy of our AI models, where such interests are not overridden by your rights.
        </li>
        <li>
          <strong>Legal obligation</strong>: where we are required to retain data by applicable law, such as
          financial records required for tax compliance.
        </li>
      </ul>

      <h2>4. How We Use Your Data</h2>
      <p>Your data is used to:</p>
      <ul>
        <li>Create and manage your Lyvewell account</li>
        <li>Generate personalised supplement protocols, meal plans, and AI coaching responses</li>
        <li>Process subscription payments and send billing communications</li>
        <li>Send transactional emails (password reset, subscription confirmations, receipts)</li>
        <li>Respond to support enquiries</li>
        <li>Detect and prevent fraud, abuse, and security incidents</li>
        <li>Improve the accuracy and quality of our AI systems (using aggregated and anonymised data)</li>
        <li>Comply with our legal and regulatory obligations</li>
      </ul>
      <p>
        We do not sell your personal data to third parties. We do not use your data for advertising profiling.
      </p>

      <h2>5. Data Sharing</h2>
      <p>
        We share your data with the following trusted third-party processors, each bound by data processing
        agreements:
      </p>
      <ul>
        <li>
          <strong>Anthropic, PBC</strong> (United States) — AI model provider. Your AI chat messages and health
          profile data are processed by Anthropic to generate responses. Anthropic&rsquo;s API does not use
          your data to train models by default. Data transfers are governed by appropriate data transfer
          agreements.
        </li>
        <li>
          <strong>Stripe, Inc.</strong> (United States) — payment processing. Stripe operates under its own
          Privacy Policy and is certified to applicable security standards. Data transfers are governed by
          appropriate data transfer agreements.
        </li>
        <li>
          <strong>Supabase, Inc.</strong> (EU region — Frankfurt, Germany) — database hosting and
          authentication. All primary data is stored in the EU. Data is encrypted at rest and in transit.
        </li>
        <li>
          <strong>Resend, Inc.</strong> (United States) — transactional email delivery (password resets,
          receipts). Data transfers are governed by appropriate data transfer agreements.
        </li>
        <li>
          <strong>PostHog, Inc.</strong> (EU region available) — product analytics. Data is anonymised before
          transmission where possible.
        </li>
      </ul>
      <p>
        We may also disclose your data where required by law, court order, or regulatory authority, or to
        protect the rights and safety of Lyvewell, our users, or the public.
      </p>

      <h2>6. International Transfers</h2>
      <p>
        Some of our third-party processors are based in the United States. When your data is transferred
        internationally, we take steps to ensure it receives an appropriate level of protection through
        contractual safeguards and data processing agreements with each provider.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active. When you delete your account:
      </p>
      <ul>
        <li>Your personal data will be permanently deleted within <strong>30 days</strong>.</li>
        <li>
          Anonymised, aggregated analytics data that cannot be linked to you may be retained indefinitely for
          statistical purposes.
        </li>
        <li>
          Financial records (billing history) may be retained for up to 7 years to comply with applicable
          tax laws.
        </li>
      </ul>

      <h2>8. Your Privacy Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the following rights regarding your personal data.
        Contact us at <a href="mailto:privacy@lyvewell.fit">privacy@lyvewell.fit</a> to exercise any of them:
      </p>
      <ul>
        <li>
          <strong>Right of access</strong> — request a copy of the personal data we hold about you.
        </li>
        <li>
          <strong>Right to rectification</strong> — request correction of inaccurate or incomplete data.
        </li>
        <li>
          <strong>Right to erasure</strong> (&ldquo;right to be forgotten&rdquo;) — request deletion of your
          personal data.
        </li>
        <li>
          <strong>Right to data portability</strong> — receive your data in a structured, machine-readable
          format.
        </li>
        <li>
          <strong>Right to object</strong> — object to certain types of data processing.
        </li>
        <li>
          <strong>Right to restrict processing</strong> — request that we limit how we use your data in certain
          circumstances.
        </li>
        <li>
          <strong>Right to withdraw consent</strong> — where processing is based on consent, you may withdraw it
          at any time without affecting the lawfulness of prior processing.
        </li>
      </ul>
      <p>
        We will respond to valid requests within <strong>one calendar month</strong>. If you are not satisfied
        with our response, you may have the right to lodge a complaint with the data protection authority in
        your country.
      </p>

      <h2>9. Cookies</h2>
      <p>
        We use cookies and similar technologies to operate the Service. For full details, including how to
        manage your preferences, please see our <a href="/legal/cookies">Cookie Policy</a>.
      </p>

      <h2>10. Children&rsquo;s Privacy</h2>
      <p>
        The Service is intended for adults aged 18 and over. We do not knowingly collect personal data from
        anyone under 18. If you believe a child has provided us with personal data, please contact us
        immediately at <a href="mailto:privacy@lyvewell.fit">privacy@lyvewell.fit</a> and we will delete it
        promptly.
      </p>

      <h2>11. Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal data, including:
      </p>
      <ul>
        <li>Encryption of all data in transit using TLS 1.2+</li>
        <li>Encryption of data at rest in our Supabase database (AES-256)</li>
        <li>Row-level security (RLS) policies ensuring users can only access their own data</li>
        <li>Hashed and salted password storage via Supabase Auth</li>
        <li>Regular security reviews and access controls</li>
      </ul>
      <p>
        No transmission over the internet is 100% secure. While we take reasonable precautions, we cannot
        guarantee absolute security.
      </p>

      <h2>12. Updates to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of material changes via email
        and/or a notice within the Service at least 30 days before they take effect. We encourage you to
        review this page periodically.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        For any privacy-related queries, data subject requests, or concerns:
        <br />
        Email: <a href="mailto:privacy@lyvewell.fit">privacy@lyvewell.fit</a>
      </p>
    </>
  )
}
