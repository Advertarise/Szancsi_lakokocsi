import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { env } from "@/lib/server/env"

let client: SupabaseClient | null = null

/**
 * Szerveroldali Supabase kliens a service role (secret) kulccsal. A böngésző
 * sosem kapja meg; a `bookings` táblát a sor szintű biztonság (RLS) minden más
 * elől elzárja.
 */
export function supabase(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseServiceKey) throw new Error("A Supabase nincs beállítva.")
  client ??= createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
