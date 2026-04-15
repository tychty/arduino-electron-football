interface ArduinoAPI {
  listPorts: () => Promise<{ path: string; manufacturer?: string }[]>
  connect: (port: string) => Promise<void>
  disconnect: () => Promise<void>
  /** Returns unsubscribe function */
  onData: (callback: (value: number) => void) => () => void
}

declare global {
  interface Window {
    arduino: ArduinoAPI
  }
}

export {}
