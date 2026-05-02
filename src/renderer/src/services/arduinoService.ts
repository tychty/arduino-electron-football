export type HitHandler = (pin: number, peak: number) => void
export type ErrorHandler = (message: string) => void

export interface PortInfo {
  path: string
  manufacturer?: string
}

export interface LeaderboardEntry {
  name: string
  company: string
  email: string
  score: number
  date: string
}

export interface IArduinoService {
  listPorts(): Promise<PortInfo[]>
  connect(port: string): Promise<void>
  disconnect(): Promise<void>
  autoConnect(): Promise<string | null>
  onHit(handler: HitHandler): () => void
  onError(handler: ErrorHandler): () => void
  setNoiseTolerance(val: number, pin?: number): Promise<void>
  setWindow(ms: number): Promise<void>
  setIgnore(on: boolean): Promise<void>
  readLeaderboard(): Promise<LeaderboardEntry[]>
  appendLeaderboard(name: string, company: string, email: string, score: number, date: string): Promise<void>
  clearLeaderboard(): Promise<void>
  getLeaderboardPath(): Promise<string>
}

class ElectronArduinoService implements IArduinoService {
  listPorts = (): Promise<PortInfo[]> => window.arduino.listPorts()
  connect = (port: string): Promise<void> => window.arduino.connect(port)
  disconnect = (): Promise<void> => window.arduino.disconnect()
  autoConnect = (): Promise<string | null> => window.arduino.autoConnect()
  onHit = (cb: HitHandler): (() => void) => window.arduino.onData(cb)
  onError = (cb: ErrorHandler): (() => void) => window.arduino.onError(cb)
  setNoiseTolerance = (val: number, pin?: number): Promise<void> =>
    window.arduino.setNoiseTolerance(val, pin)
  setWindow = (ms: number): Promise<void> => window.arduino.setWindow(ms)
  setIgnore = (on: boolean): Promise<void> => window.arduino.setIgnore(on)
  readLeaderboard = (): Promise<LeaderboardEntry[]> => window.arduino.leaderboard.read()
  appendLeaderboard = (name: string, company: string, email: string, score: number, date: string): Promise<void> =>
    window.arduino.leaderboard.append(name, company, email, score, date)
  clearLeaderboard = (): Promise<void> => window.arduino.leaderboard.clear()
  getLeaderboardPath = (): Promise<string> => window.arduino.leaderboard.path()
}

export class MockArduinoService implements IArduinoService {
  private hitHandlers = new Set<HitHandler>()
  private errorHandlers = new Set<ErrorHandler>()
  private _entries: LeaderboardEntry[] = []

  simulateHit(pin: number, peak: number): void {
    this.hitHandlers.forEach((h) => h(pin, peak))
  }
  simulateError(msg: string): void {
    this.errorHandlers.forEach((h) => h(msg))
  }

  listPorts = async (): Promise<PortInfo[]> => [{ path: '/dev/mock0' }]
  connect = async (): Promise<void> => {}
  disconnect = async (): Promise<void> => {}
  autoConnect = async (): Promise<string | null> => '/dev/mock0'
  onHit(h: HitHandler): () => void {
    this.hitHandlers.add(h)
    return () => this.hitHandlers.delete(h)
  }
  onError(h: ErrorHandler): () => void {
    this.errorHandlers.add(h)
    return () => this.errorHandlers.delete(h)
  }
  setNoiseTolerance = async (): Promise<void> => {}
  setWindow = async (): Promise<void> => {}
  setIgnore = async (): Promise<void> => {}
  readLeaderboard = async (): Promise<LeaderboardEntry[]> => [...this._entries]
  appendLeaderboard = async (name: string, company: string, email: string, score: number, date: string): Promise<void> => {
    this._entries.push({ name, company, email, score, date })
  }
  clearLeaderboard = async (): Promise<void> => {
    this._entries = []
  }
  getLeaderboardPath = async (): Promise<string> => '(mock)'
}

export let arduinoService: IArduinoService = new ElectronArduinoService()
export const _setArduinoService = (s: IArduinoService): void => {
  arduinoService = s
}
