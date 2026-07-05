// src/components/pomodoro/pomodoro-sheet.tsx
'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, RotateCcw, Timer, BookOpen } from 'lucide-react'
import { usePomodoro } from '@/hooks/use-pomodoro'
import { TimerDisplay } from './timer-display'
import { logPomodoroSession } from '@/app/(dashboard)/dashboard/actions'
import { toast } from 'sonner'

export function PomodoroSheet({ plans = [] }: { plans?: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleComplete = async (topicId: string | null, duration: number, isDistracted: boolean) => {
    toast.loading('Logging session...')
    await logPomodoroSession(topicId, duration, !isDistracted)
    toast.success(`+10 XP Earned! ${isDistracted ? '(Focus penalty applied)' : ''}`)
  }

  const { timeLeft, totalTime, isActive, sessionType, currentTopicId, isDistracted, start, pause, reset, setTopic } = usePomodoro(handleComplete)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* FIX: Removed asChild and applied classes directly to SheetTrigger. 
          This prevents the nested <button> error and fixes the Hydration Mismatch! */}
      <SheetTrigger className="w-full bg-sky-500 hover:bg-sky-600 text-white h-12 text-lg font-semibold shadow-lg shadow-sky-500/20 rounded-md inline-flex items-center justify-center gap-2 transition-colors cursor-pointer">
        <Timer className="w-5 h-5" /> Start Studying
      </SheetTrigger>
      
      <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-50 w-full sm:max-w-md flex flex-col" side="bottom">
        <SheetHeader className="text-left border-b border-zinc-800 pb-4 mb-6">
          <SheetTitle className="text-2xl font-bold text-white">Focus Session</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Stay on task to earn XP. Switching tabs for &gt;2 mins will pause your timer.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} sessionType={sessionType} />

          {isDistracted && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium text-center">
              ⚠️ Distraction detected! Timer paused.
            </div>
          )}

          <div className="w-full max-w-xs">
            <Select value={currentTopicId || ''} onValueChange={setTopic}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200 h-12">
                <BookOpen className="w-4 h-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Select a topic to study" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {plans.length > 0 ? plans.map((plan: any) => (
                  <SelectItem key={plan.id} value={plan.id} className="text-zinc-200 focus:bg-zinc-800">
                    {plan.syllabus?.topic || 'General Study'}
                  </SelectItem>
                )) : (
                  <SelectItem value="general" className="text-zinc-200 focus:bg-zinc-800">General Study</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <button className="w-12 h-12 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 inline-flex items-center justify-center transition-colors" onClick={reset}>
              <RotateCcw className="w-5 h-5" />
            </button>

            {!isActive ? (
              <button className="w-16 h-16 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30 inline-flex items-center justify-center transition-colors" onClick={start}>
                <Play className="w-7 h-7 fill-white" />
              </button>
            ) : (
              <button className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white inline-flex items-center justify-center transition-colors" onClick={pause}>
                <Pause className="w-7 h-7 fill-white" />
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}