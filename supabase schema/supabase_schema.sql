create table public.events (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  description text null,
  date date not null,
  start_time time without time zone null,
  end_time time without time zone null,
  location text null,
  type text null,
  constraint events_pkey primary key (id)
);

-- Gallery images table for admin-managed photo gallery
create table public.gallery_images (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  label text not null,
  image_url text not null,
  display_order integer default 0,
  constraint gallery_images_pkey primary key (id)
);

-- Enable RLS for gallery_images
alter table gallery_images enable row level security;

-- Allow everyone to read gallery images
create policy "Public read access" on gallery_images for select using (true);

-- Allow authenticated users to manage gallery images
create policy "Authenticated users can insert" on gallery_images for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update" on gallery_images for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete" on gallery_images for delete using (auth.role() = 'authenticated');
