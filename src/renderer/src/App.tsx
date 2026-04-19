import { useState, useEffect, useMemo } from 'react'
import { arduinoService } from './services/arduinoService'
import { useSettingsCtx } from './context/SettingsContext'
import { useConnection } from './hooks/useConnection'
import { useGame } from './hooks/useGame'
import { useKeyboard } from './hooks/useKeyboard'
import { useLeaderboard } from './hooks/useLeaderboard'
import ConnectionIndicator from './components/ConnectionIndicator'
import EndGameModal from './components/EndGameModal'
import LeaderboardPage from './pages/LeaderboardPage'
import GamePage from './pages/GamePage'
import SettingsPage from './pages/SettingsPage'

type Page = 'leaderboard' | 'game' | 'settings'

export default function App(): JSX.Element {
  const [page, setPage] = useState<Page>('leaderboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [peaks, setPeaks] = useState<Record<number, number>>({})

  const { allPins, settings } = useSettingsCtx()
  const { ports, selected, connected, error, setSelected, refresh, connect, disconnect } =
    useConnection()
  const { scores, totalHits, flashingPins, isGameOver, hit, reset } = useGame()

  useEffect(() => {
    if (!connected) return
    return arduinoService.onHit((pin, peak) => {
      setPeaks((prev) => ({ ...prev, [pin]: peak }))
      if (allPins.includes(pin)) hit(pin, peak)
    })
  }, [connected, allPins, hit])

  useKeyboard(hit, page === 'game' && !modalOpen)

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
          scores={scores}
          totalHits={totalHits}
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
          peaks={peaks}
          onSetSelected={setSelected}
          onRefresh={refresh}
          onConnect={connect}
          onDisconnect={handleDisconnect}
          onBack={() => setPage('leaderboard')}
        />
      )}

      {modalOpen && <EndGameModal score={score} onDone={handleModalDone} />}
    </>
  )
}
