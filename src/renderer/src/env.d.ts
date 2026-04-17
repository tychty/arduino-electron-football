export interface LeaderboardEntry {
  name: string
  score: number
  date: string
}

interface ArduinoAPI {
  listPorts: () => Promise<{ path: string; manufacturer?: string }[]>
  connect: (port: string) => Promise<void>
  disconnect: () => Promise<void>
  autoConnect: () => Promise<string | null>
  /** Returns unsubscribe function */
  onData: (callback: (pin: number, peak: number) => void) => () => void
  /** Returns unsubscribe function */
  onError: (callback: (msg: string) => void) => () => void
  setDebounce: (ms: number, pin?: number) => Promise<void>
  setNoiseTolerance: (value: number, pin?: number) => Promise<void>
  leaderboard: {
    read: () => Promise<LeaderboardEntry[]>
    append: (name: string, score: number, date: string) => Promise<void>
  }
}

declare global {
  interface Window {
    arduino: ArduinoAPI
  }
}

export {}
