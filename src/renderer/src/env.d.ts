import type { HitHandler, ErrorHandler, PortInfo, LeaderboardEntry } from './services/arduinoService'

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

interface ArduinoAPI {
  listPorts: () => Promise<PortInfo[]>
  connect: (port: string) => Promise<void>
  disconnect: () => Promise<void>
  autoConnect: () => Promise<string | null>
  onData: (callback: HitHandler) => () => void
  onError: (callback: ErrorHandler) => () => void
  setNoiseTolerance: (value: number, pin?: number) => Promise<void>
  setWindow: (ms: number) => Promise<void>
  setIgnore: (on: boolean) => Promise<void>
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
