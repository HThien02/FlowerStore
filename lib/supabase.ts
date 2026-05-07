import { createClient } from '@supabase/supabase-js'

// Lazy initialize clients only when needed
let supabaseClient: ReturnType<typeof createClient> | null = null
let supabaseServerClient: ReturnType<typeof createClient> | null = null

/** True when public Supabase env vars are present (required on client + inlined at build for NEXT_PUBLIC_*). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase URL or anon key')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

export function getSupabaseServerClient() {
  if (!supabaseServerClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase URL or service role key')
    }

    supabaseServerClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return supabaseServerClient
}

// Export for backwards compatibility — use getters so importing this module
// does not eagerly create a client (avoids supabaseUrl errors during SSR/module init).
export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
  get auth() {
    return getSupabaseClient().auth
  },
}
