-- Beveiliging — RLS aan op ALLE tabellen (o.a. gedeelde_projecten)
-- Uitvoeren in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Veilig om direct uit te voeren: de app gebruikt alleen de service_role key
-- server-side, die RLS altijd omzeilt. Geen policies = anon key geblokkeerd.

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- Controle: elke tabel moet hier rls_aan = true tonen
select tablename, rowsecurity as rls_aan
from pg_tables where schemaname = 'public' order by tablename;
