'use client'
import { useOptimistic, useTransition } from 'react'
import { updateTopicStatus } from './actions'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TopicCheckItem({ plan }: { plan: any }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(plan.status, (state, newStatus: string) => newStatus)

  const handleToggle = () => {
    const newStatus = optimisticStatus === 'completed' ? 'pending' : 'completed'
    startTransition(async () => {
      setOptimisticStatus(newStatus)
      await updateTopicStatus(plan.id, newStatus as any)
    })
  }

  const isCompleted = optimisticStatus === 'completed'
  const topic = plan.syllabus

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
        isCompleted ? "bg-primary/5 border-primary/20" : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
      )}
    >
      {isCompleted ? <CheckCircle2 className="w-6 h-6 text-primary shrink-0" /> : <Circle className="w-6 h-6 text-zinc-600 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", isCompleted ? "text-zinc-500 line-through" : "text-white")}>
          {topic?.topic || 'Unknown Topic'}
        </p>
        <p className="text-xs text-zinc-500 truncate">{topic?.subject} • {topic?.estimated_mins || '?'} mins</p>
      </div>
    </button>
  )
}