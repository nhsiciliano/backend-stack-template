import { createClient } from '@supabase/supabase-js'
import type { AppConfig } from '../config/env.js'

let supabaseAdminSingleton: ReturnType<typeof createClient> | undefined

export function getSupabaseAdminClient(config: AppConfig) {
  supabaseAdminSingleton ??= createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminSingleton
}
