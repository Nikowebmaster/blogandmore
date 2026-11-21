-- Zeigt alle Login-Konten und ob dazu ein Mitgliedsprofil existiert.
-- Im SQL Editor ausführen. Es wird nichts verändert.
select u.email,
       u.email_confirmed_at is not null as bestaetigt,
       p.username,
       p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;
