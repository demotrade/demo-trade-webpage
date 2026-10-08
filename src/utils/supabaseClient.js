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

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://netwmohjucdoomghiuzk.supabase.co');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_BjKpsxqfXZvs1OjbP5BH0Q_QsCsvsYl');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
