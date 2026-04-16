import { useState, useEffect } from 'react'
import ConnectionPanel from './ConnectionPanel'
import PinsGrid from './PinsGrid'

export default function App(): JSX.Element {
  const [connected, setConnected] = useState(false)
  const [peaks, setPeaks] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!connected) return
    const unsub = window.arduino.onData((pin, peak) => setPeaks((prev) => ({ ...prev, [pin]: peak })))
    return unsub
  }, [connected])

  const handleDisconnect = (): void => {
    setConnected(false)
    setPeaks({})
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h2>Arduino Serial</h2>

      <ConnectionPanel
        onConnectedChange={(c) => (c ? setConnected(true) : handleDisconnect())}
      />

      <PinsGrid peaks={peaks} connected={connected} />
    </div>
  )
}
