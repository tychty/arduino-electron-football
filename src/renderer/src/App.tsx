import { useState, useEffect } from 'react'

interface Port {
  path: string
  manufacturer?: string
}

interface PinConfig {
  debounce: number
  noise: number
}

const DEBOUNCE_DEFAULT = 200
const NOISE_DEFAULT = 5

function loadConfig(): { debounce: number; noise: number } {
  return {
    debounce: Number(localStorage.getItem('debounceMs') ?? DEBOUNCE_DEFAULT),
    noise: Number(localStorage.getItem('noiseTolerance') ?? NOISE_DEFAULT)
  }
}

function loadPinConfigs(): Record<number, PinConfig> {
  try {
    const raw = localStorage.getItem('pinConfigs')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function savePinConfigs(configs: Record<number, PinConfig>): void {
  localStorage.setItem('pinConfigs', JSON.stringify(configs))
}

export default function App(): JSX.Element {
  const [ports, setPorts] = useState<Port[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [peaks, setPeaks] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [debounce, setDebounce] = useState(() => loadConfig().debounce)
  const [noise, setNoise] = useState(() => loadConfig().noise)
  const [pinConfigs, setPinConfigs] = useState<Record<number, PinConfig>>(() => loadPinConfigs())

  const knownPins = [...new Set([
    ...Object.keys(peaks).map(Number),
    ...Object.keys(pinConfigs).map(Number)
  ])].sort((a, b) => a - b)

  const getPinDebounce = (pin: number): number => pinConfigs[pin]?.debounce ?? debounce
  const getPinNoise = (pin: number): number => pinConfigs[pin]?.noise ?? noise

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
    for (const [pin, cfg] of Object.entries(pinConfigs)) {
      await window.arduino.setDebounce(cfg.debounce, Number(pin))
      await window.arduino.setNoiseTolerance(cfg.noise, Number(pin))
    }
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

  const handlePinDebounceChange = async (pin: number, value: number): Promise<void> => {
    const next = { ...pinConfigs, [pin]: { ...pinConfigs[pin] ?? { debounce, noise }, debounce: value } }
    setPinConfigs(next)
    savePinConfigs(next)
    if (connected) await window.arduino.setDebounce(value, pin)
  }

  const handlePinNoiseChange = async (pin: number, value: number): Promise<void> => {
    const next = { ...pinConfigs, [pin]: { ...pinConfigs[pin] ?? { debounce, noise }, noise: value } }
    setPinConfigs(next)
    savePinConfigs(next)
    if (connected) await window.arduino.setNoiseTolerance(value, pin)
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

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 8 }}>All pins</h4>

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

        {knownPins.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 8 }}>Per-pin overrides</h4>
            {knownPins.map((pin) => (
              <div key={pin} style={{ marginBottom: 20, paddingLeft: 12, borderLeft: '2px solid #ccc' }}>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Pin {pin}</div>

                <div style={{ marginBottom: 12 }}>
                  <label>Debounce: {getPinDebounce(pin)}ms</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <input
                      type="range"
                      min={100}
                      max={500}
                      step={10}
                      value={getPinDebounce(pin)}
                      onChange={(e) => handlePinDebounceChange(pin, Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min={1}
                      value={getPinDebounce(pin)}
                      style={{ width: 64 }}
                      onChange={(e) => handlePinDebounceChange(pin, Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label>Noise tolerance: {getPinNoise(pin)}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={Math.min(getPinNoise(pin), 10)}
                      onChange={(e) => handlePinNoiseChange(pin, Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min={0}
                      value={getPinNoise(pin)}
                      style={{ width: 64 }}
                      onChange={(e) => handlePinNoiseChange(pin, Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
