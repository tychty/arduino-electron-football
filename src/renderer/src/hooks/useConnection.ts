import { useState, useEffect, useRef } from 'react'
import { arduinoService, PortInfo } from '../services/arduinoService'
import { useSettingsCtx } from '../context/SettingsContext'
import { SERIAL_RETRY_INTERVAL_MS } from '../../../shared/config'

const LAST_CONNECTED_PORT_KEY = 'lastConnectedPort'

export interface Connection {
  ports: PortInfo[]
  selected: string
  connected: boolean
  tryingPort: string | null
  error: string | null
  setSelected: (port: string) => void
}

export function useConnection(): Connection {
  const { allPins, settings } = useSettingsCtx()
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [selected, setSelected] = useState(() => localStorage.getItem(LAST_CONNECTED_PORT_KEY) ?? '')
  const [connected, setConnected] = useState(false)
  const [tryingPort, setTryingPort] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connectedRef = useRef(false)
  const selectedRef = useRef(selected)
  const cyclingRef = useRef(false)
  const allPinsRef = useRef(allPins)
  const settingsRef = useRef(settings)

  useEffect(() => { allPinsRef.current = allPins }, [allPins])
  useEffect(() => { settingsRef.current = settings }, [settings])

  const pushSettings = async (pins: number[]): Promise<void> => {
    await arduinoService.setWindow(settingsRef.current.game.hitWindowMs)
    for (const pin of pins) {
      const { noise } = settingsRef.current.pinHardware(pin)
      await arduinoService.setNoiseTolerance(noise, pin)
    }
  }

  const markConnected = async (portPath: string): Promise<void> => {
    localStorage.setItem(LAST_CONNECTED_PORT_KEY, portPath)
    selectedRef.current = portPath
    connectedRef.current = true
    setSelected(portPath)
    setConnected(true)
    setTryingPort(null)
    setError(null)
    await pushSettings(allPinsRef.current)
  }

  const tryConnect = async (portPath: string): Promise<boolean> => {
    try {
      await arduinoService.connect(portPath)
      return true
    } catch {
      return false
    }
  }

  // Reassigned every render so the closure always captures current helpers/refs
  const runCycleRef = useRef<() => Promise<void>>(async () => {})
  runCycleRef.current = async (): Promise<void> => {
    if (connectedRef.current || cyclingRef.current) return
    cyclingRef.current = true
    try {
      const list = await arduinoService.listPorts()
      setPorts(list)
      if (list.length === 0) return

      const startIdx = list.findIndex((p) => p.path === selectedRef.current)
      const ordered = startIdx >= 0
        ? [...list.slice(startIdx), ...list.slice(0, startIdx)]
        : list

      for (const port of ordered) {
        if (connectedRef.current) return
        setTryingPort(port.path)
        if (await tryConnect(port.path)) {
          await markConnected(port.path)
          return
        }
      }
      setTryingPort(null)
    } finally {
      cyclingRef.current = false
    }
  }

  useEffect(() => {
    runCycleRef.current()
    const id = setInterval(() => runCycleRef.current(), SERIAL_RETRY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Hard disconnect on error — Arduino RAM is flushed, must resync on reconnect
  useEffect(() => {
    return arduinoService.onError((msg) => {
      const port = selectedRef.current
      setError(`${port}: ${msg}`)
      connectedRef.current = false
      setConnected(false)
    })
  }, [])

  useEffect(() => {
    if (!connected) return
    arduinoService.setWindow(settings.game.hitWindowMs)
  }, [connected, settings.game.hitWindowMs])

  const handleSetSelected = async (port: string): Promise<void> => {
    selectedRef.current = port
    setSelected(port)
    if (!port || connectedRef.current || cyclingRef.current) return
    cyclingRef.current = true
    setTryingPort(port)
    try {
      if (await tryConnect(port)) {
        await markConnected(port)
      } else {
        setTryingPort(null)
      }
    } finally {
      cyclingRef.current = false
    }
  }

  return { ports, selected, connected, tryingPort, error, setSelected: handleSetSelected }
}
