import { useState, useEffect, useCallback, useRef } from 'react'
import { useConnection } from './hooks/useConnection'
import { useGame } from './hooks/useGame'
import { useLeaderboardCtx } from './context/LeaderboardContext'
import { arduinoService } from './services/arduinoService'
import ConnectionIndicator from './components/ConnectionIndicator'
import PlayerInfoModal, { PlayerInfo } from './components/PlayerInfoModal'

import LeaderboardPage from './pages/LeaderboardPage'
import GamePage from './pages/GamePage'
import SettingsPage from './pages/SettingsPage'

type Page = 'leaderboard' | 'game' | 'settings' | 'layout'

export default function App(): JSX.Element {
  const [page, setPage] = useState<Page>('leaderboard')
  const [showPlayerInfo, setShowPlayerInfo] = useState(false)
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null)
  const [summaryData, setSummaryData] = useState<{ score: number; rank: number } | null>(null)
  const savingRef = useRef(false)

  const { ports, selected, connected, tryingPort, setSelected } = useConnection()

  const { entries, reload } = useLeaderboardCtx()

  const handleAbandon = useCallback((): void => {
    setSummaryData(null)
    setPage('leaderboard')
  }, [])

  const handleSummaryDismiss = useCallback((): void => {
    setSummaryData(null)
    setPage('leaderboard')
  }, [])

  const { scores, totalHits, flashingPins, reset, peaks, score, roundPhase, countdownValue, lastRoundResult } = useGame(
    connected,
    page === 'game',
    false,
    { onAbandon: handleAbandon, onSummaryDismiss: handleSummaryDismiss }
  )

  const reloadRef = useRef(reload)
  useEffect(() => { reloadRef.current = reload }, [reload])
  const scoreRef = useRef(score)
  useEffect(() => { scoreRef.current = score }, [score])

  // Auto-save and show summary when last round resolves
  useEffect(() => {
    if (roundPhase !== 'gameover' || page !== 'game' || !playerInfo || savingRef.current) return
    savingRef.current = true
    const doSave = async (): Promise<void> => {
      const s = scoreRef.current
      const date = new Date().toISOString()
      await arduinoService.appendLeaderboard(playerInfo.name, playerInfo.company, playerInfo.email, s, date)
      const data = await arduinoService.readLeaderboard()
      const rank = data.filter((e) => e.score > s).length + 1
      await reloadRef.current()
      setSummaryData({ score: s, rank })
    }
    doSave()
  }, [roundPhase, page, playerInfo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (page === 'leaderboard') {
        if (!showPlayerInfo && e.key === 'F2') { setPage('settings'); return }
        if (!showPlayerInfo && (e.key === ' ' || e.code === 'Space')) {
          e.preventDefault()
          handleNewGame()
        }
      }
      if (page === 'settings' && e.key === 'Escape') {
        setPage('leaderboard')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, showPlayerInfo])

  const handleNewGame = (): void => {
    setShowPlayerInfo(true)
  }

  const handlePlayerInfoConfirm = (info: PlayerInfo): void => {
    setPlayerInfo(info)
    setShowPlayerInfo(false)
    savingRef.current = false
    reset()
    setPage('game')
  }

  const handleEditLayout = (): void => {
    reset()
    setPage('layout')
  }

  return (
    <>
      <ConnectionIndicator connected={connected} tryingPort={tryingPort} />

      {page === 'leaderboard' && (
        <LeaderboardPage
          entries={entries}
          onNewGame={handleNewGame}
        />
      )}

      {page === 'game' && (
        <GamePage
          scores={scores}
          totalHits={totalHits}
          score={score}
          flashingPins={flashingPins}
          roundPhase={roundPhase}
          countdownValue={countdownValue}
          lastRoundResult={lastRoundResult}
          summaryData={summaryData}
          onEndGame={() => {}}
          playerName={playerInfo?.name ?? ''}
        />
      )}

      {page === 'layout' && (
        <GamePage
          scores={scores}
          totalHits={totalHits}
          score={score}
          flashingPins={flashingPins}
          roundPhase={roundPhase}
          countdownValue={countdownValue}
          onEndGame={() => { reset(); setPage('settings') }}
          endless
          editLayout
        />
      )}

      {page === 'settings' && (
        <SettingsPage
          ports={ports}
          selected={selected}
          connected={connected}
          peaks={peaks}
          onSetSelected={setSelected}
          onBack={() => setPage('leaderboard')}
          onEditLayout={handleEditLayout}
        />
      )}

      {showPlayerInfo && <PlayerInfoModal onConfirm={handlePlayerInfoConfirm} onCancel={() => setShowPlayerInfo(false)} />}
    </>
  )
}
