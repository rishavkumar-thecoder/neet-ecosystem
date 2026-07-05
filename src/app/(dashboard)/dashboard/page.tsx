// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Clock, TrendingUp, Target, BookOpen, Award, Flame, Brain, ListTodo } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PomodoroSheet } from '@/components/pomodoro/pomodoro-sheet'
import { TopicCheckItem } from './topic-check-item'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch today's study plans for the Pomodoro sheet and checklist
  const today = new Date().toISOString().split('T')[0]
  const { data: plans } = await supabase
    .from('study_plans')
    .select('id, status, syllabus (topic, subject, estimated_mins)')
    .eq('user_id', user.id)
    .eq('plan_date', today)

  if (!profile) redirect('/onboarding')

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome back, {profile.full_name}! 👋
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Let's crush your NEET {profile.target_year} preparation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 w-fit">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold text-sm">
            {profile.class_status} • {profile.coaching_status === 'Yes' ? 'Coaching' : 'Self Study'}
          </span>
        </div>
      </div>

      {/* Stats Grid - High Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Current Streak</CardTitle>
            <Flame className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.current_streak || 0} <span className="text-lg font-normal text-zinc-500">days</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Keep the fire burning! 🔥</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Study Hours</CardTitle>
            <Clock className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.total_hours_studied || 0} <span className="text-lg font-normal text-zinc-500">hrs</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Lifetime progress</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">PYQs Solved</CardTitle>
            <BookOpen className="w-5 h-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-zinc-500 mt-1">Start practicing today</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Points</CardTitle>
            <Award className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.total_points || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Level up your rank 🎯</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Profile */}
        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm">Target Year</span>
              <span className="text-white font-bold">{profile.target_year}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm">Weak Subject</span>
              <span className="text-destructive font-semibold">{profile.weak_subject}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm">Daily Goal</span>
              <span className="text-white font-semibold">{profile.daily_hours} hours</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-400 text-sm">Best Time</span>
              <span className="text-accent font-semibold">{profile.study_time_pref}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/chat" className="block group">
            <Card className="h-full bg-gradient-to-br from-sky-500/10 to-zinc-900 border-sky-500/20 hover:border-sky-500/50 transition-all">
              <CardHeader>
                <Brain className="w-8 h-8 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white text-xl">AI Doubt Solver</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">Chat with your personal AI tutor. Ask concepts, PYQs, or mnemonics.</p>
                {/* FIX: Replaced <Button> with a styled <div> to prevent <button> inside <a> tag HTML violation */}
                <div className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-center shadow-lg shadow-sky-500/20">
                  Start Chatting
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pyqs" className="block group">
            <Card className="h-full bg-gradient-to-br from-purple-500/10 to-zinc-900 border-purple-500/20 hover:border-purple-500/50 transition-all">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white text-xl">PYQ Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">Solve past 10 years NEET questions with detailed explanations.</p>
                {/* FIX: Replaced <Button> with a styled <div> */}
                <div className="w-full mt-4 border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-medium py-2 px-4 rounded-md transition-colors text-center">
                  Solve Now
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* NEW: Today's Session & Pomodoro Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" /> Today's Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plans && plans.length > 0 ? (
              plans.map((plan: any) => <TopicCheckItem key={plan.id} plan={plan} />)
            ) : (
              <div className="text-center py-8 bg-zinc-950/50 rounded-lg border border-dashed border-zinc-800">
                <p className="text-zinc-400 mb-2">No specific topics scheduled for today.</p>
                <p className="text-zinc-500 text-sm">Start a Pomodoro session below to track general study time!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-zinc-900 border-primary/20 shadow-lg shadow-black/20 flex flex-col">
          <CardHeader>
            <CardTitle className="text-white text-xl">Focus Timer</CardTitle>
            <p className="text-zinc-400 text-sm mt-1">Start a 25-min Pomodoro session to earn XP.</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <PomodoroSheet plans={plans || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}