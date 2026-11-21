-- =====================================================================
-- Datenbank für Blog + Mitgliederbereich
-- Ausführen im Supabase-Dashboard → SQL Editor → "New query" → Run
-- =====================================================================

-- ---------- Tabellen ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique check (username ~ '^[a-z0-9_.-]{3,30}$'),
  first_name  text not null check (char_length(first_name) between 1 and 60),
  last_name   text not null check (char_length(last_name) between 1 and 60),
  about       text check (char_length(about) <= 2000),
  birth_date  date,
  city        text check (char_length(city) <= 80),
  role        text not null default 'member' check (role in ('member', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.categories (
  slug  text primary key,
  name  text not null,
  sort  int  not null default 0
);

insert into public.categories (slug, name, sort) values
  ('autos', 'Autos', 1),
  ('investment', 'Investment', 2),
  ('fitness', 'Fitness', 3),
  ('aktivitys', 'AkTivitys', 4)
on conflict (slug) do nothing;

create table if not exists public.posts (
  id          bigint generated always as identity primary key,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  category    text not null references public.categories (slug),
  title       text not null check (char_length(title) between 3 and 150),
  content     text not null check (char_length(content) between 10 and 20000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create index if not exists posts_category_created_idx on public.posts (category, created_at desc);

-- ---------- Hilfsfunktion: ist der angemeldete Nutzer Admin? ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- Zugriffsregeln (Row Level Security) ----------
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.posts      enable row level security;

-- Profile: jeder sieht nur sein eigenes, Admin sieht alle.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Profile: eigenes Profil bearbeiten (nur freigegebene Spalten, siehe unten).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Mitglieder dürfen Rolle und Username NICHT selbst ändern.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (first_name, last_name, about, birth_date, city) on public.profiles to authenticated;

-- Kategorien: öffentlich lesbar.
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
  for select to anon, authenticated using (true);

-- Beiträge: öffentlich lesbar.
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts
  for select to anon, authenticated using (true);

-- Beiträge: Mitglieder schreiben nur unter eigenem Namen.
drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts
  for insert to authenticated
  with check (author_id = auth.uid());

-- Beiträge: Autor oder Admin darf ändern/löschen.
drop policy if exists "posts_update" on public.posts;
create policy "posts_update" on public.posts
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete" on public.posts
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.posts from anon;

-- ---------- Öffentliche Beitragsliste mit Autorennamen ----------
-- Zeigt vom Profil nur den Username – Geburtsdatum, Wohnort usw. bleiben privat.
create or replace view public.posts_public as
  select p.id, p.title, p.content, p.category, p.created_at, p.updated_at,
         p.author_id, pr.username as author
  from public.posts p
  join public.profiles pr on pr.id = p.author_id;

grant select on public.posts_public to anon, authenticated;
