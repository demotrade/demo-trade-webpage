import { supabase } from './supabaseClient.js';

// Az admin e-mail cím nem titok; az űrlapon előre kitölthető (a jelszó viszont soha nincs a kódban).
export const ADMIN_EMAIL_HINT =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_EMAIL) || '';
const LAST_EMAIL_KEY = 'demotrade_admin_email';

// FONTOS: ez csak a felület megjelenítését vezérli. A valódi védelmet az adatbázis (RLS)
// és a szerveroldali végpontok adják; a böngészőben lévő ellenőrzés megkerülhető, de hatástalan.
export function isAdminUser(user) {
  return Boolean(user && user.app_metadata && user.app_metadata.role === 'admin');
}

export function getRememberedAdminEmail() {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || ADMIN_EMAIL_HINT;
  } catch (e) {
    return ADMIN_EMAIL_HINT;
  }
}

function friendlyAuthError(error) {
  const msg = String((error && error.message) || '').toLowerCase();
  const status = error && error.status;
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Túl sok próbálkozás. Kérjük, várjon néhány percet, majd próbálja újra.';
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'Hibás e-mail cím vagy jelszó. Kérjük, ellenőrizze a beírt adatokat (a jelszómező végén lévő szem ikonnal megnézheti a jelszót).';
  }
  if (msg.includes('email not confirmed')) {
    return 'Ez a fiók még nincs megerősítve. Kérjük, értesítse a weboldal készítőjét.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Nem sikerült kapcsolódni a szerverhez. Kérjük, ellenőrizze az internetkapcsolatot.';
  }
  return 'A belépés nem sikerült. Kérjük, próbálja újra később.';
}

export async function adminSignIn(email, password) {
  const cleanEmail = String(email || '').trim();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      return { ok: false, message: friendlyAuthError(error) };
    }
    if (!isAdminUser(data && data.user)) {
      await supabase.auth.signOut();
      return {
        ok: false,
        message: 'Ez a fiók létezik, de nincs adminisztrátori jogosultsága. Kérjük, értesítse a weboldal készítőjét.'
      };
    }
    try { localStorage.setItem(LAST_EMAIL_KEY, cleanEmail); } catch (e) { /* nem kritikus */ }
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, message: friendlyAuthError(err) };
  }
}

export async function adminSignOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Kijelentkezési figyelmeztetés:', err);
  }
}

export async function getAdminSession() {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data && data.session && data.session.user;
    return isAdminUser(user) ? user : null;
  } catch (err) {
    return null;
  }
}

export async function getAdminAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return (data && data.session && data.session.access_token) || null;
  } catch (err) {
    return null;
  }
}
