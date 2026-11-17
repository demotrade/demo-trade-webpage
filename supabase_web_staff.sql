-- ==============================================================================
-- DEMO-TRADE KFT. — MUNKATÁRSAK TÁBLA (Admin felületről szerkeszthető névsor)
-- Futtassa le a Supabase Irányítópult -> SQL Editor felületén!
-- ==============================================================================

-- Segédfüggvény (ha még nem létezne): admin jogosultság vizsgálata JWT tokenből
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Munkatársak tábla létrehozása
CREATE TABLE IF NOT EXISTS public.web_staff (
  id TEXT PRIMARY KEY,
  office TEXT NOT NULL,            -- 'nyiregyhaza' | 'kisvarda' | 'tarpa'
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_web_staff_sort ON public.web_staff(sort_order);

-- Biztonsági szabályok (RLS):
-- Bárki (látogatók és be nem lépettek) olvashatja a munkatársakat,
-- de MÓDOSÍTANI / TÖRÖLNI / ÚJAT HOZZÁADNI KIZÁRÓLAG a bejelentkezett admin tud.
ALTER TABLE public.web_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on web_staff" ON public.web_staff;
DROP POLICY IF EXISTS "Public read web_staff" ON public.web_staff;
DROP POLICY IF EXISTS "Admin insert web_staff" ON public.web_staff;
DROP POLICY IF EXISTS "Admin update web_staff" ON public.web_staff;
DROP POLICY IF EXISTS "Admin delete web_staff" ON public.web_staff;

CREATE POLICY "Public read web_staff"
  ON public.web_staff FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert web_staff"
  ON public.web_staff FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update web_staff"
  ON public.web_staff FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete web_staff"
  ON public.web_staff FOR DELETE TO authenticated
  USING (public.is_admin());

-- Kezdő névsor feltöltése (a weboldalon eddig látható adatok)
INSERT INTO public.web_staff (id, office, name, role, phone, sort_order) VALUES
  ('staff-nyh-1', 'nyiregyhaza', 'Moravszki Gábor', 'ügyvezető igazgató, növényorvos', '+36 30 346 2848', 0),
  ('staff-nyh-2', 'nyiregyhaza', 'Sápi Imre', 'irodavezető, szaktanácsadó', '+36 30 559 7376', 1),
  ('staff-nyh-3', 'nyiregyhaza', 'Benke László', 'szaktanácsadó', '+36 30 557 1656', 2),
  ('staff-nyh-4', 'nyiregyhaza', 'Mitruné Tóth Krisztina', 'pályázati szaktanácsadó', '+36 30 275 4911', 3),
  ('staff-nyh-5', 'nyiregyhaza', 'Ungvári Enikő', 'szaktanácsadó', '+36 30 786 7133', 4),
  ('staff-nyh-6', 'nyiregyhaza', 'Nagy Piroska', 'szaktanácsadó', '+36 30 440 2705', 5),
  ('staff-kv-1',  'kisvarda',    'Pokol Roland', 'növényorvos, szaktanácsadó', '+36 30 440 2725', 6),
  ('staff-kv-2',  'kisvarda',    'Kosztyi Nikolett', 'szaktanácsadó', '+36 30 340 0525', 7),
  ('staff-tp-1',  'tarpa',       'Sápi Imre', 'szaktanácsadó', '+36 30 559 7376', 8),
  ('staff-tp-2',  'tarpa',       'Benke László', 'szaktanácsadó', '+36 30 557 1656', 9)
ON CONFLICT (id) DO NOTHING;
