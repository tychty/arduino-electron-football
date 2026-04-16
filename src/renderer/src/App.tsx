import { useState, useEffect } from 'react'
import PinSettings from './PinSettings'

interface Port {
  path: string
  manufacturer?: string
}

const PINS = [0]

export default function App(): JSX.Element {
  const [ports, setPorts] = useState<Port[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [peaks, setPeaks] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    const list = await window.arduino.listPorts()
    setPorts(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!connected) return
    const unsub = window.arduino.onData((pin, peak) => setPeaks((prev) => ({ ...prev, [pin]: peak })))
    return unsub
  }, [connected])

  useEffect(() => {
    const unsub = window.arduino.onError((msg) => setError(msg))
    return unsub
  }, [])

  const connect = async (): Promise<void> => {
    if (!selected) return
    setError(null)
    await window.arduino.connect(selected)
    setConnected(true)
    for (const pin of PINS) {
      const debounce = Number(localStorage.getItem(`pin_${pin}_debounce`) ?? 200)
      const noise = Number(localStorage.getItem(`pin_${pin}_noise`) ?? 5)
      await window.arduino.setDebounce(debounce, pin)
      await window.arduino.setNoiseTolerance(noise, pin)
    }
  }

  const disconnect = async (): Promise<void> => {
    await window.arduino.disconnect()
    setConnected(false)
    setPeaks({})
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h2>Arduino Serial</h2>

      <div style={{ marginBottom: 12 }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={connected}
        >
          <option value="">-- select port --</option>
          {ports.map((p) => (
            <option key={p.path} value={p.path}>
              {p.path}
              {p.manufacturer ? ` (${p.manufacturer})` : ''}
            </option>
          ))}
        </select>
        <button onClick={refresh} disabled={connected} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        {!connected ? (
          <button onClick={connect} disabled={!selected}>
            Connect
          </button>
        ) : (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: '#c0392b' }}>Error: {error}</div>
      )}

      {PINS.map((pin) => (
        <PinSettings
          key={pin}
          pin={pin}
          peak={peaks[pin]}
          connected={connected}
        />
      ))}
    </div>
  )
}
