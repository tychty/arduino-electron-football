import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createGameStateMachine, GameConfig, GameState, GameStateMachine } from '../game/gameStateMachine'
import { useSettingsCtx } from '../context/SettingsContext'
import { arduinoService } from '../services/arduinoService'
import { VIRTUAL_MISS_PIN, KB_SYNTHETIC_PEAK } from '../../../shared/config'

const INITIAL_STATE: GameState = {
  totalHits: 0,
  scores: {},
  flashingPins: new Set(),
  isGameOver: false,
  version: 0,
}

export function useGame(connected: boolean, keyboardEnabled: boolean) {
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
  const allPinsRef = useRef(allPins)

  useEffect(() => { allPinsRef.current = allPins }, [allPins])

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
      if (allPinsRef.current.includes(pin)) hit(pin, peak)
    })
  }, [connected, hit])

  useEffect(() => {
    if (!keyboardEnabled) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.repeat) return

      if (e.code === 'Space') {
        e.preventDefault()
        hit(VIRTUAL_MISS_PIN, KB_SYNTHETIC_PEAK)
        return
      }

      if (e.key >= '0' && e.key <= '9') {
        const pin = (Number(e.key) - 1 + 10) % 10
        if (!allPinsRef.current.includes(pin)) return
        hit(pin, KB_SYNTHETIC_PEAK)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyboardEnabled, hit])

  const score = useMemo(
    () => allPins.reduce((total, pin) => total + (gameState.scores[pin] ?? 0) * (configs[pin]?.scorePoints ?? 1), 0),
    [gameState.scores, allPins, configs]
  )

  return { ...gameState, hit, reset, peaks, score }
}
