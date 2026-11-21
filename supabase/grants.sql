-- =====================================================================
-- Zugriffsrechte (neue Supabase-Projekte vergeben diese nicht mehr automatisch)
-- Im SQL Editor ausführen. Kann gefahrlos mehrfach ausgeführt werden.
-- Wer was sehen/ändern darf, regeln weiterhin die Policies in schema.sql.
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;

-- Kategorien: lesen für alle
grant select on public.categories to anon, authenticated;

-- Beiträge: lesen für alle, schreiben für angemeldete Mitglieder
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select on public.posts_public to anon, authenticated;

-- Profile: lesen für Angemeldete (Policy: nur eigenes, Admin alle)
grant select on public.profiles to authenticated;
grant update (first_name, last_name, about, birth_date, city) on public.profiles to authenticated;

-- Admin-Prüfung in den Policies
grant execute on function public.is_admin() to anon, authenticated;

-- Server-Funktion "manage-members" (service_role) braucht vollen Zugriff
grant all on public.profiles, public.posts, public.categories to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
