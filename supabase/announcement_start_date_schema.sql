-- Add start_date to announcements so admins can specify when an announcement becomes active.
-- Run in Supabase SQL editor.

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
