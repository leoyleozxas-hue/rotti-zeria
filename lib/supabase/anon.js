// lib/supabase/anon.js
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase SIN cookies ni sesión.
 * Solo para datos públicos (settings, catálogo público, etc.).
 * NO usar para operaciones autenticadas (admin, pedidos con RLS de admin).
 *
 * ¿Por qué existe? `unstable_cache()` de Next 16 prohíbe leer cookies()
 * dentro del cache scope. settings es público (RLS: "Anyone can read settings"),
 * así que un cliente anon sin cookies es suficiente y seguro.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}