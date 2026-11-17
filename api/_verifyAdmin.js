/**
 * Admin hitelesítés a szerveroldali végpontokhoz (Vercel Serverless + helyi vite dev).
 *
 * A böngésző a Supabase bejelentkezésből kapott hozzáférési tokent (JWT) küldi
 * `Authorization: Bearer <token>` fejlécben. Itt a Supabase Auth szerverrel
 * ellenőrizzük, hogy a token érvényes-e, és a felhasználó `app_metadata.role`
 * értéke 'admin'-e. Az `app_metadata` csak a Supabase felületén / SQL-lel állítható,
 * a felhasználó maga nem tudja átírni.
 *
 * (A fájlnév `_`-lel kezdődik, így a Vercel nem tesz belőle önálló végpontot.)
 */
export async function verifyAdmin(req) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://netwmohjucdoomghiuzk.supabase.co';
  // Nyilvános (publishable) kulcs – a böngészőben is ott van, nem titok.
  const SUPABASE_ANON_KEY =
    process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BjKpsxqfXZvs1OjbP5BH0Q_QsCsvsYl';

  const header = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { ok: false, status: 401, message: 'Ehhez a művelethez be kell jelentkezni az admin felületre.' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${match[1]}`
      }
    });

    if (!response.ok) {
      return { ok: false, status: 401, message: 'A bejelentkezés lejárt vagy érvénytelen. Kérjük, jelentkezzen be újra.' };
    }

    const user = await response.json();
    if (!user || !user.app_metadata || user.app_metadata.role !== 'admin') {
      return { ok: false, status: 403, message: 'Ehhez a művelethez nincs adminisztrátori jogosultsága.' };
    }

    return { ok: true, user };
  } catch (err) {
    console.error('Admin ellenőrzési hiba:', err);
    return { ok: false, status: 503, message: 'A jogosultság ellenőrzése most nem sikerült. Kérjük, próbálja újra.' };
  }
}
