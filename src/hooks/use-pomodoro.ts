'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type SessionType = 'focus' | 'shortBreak' | 'longBreak'

const DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

export function usePomodoro(onComplete?: (topicId: string | null, durationMins: number, isDistracted: boolean) => void) {
  const [sessionType] = useState<SessionType>('focus')
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus)
  const [isActive, setIsActive] = useState(false)
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null)
  const [isDistracted, setIsDistracted] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hiddenTimestampRef = useRef<number | null>(null)
  const endTimeRef = useRef<number | null>(null)

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedEndTime = localStorage.getItem('pomodoro_endTime')
    const savedTopic = localStorage.getItem('pomodoro_topicId')

    if (savedTopic) setCurrentTopicId(savedTopic)

    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10)
      const remaining = Math.round((endTime - Date.now()) / 1000)
      if (remaining > 0) {
        setTimeLeft(remaining)
        endTimeRef.current = endTime
      } else {
        localStorage.removeItem('pomodoro_endTime')
      }
    }
  }, [])

  // Tick Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000
        localStorage.setItem('pomodoro_endTime', endTimeRef.current.toString())
      }

      intervalRef.current = setInterval(() => {
        if (endTimeRef.current) {
          const remaining = Math.round((endTimeRef.current - Date.now()) / 1000)
          if (remaining <= 0) {
            setTimeLeft(0)
            setIsActive(false)
            clearInterval(intervalRef.current!)
            localStorage.removeItem('pomodoro_endTime')
            
            if (Notification.permission === 'granted') {
              new Notification('Session Complete!', { body: 'Great focus. Time for a break.' })
            }
            if (onComplete && sessionType === 'focus') {
              onComplete(currentTopicId, DURATIONS.focus / 60, isDistracted)
            }
          } else {
            setTimeLeft(remaining)
          }
        }
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (!isActive) {
         endTimeRef.current = null
         localStorage.removeItem('pomodoro_endTime')
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, timeLeft, onComplete, currentTopicId, sessionType, isDistracted])

  // Anti-Cheat (Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTimestampRef.current = Date.now()
      } else {
        if (hiddenTimestampRef.current && isActive) {
          const hiddenDuration = (Date.now() - hiddenTimestampRef.current) / 1000
          if (hiddenDuration > 120) {
            setIsActive(false)
            setIsDistracted(true)
          }
        }
        hiddenTimestampRef.current = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isActive])

  const start = useCallback(() => {
    if (Notification.permission === 'default') Notification.requestPermission()
    setIsDistracted(false)
    setIsActive(true)
  }, [])

  const pause = useCallback(() => setIsActive(false), [])

  const reset = useCallback(() => {
    setIsActive(false)
    setTimeLeft(DURATIONS[sessionType])
    endTimeRef.current = null
    localStorage.removeItem('pomodoro_endTime')
  }, [sessionType])

  const setTopic = useCallback((id: string | null) => {
    setCurrentTopicId(id)
    if (id) localStorage.setItem('pomodoro_topicId', id)
    else localStorage.removeItem('pomodoro_topicId')
  }, [])

  return { timeLeft, totalTime: DURATIONS[sessionType], isActive, sessionType, currentTopicId, isDistracted, start, pause, reset, setTopic }
}