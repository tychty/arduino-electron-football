import { useState, useEffect } from 'react'
import ConnectionPanel from './ConnectionPanel'
import PinsGrid from './PinsGrid'
import HitDebounceSettings, { useHitDebounce } from './HitDebounceSettings'
import KeyboardDebounceSettings, { useKeyboardDebounce } from './KeyboardDebounceSettings'
import FlashDurationSettings, { useFlashDuration } from './FlashDurationSettings'
import FootballGoal from './FootballGoal'
import ScoreDisplay from './ScoreDisplay'
import { usePins } from './usePins'
import { usePinConfigs } from './usePinConfigs'
import { useGame } from './useGame'
import { useKeyboard } from './useKeyboard'
import { useConnection } from './useConnection'

export default function App(): JSX.Element {
  const { allPins, canAddPin, addPin, deletePin } = usePins()
  const { configs, updateConfig } = usePinConfigs(allPins)
  const { hitDebounceMs, setHitDebounceMs } = useHitDebounce()
  const { kbDebounceMs, setKbDebounceMs } = useKeyboardDebounce()
  const { flashDuration, setFlashDuration } = useFlashDuration()
  const { ports, selected, connected, error, setSelected, refresh, connect, disconnect } =
    useConnection(allPins)

  const [peaks, setPeaks] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!connected) return
    const unsub = window.arduino.onData((pin, peak) =>
      setPeaks((prev) => ({ ...prev, [pin]: peak }))
    )
    return unsub
  }, [connected])

  const handleDisconnect = (): void => {
    void disconnect()
    setPeaks({})
  }

  const { hits, score, flashPin, flashMiss, resetScore, injectHit } = useGame(
    connected,
    allPins,
    hitDebounceMs,
    flashDuration,
    configs
  )

  useKeyboard(allPins, kbDebounceMs, injectHit)

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
          canAddPin={canAddPin}
          onAddPin={addPin}
          onDeletePin={deletePin}
          onConfigChange={updateConfig}
        />
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HitDebounceSettings value={hitDebounceMs} onChange={setHitDebounceMs} />
          <KeyboardDebounceSettings value={kbDebounceMs} onChange={setKbDebounceMs} />
          <FlashDurationSettings value={flashDuration} onChange={setFlashDuration} />
        </div>
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
