-- ============================================================
-- Blog Admin Schema: admin_users, blog_posts, blog-images bucket
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Admin Users Allowlist
-- --------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Admins can check their own admin status
create policy "Users can check own admin status"
  on public.admin_users for select
  using (user_id = auth.uid());

-- Only existing admins can manage the allowlist
create policy "Admins can insert admin_users"
  on public.admin_users for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete admin_users"
  on public.admin_users for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ============================================================
-- BOOTSTRAP: Insert your first admin manually after running this script:
--   insert into public.admin_users (user_id)
--   values ('YOUR-AUTH-USER-UUID-HERE');
-- ============================================================


-- 2. Blog Posts
-- --------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null default auth.uid(),
  updated_by uuid null default auth.uid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content_markdown text not null,
  category text not null check (category in ('Community','Events','Nature','Heritage')),
  hero_image_url text null,
  published boolean not null default false,
  published_at timestamptz null,
  featured boolean not null default false
);

alter table public.blog_posts enable row level security;

-- Auto-update updated_at on every change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- Public users can only see published posts
create policy "Public can read published posts"
  on public.blog_posts for select
  using (published = true);

-- Admins can see ALL posts (draft + published)
create policy "Admins can read all posts"
  on public.blog_posts for select
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can create posts
create policy "Admins can insert posts"
  on public.blog_posts for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can update posts
create policy "Admins can update posts"
  on public.blog_posts for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Admins can delete posts
create policy "Admins can delete posts"
  on public.blog_posts for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));


-- 3. Storage: blog-images bucket
-- --------------------------------------------------------
-- Create the bucket via Supabase Dashboard > Storage > New Bucket:
--   Name: blog-images
--   Public: ON
--
-- Then run these storage policies in SQL Editor:

-- Public read
-- insert into storage.policies (name, bucket_id, operation, definition)
-- values ('Public read blog-images', 'blog-images', 'SELECT', 'true');

-- Admin insert
-- insert into storage.policies (name, bucket_id, operation, definition)
-- values ('Admin insert blog-images', 'blog-images', 'INSERT',
--   'exists (select 1 from public.admin_users where user_id = auth.uid())');

-- Admin update
-- insert into storage.policies (name, bucket_id, operation, definition)
-- values ('Admin update blog-images', 'blog-images', 'UPDATE',
--   'exists (select 1 from public.admin_users where user_id = auth.uid())');

-- Admin delete
-- insert into storage.policies (name, bucket_id, operation, definition)
-- values ('Admin delete blog-images', 'blog-images', 'DELETE',
--   'exists (select 1 from public.admin_users where user_id = auth.uid())');
