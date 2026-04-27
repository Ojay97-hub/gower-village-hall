-- ============================================================
-- Coffee Morning Updates Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Coffee Morning Updates table
-- --------------------------------------------------------
create table if not exists public.coffee_morning_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null default auth.uid(),
  updated_by uuid null default auth.uid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content_markdown text not null,
  hero_image_url text null,
  event_date date null,
  fundraising_for text null,
  amount_raised numeric(10, 2) null,
  published boolean not null default false,
  published_at timestamptz null
);

alter table public.coffee_morning_updates enable row level security;

create trigger coffee_morning_updates_updated_at
  before update on public.coffee_morning_updates
  for each row execute function public.set_updated_at();

-- Public users can only see published updates
create policy "Public can read published coffee morning updates"
  on public.coffee_morning_updates for select
  using (published = true);

-- Admins can see ALL updates (draft + published)
create policy "Admins can read all coffee morning updates"
  on public.coffee_morning_updates for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can create updates
create policy "Admins can insert coffee morning updates"
  on public.coffee_morning_updates for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can update updates
create policy "Admins can update coffee morning updates"
  on public.coffee_morning_updates for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can delete updates
create policy "Admins can delete coffee morning updates"
  on public.coffee_morning_updates for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));


-- 2. Storage: coffee-morning-images bucket
-- --------------------------------------------------------
-- Create the bucket via Supabase Dashboard > Storage > New Bucket:
--   Name: coffee-morning-images
--   Public: ON
--
-- Then add storage policies (Storage > Policies) mirroring blog-images:
--   - Public SELECT: true
--   - Admin INSERT/UPDATE/DELETE:
--       exists (select 1 from public.admin_users where user_id = auth.uid())
