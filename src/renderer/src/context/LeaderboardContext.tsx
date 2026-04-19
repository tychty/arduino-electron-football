import { createContext, useContext, ReactNode } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import type { LeaderboardEntry } from '../services/arduinoService'

interface LeaderboardContextValue {
  entries: LeaderboardEntry[]
  append: (name: string, score: number) => Promise<void>
  reload: () => Promise<void>
  clear: () => Promise<void>
}

const LeaderboardContext = createContext<LeaderboardContextValue | null>(null)

export function LeaderboardProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useLeaderboard()
  return <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>
}

export function useLeaderboardCtx(): LeaderboardContextValue {
  const ctx = useContext(LeaderboardContext)
  if (!ctx) throw new Error('useLeaderboardCtx must be used within a LeaderboardProvider')
  return ctx
}
