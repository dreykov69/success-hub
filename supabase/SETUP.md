# Milkii Hub Supabase Setup

## 1. Project env

Local `.env` should use your Supabase project URL and publishable key:

```txt
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Do not put production admin passwords in `VITE_*` variables. Anything prefixed with
`VITE_` is public in the built website.

## 2. Run the schema

Open Supabase Dashboard > SQL Editor, paste all of `supabase/schema.sql`, and run it.

This creates:

- app tables: `profiles`, `wallets`, `vip_plans`, `deposits`, `withdrawals`, `transactions`, `referrals`
- `admin_users` for admin authority
- row level security policies
- database functions for approving/rejecting deposits and withdrawals
- the private `payment-proofs` Storage bucket
- the `GRANT` statements needed by browser clients

## 3. Test public database access

Run this in PowerShell:

```powershell
$Url="https://YOUR_PROJECT_REF.supabase.co"
$Key="YOUR_SUPABASE_PUBLISHABLE_KEY"

Invoke-RestMethod `
  -Uri "$Url/rest/v1/vip_plans?select=id,name,price&active=eq.true&limit=5" `
  -Headers @{ apikey=$Key; Authorization="Bearer $Key" }
```

Expected result: rows for `Starter`, `VIP Silver`, `VIP Gold`, `VIP Platinum`,
and `VIP Diamond`.

## 4. Create the admin user

Supabase Auth signs users in by email/password. To use `dreykov69` as the app
username, create an Auth user with any admin email you control, then attach that
Auth user to the username.

1. Go to Supabase Dashboard > Authentication > Users.
2. Click **Add user**.
3. Enter your admin email.
4. Use the admin password privately in Supabase Auth only.
5. After the user is created, run this in SQL Editor, replacing the email:

```sql
insert into public.admin_users (user_id, username)
select id, 'dreykov69'
from auth.users
where email = 'YOUR_ADMIN_EMAIL_HERE'
on conflict (user_id) do update set username = excluded.username;

update public.profiles
set username = 'dreykov69',
    full_name = 'Dreykov Admin'
where id = (
  select id from auth.users where email = 'YOUR_ADMIN_EMAIL_HERE'
);
```

## 5. Avoid Auth email limit while testing

Supabase's built-in email provider has a very small limit. For local development:

1. Go to Authentication > Providers > Email.
2. Turn off **Confirm email** while testing.
3. For production, configure custom SMTP instead of the built-in email provider.

## 6. Deployment env

In Vercel/Render, set only:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_PAYMENT_PHONE
VITE_PAYMENT_NAME
```

Never deploy `service_role`, `sb_secret_*`, or admin passwords to the frontend.
