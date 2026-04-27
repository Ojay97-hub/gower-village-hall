-- Allow public (unauthenticated) users to read confirmed bookings only.
-- Run this in the Supabase SQL Editor.
--
-- The existing "Admins can read bookings" policy is unchanged — admins still
-- see all bookings regardless of status. RLS policies are additive (OR-ed),
-- so this simply adds a second path for the anon role.

CREATE POLICY "Public can read confirmed bookings"
  ON public.bookings FOR SELECT
  USING (status = 'confirmed');
