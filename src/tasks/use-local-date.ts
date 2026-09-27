import { useEffect, useState } from 'react'
import { localDateKey } from './local-date.ts'

export function useLocalDateKey(): string {
  const [date, setDate] = useState(() => localDateKey())

  useEffect(() => {
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    const delay = Math.max(nextMidnight.getTime() - now.getTime(), 0)
    const timer = window.setTimeout(() => {
      setDate(localDateKey())
    }, delay)
    return () => window.clearTimeout(timer)
  }, [date])

  useEffect(() => {
    const refresh = () => setDate(localDateKey())
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  return date
}
