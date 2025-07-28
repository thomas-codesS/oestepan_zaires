import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Cliente de Supabase para el lado del cliente (browser)
 * Maneja autenticación y operaciones en tiempo real
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient() 