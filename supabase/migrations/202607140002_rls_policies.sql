alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.pets enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.price_history enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.visits enable row level security;

create policy if not exists "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy if not exists "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy if not exists "products_read_all" on public.products
for select using (true);

create policy if not exists "products_insert_owner_staff" on public.products
for insert with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "products_update_owner_only" on public.products
for update using (
  auth.jwt() ->> 'role' = 'owner'
) with check (
  auth.jwt() ->> 'role' = 'owner'
);

create policy if not exists "services_read_all" on public.services
for select using (true);

create policy if not exists "services_manage_owner" on public.services
for all using (
  auth.jwt() ->> 'role' = 'owner'
) with check (
  auth.jwt() ->> 'role' = 'owner'
);

create policy if not exists "transactions_insert_owner_staff" on public.transactions
for insert with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "transactions_update_owner_only" on public.transactions
for update using (
  auth.jwt() ->> 'role' = 'owner'
) with check (
  auth.jwt() ->> 'role' = 'owner'
);

create policy if not exists "transaction_items_insert_owner_staff" on public.transaction_items
for insert with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "visits_manage_owner_doctor" on public.visits
for all using (
  auth.jwt() ->> 'role' in ('owner','dokter')
) with check (
  auth.jwt() ->> 'role' in ('owner','dokter')
);
