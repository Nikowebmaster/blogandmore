-- =====================================================================
-- Admin-Konto von Niko anlegen
-- VORHER im Dashboard: Authentication → Users → "Add user" → "Create new user"
--   E-Mail:   niko@mitglieder.voehr.com
--   Passwort: (selbst wählen)
--   "Auto Confirm User" anhaken
-- DANACH dieses Skript im SQL Editor ausführen.
-- Login auf der Website: Username "niko" + dein Passwort
-- =====================================================================

insert into public.profiles (id, username, first_name, last_name, about, city, role)
select id,
       'niko',
       'Niko',
       'Vöhr',
       'Mein Name ist Niko und ich beschäftige mich mit Autos, Investments und Fitness.',
       'Wien',
       'admin'
from auth.users
where email = 'niko@mitglieder.voehr.com'
on conflict (id) do update set role = 'admin';
