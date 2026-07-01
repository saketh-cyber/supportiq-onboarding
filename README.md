# SupportIQ — Onboarding Exercise

A full-stack onboarding app built for the RVS Engineering Leader / Co-Founder exercise.

**Stack:** Next.js 14 (App Router, TypeScript) · Supabase (Postgres) · deployable on Vercel.

- **`/`** — 3-step onboarding wizard (account → configurable details → configurable details → done)
- **`/admin`** — configure which data components appear on steps 2 and 3
- **`/data`** — public HTML table of all user data straight from the database

---

## What it does

**Onboarding wizard (`/`)**
- Step 1 collects email + password and persists a user to the database.
- Steps 2 and 3 render whichever components the admin assigned to each page.
- The three available components are **About Me**, **Address** (street / city / state / zip), and **Birthdate**.
- A progress tracker shows the user where they are in the flow.
- **Resume where you left off:** once a user submits an email + password, their id is stored in a cookie and their step is saved server-side. If they leave and come back (or re-enter the same email + password), they resume at the step they left.

**Admin (`/admin`)**
- Assign each component to step 2 and/or step 3.
- Each page is enforced to always have at least one component.
- No auth (per the exercise FAQ).

**Data (`/data`)**
- Plain HTML table of the users table, no auth.
- Reads the DB on every load, so a refresh always shows the latest data. There's also a Refresh button.

---

## Run locally

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a free project.

### 2. Create the tables
In the Supabase dashboard, open **SQL Editor** and run the contents of [`schema.sql`](./schema.sql). This creates the `users` and `page_config` tables and seeds the default layout.

### 3. Set environment variables
Copy `.env.example` to `.env.local` and fill in your values from **Supabase → Project Settings → API**:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
```

> The service role key is only ever used in server-side API routes (`/app/api/*`). It is never exposed to the browser.

### 4. Install and run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the two environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) in the Vercel project settings.
4. Deploy. Vercel auto-detects Next.js — no extra config needed.

---

## Architecture notes

- **Why a single-row `page_config` table:** the admin layout is global app config, so it lives in one row (`id = 1`) that the admin section updates and the wizard reads. Simple, and avoids over-modeling for the exercise.
- **Component-driven rendering:** steps 2 and 3 don't hardcode any fields. They read the config and map over the assigned component keys, so the same rendering code serves any admin arrangement.
- **Resume logic:** `current_step` is stored on the user row and written on every step transition. The client keeps the user id in a cookie to reconnect the session. Per the spec, resume only applies after email + password submission.
- **Passwords:** hashed with bcrypt before storage so no plaintext passwords sit in the DB. bcrypt gives each password its own salt and uses a tunable work factor, which is the pragmatic production-grade choice here while keeping deployment simple.
- **`force-dynamic` on API routes:** guarantees `/data` and the config always reflect live database state rather than a cached snapshot.

---

## File map

```
app/
  page.tsx            # onboarding wizard (/)
  admin/page.tsx      # component layout admin (/admin)
  data/page.tsx       # user data table (/data)
  api/
    user/route.ts     # create/resume user, save profile
    users/route.ts    # list users (for /data)
    config/route.ts   # get/set page layout
components/
  Rail.tsx            # step tracker + branding
  ComponentBlock.tsx  # the 3 renderable data components
lib/
  supabase.ts         # server Supabase client
  types.ts            # shared types, component keys, defaults
schema.sql            # database schema + seed
```
