import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createGameStateMachine, GameConfig, GameState, GameStateMachine } from '../game/gameStateMachine'
import { useSettingsCtx } from '../context/SettingsContext'
import { arduinoService } from '../services/arduinoService'

const INITIAL_STATE: GameState = {
  totalHits: 0,
  scores: {},
  flashingPins: new Set(),
  isGameOver: false,
  version: 0,
}

export function useGame(connected: boolean) {
  const { allPins, configs, hitDebounceMs, flashDuration, hitLimit } = useSettingsCtx()

  const config = useMemo<GameConfig>(
    () => ({
      pinConfig: configs,
      hitDebounceMs,
      flashDurationMs: flashDuration,
      hitLimit,
    }),
    [configs, hitDebounceMs, flashDuration, hitLimit]
  )

  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const machineRef = useRef<GameStateMachine | null>(null)
  const [peaks, setPeaks] = useState<Record<number, number>>({})

  useEffect(() => {
    const m = createGameStateMachine(config, {
      onStateChange: setGameState,
      onGameOver: setGameState,
    })
    machineRef.current = m
    return () => m.destroy()
  }, [config])

  const hit = useCallback((pin: number, peak: number): void => {
    machineRef.current?.hit(pin, peak, Date.now())
  }, [])

  const reset = useCallback((): void => {
    machineRef.current?.reset()
    setPeaks({})
  }, [])

  useEffect(() => {
    if (!connected) return
    return arduinoService.onHit((pin, peak) => {
      setPeaks((prev) => ({ ...prev, [pin]: peak }))
      if (allPins.includes(pin)) hit(pin, peak)
    })
  }, [connected, allPins, hit])

  const score = useMemo(
    () => allPins.reduce((total, pin) => total + (gameState.scores[pin] ?? 0) * (configs[pin]?.scorePoints ?? 1), 0),
    [gameState.scores, allPins, configs]
  )

  return { ...gameState, hit, reset, peaks, score }
}
