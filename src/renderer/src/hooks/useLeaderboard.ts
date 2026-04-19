import { useState, useEffect } from 'react'
import { arduinoService } from '../services/arduinoService'
import type { LeaderboardEntry } from '../services/arduinoService'

interface UseLeaderboard {
  entries: LeaderboardEntry[]
  append: (name: string, score: number) => Promise<void>
  reload: () => Promise<void>
}

export function useLeaderboard(): UseLeaderboard {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  const reload = async (): Promise<void> => {
    const data = await arduinoService.readLeaderboard()
    setEntries([...data].sort((a, b) => b.score - a.score))
  }

  useEffect(() => {
    reload()
  }, [])

  const append = async (name: string, score: number): Promise<void> => {
    const date = new Date().toISOString()
    await arduinoService.appendLeaderboard(name, score, date)
    await reload()
  }

  return { entries, append, reload }
}
