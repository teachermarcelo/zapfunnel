import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  // If already initialized
  if (supabaseInstance) return supabaseInstance;

  // Check stored config or env vars
  const storedCfg = StorageService.getSupabaseConfig();
  const url = storedCfg.url?.trim() || (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || 'https://rvgcniaowzmsudzliozf.supabase.co';
  const anonKey = storedCfg.anonKey?.trim() || (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();

  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    } catch (err) {
      console.warn('Erro ao inicializar Supabase Client:', err);
      return null;
    }
  }

  return null;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
