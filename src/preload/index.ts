import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('arduino', {
  listPorts: (): Promise<{ path: string; manufacturer?: string }[]> =>
    ipcRenderer.invoke('serial:list'),

  connect: (port: string): Promise<void> =>
    ipcRenderer.invoke('serial:connect', port),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke('serial:disconnect'),

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

  setDebounce: (ms: number, pin?: number): Promise<void> =>
    ipcRenderer.invoke('serial:command', pin !== undefined ? `D:${pin}:${ms}` : `D:${ms}`),

  setNoiseTolerance: (value: number, pin?: number): Promise<void> =>
    ipcRenderer.invoke('serial:command', pin !== undefined ? `N:${pin}:${value}` : `N:${value}`)
})
