import { useState, useEffect, useMemo } from 'react'
import { arduinoService } from './services/arduinoService'
import { usePins } from './usePins'
import { useSettings } from './useSettings'
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
  const settings = useSettings(allPins)
  const { ports, selected, connected, error, setSelected, refresh, connect, disconnect } =
    useConnection(allPins)

  const [peaks, setPeaks] = useState<Record<number, number>>({})

  const { game } = settings

  const gameConfig = useMemo(
    () => ({
      pinConfig: settings.pinConfigs,
      hitDebounceMs: game.hitDebounceMs,
      flashDurationMs: game.flashDuration,
      hitLimit: game.hitLimit,
    }),
    [settings.pinConfigs, game.hitDebounceMs, game.flashDuration, game.hitLimit]
  )

  const { scores, totalHits, flashingPins, isGameOver, hit, reset } = useGame(gameConfig)

  useEffect(() => {
    if (!connected) return
    return arduinoService.onHit((pin, peak) => {
      setPeaks((prev) => ({ ...prev, [pin]: peak }))
      if (allPins.includes(pin)) hit(pin, peak)
    })
  }, [connected, allPins, hit])

  useKeyboard(allPins, game.kbDebounceMs, hit, page === 'game' && !modalOpen)

  const score = useMemo(
    () =>
      allPins.reduce((total, pin) => {
        return total + (scores[pin] ?? 0) * (settings.pinConfigs[pin]?.scorePoints ?? 1)
      }, 0),
    [scores, allPins, settings.pinConfigs]
  )

  const { entries, append, reload } = useLeaderboard()

  useEffect(() => {
    if (isGameOver && page === 'game' && !modalOpen) {
      setModalOpen(true)
    }
  }, [isGameOver, page, modalOpen])

  const handleDisconnect = (): void => {
    void disconnect()
    setPeaks({})
  }

  const handleNewGame = (): void => {
    reset()
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
    reset()
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
          pinConfigs={settings.pinConfigs}
          scores={scores}
          totalHits={totalHits}
          hitLimit={game.hitLimit}
          score={score}
          flashingPins={flashingPins}
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
          settings={settings}
          canAddPin={canAddPin}
          onSetSelected={setSelected}
          onRefresh={refresh}
          onConnect={connect}
          onDisconnect={handleDisconnect}
          onAddPin={addPin}
          onDeletePin={deletePin}
          onBack={() => setPage('leaderboard')}
        />
      )}

      {modalOpen && <EndGameModal score={score} onDone={handleModalDone} />}
    </>
  )
}
