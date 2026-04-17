import { useState, useEffect, useRef, useCallback } from 'react'
import { createGameStateMachine, GameConfig, GameState, GameStateMachine } from './gameStateMachine'

const INITIAL_STATE: GameState = {
  totalHits: 0,
  scores: {},
  flashingPins: new Set(),
  isGameOver: false,
  version: 0,
}

export function useGame(config: GameConfig) {
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
