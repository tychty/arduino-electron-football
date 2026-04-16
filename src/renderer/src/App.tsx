import { useState, useEffect } from 'react'
import { PINS } from './pins'
import ConnectionPanel from './ConnectionPanel'
import PinSettings from './PinSettings'

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
