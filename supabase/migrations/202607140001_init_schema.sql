create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner','dokter','staff','customer')),
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  address text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  species text,
  breed text,
  sex text,
  birth_date date,
  weight_kg numeric,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.product_categories(id) on delete set null,
  sku text unique,
  price numeric not null,
  cost_price numeric,
  stock_qty integer not null default 0,
  unit text not null default 'pcs',
  min_stock_alert integer not null default 5,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  duration_minutes integer,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('product','service')),
  item_id uuid not null,
  old_price numeric,
  new_price numeric,
  changed_by uuid not null references public.profiles(id),
  changed_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  cashier_id uuid not null references public.profiles(id),
  subtotal numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  payment_method text not null check (payment_method in ('cash','transfer','other')),
  payment_status text not null default 'paid' check (payment_status in ('paid','unpaid','partial')),
  status text not null default 'completed' check (status in ('completed','void')),
  voided_by uuid references public.profiles(id),
  voided_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  item_type text not null check (item_type in ('product','service')),
  item_id uuid not null,
  item_name_snapshot text not null,
  price_at_transaction numeric not null,
  qty integer not null default 1,
  line_total numeric not null,
  pet_id uuid references public.pets(id) on delete set null
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  handled_by uuid references public.profiles(id),
  visit_type text,
  diagnosis text,
  treatment_notes text,
  weight_kg numeric,
  next_visit_recommendation date,
  status text not null default 'completed' check (status in ('ongoing','completed')),
  transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_name on public.products (name);
create index if not exists idx_services_name on public.services (name);
create index if not exists idx_transactions_created_at on public.transactions (created_at desc);
create index if not exists idx_visits_pet_created_at on public.visits (pet_id, created_at desc);
