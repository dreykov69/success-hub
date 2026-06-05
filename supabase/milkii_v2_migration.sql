-- Milkii Hub v2 migration
-- Run this after the existing supabase/schema.sql if you already created the old database.
-- For a brand-new project, run schema.sql first, then run this file.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists accepted_rules_at timestamptz,
  add column if not exists daily_usage jsonb not null default '{}'::jsonb;

alter table public.wallets
  add column if not exists points_balance numeric(14, 2) not null default 0;

update public.vip_plans
set price = values_table.price,
    reward_per_referral = values_table.reward_per_referral,
    name = values_table.name,
    sort_order = values_table.sort_order,
    active = true
from (
  values
    ('starter', 'Starter', 0::numeric, 0::numeric, 1),
    ('silver', 'VIP Silver', 500::numeric, 250::numeric, 2),
    ('gold', 'VIP Golden', 700::numeric, 350::numeric, 3),
    ('platinum', 'VIP Platinum', 900::numeric, 450::numeric, 4),
    ('diamond', 'VIP Diamond', 1100::numeric, 550::numeric, 5)
) as values_table(id, name, price, reward_per_referral, sort_order)
where public.vip_plans.id = values_table.id;

insert into public.vip_plans (id, name, price, reward_per_referral, sort_order, active)
values
  ('starter', 'Starter', 0, 0, 1, true),
  ('silver', 'VIP Silver', 500, 250, 2, true),
  ('gold', 'VIP Golden', 700, 350, 3, true),
  ('platinum', 'VIP Platinum', 900, 450, 4, true),
  ('diamond', 'VIP Diamond', 1100, 550, 5, true)
on conflict (id) do update
set name = excluded.name,
    price = excluded.price,
    reward_per_referral = excluded.reward_per_referral,
    sort_order = excluded.sort_order,
    active = excluded.active;

create table if not exists public.game_settings (
  id text primary key default 'default',
  crash_max_multiplier numeric(8, 2) not null default 10,
  slot_cherry_weight numeric(8, 2) not null default 30,
  slot_diamond_weight numeric(8, 2) not null default 1,
  plinko_ten_x_weight numeric(8, 2) not null default 8,
  mines_bombs integer not null default 5,
  dice_house_edge_percent numeric(8, 2) not null default 0,
  apple_good_multiplier numeric(8, 2) not null default 0.5,
  apple_bad_apple_weight numeric(8, 2) not null default 30,
  higher_lower_multiplier numeric(8, 2) not null default 2,
  memory_win_points numeric(8, 2) not null default 30,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint game_settings_singleton check (id = 'default')
);

insert into public.game_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.game_settings
  add column if not exists apple_good_multiplier numeric(8, 2) not null default 0.5,
  add column if not exists apple_bad_apple_weight numeric(8, 2) not null default 30,
  add column if not exists higher_lower_multiplier numeric(8, 2) not null default 2,
  add column if not exists memory_win_points numeric(8, 2) not null default 30;

create table if not exists public.game_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null,
  game_name text not null,
  mode text not null check (mode in ('free', 'paid')),
  wallet text not null check (wallet in ('money', 'points')),
  bet_amount numeric(14, 2) not null default 0,
  win_amount numeric(14, 2) not null default 0,
  outcome text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists game_logs_user_created_idx
on public.game_logs (user_id, created_at desc);

create index if not exists game_logs_game_created_idx
on public.game_logs (game_id, created_at desc);

create or replace function public.vip_level(rank_text text)
returns integer
language sql
immutable
as $$
  select case rank_text
    when 'VIP Silver' then 1
    when 'VIP Golden' then 2
    when 'VIP Gold' then 2
    when 'VIP Platinum' then 3
    when 'VIP Diamond' then 4
    else 0
  end;
$$;

create or replace function public.can_user_withdraw(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_user_id
      and public.vip_level(rank) >= 1
      and valid_referrals >= 10
  );
$$;

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
  inviter_profile public.profiles%rowtype;
  referral_reward numeric(12, 2) := 0;
  is_valid_referral boolean := false;
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

  is_valid_referral := target_deposit.vip_plan_id is not null
    and public.vip_level(coalesce(target_plan.name, 'Starter')) >= 1;

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
          is_valid_referral and invited_by is not null
        ),
        xp = xp + 180
    where id = target_deposit.user_id;

    if is_valid_referral and target_profile.invited_by is not null and not target_profile.referral_rewarded then
      select * into inviter_profile
      from public.profiles
      where id = target_profile.invited_by
      for update;

      if public.vip_level(inviter_profile.rank) >= 1 then
        referral_reward := inviter_profile.reward_per_referral;
      end if;

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
      values (
        target_profile.invited_by,
        referral_reward,
        'referral_reward',
        'Valid referral: invitee became VIP Silver or higher'
      );
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

alter table public.game_settings enable row level security;
alter table public.game_logs enable row level security;

drop policy if exists "game settings read all" on public.game_settings;
drop policy if exists "game settings admin update" on public.game_settings;
drop policy if exists "game logs read own or admin" on public.game_logs;
drop policy if exists "users insert own game logs" on public.game_logs;
drop policy if exists "users create own withdrawals" on public.withdrawals;

create policy "game settings read all"
on public.game_settings for select
to anon, authenticated
using (true);

create policy "game settings admin update"
on public.game_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "game logs read own or admin"
on public.game_logs for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "users insert own game logs"
on public.game_logs for insert
to authenticated
with check (user_id = auth.uid());

create policy "users create own withdrawals"
on public.withdrawals for insert
to authenticated
with check (
  user_id = auth.uid()
  and amount >= 500
  and public.can_user_withdraw(auth.uid())
);

grant select on public.game_settings to anon, authenticated;
grant select, insert on public.game_logs to authenticated;
grant update on public.game_settings to authenticated;
grant execute on function public.vip_level(text) to authenticated;
grant execute on function public.can_user_withdraw(uuid) to authenticated;
