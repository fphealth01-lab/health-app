import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — Lyvewell',
  description: 'Lyvewell refund and cancellation policy for monthly and annual subscriptions.',
}

const LAST_UPDATED = '10 May 2026'

export default function RefundPage() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p className="text-muted-foreground not-prose -mt-4 mb-8 text-sm">Last updated: {LAST_UPDATED}</p>

      <p>
        Lyvewell Ltd (&ldquo;Lyvewell&rdquo;) wants you to feel confident when subscribing. This policy explains
        when and how you can receive a refund, and how to cancel your subscription.
      </p>

      <h2>1. Seven-Day Free Trial</h2>
      <p>
        All new Lyvewell subscriptions begin with a <strong>7-day free trial</strong>. During the trial period:
      </p>
      <ul>
        <li>Your payment method will not be charged.</li>
        <li>You have full access to all premium features.</li>
        <li>
          You may cancel at any time before the trial ends without incurring any charge. If you cancel during
          the trial, your access will continue until the trial period expires and no payment will be taken.
        </li>
      </ul>
      <p>
        After the 7-day trial, your subscription will automatically convert to your chosen paid plan and your
        payment method will be charged.
      </p>

      <h2>2. Monthly Subscriptions</h2>
      <p>
        Monthly subscriptions are charged at <strong>£8.99 per month</strong> (or regional equivalent). Because
        you gain immediate full access to the Service on billing, we generally do not offer refunds for partial
        months already paid.
      </p>
      <p>
        If you cancel a monthly subscription, your access will continue until the end of the current billing
        period. You will not be charged for subsequent months.
      </p>
      <p>
        Exceptions may be made at our discretion in cases of documented technical failure that prevented access
        to the Service for a material portion of the billing period. To request such a review, email us at{' '}
        <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a> with the subject line
        &ldquo;Refund Request&rdquo;.
      </p>

      <h2>3. Annual Subscriptions</h2>
      <p>
        Annual subscriptions are charged at <strong>£55.99 per year</strong> (or regional equivalent) in a
        single upfront payment.
      </p>
      <p>
        In accordance with the <strong>UK Consumer Contracts (Information, Cancellation and Additional Charges)
        Regulations 2013</strong>, you have a statutory 14-day cooling-off period from the date of purchase.
        During this window, you may request a full refund provided you have not made significant use of the
        Service (e.g. generated multiple protocols, had extensive coach conversations).
      </p>
      <p>
        After the 14-day cooling-off period, or where the Service has been materially used, refunds for annual
        subscriptions may be provided on a <strong>pro-rated basis</strong> — that is, a refund for the
        remaining complete months of the subscription, less a small administration fee of £5.00. Each case is
        reviewed individually.
      </p>
      <p>
        To request a refund for an annual subscription, email{' '}
        <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a> with:
      </p>
      <ul>
        <li>Your registered email address</li>
        <li>The date of purchase</li>
        <li>Your reason for requesting a refund</li>
      </ul>

      <h2>4. How to Cancel Your Subscription</h2>
      <p>
        You can cancel your subscription at any time through the Lyvewell billing portal:
      </p>
      <ol>
        <li>Log in to your Lyvewell account.</li>
        <li>Navigate to <strong>Settings &rarr; Billing</strong>.</li>
        <li>Click <strong>Manage subscription</strong> to open the Stripe billing portal.</li>
        <li>Select <strong>Cancel plan</strong> and follow the prompts.</li>
      </ol>
      <p>
        Cancellation takes effect at the end of the current billing period. You will retain access to all
        premium features until that date. You will not receive a partial refund for unused days unless otherwise
        specified in this policy.
      </p>
      <p>
        If you encounter any issues cancelling, contact us at{' '}
        <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a>.
      </p>

      <h2>5. How to Request a Refund</h2>
      <p>
        To request a refund, email <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a> with the
        subject line <strong>&ldquo;Refund Request&rdquo;</strong>. Please include:
      </p>
      <ul>
        <li>Your registered email address</li>
        <li>Your subscription type (monthly or annual)</li>
        <li>Date of the charge you are disputing</li>
        <li>A brief explanation of why you are requesting a refund</li>
      </ul>
      <p>
        We aim to respond to all refund requests within <strong>5 business days</strong>.
      </p>

      <h2>6. Refund Processing</h2>
      <p>
        Approved refunds are processed through Stripe back to the original payment method used at the time of
        purchase. Refunds typically appear within <strong>5–10 business days</strong>, depending on your bank
        or card issuer. We will notify you by email once a refund has been initiated.
      </p>
      <p>
        Please note that Stripe may not return the original processing fee on refunds, which means you may
        receive slightly less than the full charged amount in rare cases of partial refunds.
      </p>

      <h2>7. Dispute Resolution</h2>
      <p>
        We always prefer to resolve billing issues directly and in good faith before a chargeback or payment
        dispute is raised with your bank. If you believe you have been incorrectly charged, please contact us
        at <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a> first. We will work with you to
        resolve the issue promptly.
      </p>
      <p>
        Initiating a chargeback without first contacting us may result in the suspension of your account
        pending the resolution of the dispute.
      </p>

      <h2>8. No Refunds For</h2>
      <p>The following are generally not eligible for refunds:</p>
      <ul>
        <li>Monthly subscriptions where the billing period has already been substantially used.</li>
        <li>
          Gift subscriptions or promotional codes that have been redeemed and the Service has been accessed.
        </li>
        <li>
          Cases where the account has been suspended or terminated due to a violation of our{' '}
          <a href="/legal/terms">Terms of Service</a>.
        </li>
        <li>Annual subscriptions where the cooling-off period has elapsed and significant use has occurred.</li>
      </ul>

      <h2>9. Your Statutory Rights</h2>
      <p>
        Nothing in this Refund Policy affects your statutory rights as a UK consumer. In particular, your rights
        under the <strong>Consumer Rights Act 2015</strong> — including rights related to services that are not
        performed with reasonable care and skill — are not limited or excluded by this policy.
      </p>
      <p>
        If you believe Lyvewell has not delivered the Service as described, you are entitled to seek a remedy
        under UK consumer law regardless of the terms set out above.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any billing or refund enquiries:
        <br />
        Email: <a href="mailto:support@lyvewell.fit">support@lyvewell.fit</a>
        <br />
        We aim to respond within 2 business days.
      </p>
    </>
  )
}
