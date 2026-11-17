-- ==============================================================================
-- 2. LÉPÉS — ÍRÁSI JOGOK ZÁROLÁSA (csak a bejelentkezett admin írhat / törölhet)
-- Futtatás: Supabase Irányítópult -> SQL Editor -> New Query -> Run
--
-- SORREND (fontos!):
--   1) supabase_security_1_admin_role.sql lefuttatása (admin felhasználó + szerepkör)
--   2) Az új weboldal-verzió élesítése (push / deploy) — ez tartalmazza az új belépést
--   3) EZ a fájl
-- Ha ezt az új belépés élesítése ELŐTT futtatja le, a régi admin felület mentései leállnak.
--
-- A fájl többször is lefuttatható (idempotens).
-- ==============================================================================

-- Segédfüggvény: az aktuális felhasználó admin-e (az app_metadata.role alapján)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ------------------------------------------------------------------------------
-- web_posts (cikkek, álláshirdetések, termékek)
-- ------------------------------------------------------------------------------
ALTER TABLE public.web_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on web_posts" ON public.web_posts;
DROP POLICY IF EXISTS "Public read web_posts" ON public.web_posts;
DROP POLICY IF EXISTS "Admin insert web_posts" ON public.web_posts;
DROP POLICY IF EXISTS "Admin update web_posts" ON public.web_posts;
DROP POLICY IF EXISTS "Admin delete web_posts" ON public.web_posts;

CREATE POLICY "Public read web_posts"
  ON public.web_posts FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admin insert web_posts"
  ON public.web_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update web_posts"
  ON public.web_posts FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete web_posts"
  ON public.web_posts FOR DELETE TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- web_staff (munkatársak) — csak ha a tábla már létezik
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.web_staff') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.web_staff ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Allow anon all on web_staff" ON public.web_staff';
    EXECUTE 'DROP POLICY IF EXISTS "Public read web_staff" ON public.web_staff';
    EXECUTE 'DROP POLICY IF EXISTS "Admin insert web_staff" ON public.web_staff';
    EXECUTE 'DROP POLICY IF EXISTS "Admin update web_staff" ON public.web_staff';
    EXECUTE 'DROP POLICY IF EXISTS "Admin delete web_staff" ON public.web_staff';

    EXECUTE 'CREATE POLICY "Public read web_staff" ON public.web_staff FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Admin insert web_staff" ON public.web_staff FOR INSERT TO authenticated WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "Admin update web_staff" ON public.web_staff FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "Admin delete web_staff" ON public.web_staff FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END
$$;

-- ------------------------------------------------------------------------------
-- Képtárhely (webpage-images): bárki láthatja, de csak az admin tölthet fel / módosíthat / törölhet
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow upload to webpage-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update to webpage-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload to webpage-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update webpage-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete webpage-images" ON storage.objects;

CREATE POLICY "Admin upload to webpage-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'webpage-images' AND public.is_admin());

CREATE POLICY "Admin update webpage-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'webpage-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'webpage-images' AND public.is_admin());

CREATE POLICY "Admin delete webpage-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'webpage-images' AND public.is_admin());

-- (A nyilvános olvasás — "Public view for webpage-images" — marad, hogy a képek látszódjanak az oldalon.)

-- ------------------------------------------------------------------------------
-- ELLENŐRZÉS: az alábbi lekérdezés a hatályos szabályokat listázza.
-- Sehol nem szabad "anon" szerepkörre szóló INSERT / UPDATE / DELETE / ALL szabálynak lennie.
-- ------------------------------------------------------------------------------
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('web_posts', 'web_staff'))
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename, cmd, policyname;
