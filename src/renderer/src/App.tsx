import { useState, useEffect } from 'react'
import { usePins } from './usePins'
import { usePinConfigs } from './usePinConfigs'
import { useHitDebounce } from './HitDebounceSettings'
import { useKeyboardDebounce } from './KeyboardDebounceSettings'
import { useFlashDuration } from './FlashDurationSettings'
import { useHitLimit } from './HitLimitSettings'
import { useConnection } from './useConnection'
import { useGame } from './useGame'
import { useKeyboard } from './useKeyboard'
import { useLeaderboard } from './useLeaderboard'
import ConnectionIndicator from './ConnectionIndicator'
import EndGameModal from './EndGameModal'
import LeaderboardPage from './pages/LeaderboardPage'
import GamePage from './pages/GamePage'
import SettingsPage from './pages/SettingsPage'

type Page = 'leaderboard' | 'game' | 'settings'

export default function App(): JSX.Element {
  const [page, setPage] = useState<Page>('leaderboard')
  const [modalOpen, setModalOpen] = useState(false)

  const { allPins, canAddPin, addPin, deletePin } = usePins()
  const { configs, updateConfig } = usePinConfigs(allPins)
  const { hitDebounceMs, setHitDebounceMs } = useHitDebounce()
  const { kbDebounceMs, setKbDebounceMs } = useKeyboardDebounce()
  const { flashDuration, setFlashDuration } = useFlashDuration()
  const { hitLimit, setHitLimit } = useHitLimit()
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

  const { hits, totalHits, score, gameOver, flashPin, flashMiss, resetScore, injectHit } = useGame(
    connected,
    allPins,
    hitDebounceMs,
    flashDuration,
    configs,
    hitLimit
  )

  useKeyboard(allPins, kbDebounceMs, injectHit, page === 'game' && !modalOpen)

  const { entries, append, reload } = useLeaderboard()

  // open modal when game ends naturally
  useEffect(() => {
    if (gameOver && page === 'game' && !modalOpen) {
      setModalOpen(true)
    }
  }, [gameOver, page])

  const handleNewGame = (): void => {
    resetScore()
    setPage('game')
  }

  const handleEndGame = (): void => {
    setModalOpen(true)
  }

  const handleModalDone = async (name: string | null): Promise<void> => {
    if (name) {
      await append(name, score)
    } else {
      await reload()
    }
    setModalOpen(false)
    resetScore()
    setPage('leaderboard')
  }

  return (
    <>
      <ConnectionIndicator connected={connected} />

      {page === 'leaderboard' && (
        <LeaderboardPage
          entries={entries}
          onNewGame={handleNewGame}
          onSettings={() => setPage('settings')}
        />
      )}

      {page === 'game' && (
        <GamePage
          allPins={allPins}
          pinConfigs={configs}
          hits={hits}
          totalHits={totalHits}
          hitLimit={hitLimit}
          score={score}
          flashPin={flashPin}
          flashMiss={flashMiss}
          onEndGame={handleEndGame}
        />
      )}

      {page === 'settings' && (
        <SettingsPage
          ports={ports}
          selected={selected}
          connected={connected}
          connectionError={error}
          allPins={allPins}
          peaks={peaks}
          pinConfigs={configs}
          canAddPin={canAddPin}
          hitDebounceMs={hitDebounceMs}
          kbDebounceMs={kbDebounceMs}
          flashDuration={flashDuration}
          hitLimit={hitLimit}
          onSetSelected={setSelected}
          onRefresh={refresh}
          onConnect={connect}
          onDisconnect={handleDisconnect}
          onAddPin={addPin}
          onDeletePin={deletePin}
          onConfigChange={updateConfig}
          onHitDebounceChange={setHitDebounceMs}
          onKbDebounceChange={setKbDebounceMs}
          onFlashDurationChange={setFlashDuration}
          onHitLimitChange={setHitLimit}
          onBack={() => setPage('leaderboard')}
        />
      )}

      {modalOpen && (
        <EndGameModal score={score} onDone={handleModalDone} />
      )}
    </>
  )
}
