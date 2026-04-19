import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createGameStateMachine, GameConfig, GameState, GameStateMachine } from '../game/gameStateMachine'
import { useSettingsCtx } from '../context/SettingsContext'

const INITIAL_STATE: GameState = {
  totalHits: 0,
  scores: {},
  flashingPins: new Set(),
  isGameOver: false,
  version: 0,
}

export function useGame() {
  const { configs, hitDebounceMs, flashDuration, hitLimit } = useSettingsCtx()

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
  }, [])

  return { ...gameState, hit, reset }
}
