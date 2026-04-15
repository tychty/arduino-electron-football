import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('arduino', {
  listPorts: (): Promise<{ path: string; manufacturer?: string }[]> =>
    ipcRenderer.invoke('serial:list'),

  connect: (port: string): Promise<void> =>
    ipcRenderer.invoke('serial:connect', port),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke('serial:disconnect'),

  // Returns an unsubscribe function — call it on cleanup
  onData: (callback: (value: number) => void): (() => void) => {
    const handler = (_: unknown, value: number): void => callback(value)
    ipcRenderer.on('serial:data', handler)
    return () => ipcRenderer.off('serial:data', handler)
  }
})
