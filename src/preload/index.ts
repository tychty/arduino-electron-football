import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('arduino', {
  listPorts: (): Promise<{ path: string; manufacturer?: string }[]> =>
    ipcRenderer.invoke('serial:list'),

  connect: (port: string): Promise<void> =>
    ipcRenderer.invoke('serial:connect', port),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke('serial:disconnect'),

  autoConnect: (): Promise<string | null> =>
    ipcRenderer.invoke('serial:autoConnect'),

  // Returns an unsubscribe function — call it on cleanup
  onData: (callback: (pin: number, peak: number) => void): (() => void) => {
    const handler = (_: unknown, pin: number, peak: number): void => callback(pin, peak)
    ipcRenderer.on('serial:data', handler)
    return () => ipcRenderer.off('serial:data', handler)
  },

  onError: (callback: (msg: string) => void): (() => void) => {
    const handler = (_: unknown, msg: string): void => callback(msg)
    ipcRenderer.on('serial:error', handler)
    return () => ipcRenderer.off('serial:error', handler)
  },

  setNoiseTolerance: (value: number, pin?: number): Promise<void> =>
    ipcRenderer.invoke('serial:command', pin !== undefined ? `N:${pin}:${value}` : `N:${value}`),

  setWindow: (ms: number): Promise<void> =>
    ipcRenderer.invoke('serial:command', `W:${ms}`),

  setIgnore: (on: boolean): Promise<void> =>
    ipcRenderer.invoke('serial:command', `I:${on ? 1 : 0}`),

  leaderboard: {
    read: (): Promise<{ name: string; score: number; date: string }[]> =>
      ipcRenderer.invoke('leaderboard:read'),

    append: (name: string, company: string, email: string, score: number, date: string): Promise<void> =>
      ipcRenderer.invoke('leaderboard:append', name, company, email, score, date),

    clear: (): Promise<void> =>
      ipcRenderer.invoke('leaderboard:clear'),

    path: (): Promise<string> =>
      ipcRenderer.invoke('leaderboard:path'),

    showInFolder: (): Promise<void> =>
      ipcRenderer.invoke('leaderboard:showInFolder'),
  },
})
