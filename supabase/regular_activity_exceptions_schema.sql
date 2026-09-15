-- Per-occurrence cancellations for recurring regular activities.
-- A row here means: the activity in `activity_id` does NOT run on
-- `exception_date`, even though its recurrence rule would otherwise
-- generate that date. All other occurrences in the series are unaffected.
-- "Restoring" an occurrence is simply deleting its row here — there is no
-- update path for this table.
-- Run in Supabase SQL editor (or via Supabase MCP) once.

CREATE TABLE IF NOT EXISTS regular_activity_exceptions (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id    UUID        NOT NULL REFERENCES regular_activities(id) ON DELETE CASCADE,
  exception_date DATE        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (activity_id, exception_date)
);

ALTER TABLE regular_activity_exceptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'regular_activity_exceptions'
      AND policyname = 'Public read regular_activity_exceptions'
  ) THEN
    CREATE POLICY "Public read regular_activity_exceptions"
      ON regular_activity_exceptions FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'regular_activity_exceptions'
      AND policyname = 'Auth insert regular_activity_exceptions'
  ) THEN
    CREATE POLICY "Auth insert regular_activity_exceptions"
      ON regular_activity_exceptions FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'regular_activity_exceptions'
      AND policyname = 'Auth delete regular_activity_exceptions'
  ) THEN
    CREATE POLICY "Auth delete regular_activity_exceptions"
      ON regular_activity_exceptions FOR DELETE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;
