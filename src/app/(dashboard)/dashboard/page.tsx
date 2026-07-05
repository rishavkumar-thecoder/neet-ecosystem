// src/app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Clock, TrendingUp, Target, BookOpen, Award } from 'lucide-react'

export default async function DashboardPage() {
  // 👇 FIX: Added 'await' here!
  const supabase = await createClient() 
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-50">
            Welcome back, {profile.full_name}! 👋
          </h1>
          <p className="text-zinc-400 mt-2">
            Let's crush your NEET {profile.target_year} preparation
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold">
            {profile.class_status} • {profile.coaching_status === 'Yes' ? 'Coaching Student' : 'Self Study'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Current Streak
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              {stats?.current_streak || 0} days
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Study Hours
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              {stats?.total_hours_studied || 0} hrs
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              PYQs Solved
            </CardTitle>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              0
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Start practicing now
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Points
            </CardTitle>
            <Award className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-50">
              {stats?.total_points || 0}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Level up! 🎯
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-50 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Study Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Weak Subject</span>
              <span className="text-zinc-50 font-medium">{profile.weak_subject}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Daily Target</span>
              <span className="text-zinc-50 font-medium">{profile.daily_hours} hours</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400">Preferred Time</span>
              <span className="text-zinc-50 font-medium">{profile.study_time_pref}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-50">Quick Actions</CardTitle>
            <CardDescription className="text-zinc-400">
              Start your study session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              Start Pomodoro Session 🍅
            </button>
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-50 py-3 px-4 rounded-lg font-medium transition-colors">
              Solve PYQs 📚
            </button>
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-50 py-3 px-4 rounded-lg font-medium transition-colors">
              Chat with AI Tutor 🤖
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}