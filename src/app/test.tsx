import { createClient } from '@/lib/supabase/server'

async function test() {
  const supabase = createClient()
  
  // Start typing 'supabase.from(' and watch the autocomplete!
  const { data } = await supabase.from('profiles').select('*')
}