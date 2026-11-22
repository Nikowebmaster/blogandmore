-- =====================================================================
-- Fahrzeugdaten: Varianten, frei erweiterbare Felder, Werte
-- Im SQL Editor ausführen (einmalig). Danach fahrzeugdaten-import.sql ausführen.
-- Lesen: alle · Ändern: nur Admin
-- =====================================================================

-- Eine Zeile pro Variante (Marke / Modell / Karosserie / Motor / Antrieb)
create table if not exists public.vehicles (
  id          bigint generated always as identity primary key,
  brand       text not null check (char_length(brand) between 1 and 60),
  model       text not null check (char_length(model) between 1 and 80),
  body        text not null check (char_length(body) between 1 and 60),
  engine      text not null check (char_length(engine) between 1 and 80),
  drivetrain  text not null check (char_length(drivetrain) between 1 and 60),
  created_at  timestamptz not null default now(),
  unique (brand, model, body, engine, drivetrain)
);

-- Frei definierbare Felder (gelten für alle Varianten)
create table if not exists public.vehicle_attributes (
  id     bigint generated always as identity primary key,
  name   text not null unique check (char_length(name) between 1 and 80),
  unit   text check (char_length(unit) <= 20),
  sort   int  not null default 0
);

-- Werte: Variante × Feld
create table if not exists public.vehicle_values (
  vehicle_id    bigint not null references public.vehicles (id) on delete cascade,
  attribute_id  bigint not null references public.vehicle_attributes (id) on delete cascade,
  value         text not null check (char_length(value) <= 200),
  primary key (vehicle_id, attribute_id)
);

-- Zusatzgewichte / Faustregeln aus der Excel-Tabelle
create table if not exists public.vehicle_extras (
  id     bigint generated always as identity primary key,
  label  text not null unique,
  value  text not null,
  unit   text,
  sort   int not null default 0
);

-- ---------- Zugriffsregeln ----------
alter table public.vehicles           enable row level security;
alter table public.vehicle_attributes enable row level security;
alter table public.vehicle_values     enable row level security;
alter table public.vehicle_extras     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['vehicles', 'vehicle_attributes', 'vehicle_values', 'vehicle_extras'] loop
    execute format('drop policy if exists "%1$s_read" on public.%1$I', t);
    execute format('create policy "%1$s_read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$I', t);
    execute format('create policy "%1$s_admin_write" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- ---------- Variante samt allen Werten in einem Schritt speichern ----------
-- p_id = null → neu anlegen, sonst bearbeiten.
-- p_values = {"<Feld-ID>": "<Wert>", ...}; leere Werte werden entfernt.
create or replace function public.save_vehicle(
  p_id bigint, p_brand text, p_model text, p_body text, p_engine text, p_drivetrain text, p_values jsonb
) returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare v_id bigint;
begin
  if not public.is_admin() then
    raise exception 'Keine Berechtigung';
  end if;

  if p_id is null then
    insert into vehicles (brand, model, body, engine, drivetrain)
    values (trim(p_brand), trim(p_model), trim(p_body), trim(p_engine), trim(p_drivetrain))
    returning id into v_id;
  else
    update vehicles
       set brand = trim(p_brand), model = trim(p_model), body = trim(p_body),
           engine = trim(p_engine), drivetrain = trim(p_drivetrain)
     where id = p_id
    returning id into v_id;
    if v_id is null then raise exception 'Datensatz nicht gefunden'; end if;
  end if;

  delete from vehicle_values where vehicle_id = v_id;
  insert into vehicle_values (vehicle_id, attribute_id, value)
  select v_id, e.key::bigint, trim(e.value)
  from jsonb_each_text(coalesce(p_values, '{}'::jsonb)) e
  where trim(coalesce(e.value, '')) <> '';

  return v_id;
end;
$$;

revoke execute on function public.save_vehicle(bigint, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.save_vehicle(bigint, text, text, text, text, text, jsonb) to authenticated;
