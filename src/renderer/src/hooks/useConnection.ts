import { useState, useEffect } from 'react'
import { arduinoService, PortInfo } from '../services/arduinoService'
import { useSettingsCtx } from '../context/SettingsContext'

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

export function useConnection(): Connection {
  const { allPins, settings } = useSettingsCtx()
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    const list = await arduinoService.listPorts()
    setPorts(list)
  }

  const sendConfigsOnConnect = async (pins: number[]): Promise<void> => {
    await arduinoService.setWindow(settings.game.hitWindowMs)
    for (const pin of pins) {
      const { noise } = settings.pinHardware(pin)
      await arduinoService.setNoiseTolerance(noise, pin)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    return arduinoService.onError((msg) => setError(msg))
  }, [])

  useEffect(() => {
    arduinoService.autoConnect().then(async (portPath) => {
      if (!portPath) return
      setSelected(portPath)
      setConnected(true)
      await sendConfigsOnConnect(allPins)
    })
  }, [])

  const connect = async (): Promise<void> => {
    if (!selected) return
    setError(null)
    await arduinoService.connect(selected)
    setConnected(true)
    await sendConfigsOnConnect(allPins)
  }

  useEffect(() => {
    if (!connected) return
    arduinoService.setWindow(settings.game.hitWindowMs)
  }, [connected, settings.game.hitWindowMs])

  const disconnect = async (): Promise<void> => {
    await arduinoService.disconnect()
    setConnected(false)
  }

  return { ports, selected, connected, error, setSelected, refresh, connect, disconnect }
}
