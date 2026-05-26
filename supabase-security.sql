-- ============================================================
-- VEILIGHEIDSUPDATE — VanWinden Systeem App
-- Uitvoeren in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Wachtwoord-kolom vergroten voor bcrypt hashes (60 tekens)
ALTER TABLE gebruikers ALTER COLUMN wachtwoord TYPE TEXT;

-- 2. RLS inschakelen op alle tabellen
--    (service_role key bypasses RLS automatisch — code hoeft niet te veranderen)
ALTER TABLE gebruikers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_log   ENABLE ROW LEVEL SECURITY;

-- 3. Geen policies voor 'anon' rol = publieke toegang geblokkeerd
--    De app gebruikt de service_role key server-side, die RLS altijd omzeilt.
--    Dus: geen extra policies nodig. Toch voor de volledigheid:

-- Verwijder eventuele bestaande permissieve policies
DROP POLICY IF EXISTS "Iedereen kan lezen" ON gebruikers;
DROP POLICY IF EXISTS "Iedereen kan schrijven" ON login_log;

-- ============================================================
-- KLAAR — controleer in Supabase Dashboard:
-- Authentication → Policies → beide tabellen tonen "RLS enabled"
-- ============================================================
