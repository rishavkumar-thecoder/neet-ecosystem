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
    
  if (error) console.error('Fetch Syllabus Error:', error)
  return data || []
}

export async function createStudyPlan(planData: { date: string, topic_id: string }[]) {
  const supabase = await createClient()
  
  // FIX: Added 'data:' prefix
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const inserts = planData.map(p => ({
    user_id: user.id,
    plan_date: p.date,
    topic_id: p.topic_id,
    status: 'pending'
  }))

  const { error } = await supabase.from('study_plans').insert(inserts)
  if (error) {
    console.error(error)
    return { success: false, message: 'Failed to save plan.' }
  }
  return { success: true, message: 'Plan successfully saved to dashboard.' }
}

export async function saveLongTermMemory(fact: string) {
  const supabaseUser = await createClient()
  
  // FIX: Added 'data:' prefix
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabaseAdmin = createAdminClient()
  
  // Generate embedding
  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: fact,
  })

  // Supabase expects the vector as a string or array depending on your schema.
  // Passing it as a string is the safest method for pgvector.
  const { error } = await supabaseAdmin.from('user_memories').insert({
    user_id: user.id,
    content: fact,
    embedding: `[${embedding.join(',')}]`, 
  })

  if (error) {
    console.error('❌ Supabase Memory Insert Error:', error)
    return { success: false, message: `Failed to save memory: ${error.message}` }
  }
  return { success: true, message: 'Memory stored.' }
}

export async function searchMemory(query: string) {
  const supabaseUser = await createClient()
  
  // FIX: Added 'data:' prefix
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const supabaseAdmin = createAdminClient()
  
  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: query,
  })

  const { data, error } = await supabaseAdmin.rpc('match_user_memories', {
    query_embedding: `[${embedding.join(',')}]`, // Pass as string for RPC
    match_user_id: user.id,
    match_count: 3
  })

  if (error) {
    console.error('❌ Supabase Memory Search Error:', error)
    return []
  }
  return data || []
}