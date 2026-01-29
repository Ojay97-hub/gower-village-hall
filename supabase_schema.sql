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
