-- ============================================================
-- Bookings Schema
-- Run this in Supabase SQL Editor
-- ============================================================

create table if not exists public.bookings (
  id uuid not null default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text null,
  event_type text null,
  date date not null,
  end_date date null,
  message text null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamp with time zone not null default now(),
  constraint bookings_pkey primary key (id)
);

alter table public.bookings enable row level security;

-- Admins can read all bookings
create policy "Admins can read bookings"
  on public.bookings for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can update bookings (e.g. change status)
create policy "Admins can update bookings"
  on public.bookings for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Inserts come from the serverless function using the service role key,
-- which bypasses RLS entirely — no insert policy needed.
