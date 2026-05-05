-- Indexes for fast streak and adherence queries on tracking tables.
-- These make the daily dashboard load fast even with years of history.

CREATE INDEX IF NOT EXISTS idx_tracking_entries_user_date
  ON public.tracking_entries(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date
  ON public.daily_checkins(user_id, date DESC);
