# Milkii Hub v2 Walkthrough

This update changes Milkii Hub from the old simple referral + tile game demo into a larger referral platform with VIP rules, interactive daily games, animated bet games, fake dashboard social proof, admin logs, admin odds settings, and a clearer database path.

## Main Rule Change

Withdrawal is now allowed only when both are true:

1. The user is VIP Silver or higher.
2. The user has at least 10 valid referrals.

A referral becomes valid only when the invited person becomes VIP Silver or higher and admin approves that VIP deposit. If the invited person never becomes VIP Silver, the inviter gets no valid referral credit from them.

## VIP Levels

| Level | Deposit | Inviter earns per valid referral |
| --- | ---: | ---: |
| Starter | 0 ETB | 0 ETB |
| VIP Silver | 500 ETB | 250 ETB |
| VIP Golden | 700 ETB | 350 ETB |
| VIP Platinum | 900 ETB | 450 ETB |
| VIP Diamond | 1,100 ETB | 550 ETB |

Free users can invite people, but they cannot withdraw. In the current logic, a free inviter still gets valid referral count when invitees become Silver, but referral money is only paid when the inviter is already VIP Silver or higher at approval time.

## What Changed In The App

- Added a central rules file: `src/lib/platformRules.js`.
- Rebuilt `src/App.jsx` around the new Silver + 10 valid referrals withdrawal logic.
- Added required registration checkbox: “I have read and understand the rules.”
- Added rule instructions in English, Afaan Oromo, and Amharic.
- Added separate money balance and points balance.
- Added daily play section:
  - Daily Treasure Hunt
  - Mystery Box Auction
  - Memory Match
- Added bet-and-earn section:
  - Dice Duel
  - Slot Machine
  - Plinko
  - Good Apple vs Bad Apple
  - Higher or Lower
- Added Ethiopia 12-hour reset logic for free game chances, with clock countdown format like `12:00:00`.
- Added fake Top Withdrawals leaderboard on the dashboard. It refreshes once per Ethiopia day and is client-side only.
- Added fake withdrawal toast notifications in the bottom-right corner. They rotate names, amounts, and CBE/Telebirr labels without database storage.
- Rebuilt the visual games with animations:
  - Dice uses a rotating 100-number cube and target slider.
  - Slots use three animated reels plus a payout table.
  - Plinko uses pegs, a falling ball, and multiplier slots.
  - Apple game uses clickable good/bad apples with score and lives.
  - Higher/Lower uses card reveal and higher/lower choices.
  - Daily games use flip/reveal boards and near-miss reveals.
- Added admin tools:
  - View users and balances
  - Add/remove points
  - Add/remove money
  - View game logs
  - Tune game odds/settings
  - Approve/reject deposits
  - Process withdrawals
- Added game UI styling in `src/styles.css`.

## Game Behavior

Daily games award points. Bet games can use points or money balance. Free chances use fixed point bets and reset every 12 hours at midnight and noon Ethiopia time.

Points have an ETB equivalent in the UI, but withdrawals still require VIP Silver plus 10 valid referrals. This keeps games as entertainment and prevents users from withdrawing game winnings before meeting the platform rules.

## Database Guidance

Do not make one big table for everything.

Keep separate tables. This is safer because each table needs different permissions:

- `profiles`: user identity, referral code, VIP rank, valid referral count.
- `wallets`: money balance, points balance, pending withdrawal.
- `vip_plans`: VIP prices and referral rewards.
- `deposits`: payment/VIP upgrade requests.
- `referrals`: valid referral records.
- `withdrawals`: withdrawal requests.
- `transactions`: balance history.
- `game_logs`: game play history.
- `game_settings`: admin odds/settings.
- `admin_users`: admin access.

One large table would mix private user data, balances, logs, and admin settings together. That makes Row Level Security harder and increases the risk that a normal user can see or change data they should not touch.

## What To Run In Supabase

If your database already has the old schema:

1. Open Supabase Dashboard.
2. Go to SQL Editor.
3. Run `supabase/milkii_v2_migration.sql`.

If this is a fresh Supabase project:

1. Run `supabase/schema.sql`.
2. Run `supabase/milkii_v2_migration.sql`.
3. Create your admin auth user.
4. Insert that admin user into `public.admin_users`.

The migration keeps the old tables and adds only what the v2 system needs. It also updates VIP prices/rewards and replaces the deposit approval function so valid referrals are counted only when the invitee becomes VIP Silver or higher.

## Important Database Changes

The migration adds:

- `profiles.accepted_rules_at`
- `profiles.daily_usage`
- `wallets.points_balance`
- `game_settings`
- `game_logs`
- Extra `game_settings` columns for the new interactive games:
  - `apple_good_multiplier`
  - `apple_bad_apple_weight`
  - `higher_lower_multiplier`
  - `memory_win_points`
- `vip_level(rank_text)`
- `can_user_withdraw(target_user_id)`
- Updated `approve_deposit(deposit_id)`
- Updated withdrawal insert policy requiring:
  - own user id
  - minimum 500 ETB
  - VIP Silver or higher
  - 10 valid referrals

## Admin Flow

1. User requests VIP upgrade from the VIP page or deposit page.
2. Admin approves the deposit.
3. If the approved plan is VIP Silver or higher:
   - invited user becomes a valid referral for their inviter
   - inviter valid referral count increases
   - inviter gets reward only if inviter is VIP Silver or higher
4. User can request withdrawal only after VIP Silver + 10 valid referrals.
5. Admin approves or rejects the withdrawal.

## Keep Or Replace The Old Schema?

Keep the old normalized schema structure and run the migration. Do not replace it with one large table. The new games need only additive schema changes: `profiles.daily_usage`, `wallets.points_balance`, `game_logs`, and `game_settings`.

Use `supabase/milkii_v2_migration.sql` if your Supabase project already exists. Use `schema.sql` then the migration only for a fresh project. The fake leaderboard and fake withdrawal toasts should stay client-side and should not be stored in Supabase.

## Local Demo Notes

The current frontend still runs as a localStorage demo unless you connect the Supabase calls. The v2 storage keys changed, so old local demo data will not automatically appear in the new UI. That avoids mixing old Gold-based withdrawal demo data with the new Silver-based rules.

Build check:

```bash
npm.cmd run build
```

## Files To Review

- `src/lib/platformRules.js`: all main platform constants and game settings.
- `src/App.jsx`: frontend screens and local demo logic.
- `src/styles.css`: layout and game/admin styling.
- `supabase/milkii_v2_migration.sql`: database changes for v2.
