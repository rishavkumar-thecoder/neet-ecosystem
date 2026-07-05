'use client'
import { motion } from 'framer-motion'

export function TimerDisplay({ timeLeft, totalTime, sessionType }: { timeLeft: number, totalTime: number, sessionType: string }) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = timeLeft / totalTime
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const color = sessionType === 'focus' ? '#0EA5E9' : '#10B981'

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 288 288">
        <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
        <motion.circle
          cx="144" cy="144" r={radius} stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div 
          key={timeLeft} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold text-white font-mono tracking-tight"
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
        <p className="text-sm font-bold uppercase tracking-widest mt-2" style={{ color }}>
          {sessionType === 'focus' ? 'Focus' : 'Break'}
        </p>
      </div>
    </div>
  )
}