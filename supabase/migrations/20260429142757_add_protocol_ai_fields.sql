-- AI metadata on the user's protocol. `ai_model` is the model string that
-- generated the protocol (or NULL for hardcoded fallbacks). `ai_generated_at`
-- is the moment the call returned — not the row's `generated_at`, which is
-- our own internal create-time and can drift when we copy a cached protocol.
alter table public.protocols
  add column if not exists ai_model        text,
  add column if not exists ai_generated_at timestamptz;

-- Per-supplement citations the AI returns (array of {title, url}). Free tier
-- leaves this empty; premium populates it. Default '[]'::jsonb keeps reads
-- safe (`citations.length === 0` works without null-checks in the UI).
alter table public.protocol_items
  add column if not exists citations jsonb not null default '[]'::jsonb;

comment on column public.protocols.ai_model
  is 'Anthropic model string used to generate this protocol. NULL = hardcoded fallback.';
comment on column public.protocols.ai_generated_at
  is 'Timestamp the AI call returned; survives caching unlike generated_at.';
comment on column public.protocol_items.citations
  is 'jsonb array of {title, url} cited by the AI for this supplement.';
