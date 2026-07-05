// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database' // Import the generated types

export function createClient() {
  // Pass the Database type to createBrowserClient
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}