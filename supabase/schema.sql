-- Milkii Hub Supabase schema
-- Run this entire file in Supabase Dashboard > SQL Editor for a fresh project.
-- It creates app tables, RLS policies, public read access for VIP plans,
-- admin-only approval functions, and the grants needed by browser clients.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.deposit_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.withdrawal_status as enum ('pending', 'paid', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique,
  full_name text not null,
  phone text not null default '',
  language text not null default 'en',
  referral_code text not null unique,
  invited_by uuid references public.profiles(id),
  rank text not null default 'Starter',
  reward_per_referral numeric(12, 2) not null default 200,
  valid_referrals integer not null default 0,
  pending_referrals integer not null default 0,
  game_points integer not null default 0,
  referral_rewarded boolean not null default false,
  onboarding_seen boolean not null default false,
  xp integer not null default 0,
  streak integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(12, 2) not null default 0,
  pending_balance numeric(12, 2) not null default 0,
  pending_withdrawal numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.vip_plans (
  id text primary key,
  name text not null unique,
  price numeric(12, 2) not null,
  reward_per_referral numeric(12, 2) not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

insert into public.vip_plans (id, name, price, reward_per_referral, sort_order, active)
values
  ('starter', 'Starter', 0, 200, 1, true),
  ('silver', 'VIP Silver', 400, 200, 2, true),
  ('gold', 'VIP Gold', 600, 200, 3, true),
  ('platinum', 'VIP Platinum', 800, 200, 4, true),
  ('diamond', 'VIP Diamond', 1050, 200, 5, true)
on conflict (id) do update
set name = excluded.name,
    price = excluded.price,
    reward_per_referral = excluded.reward_per_referral,
    sort_order = excluded.sort_order,
    active = excluded.active;

create unique index if not exists profiles_email_unique
on public.profiles (lower(email));

create unique index if not exists profiles_phone_unique
on public.profiles (phone)
where phone <> '';

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  sms_text text,
  proof_path text,
  vip_plan_id text references public.vip_plans(id),
  status public.deposit_status not null default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  reward_amount numeric(12, 2) not null default 0,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(inviter_id, invitee_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null,
  kind text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method text not null check (method in ('telebirr', 'cbe')),
  account_name text not null,
  account_identifier text not null,
  status public.withdrawal_status not null default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inviter_profile_id uuid;
  requested_referral_code text;
  new_referral_code text;
begin
  requested_referral_code := nullif(trim(coalesce(new.raw_user_meta_data->>'referral_code', '')), '');

  if requested_referral_code is not null then
    select id
    into inviter_profile_id
    from public.profiles
    where lower(referral_code) = lower(requested_referral_code)
    limit 1;
  end if;

  new_referral_code := 'MH' || substr(upper(replace(gen_random_uuid()::text, '-', '')), 1, 8);

  insert into public.profiles (
    id,
    email,
    username,
    full_name,
    phone,
    referral_code,
    invited_by,
    pending_referrals,
    xp
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Milkii Member'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'phone'), ''), ''),
    new_referral_code,
    inviter_profile_id,
    0,
    80
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  if inviter_profile_id is not null then
    update public.profiles
    set pending_referrals = pending_referrals + 1
    where id = inviter_profile_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.approve_deposit(deposit_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deposit public.deposits%rowtype;
  target_plan public.vip_plans%rowtype;
  target_profile public.profiles%rowtype;
  referral_reward numeric(12, 2);
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve deposits';
  end if;

  select * into target_deposit
  from public.deposits
  where id = deposit_id
  for update;

  if not found or target_deposit.status <> 'pending' then
    return;
  end if;

  select * into target_profile
  from public.profiles
  where id = target_deposit.user_id
  for update;

  if target_deposit.vip_plan_id is not null then
    select * into target_plan
    from public.vip_plans
    where id = target_deposit.vip_plan_id;
  end if;

  update public.deposits
  set status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = deposit_id;

  update public.wallets
  set pending_balance = greatest(0, pending_balance - target_deposit.amount),
      balance = case
        when target_deposit.vip_plan_id is null then balance + target_deposit.amount
        else balance
      end,
      updated_at = now()
  where user_id = target_deposit.user_id;

  if target_deposit.vip_plan_id is not null then
    update public.profiles
    set rank = target_plan.name,
        reward_per_referral = target_plan.reward_per_referral,
        referral_rewarded = referral_rewarded or (
          target_plan.price > 0 and invited_by is not null
        ),
        xp = xp + 180
    where id = target_deposit.user_id;

    if target_plan.price > 0 and target_profile.invited_by is not null and not target_profile.referral_rewarded then
      referral_reward := target_plan.reward_per_referral;

      insert into public.referrals (inviter_id, invitee_id, reward_amount, approved_at)
      values (target_profile.invited_by, target_profile.id, referral_reward, now())
      on conflict (inviter_id, invitee_id) do nothing;

      update public.wallets
      set balance = balance + referral_reward,
          updated_at = now()
      where user_id = target_profile.invited_by;

      update public.profiles
      set valid_referrals = valid_referrals + 1,
          pending_referrals = greatest(0, pending_referrals - 1),
          xp = xp + 120
      where id = target_profile.invited_by;

      insert into public.transactions (user_id, amount, kind, note)
      values (target_profile.invited_by, referral_reward, 'referral_reward', 'Referral VIP approval reward');
    end if;
  else
    update public.profiles
    set xp = xp + greatest(1, round(target_deposit.amount / 5)::integer)
    where id = target_deposit.user_id;
  end if;

  insert into public.transactions (user_id, amount, kind, note)
  values (target_deposit.user_id, target_deposit.amount, 'deposit_approved', 'Deposit approved by admin');
end;
$$;

create or replace function public.reject_deposit(deposit_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_deposit public.deposits%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject deposits';
  end if;

  select * into target_deposit
  from public.deposits
  where id = deposit_id
  for update;

  if not found or target_deposit.status <> 'pending' then
    return;
  end if;

  update public.deposits
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = deposit_id;

  update public.wallets
  set pending_balance = greatest(0, pending_balance - target_deposit.amount),
      updated_at = now()
  where user_id = target_deposit.user_id;
end;
$$;

create or replace function public.mark_withdrawal_paid(withdrawal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_withdrawal public.withdrawals%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only admins can pay withdrawals';
  end if;

  select * into target_withdrawal
  from public.withdrawals
  where id = withdrawal_id
  for update;

  if not found or target_withdrawal.status <> 'pending' then
    return;
  end if;

  update public.withdrawals
  set status = 'paid',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = withdrawal_id;

  update public.wallets
  set pending_withdrawal = greatest(0, pending_withdrawal - target_withdrawal.amount),
      updated_at = now()
  where user_id = target_withdrawal.user_id;

  insert into public.transactions (user_id, amount, kind, note)
  values (target_withdrawal.user_id, -target_withdrawal.amount, 'withdrawal_paid', 'Withdrawal marked paid by admin');
end;
$$;

create or replace function public.reject_withdrawal(withdrawal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_withdrawal public.withdrawals%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reject withdrawals';
  end if;

  select * into target_withdrawal
  from public.withdrawals
  where id = withdrawal_id
  for update;

  if not found or target_withdrawal.status <> 'pending' then
    return;
  end if;

  update public.withdrawals
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = withdrawal_id;

  update public.wallets
  set balance = balance + target_withdrawal.amount,
      pending_withdrawal = greatest(0, pending_withdrawal - target_withdrawal.amount),
      updated_at = now()
  where user_id = target_withdrawal.user_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.vip_plans enable row level security;
alter table public.deposits enable row level security;
alter table public.referrals enable row level security;
alter table public.transactions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "profiles read own or admin" on public.profiles;
drop policy if exists "profiles update own or admin" on public.profiles;
drop policy if exists "wallets read own or admin" on public.wallets;
drop policy if exists "vip plans are public" on public.vip_plans;
drop policy if exists "deposits read own or admin" on public.deposits;
drop policy if exists "users create own deposits" on public.deposits;
drop policy if exists "admins update deposits" on public.deposits;
drop policy if exists "referrals read related or admin" on public.referrals;
drop policy if exists "transactions read own or admin" on public.transactions;
drop policy if exists "withdrawals read own or admin" on public.withdrawals;
drop policy if exists "users create own withdrawals" on public.withdrawals;
drop policy if exists "admins update withdrawals" on public.withdrawals;
drop policy if exists "admin table read own admin row" on public.admin_users;

create policy "profiles read own or admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles update own or admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "wallets read own or admin"
on public.wallets for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "vip plans are public"
on public.vip_plans for select
to anon, authenticated
using (active = true);

create policy "deposits read own or admin"
on public.deposits for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "users create own deposits"
on public.deposits for insert
to authenticated
with check (user_id = auth.uid());

create policy "admins update deposits"
on public.deposits for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "referrals read related or admin"
on public.referrals for select
to authenticated
using (inviter_id = auth.uid() or invitee_id = auth.uid() or public.is_admin());

create policy "transactions read own or admin"
on public.transactions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "withdrawals read own or admin"
on public.withdrawals for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "users create own withdrawals"
on public.withdrawals for insert
to authenticated
with check (user_id = auth.uid());

create policy "admins update withdrawals"
on public.withdrawals for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin table read own admin row"
on public.admin_users for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.vip_plans to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.wallets to authenticated;
grant select, insert, update on public.deposits to authenticated;
grant select on public.referrals to authenticated;
grant select on public.transactions to authenticated;
grant select, insert, update on public.withdrawals to authenticated;
grant select on public.admin_users to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.approve_deposit(uuid) to authenticated;
grant execute on function public.reject_deposit(uuid) to authenticated;
grant execute on function public.mark_withdrawal_paid(uuid) to authenticated;
grant execute on function public.reject_withdrawal(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "payment proofs insert own" on storage.objects;
drop policy if exists "payment proofs read own or admin" on storage.objects;
drop policy if exists "payment proofs admin update" on storage.objects;
drop policy if exists "payment proofs admin delete" on storage.objects;

create policy "payment proofs insert own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "payment proofs read own or admin"
on storage.objects for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create policy "payment proofs admin update"
on storage.objects for update
to authenticated
using (bucket_id = 'payment-proofs' and public.is_admin())
with check (bucket_id = 'payment-proofs' and public.is_admin());

create policy "payment proofs admin delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'payment-proofs' and public.is_admin());

-- After creating your admin Auth user, run this in SQL Editor:
--
-- insert into public.admin_users (user_id, username)
-- select id, 'dreykov69'
-- from auth.users
-- where email = 'YOUR_ADMIN_EMAIL_HERE'
-- on conflict (user_id) do update set username = excluded.username;
