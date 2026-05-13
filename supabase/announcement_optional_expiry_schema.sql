-- Make expiry_date optional on announcements so notices can be pinned indefinitely.
-- Run in Supabase SQL editor.

ALTER TABLE announcements
  ALTER COLUMN expiry_date DROP NOT NULL;
