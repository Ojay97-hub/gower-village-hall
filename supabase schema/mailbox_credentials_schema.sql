-- Mailbox launcher details: stores only the shared inbox address and a
-- login URL so master admins can jump to webmail from the dashboard. No
-- password is stored here — admins use their own password manager.
-- RLS keeps the row master-admin-only.

create table if not exists public.mailbox_credentials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  login_url text not null default 'https://mail.hostinger.com',
  notes text
);

-- If an earlier version of this schema added a password column, drop it.
alter table public.mailbox_credentials drop column if exists password;

alter table public.mailbox_credentials enable row level security;

drop policy if exists "Admins can read mailbox credentials" on public.mailbox_credentials;
drop policy if exists "Master admins can read mailbox credentials" on public.mailbox_credentials;
create policy "Master admins can read mailbox credentials"
  on public.mailbox_credentials
  for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
        and admin_users.is_master_admin = true
    )
  );

drop policy if exists "Master admins can insert mailbox credentials" on public.mailbox_credentials;
create policy "Master admins can insert mailbox credentials"
  on public.mailbox_credentials
  for insert
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
        and admin_users.is_master_admin = true
    )
  );

drop policy if exists "Master admins can update mailbox credentials" on public.mailbox_credentials;
create policy "Master admins can update mailbox credentials"
  on public.mailbox_credentials
  for update
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
        and admin_users.is_master_admin = true
    )
  );

drop policy if exists "Master admins can delete mailbox credentials" on public.mailbox_credentials;
create policy "Master admins can delete mailbox credentials"
  on public.mailbox_credentials
  for delete
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = auth.uid()
        and admin_users.is_master_admin = true
    )
  );

-- Keep updated_at fresh
create or replace function public.set_mailbox_credentials_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_mailbox_credentials_updated_at on public.mailbox_credentials;
create trigger trg_mailbox_credentials_updated_at
  before update on public.mailbox_credentials
  for each row execute function public.set_mailbox_credentials_updated_at();
