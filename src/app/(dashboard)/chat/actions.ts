// src/app/(dashboard)/chat/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { embed } from 'ai'
import { google } from '@ai-sdk/google'

export async function fetchSyllabus(chapterName: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('syllabus')
    .select('id, topic, estimated_mins, subject, chapter')
    .ilike('chapter', `%${chapterName}%`)
    .limit(10)
  
  return data || []
}

export async function createStudyPlan(planData: { date: string, topic_id: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const inserts = planData.map(p => ({
    user_id: user.id, 
    plan_date: p.date,
    topic_id: p.topic_id,
    status: 'pending'
  }))

  const { error } = await supabase.from('study_plans').insert(inserts)
  if (error) return { success: false, message: 'Failed to save plan.' }
  return { success: true, message: 'Plan successfully saved to dashboard.' }
}

export async function saveLongTermMemory(fact: string) {
  // 1. Use Standard Client to get the User ID from browser cookies
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 2. Use Admin Client to bypass RLS and insert the vector
  const supabaseAdmin = createAdminClient()

  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: fact,
  })
  
  const { error } = await supabaseAdmin.from('user_memories').insert({
    user_id: user.id,
    content: fact,
    embedding: embedding, 
  })
  
  if (error) {
    console.error('❌ Supabase Memory Insert Error:', error)
    return { success: false, message: `Failed to save memory: ${error.message}` }
  }
  return { success: true, message: 'Memory stored.' }
}

export async function searchMemory(query: string) {
  // 1. Get User ID
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 2. Use Admin Client for RPC
  const supabaseAdmin = createAdminClient()

  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: query,
  })
  
  const { data, error } = await supabaseAdmin.rpc('match_user_memories', {
    query_embedding: embedding,
    match_user_id: user.id,
    match_count: 3
  })
  
  if (error) {
    console.error('❌ Supabase Memory Search Error:', error)
    return []
  }
  return data || []
}