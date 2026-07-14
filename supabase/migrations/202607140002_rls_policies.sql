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

create policy if not exists "profiles_select_owner" on public.profiles
for select using (auth.jwt() ->> 'role' = 'owner');

create policy if not exists "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy if not exists "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy if not exists "profiles_update_owner" on public.profiles
for update using (auth.jwt() ->> 'role' = 'owner') with check (auth.jwt() ->> 'role' = 'owner');

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

create policy if not exists "customers_select_owner_staff" on public.customers
for select using (
  auth.jwt() ->> 'role' in ('owner','staff','dokter')
);

create policy if not exists "customers_select_customer_own" on public.customers
for select using (
  auth.jwt() ->> 'role' = 'customer'
  and profile_id = auth.uid()
);

create policy if not exists "customers_insert_owner_staff" on public.customers
for insert with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "customers_update_owner_staff" on public.customers
for update using (
  auth.jwt() ->> 'role' in ('owner','staff')
) with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "pets_select_owner_staff_dokter" on public.pets
for select using (
  auth.jwt() ->> 'role' in ('owner','staff','dokter')
);

create policy if not exists "pets_select_customer_own" on public.pets
for select using (
  auth.jwt() ->> 'role' = 'customer'
  and customer_id in (
    select id from public.customers where profile_id = auth.uid()
  )
);

create policy if not exists "pets_insert_owner_staff" on public.pets
for insert with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "pets_update_owner_staff" on public.pets
for update using (
  auth.jwt() ->> 'role' in ('owner','staff')
) with check (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "product_categories_read_all" on public.product_categories
for select using (true);

create policy if not exists "product_categories_manage_owner" on public.product_categories
for all using (
  auth.jwt() ->> 'role' = 'owner'
) with check (
  auth.jwt() ->> 'role' = 'owner'
);

create policy if not exists "price_history_read_owner" on public.price_history
for select using (
  auth.jwt() ->> 'role' = 'owner'
);

create policy if not exists "price_history_insert_owner" on public.price_history
for insert with check (
  auth.jwt() ->> 'role' = 'owner'
);

create policy if not exists "transactions_select_owner_staff" on public.transactions
for select using (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "transactions_select_customer_own" on public.transactions
for select using (
  auth.jwt() ->> 'role' = 'customer'
  and customer_id in (
    select id from public.customers where profile_id = auth.uid()
  )
);

create policy if not exists "transaction_items_select_owner_staff" on public.transaction_items
for select using (
  auth.jwt() ->> 'role' in ('owner','staff')
);

create policy if not exists "transaction_items_select_customer_own" on public.transaction_items
for select using (
  auth.jwt() ->> 'role' = 'customer'
  and transaction_id in (
    select id from public.transactions where customer_id in (
      select id from public.customers where profile_id = auth.uid()
    )
  )
);

create policy if not exists "visits_select_owner_staff_dokter" on public.visits
for select using (
  auth.jwt() ->> 'role' in ('owner','staff','dokter')
);

create policy if not exists "visits_select_customer_own" on public.visits
for select using (
  auth.jwt() ->> 'role' = 'customer'
  and pet_id in (
    select id from public.pets where customer_id in (
      select id from public.customers where profile_id = auth.uid()
    )
  )
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
