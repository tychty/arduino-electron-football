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

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    const unsub = window.arduino.onError((msg) => setError(msg))
    return unsub
  }, [])

  const connect = async (): Promise<void> => {
    if (!selected) return
    setError(null)
    await window.arduino.connect(selected)
    setConnected(true)
    for (const pin of allPins) {
      const debounce = Number(localStorage.getItem(`pin_${pin}_debounce`) ?? 200)
      const noise = Number(localStorage.getItem(`pin_${pin}_noise`) ?? 5)
      await window.arduino.setDebounce(debounce, pin)
      await window.arduino.setNoiseTolerance(noise, pin)
    }
  }

  const disconnect = async (): Promise<void> => {
    await window.arduino.disconnect()
    setConnected(false)
  }

  return { ports, selected, connected, error, setSelected, refresh, connect, disconnect }
}
