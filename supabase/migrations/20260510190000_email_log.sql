-- ============================================================================
-- email_log — record of every transactional email sent via Resend.
-- Used for deduplication (e.g. welcome email fires only once per user)
-- and operational monitoring.
-- ============================================================================

CREATE TABLE public.email_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type      text        NOT NULL CHECK (email_type IN (
                                'welcome',
                                'onboarding_complete',
                                'subscription_confirmation',
                                'trial_ending',
                                'weekly_checkin'
                              )),
  recipient_email text        NOT NULL,
  resend_id       text,
  status          text        NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'queued')),
  error_message   text,
  sent_at         timestamptz DEFAULT now()
);

CREATE INDEX idx_email_log_user ON public.email_log(user_id, sent_at DESC);
CREATE INDEX idx_email_log_type ON public.email_log(email_type, sent_at DESC);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin-only, not accessible to regular users)
CREATE POLICY "Service role can manage email log" ON public.email_log
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
