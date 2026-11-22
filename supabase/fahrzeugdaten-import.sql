-- =====================================================================
-- Import der Daten aus BMW_Gewichte_Daten.xlsx (kann mehrfach ausgeführt werden)
-- Vorher: fahrzeugdaten-schema.sql
-- =====================================================================

insert into public.vehicle_attributes (name, unit, sort) values
  ('Leergewicht Automatik (Hersteller)', 'kg', 10),
  ('Leergewicht Automatik (real)', 'kg', 20),
  ('Leergewicht Schaltgetriebe (Hersteller)', 'kg', 30),
  ('Leergewicht Schaltgetriebe (real)', 'kg', 40),
  ('0-100 km/h Schaltgetriebe', 's', 50),
  ('0-100 km/h Automatik', 's', 60),
  ('Beschleunigung 100-200 Serie', 's', 70),
  ('Beschleunigung 100-200 Stage 1', 's', 80),
  ('Beschleunigung 100-200 Stage 2', 's', 90),
  ('Beschleunigung 100-200 Stage 3', 's', 100),
  ('Spurweite vorne', 'mm', 110),
  ('Spurweite hinten', 'mm', 120),
  ('Länge', 'mm', 130)
on conflict (name) do nothing;

-- BMW 1er (F20/F21) · 3-Türer · M135i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '3-Türer', 'M135i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1440'), ('Leergewicht Automatik (real)', '1505'), ('Leergewicht Schaltgetriebe (Hersteller)', '1430'), ('Leergewicht Schaltgetriebe (real)', '1495'), ('0-100 km/h Schaltgetriebe', '5,1'), ('0-100 km/h Automatik', '4,9'), ('Spurweite vorne', '1512'), ('Spurweite hinten', '1532'), ('Länge', '4340')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 5-Türer · M135i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '5-Türer', 'M135i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1445'), ('Leergewicht Automatik (real)', '1510'), ('0-100 km/h Schaltgetriebe', '5,1'), ('0-100 km/h Automatik', '4,9'), ('Spurweite vorne', '1512'), ('Spurweite hinten', '1532'), ('Länge', '4340')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 3-Türer · M135i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '3-Türer', 'M135i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1515'), ('Leergewicht Automatik (real)', '1580'), ('0-100 km/h Automatik', '4,7'), ('Spurweite vorne', '1512'), ('Spurweite hinten', '1532'), ('Länge', '4340')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 5-Türer · M135i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '5-Türer', 'M135i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1520'), ('Leergewicht Automatik (real)', '1585'), ('0-100 km/h Automatik', '4,7'), ('Spurweite vorne', '1512'), ('Spurweite hinten', '1532'), ('Länge', '4340')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 3-Türer · M140i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '3-Türer', 'M140i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1470'), ('Leergewicht Automatik (real)', '1535'), ('Leergewicht Schaltgetriebe (Hersteller)', '1445'), ('Leergewicht Schaltgetriebe (real)', '1510'), ('0-100 km/h Schaltgetriebe', '4,8'), ('0-100 km/h Automatik', '4,6'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4324')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 5-Türer · M140i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '5-Türer', 'M140i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1475'), ('Leergewicht Automatik (real)', '1540'), ('0-100 km/h Schaltgetriebe', '4,8'), ('0-100 km/h Automatik', '4,6'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4324')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 3-Türer · M140i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '3-Türer', 'M140i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1540'), ('Leergewicht Automatik (real)', '1605'), ('0-100 km/h Automatik', '4,4'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4324')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 1er (F20/F21) · 5-Türer · M140i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '1er (F20/F21)', '5-Türer', 'M140i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1540'), ('Leergewicht Automatik (real)', '1605'), ('0-100 km/h Automatik', '4,4'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4324')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Coupé · M235i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Coupé', 'M235i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1470'), ('Leergewicht Automatik (real)', '1535'), ('Leergewicht Schaltgetriebe (Hersteller)', '1455'), ('Leergewicht Schaltgetriebe (real)', '1520'), ('0-100 km/h Schaltgetriebe', '5,0'), ('0-100 km/h Automatik', '4,8'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Cabrio · M235i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Cabrio', 'M235i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1620'), ('Leergewicht Automatik (real)', '1685'), ('Leergewicht Schaltgetriebe (Hersteller)', '1600'), ('Leergewicht Schaltgetriebe (real)', '1665'), ('0-100 km/h Schaltgetriebe', '5,2'), ('0-100 km/h Automatik', '5,0'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Coupé · M235i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Coupé', 'M235i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1525'), ('Leergewicht Automatik (real)', '1590'), ('0-100 km/h Automatik', '4,6'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Cabrio · M235i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Cabrio', 'M235i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1670'), ('Leergewicht Automatik (real)', '1735'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Coupé · M240i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Coupé', 'M240i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1485'), ('Leergewicht Automatik (real)', '1550'), ('Leergewicht Schaltgetriebe (Hersteller)', '1470'), ('Leergewicht Schaltgetriebe (real)', '1535'), ('0-100 km/h Schaltgetriebe', '4,8'), ('0-100 km/h Automatik', '4,6'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Cabrio · M240i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Cabrio', 'M240i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1630'), ('Leergewicht Automatik (real)', '1695'), ('Leergewicht Schaltgetriebe (Hersteller)', '1615'), ('Leergewicht Schaltgetriebe (real)', '1680'), ('0-100 km/h Schaltgetriebe', '4,9'), ('0-100 km/h Automatik', '4,7'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Coupé · M240i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Coupé', 'M240i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1540'), ('Leergewicht Automatik (real)', '1605'), ('0-100 km/h Automatik', '4,4'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 2er (F22/F23) · Cabrio · M240i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '2er (F22/F23)', 'Cabrio', 'M240i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1680'), ('Leergewicht Automatik (real)', '1745'), ('0-100 km/h Automatik', '4,6'), ('Spurweite vorne', '1516'), ('Spurweite hinten', '1534'), ('Länge', '4454')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 3er (F30) · Limousine · 335i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '3er (F30)', 'Limousine', '335i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1595'), ('Leergewicht Automatik (real)', '1670'), ('Leergewicht Schaltgetriebe (Hersteller)', '1585'), ('Leergewicht Schaltgetriebe (real)', '1660'), ('0-100 km/h Schaltgetriebe', '5,5'), ('0-100 km/h Automatik', '5,2'), ('Spurweite vorne', '1543'), ('Spurweite hinten', '1583'), ('Länge', '4633')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 3er (F30) · Limousine · 340i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '3er (F30)', 'Limousine', '340i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1615'), ('Leergewicht Automatik (real)', '1690'), ('Leergewicht Schaltgetriebe (Hersteller)', '1605'), ('Leergewicht Schaltgetriebe (real)', '1680'), ('0-100 km/h Schaltgetriebe', '5,2'), ('0-100 km/h Automatik', '5,1'), ('Spurweite vorne', '1543'), ('Spurweite hinten', '1583'), ('Länge', '4633')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Coupé · 435i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Coupé', '435i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1525'), ('Leergewicht Automatik (real)', '1600'), ('Leergewicht Schaltgetriebe (Hersteller)', '1510'), ('Leergewicht Schaltgetriebe (real)', '1585'), ('0-100 km/h Schaltgetriebe', '5,4'), ('0-100 km/h Automatik', '5,1'), ('Spurweite vorne', '1545'), ('Spurweite hinten', '1594'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Cabrio · 435i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Cabrio', '435i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1750'), ('Leergewicht Automatik (real)', '1825'), ('Leergewicht Schaltgetriebe (Hersteller)', '1740'), ('Leergewicht Schaltgetriebe (real)', '1815'), ('0-100 km/h Schaltgetriebe', '5,6'), ('0-100 km/h Automatik', '5,5'), ('Spurweite vorne', '1545'), ('Spurweite hinten', '1594'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Coupé · 435i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Coupé', '435i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1590'), ('Leergewicht Automatik (real)', '1665'), ('0-100 km/h Automatik', '4,9'), ('Spurweite vorne', '1544'), ('Spurweite hinten', '1590'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Coupé · 440i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Coupé', '440i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1555'), ('Leergewicht Automatik (real)', '1630'), ('Leergewicht Schaltgetriebe (Hersteller)', '1540'), ('Leergewicht Schaltgetriebe (real)', '1615'), ('0-100 km/h Schaltgetriebe', '5,2'), ('0-100 km/h Automatik', '5,0'), ('Spurweite vorne', '1544'), ('Spurweite hinten', '1590'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Coupé · 440i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Coupé', '440i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1625'), ('Leergewicht Automatik (real)', '1700'), ('Leergewicht Schaltgetriebe (Hersteller)', '1610'), ('0-100 km/h Schaltgetriebe', '5,0'), ('0-100 km/h Automatik', '4,9'), ('Spurweite vorne', '1544'), ('Spurweite hinten', '1590'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Cabrio · 440i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Cabrio', '440i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1770'), ('Leergewicht Automatik (real)', '1845'), ('Leergewicht Schaltgetriebe (Hersteller)', '1755'), ('0-100 km/h Automatik', '5,4'), ('Spurweite vorne', '1545'), ('Spurweite hinten', '1594'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Cabrio · 440i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Cabrio', '440i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1850'), ('Leergewicht Automatik (real)', '1925'), ('0-100 km/h Automatik', '5,4'), ('Spurweite vorne', '1544'), ('Spurweite hinten', '1590'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Gran Coupé · 435i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Gran Coupé', '435i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1590'), ('Leergewicht Automatik (real)', '1665'), ('Leergewicht Schaltgetriebe (Hersteller)', '1575'), ('Leergewicht Schaltgetriebe (real)', '1650'), ('0-100 km/h Automatik', '5,2'), ('Spurweite vorne', '1544'), ('Spurweite hinten', '1590'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Gran Coupé · 435i · xDrive (Allrad)
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Gran Coupé', '435i', 'xDrive (Allrad)')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1650'), ('Leergewicht Automatik (real)', '1725'), ('Leergewicht Schaltgetriebe (Hersteller)', '1640'), ('Leergewicht Schaltgetriebe (real)', '1715'), ('0-100 km/h Schaltgetriebe', '5,3'), ('0-100 km/h Automatik', '5,0'), ('Spurweite vorne', '1544'), ('Spurweite hinten', '1590'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 4er (F32/F33/F36) · Gran Coupé · 440i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '4er (F32/F33/F36)', 'Gran Coupé', '440i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1615'), ('0-100 km/h Automatik', '5,1'), ('Spurweite vorne', '1545'), ('Spurweite hinten', '1594'), ('Länge', '4638')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- BMW 6er (E63) · Coupé · 650i · Heckantrieb
with v as (
  insert into public.vehicles (brand, model, body, engine, drivetrain)
  values ('BMW', '6er (E63)', 'Coupé', '650i', 'Heckantrieb')
  on conflict (brand, model, body, engine, drivetrain) do update set brand = excluded.brand
  returning id)
insert into public.vehicle_values (vehicle_id, attribute_id, value)
select v.id, a.id, x.val from v
cross join (values ('Leergewicht Automatik (Hersteller)', '1650'), ('Leergewicht Automatik (real)', '1725'), ('0-100 km/h Automatik', '5,2'), ('Spurweite vorne', '1558'), ('Spurweite hinten', '1596'), ('Länge', '4820')) as x(name, val)
join public.vehicle_attributes a on a.name = x.name
on conflict (vehicle_id, attribute_id) do update set value = excluded.value;

-- Zusatzgewichte / Faustregeln
insert into public.vehicle_extras (label, value, unit, sort) values
  ('Automatik', '15', 'kg', 10),
  ('xDrive', '55-70', 'kg', 20),
  ('Cabrio Stoff', '145-150', 'kg', 30),
  ('Cabrio Metall', '215-220', 'kg', 40),
  ('Limo statt Coupé', '70', 'kg', 50),
  ('Ausstattung 1er/2er', '65', 'kg', 60),
  ('Ausstattung 3er/4er', '75', 'kg', 70)
on conflict (label) do update set value = excluded.value, unit = excluded.unit, sort = excluded.sort;
