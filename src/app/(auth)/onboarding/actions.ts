// src/app/(auth)/onboarding/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // --- Check if username is already taken ---
  if (username) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      throw new Error('Username already taken. Please choose another.')
    }

    const supabaseAdmin = createAdminClient()
    const newEmail = `${username.toLowerCase()}@neetecosystem.local`

    // Update Auth Credentials (Email and Password)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email: newEmail,
        password: password,
        email_confirm: true,
      }
    )

    if (authError) {
      console.error(authError)
      throw new Error('Failed to set username and password.')
    }

    // --- FIX: Sign the user in again to establish a fresh session ---
    // Changing the email invalidates the old session, so we must create a new one.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: newEmail,
      password: password
    })

    if (signInError) {
      console.error(signInError)
      // If sign-in fails, send them to the login page to log in manually
      redirect('/login')
    }
  }

  const profileData = {
    id: user.id,
    full_name: formData.get('full_name') as string,
    target_year: parseInt(formData.get('target_year') as string),
    class_status: formData.get('class_status') as string,
    coaching_status: formData.get('coaching_status') as string,
    weak_subject: formData.get('weak_subject') as string,
    daily_hours: parseInt(formData.get('daily_hours') as string),
    study_time_pref: formData.get('study_time_pref') as string,
    username: username ? username.toLowerCase() : null,
    auth_email: `${username.toLowerCase()}@neetecosystem.local`
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (profileError) {
    console.error(profileError)
    if (profileError.code === '23505') {
      throw new Error('Username already taken. Please choose another.')
    }
    throw new Error('Failed to save profile')
  }

  // Initialize user stats
  const { error: statsError } = await supabase
    .from('user_stats')
    .insert({ user_id: user.id })
    
  if (statsError) console.error(statsError)

  redirect('/dashboard')
}