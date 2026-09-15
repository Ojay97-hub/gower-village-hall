-- Allow admins to insert bookings directly (for manually-arranged private
-- hires taken by phone/Facebook/in person), mirroring the existing admin
-- update/delete policies on this table (admin_users membership check).
-- See "supabase schema/supabase_bookings_schema.sql" for the base table —
-- inserts previously only came from the send-booking serverless function via
-- the service-role key, which bypasses RLS.
-- Run in Supabase SQL editor (or via Supabase MCP) once.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Admins can insert bookings'
  ) THEN
    CREATE POLICY "Admins can insert bookings"
      ON public.bookings FOR INSERT
      WITH CHECK (exists (select 1 from public.admin_users where user_id = auth.uid()));
  END IF;
END $$;
