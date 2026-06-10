-- Add map_query to churches so admins can control the postcode / location
-- used for the "Find Us" Google Map embed, independently of the display address.
-- When NULL the page falls back to the built-in per-church default.
-- Run in Supabase SQL editor.

ALTER TABLE churches
  ADD COLUMN IF NOT EXISTS map_query TEXT;
