import type { HitHandler, ErrorHandler, PortInfo, LeaderboardEntry } from './services/arduinoService'

interface ArduinoAPI {
  listPorts: () => Promise<PortInfo[]>
  connect: (port: string) => Promise<void>
  disconnect: () => Promise<void>
  autoConnect: () => Promise<string | null>
  onData: (callback: HitHandler) => () => void
  onError: (callback: ErrorHandler) => () => void
  setDebounce: (ms: number, pin?: number) => Promise<void>
  setNoiseTolerance: (value: number, pin?: number) => Promise<void>
  leaderboard: {
    read: () => Promise<LeaderboardEntry[]>
    append: (name: string, score: number, date: string) => Promise<void>
    clear: () => Promise<void>
    path: () => Promise<string>
    showInFolder: () => Promise<void>
  }
}

declare global {
  interface Window {
    arduino: ArduinoAPI
  }
}

export {}
