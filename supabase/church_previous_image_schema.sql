-- Add previous_image_url to churches so admins can revert to the last photo.
-- Run in Supabase SQL editor.

ALTER TABLE churches
  ADD COLUMN IF NOT EXISTS previous_image_url TEXT;
