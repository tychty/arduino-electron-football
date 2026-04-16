interface ArduinoAPI {
  listPorts: () => Promise<{ path: string; manufacturer?: string }[]>
  connect: (port: string) => Promise<void>
  disconnect: () => Promise<void>
  /** Returns unsubscribe function */
  onData: (callback: (pin: number, peak: number) => void) => () => void
  /** Returns unsubscribe function */
  onError: (callback: (msg: string) => void) => () => void
  setDebounce: (ms: number) => Promise<void>
  setNoiseTolerance: (value: number) => Promise<void>
}

declare global {
  interface Window {
    arduino: ArduinoAPI
  }
}

export {}
