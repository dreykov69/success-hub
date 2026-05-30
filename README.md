# Milkii Hub

Modern Vite + React rebuild for a gamified earning, referral, VIP and deposit platform.

## Demo Login

Demo member login:

```txt
Email: member@milkiihub.com
Password: member123
```

For production, create the admin in Supabase Auth and add that user to `public.admin_users`.
Do not store production admin passwords in frontend environment variables.

## Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill your Supabase keys:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor. The full checklist is in
`supabase/SETUP.md`.

Important production rule: users should submit deposit requests only. Admin/backend code should approve deposits and update balances.

## Deploy

Vercel:

```txt
Build command: npm run build
Output directory: dist
```

Render:

```txt
Build command: npm install && npm run build
Start command: npm start
```
