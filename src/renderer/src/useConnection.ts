import { useState, useEffect } from 'react'

export interface PortInfo {
  path: string
  manufacturer?: string
}

export interface Connection {
  ports: PortInfo[]
  selected: string
  connected: boolean
  error: string | null
  setSelected: (port: string) => void
  refresh: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

export function useConnection(allPins: number[]): Connection {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    const list = await window.arduino.listPorts()
    setPorts(list)
  }

  const sendPinConfigs = async (pins: number[]): Promise<void> => {
    for (const pin of pins) {
      const debounce = Number(localStorage.getItem(`pin_${pin}_debounce`) ?? 200)
      const noise = Number(localStorage.getItem(`pin_${pin}_noise`) ?? 5)
      await window.arduino.setDebounce(debounce, pin)
      await window.arduino.setNoiseTolerance(noise, pin)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    const unsub = window.arduino.onError((msg) => setError(msg))
    return unsub
  }, [])

  // auto-connect on startup: scan all ports and try each
  useEffect(() => {
    window.arduino.autoConnect().then(async (portPath) => {
      if (!portPath) return
      setSelected(portPath)
      setConnected(true)
      await sendPinConfigs(allPins)
    })
  }, [])

  const connect = async (): Promise<void> => {
    if (!selected) return
    setError(null)
    await window.arduino.connect(selected)
    setConnected(true)
    await sendPinConfigs(allPins)
  }

  const disconnect = async (): Promise<void> => {
    await window.arduino.disconnect()
    setConnected(false)
  }

  return { ports, selected, connected, error, setSelected, refresh, connect, disconnect }
}
