-- ==============================================================================
-- 1. LÉPÉS — ADMIN JOGOSULTSÁG MEGADÁSA
-- Futtatás: Supabase Irányítópult -> SQL Editor -> New Query -> Run
--
-- ELŐTTE (egyszer, kézzel): Authentication -> Users -> "Add user" -> "Create new user"
--   - Adja meg az admin e-mail címét és egy ERŐS, ÚJ jelszót
--     (a régi jelszó nyilvános volt a kódban, azt ne használja tovább!)
--   - Pipálja be: "Auto Confirm User"
--
-- Ezután cserélje le lent az e-mail címet a létrehozott felhasználóéra, és futtassa le.
-- Az "admin" szerepkör az app_metadata-ban van: ezt a felhasználó maga NEM tudja átírni.
-- ==============================================================================

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@demotradekft.hu';

-- Ellenőrzés: ennek a lekérdezésnek 1 sort kell visszaadnia, role = admin értékkel
SELECT id, email, raw_app_meta_data ->> 'role' AS role
FROM auth.users
WHERE raw_app_meta_data ->> 'role' = 'admin';

-- Ha valaki már be volt jelentkezve, a szerepkör csak új belépés után érvényes (jelentkezzen ki és be).
