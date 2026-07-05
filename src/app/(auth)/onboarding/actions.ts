// src/app/(auth)/onboarding/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
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
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (profileError) {
    console.error(profileError)
    throw new Error('Failed to save profile')
  }

  // Initialize user stats for the gamification system
  const { error: statsError } = await supabase
    .from('user_stats')
    .insert({ user_id: user.id })

  if (statsError) {
    console.error(statsError)
  }

  redirect('/dashboard')
}