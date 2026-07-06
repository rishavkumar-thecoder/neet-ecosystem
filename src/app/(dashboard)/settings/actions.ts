// src/app/(dashboard)/settings/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const supabaseAdmin = createAdminClient()

  // 1. Delete user data from all tables
  await supabaseAdmin.from('user_stats').delete().eq('user_id', user.id)
  await supabaseAdmin.from('study_plans').delete().eq('user_id', user.id)
  await supabaseAdmin.from('pomodoro_logs').delete().eq('user_id', user.id)
  await supabaseAdmin.from('user_memories').delete().eq('user_id', user.id)
  await supabaseAdmin.from('chats').delete().eq('user_id', user.id)
  await supabaseAdmin.from('profiles').delete().eq('id', user.id)

  // 2. Delete the Auth user (This completely wipes their login credentials)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (error) throw new Error('Failed to delete account')

  // 3. Sign out and redirect
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}