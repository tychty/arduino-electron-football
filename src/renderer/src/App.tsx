import { useState, useEffect } from 'react'
import ConnectionPanel from './ConnectionPanel'
import PinsGrid from './PinsGrid'
import HitDebounceSettings, { useHitDebounce } from './HitDebounceSettings'
import FootballGoal from './FootballGoal'
import ScoreDisplay from './ScoreDisplay'
import { usePins } from './usePins'
import { usePinConfigs } from './usePinConfigs'
import { useGame } from './useGame'
import { useConnection } from './useConnection'

export default function App(): JSX.Element {
  const { allPins, addPin, deletePin } = usePins()
  const { configs, updateConfig } = usePinConfigs(allPins)
  const { hitDebounceMs, setHitDebounceMs } = useHitDebounce()
  const { ports, selected, connected, error, setSelected, refresh, connect, disconnect } =
    useConnection(allPins)

  const [peaks, setPeaks] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!connected) return
    const unsub = window.arduino.onData((pin, peak) => setPeaks((prev) => ({ ...prev, [pin]: peak })))
    return unsub
  }, [connected])

  const handleDisconnect = (): void => {
    void disconnect()
    setPeaks({})
  }

  const { hits, score, flashPin, flashMiss, resetScore } = useGame(
    connected,
    allPins,
    hitDebounceMs,
    configs
  )

  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h2>Arduino Serial</h2>

      <ConnectionPanel
        ports={ports}
        selected={selected}
        connected={connected}
        error={error}
        onSetSelected={setSelected}
        onRefresh={refresh}
        onConnect={connect}
        onDisconnect={handleDisconnect}
      />

      <div style={{ marginTop: 24 }}>
        <PinsGrid
          allPins={allPins}
          peaks={peaks}
          connected={connected}
          pinConfigs={configs}
          onAddPin={addPin}
          onDeletePin={deletePin}
          onConfigChange={updateConfig}
        />
        <HitDebounceSettings value={hitDebounceMs} onChange={setHitDebounceMs} />
      </div>

      <div style={{ marginTop: 32 }}>
        <FootballGoal
          allPins={allPins}
          pinConfigs={configs}
          hits={hits}
          flashPin={flashPin}
          flashMiss={flashMiss}
        />
        <ScoreDisplay score={score} onReset={resetScore} />
      </div>
    </div>
  )
}
