import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Lyvewell, the AI-personalised supplement and wellness platform.',
  alternates: { canonical: '/legal/terms' },
}

const LAST_UPDATED = '10 May 2026'

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground not-prose -mt-4 mb-8 text-sm">Last updated: {LAST_UPDATED}</p>

      <h2>1. Introduction</h2>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Lyvewell platform,
        including our website at <strong>lyvewell.fit</strong>, mobile-optimised web application, and all
        associated services (collectively, the &ldquo;Service&rdquo;). These Terms constitute a legally binding
        agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and{' '}
        <strong>Lyvewell</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
      </p>
      <p>
        By creating an account or using the Service, you confirm that you have read, understood, and agree to be
        bound by these Terms. If you do not agree, you must not use the Service.
      </p>

      <h2>2. Service Description</h2>
      <p>
        Lyvewell is an AI-powered longevity and wellness platform that provides:
      </p>
      <ul>
        <li>
          <strong>Personalised supplement protocols</strong> — AI-generated recommendations based on your health
          profile, goals, dietary preferences, and self-reported conditions.
        </li>
        <li>
          <strong>AI coach</strong> — a conversational health assistant powered by large language model (LLM)
          technology that can answer questions about nutrition, supplementation, and lifestyle optimisation.
        </li>
        <li>
          <strong>Meal plans</strong> — AI-generated meal planning aligned with your nutritional targets and
          dietary preferences.
        </li>
        <li>
          <strong>Daily tracking</strong> — tools to log meals, supplements, biomarkers, and lifestyle metrics.
        </li>
        <li>
          <strong>Educational content</strong> — articles, research summaries, and evidence-based guides on
          health and longevity topics.
        </li>
      </ul>
      <p>
        All AI-generated content is for informational and educational purposes only. Nothing in the Service
        constitutes medical advice, diagnosis, or treatment. See our{' '}
        <a href="/legal/medical-disclaimer">Medical Disclaimer</a> for further detail.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        To access the Service, you must create an account. By registering, you represent and warrant that:
      </p>
      <ul>
        <li>You are at least 18 years of age.</li>
        <li>You will provide accurate, current, and complete information during registration.</li>
        <li>You will maintain and promptly update your account information to keep it accurate.</li>
        <li>You will keep your credentials confidential and not share your account with others.</li>
        <li>You will register only one account per person.</li>
        <li>You are not prohibited from using the Service under applicable law.</li>
      </ul>
      <p>
        You are responsible for all activity that occurs under your account. If you suspect unauthorized access,
        you must notify us immediately at <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a>.
      </p>

      <h2>4. Subscription Terms</h2>
      <p>
        Access to premium features requires a paid subscription. We offer the following plans:
      </p>
      <ul>
        <li>
          <strong>Monthly plan</strong>: $9.99 per month (pricing displayed in your local currency at
          sign-up).
        </li>
        <li>
          <strong>Annual plan</strong>: $59.99 per year, representing a saving compared to the monthly rate.
        </li>
      </ul>
      <p>
        All new subscriptions include a <strong>7-day free trial</strong>. Your card will not be charged until
        the trial period ends. You may cancel at any time during the trial without incurring any charge. After
        the trial, subscriptions <strong>auto-renew</strong> at the end of each billing period unless you cancel
        before the renewal date.
      </p>
      <p>
        You may cancel your subscription at any time through the billing portal accessible via
        Settings &rarr; Billing. Cancellation takes effect at the end of the current billing period; you retain
        access to premium features until that date.
      </p>

      <h2>5. Payment &amp; Billing</h2>
      <p>
        All payments are processed securely by <strong>Stripe, Inc.</strong> We do not store your full card
        details; Stripe handles payment data in accordance with PCI-DSS standards. By subscribing, you
        authorize Stripe to charge your chosen payment method on a recurring basis.
      </p>
      <p>
        Prices are displayed in USD by default. Local currency equivalents may be available at sign-up. Prices
        are inclusive of any applicable sales tax or VAT where required by law. We reserve the right to change
        prices with at least 30 days&rsquo; advance notice.
      </p>

      <h2>6. Acceptable Use</h2>
      <p>
        You agree not to:
      </p>
      <ul>
        <li>Use the Service in any way that violates applicable local, national, or international law.</li>
        <li>
          Scrape, crawl, or otherwise harvest data from the Service or attempt to access the Service by any
          automated means.
        </li>
        <li>
          Abuse, spam, or attempt to manipulate the AI coach or AI protocol generator to produce harmful,
          misleading, or inappropriate content.
        </li>
        <li>
          Resell, sublicense, or commercially exploit the Service or its outputs without our prior written
          consent.
        </li>
        <li>
          Upload or transmit viruses, malware, or any code designed to disrupt or damage the Service.
        </li>
        <li>
          Impersonate any person or entity or misrepresent your affiliation with any person or entity.
        </li>
      </ul>
      <p>
        We reserve the right to suspend or terminate your account immediately and without notice if we determine
        that you have violated these acceptable use standards.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Lyvewell platform, including its software, design, branding, and all content we create or curate,
        is owned by or licensed to Lyvewell and is protected by copyright, trademark, and other intellectual
        property laws. You are granted a limited, non-exclusive, non-transferable license to access and use the
        Service for personal, non-commercial purposes.
      </p>
      <p>
        <strong>Your data belongs to you.</strong> Health data, tracking entries, and personal information you
        provide remain your property. You grant Lyvewell a limited license to process this data solely to
        provide and improve the Service, as detailed in our <a href="/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>8. AI Output Disclaimer</h2>
      <p>
        Our supplement protocols, meal plans, and coach responses are generated by artificial intelligence
        models, including large language models operated by third-party providers. By their nature, these
        outputs:
      </p>
      <ul>
        <li>May contain errors, inaccuracies, or &ldquo;hallucinations&rdquo;.</li>
        <li>Are not reviewed by qualified healthcare professionals before delivery to you.</li>
        <li>Do not constitute personalized medical advice or a substitute for professional consultation.</li>
        <li>May not account for all drug interactions, contraindications, or individual health factors.</li>
      </ul>
      <p>
        You accept full responsibility for how you act on AI-generated suggestions. We strongly recommend
        consulting a qualified healthcare professional before starting any new supplement regimen. See our{' '}
        <a href="/legal/medical-disclaimer">Medical Disclaimer</a> for full detail.
      </p>

      <h2>9. Termination</h2>
      <p>
        You may terminate your account at any time by contacting us at{' '}
        <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a> or using the account deletion option in
        Settings. Upon deletion, we will erase your personal data within 30 days in accordance with our Privacy
        Policy, unless we are required to retain it by law.
      </p>
      <p>
        We may suspend or terminate your access to the Service immediately and without prior notice if we
        reasonably believe you have materially breached these Terms, engaged in fraudulent activity, or pose a
        risk of harm to other users or to the platform.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by applicable law, Lyvewell&rsquo;s aggregate liability to you for any
        claim arising out of or relating to your use of the Service shall not exceed the total amount you have
        paid to Lyvewell in the twelve (12) months immediately preceding the event giving rise to the claim.
      </p>
      <p>
        We are not liable for any indirect, incidental, consequential, special, or punitive damages, including
        loss of profits, loss of data, personal injury, or property damage, even if we have been advised of the
        possibility of such damages. Nothing in these Terms limits liability that cannot be excluded under
        applicable law.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Lyvewell and its officers, directors, employees, and
        agents from and against any claims, liabilities, damages, losses, costs, and expenses (including
        reasonable legal fees) arising out of or in any way connected with your use of the Service, your
        violation of these Terms, or your infringement of any third-party rights.
      </p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be governed by applicable laws in the jurisdiction where Lyvewell operates. We will
        work in good faith to resolve any disputes that arise from your use of the Service. Where informal
        resolution is not possible, disputes will be subject to the exclusive jurisdiction of the courts
        applicable to our place of business, as updated from time to time.
      </p>

      <h2>13. Dispute Resolution</h2>
      <p>
        In the event of any dispute, we encourage you to contact us first at{' '}
        <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a>. We will endeavor to resolve disputes
        informally within 30 days of receiving written notice. If informal resolution is not possible, we will
        work together to identify an appropriate resolution process based on your location and the nature of
        the dispute.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We may revise these Terms from time to time. When we make material changes, we will notify you by email
        and/or by displaying a notice within the Service at least <strong>30 days</strong> before the changes
        take effect. Your continued use of the Service after the effective date constitutes acceptance of the
        updated Terms. If you do not agree to the revised Terms, you must stop using the Service.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Contact us at:{' '}
        <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a>
      </p>
    </>
  )
}
