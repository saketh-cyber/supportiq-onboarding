-- ============================================================
-- SupportIQ Onboarding — Database Schema
-- Run this in the Supabase SQL editor before starting the app.
-- ============================================================

-- Users captured during the onboarding wizard.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,          -- hashed at the API layer (see /api/user)
  about_me text,
  street_address text,
  city text,
  state text,
  zip text,
  birthdate date,
  current_step int not null default 2,  -- where the user left off (2 or 3), 4 = done
  created_at timestamptz not null default now()
);

-- Single-row table holding which components appear on pages 2 and 3.
-- We keep one row (id = 1) and update it from the admin section.
create table if not exists public.page_config (
  id int primary key default 1,
  page2 text[] not null default array['about_me','birthdate'],
  page3 text[] not null default array['address'],
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed the default config row if it does not exist.
insert into public.page_config (id, page2, page3)
values (1, array['about_me','birthdate'], array['address'])
on conflict (id) do nothing;
