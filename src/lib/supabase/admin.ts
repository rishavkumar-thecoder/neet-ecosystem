// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database' // Import the generated types

export function createAdminClient() {
  // Pass the Database type to the standard createClient
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}