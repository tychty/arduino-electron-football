import { useState, useEffect } from 'react'

interface Port {
  path: string
  manufacturer?: string
}

export default function App(): JSX.Element {
  const [ports, setPorts] = useState<Port[]>([])
  const [selected, setSelected] = useState('')
  const [connected, setConnected] = useState(false)
  const [lastPeak, setLastPeak] = useState<number | null>(null)

  const refresh = async (): Promise<void> => {
    const list = await window.arduino.listPorts()
    setPorts(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!connected) return
    const unsub = window.arduino.onData((value) => setLastPeak(value))
    return unsub
  }, [connected])

  const connect = async (): Promise<void> => {
    if (!selected) return
    await window.arduino.connect(selected)
    setConnected(true)
  }

  const disconnect = async (): Promise<void> => {
    await window.arduino.disconnect()
    setConnected(false)
    setLastPeak(null)
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

      {connected && (
        <div style={{ marginTop: 24 }}>
          <div>connected to {selected}</div>
          <div style={{ marginTop: 12, fontSize: 64 }}>{lastPeak ?? '—'}</div>
          <div style={{ color: '#888' }}>last peak</div>
        </div>
      )}
    </div>
  )
}
