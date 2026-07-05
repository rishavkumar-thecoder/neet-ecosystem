// src/app/api/chat/route.ts
import { streamText, tool, convertToModelMessages } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { fetchSyllabus, createStudyPlan, saveLongTermMemory, searchMemory } from '@/app/(dashboard)/chat/actions'
import { getSystemPrompt } from '@/lib/ai/prompts'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single()
  
  const body = await req.json()
  
  // Safely extract the messages array whether it's sent directly or nested
  const uiMessages = Array.isArray(body) ? body : body.messages

  if (!uiMessages || !Array.isArray(uiMessages)) {
    console.error('Invalid messages payload received:', body)
    return new Response('Invalid messages format', { status: 400 })
  }

  const systemPrompt = getSystemPrompt({
    name: profile?.full_name || 'Student',
    streak: stats?.current_streak || 0,
    weakSubject: profile?.weak_subject || 'None',
    date: new Date().toLocaleDateString()
  })

  // 👇 FIX: Added 'await' because convertToModelMessages is async in AI SDK v6
  const coreMessages = await convertToModelMessages(uiMessages)

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: coreMessages,
    maxSteps: 5,
    tools: {
      get_topics: tool({
        description: 'Fetch topics from the syllabus for a specific chapter or subject',
        parameters: z.object({
          chapterName: z.string().describe('The name of the chapter or subject'),
        }),
        execute: async ({ chapterName }) => await fetchSyllabus(chapterName),
      }),
      schedule_plan: tool({
        description: 'Schedule a study plan for the user. Use this when the user asks to plan their day or week.',
        parameters: z.object({
          planData: z.array(z.object({
            date: z.string().describe('YYYY-MM-DD format'),
            topic_id: z.string().uuid(),
          })),
        }),
        execute: async ({ planData }) => await createStudyPlan(planData),
      }),
      remember: tool({
        description: 'Save a long-term memory or fact about the user (e.g. exam date, weak topics, personal preferences)',
        parameters: z.object({
          fact: z.string(),
        }),
        execute: async ({ fact }) => await saveLongTermMemory(fact),
      }),
      recall: tool({
        description: 'Search long-term memories for relevant past facts about the user',
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => await searchMemory(query),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}