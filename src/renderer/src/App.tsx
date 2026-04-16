import { useState, useEffect } from 'react'

interface Port {
  path: string
  manufacturer?: string
}

const DEBOUNCE_DEFAULT = 200
const NOISE_DEFAULT = 5

function loadConfig(): { debounce: number; noise: number } {
  return {
    debounce: Number(localStorage.getItem('debounceMs') ?? DEBOUNCE_DEFAULT),
    noise: Number(localStorage.getItem('noiseTolerance') ?? NOISE_DEFAULT)
  }
}

export default function App(): JSX.Element {
  const [ports, setPorts] = useState<Port[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [peaks, setPeaks] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [debounce, setDebounce] = useState(() => loadConfig().debounce)
  const [noise, setNoise] = useState(() => loadConfig().noise)

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
    await window.arduino.setDebounce(debounce)
    await window.arduino.setNoiseTolerance(noise)
  }

  const disconnect = async (): Promise<void> => {
    await window.arduino.disconnect()
    setConnected(false)
    setPeaks({})
  }

  const handleDebounceChange = async (value: number): Promise<void> => {
    setDebounce(value)
    localStorage.setItem('debounceMs', String(value))
    if (connected) await window.arduino.setDebounce(value)
  }

  const handleNoiseChange = async (value: number): Promise<void> => {
    setNoise(value)
    localStorage.setItem('noiseTolerance', String(value))
    if (connected) await window.arduino.setNoiseTolerance(value)
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

      <div>
        {!connected ? (
          <button onClick={connect} disabled={!selected}>
            Connect
          </button>
        ) : (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 12, color: '#c0392b' }}>Error: {error}</div>
      )}

      {connected && (
        <div style={{ marginTop: 24 }}>
          <div>connected to {selected}</div>
          <div style={{ marginTop: 12 }}>
            {Object.keys(peaks).length === 0 ? (
              <span style={{ fontSize: 64 }}>—</span>
            ) : (
              Object.entries(peaks).map(([pin, peak]) => (
                <div key={pin} style={{ fontSize: 32 }}>
                  pin {pin}: {peak}
                </div>
              ))
            )}
          </div>
          <div style={{ color: '#888' }}>last peaks</div>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 12 }}>Settings</h3>

        <div style={{ marginBottom: 16 }}>
          <label>Debounce: {debounce}ms</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="range"
              min={100}
              max={500}
              step={10}
              value={debounce}
              onChange={(e) => handleDebounceChange(Number(e.target.value))}
            />
            <input
              type="number"
              min={1}
              value={debounce}
              style={{ width: 64 }}
              onChange={(e) => handleDebounceChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label>Noise tolerance: {noise}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={Math.min(noise, 10)}
              onChange={(e) => handleNoiseChange(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              value={noise}
              style={{ width: 64 }}
              onChange={(e) => handleNoiseChange(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
