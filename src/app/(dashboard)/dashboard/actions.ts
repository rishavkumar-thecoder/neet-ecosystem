'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logPomodoroSession(topicId: string | null, durationMins: number, focusStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('pomodoro_logs').insert({
    user_id: user.id,
    topic_id: topicId,
    duration_mins: durationMins,
    focus_status: focusStatus,
    start_time: new Date(Date.now() - durationMins * 60 * 1000).toISOString(),
    end_time: new Date().toISOString()
  })

  if (focusStatus) {
    const { data: stats } = await supabase
      .from('user_stats')
      .select('total_points, total_hours_studied')
      .eq('user_id', user.id)
      .single()

    if (stats) {
      await supabase.from('user_stats').update({
        total_points: (stats.total_points || 0) + 10,
        total_hours_studied: (stats.total_hours_studied || 0) + (durationMins / 60)
      }).eq('user_id', user.id)
    }
  }

  await updateStreak()
  revalidatePath('/dashboard')
}

export async function updateTopicStatus(planId: string, status: 'completed' | 'partial' | 'skipped' | 'pending') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('study_plans').update({ status }).eq('id', planId).eq('user_id', user.id)
  revalidatePath('/dashboard')
}

export async function updateStreak() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single()
  if (!stats) return

  const today = new Date().toISOString().split('T')[0]
  const lastStudy = stats.last_study_date ? new Date(stats.last_study_date).toISOString().split('T')[0] : null

  if (lastStudy === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = 1
  if (lastStudy === yesterdayStr) newStreak = (stats.current_streak || 0) + 1

  await supabase.from('user_stats').update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, stats.longest_streak || 0),
    last_study_date: today
  }).eq('user_id', user.id)
}