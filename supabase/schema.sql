-- Magnifico database schema for Supabase.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- No CLI needed.

-- ── Products ─────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  images text[] not null default '{}',
  variants jsonb not null default '[]', -- [{ id, title, price, sku, available }]
  supplier_price numeric not null default 0,
  my_price numeric not null default 0,
  source_url text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Orders ───────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null unique,
  customer_email text not null default '',
  customer_name text not null default '',
  shipping_address jsonb,
  items jsonb not null default '[]', -- [{ productId, title, variantTitle, quantity, price, sourceUrl }]
  total numeric not null default 0,
  status text not null default 'paid' check (status in ('paid', 'fulfilled')),
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Replace this with your actual admin email before running.
-- (It's checked against the signed-in user's JWT email claim.)
create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER';
$$;

alter table products enable row level security;
alter table orders enable row level security;

-- Anyone can read published products; the admin can read everything.
create policy "public can read published products"
  on products for select
  using (status = 'published' or is_admin());

-- Only the admin can create, edit, or delete products.
create policy "admin can insert products"
  on products for insert
  with check (is_admin());

create policy "admin can update products"
  on products for update
  using (is_admin())
  with check (is_admin());

create policy "admin can delete products"
  on products for delete
  using (is_admin());

-- Orders: only the admin can read or update (e.g. marking "fulfilled").
-- Orders are only ever INSERTed by the server via the service role key
-- (which bypasses RLS entirely), so there's no insert policy for regular users.
create policy "admin can read orders"
  on orders for select
  using (is_admin());

create policy "admin can update orders"
  on orders for update
  using (is_admin())
  with check (is_admin());

-- Keep updated_at current on products.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();
