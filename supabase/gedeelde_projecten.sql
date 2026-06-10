-- Voer dit eenmalig uit in het Supabase SQL-editor
-- Dashboard → SQL editor → New query → plak dit → Run

create table if not exists gedeelde_projecten (
  id              uuid primary key default gen_random_uuid(),
  projectnummer   text,
  projectnaam     text,
  opdrachtgever   text,
  datum           text,
  werkzaamheden   text,
  opgeslagen_door text not null,      -- naam van de monteur
  opgeslagen_op   timestamptz default now(),
  data            jsonb not null      -- volledige werkbon-data
);

-- Iedereen mag lezen en schrijven (app gebruikt service-role key server-side)
-- Geen RLS nodig omdat alle calls via de server-side API route lopen.
