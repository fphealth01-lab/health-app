-- Idempotency log for Stripe webhook deliveries.
--
-- Stripe retries failed webhooks with exponential backoff and may also
-- re-deliver in rare network conditions. We dedupe on event.id so each
-- webhook event mutates our DB exactly once.
--
-- The webhook handler:
--   1. Verifies the Stripe signature.
--   2. SELECTs from this table — if row exists, returns 200 immediately.
--   3. Processes the event (upserts to public.subscriptions).
--   4. INSERTs (id, type) here so retries are no-ops.
--
-- RLS is enabled with no policies, which means only the service role can
-- read or write. We never need user-facing access to this table.

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
    id           text        PRIMARY KEY,
    type         text        NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now()
);

-- Index for the (rare) operational queries by event type — e.g. "show me
-- the last failed payment events". Cheap insert overhead.
CREATE INDEX IF NOT EXISTS stripe_webhook_events_type_idx
    ON public.stripe_webhook_events (type, processed_at DESC);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Intentionally NO policies. With RLS on and no policies, all access
-- through the anon/authenticated keys is denied; only the service role
-- (used by the webhook handler) can read/write.

COMMENT ON TABLE public.stripe_webhook_events IS
    'Dedup log for Stripe webhook deliveries. PK = Stripe event id.';
