import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { PinConfig } from './useSettings'
import { VIRTUAL_MISS_PIN } from '../../shared/config'
import {
  createGameStateMachine,
  GameConfig,
  GameState,
  GameStateMachine,
} from './gameStateMachine'
import { arduinoService } from './services/arduinoService'

const INITIAL_STATE: GameState = {
  totalHits: 0,
  scores: {},
  flashingPins: new Set(),
  isGameOver: false,
  version: 0,
}

export function useGame(
  connected: boolean,
  allPins: number[],
  hitDebounceMs: number,
  flashDuration: number,
  pinConfigs: Record<number, PinConfig>,
  hitLimit: number
) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const machineRef = useRef<GameStateMachine | null>(null)

  const config = useMemo<GameConfig>(
    () => ({ pinConfig: pinConfigs, hitDebounceMs, flashDurationMs: flashDuration, hitLimit }),
    [pinConfigs, hitDebounceMs, flashDuration, hitLimit]
  )

  useEffect(() => {
    const m = createGameStateMachine(config, {
      onStateChange: setGameState,
      onGameOver: setGameState,
    })
    machineRef.current = m
    return () => m.destroy()
  }, [config])

  useEffect(() => {
    if (!connected) return
    return arduinoService.onHit((pin, peak) => {
      if (!allPins.includes(pin)) return
      machineRef.current?.hit(pin, peak, Date.now())
    })
  }, [connected, allPins])

  const score = useMemo(
    () =>
      allPins.reduce((total, pin) => {
        const hitCount = gameState.scores[pin] ?? 0
        return total + hitCount * (pinConfigs[pin]?.scorePoints ?? 1)
      }, 0),
    [gameState.scores, pinConfigs, allPins]
  )

  const injectHit = useCallback((pin: number, peak: number, _debounceMs: number): void => {
    machineRef.current?.hit(pin, peak, Date.now())
  }, [])

  const resetScore = useCallback((): void => {
    machineRef.current?.reset()
  }, [])

  const flashPin = useMemo(
    () => [...gameState.flashingPins].find((p) => p !== VIRTUAL_MISS_PIN) ?? null,
    [gameState.flashingPins]
  )
  const flashMiss = gameState.flashingPins.has(VIRTUAL_MISS_PIN)

  return {
    hits: gameState.scores,
    totalHits: gameState.totalHits,
    score,
    gameOver: gameState.isGameOver,
    flashPin,
    flashMiss,
    resetScore,
    injectHit,
  }
}
