-- "With special thanks to" sponsors for /businesses carousel
-- Run in Supabase SQL editor (or via Supabase MCP) once.

CREATE TABLE IF NOT EXISTS business_sponsors (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT         NOT NULL,
  website_url TEXT,
  logo_url    TEXT,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS business_sponsors_sort_idx
  ON business_sponsors (is_active, sort_order, name);

ALTER TABLE business_sponsors ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'business_sponsors'
      AND policyname = 'Public read active business_sponsors'
  ) THEN
    CREATE POLICY "Public read active business_sponsors"
      ON business_sponsors FOR SELECT
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'business_sponsors'
      AND policyname = 'Auth write business_sponsors'
  ) THEN
    CREATE POLICY "Auth write business_sponsors"
      ON business_sponsors FOR ALL
      USING (auth.role() = 'authenticated');
  END IF;
END $$;
