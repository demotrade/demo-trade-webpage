import { createClient } from '@supabase/supabase-js';

const getEnv = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

// Mindkét érték NYILVÁNOS (a böngésző számára készült). Titkos kulcs (service_role) soha nem kerülhet ide.
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://netwmohjucdoomghiuzk.supabase.co');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_BjKpsxqfXZvs1OjbP5BH0Q_QsCsvsYl');

// Az admin bejelentkezés csak az aktuális böngészőlapon él (a lap bezárásakor kilép),
// így közös számítógépen sem marad bejelentkezve senki.
const sessionStore = typeof window !== 'undefined' ? window.sessionStorage : undefined;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: sessionStore,
    storageKey: 'demotrade-admin-auth'
  }
});
