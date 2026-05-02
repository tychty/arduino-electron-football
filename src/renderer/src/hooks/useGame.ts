import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createGameStateMachine, GameConfig, GameState, GameStateMachine } from '../game/gameStateMachine'
import { useSettingsCtx } from '../context/SettingsContext'
import { arduinoService } from '../services/arduinoService'
import { VIRTUAL_MISS_PIN, COUNTDOWN_DURATION_S } from '../../../shared/config'

export type RoundPhase = 'idle' | 'countdown' | 'window' | 'result' | 'gameover'

const INITIAL_STATE: GameState = {
  totalHits: 0,
  scores: {},
  flashingPins: new Set(),
  isGameOver: false,
  version: 0,
}

interface GameOptions {
  onAbandon?: () => void
  onSummaryDismiss?: () => void
}

export function useGame(connected: boolean, keyboardEnabled: boolean, endless?: boolean, options?: GameOptions) {
  const { allPins, configs, hitWindowMs, flashDuration, hitLimit } = useSettingsCtx()

  const config = useMemo<GameConfig>(
    () => ({
      pinConfig: configs,
      flashDurationMs: flashDuration,
      hitLimit: endless ? Infinity : hitLimit,
    }),
    [configs, flashDuration, hitLimit, endless]
  )

  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const machineRef = useRef<GameStateMachine | null>(null)
  const [peaks, setPeaks] = useState<Record<number, number>>({})
  const allPinsRef = useRef(allPins)
  useEffect(() => { allPinsRef.current = allPins }, [allPins])

  // Round state machine
  const [roundPhase, setRoundPhaseState] = useState<RoundPhase>('idle')
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_DURATION_S)
  const [lastRoundResult, setLastRoundResult] = useState<{ isMiss: boolean; points: number } | null>(null)

  const phaseRef = useRef<RoundPhase>('idle')
  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const optionsRef = useRef(options)
  useEffect(() => { optionsRef.current = options }, [options])

  const setRoundPhase = useCallback((phase: RoundPhase) => {
    phaseRef.current = phase
    setRoundPhaseState(phase)
  }, [])

  const clearWindowTimer = useCallback(() => {
    if (windowTimerRef.current !== null) {
      clearTimeout(windowTimerRef.current)
      windowTimerRef.current = null
    }
  }, [])

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  const hitWindowMsRef = useRef(hitWindowMs)
  useEffect(() => { hitWindowMsRef.current = hitWindowMs }, [hitWindowMs])

  const openWindow = useCallback(() => {
    setRoundPhase('window')
    if (connected) arduinoService.setIgnore(false)
    windowTimerRef.current = setTimeout(() => {
      windowTimerRef.current = null
      machineRef.current?.hitImmediate(VIRTUAL_MISS_PIN)
    }, hitWindowMsRef.current)
  }, [setRoundPhase, connected])

  const startCountdown = useCallback(() => {
    clearCountdownInterval()
    clearWindowTimer()
    setCountdownValue(COUNTDOWN_DURATION_S)
    setRoundPhase('countdown')
    if (connected) arduinoService.setIgnore(true)

    let tick = COUNTDOWN_DURATION_S
    countdownIntervalRef.current = setInterval(() => {
      tick -= 1
      if (tick <= 0) {
        clearInterval(countdownIntervalRef.current!)
        countdownIntervalRef.current = null
        openWindow()
      } else {
        setCountdownValue(tick)
      }
    }, 1000)
  }, [clearCountdownInterval, clearWindowTimer, openWindow, setRoundPhase, connected])

  useEffect(() => {
    const m = createGameStateMachine(config, {
      onStateChange: setGameState,
      onGameOver: setGameState,
      onRoundResult: (isMiss, points, over) => {
        setLastRoundResult({ isMiss, points })
        setRoundPhase(over ? 'gameover' : 'result')
      },
    })
    machineRef.current = m
    return () => m.destroy()
  }, [config, setRoundPhase])

  const hit = useCallback((pin: number): void => {
    machineRef.current?.hit(pin)
  }, [])

  const reset = useCallback((): void => {
    clearCountdownInterval()
    clearWindowTimer()
    setRoundPhase('idle')
    setLastRoundResult(null)
    setCountdownValue(COUNTDOWN_DURATION_S)
    machineRef.current?.reset()
    setPeaks({})
    if (connected) arduinoService.setIgnore(false)
  }, [clearCountdownInterval, clearWindowTimer, setRoundPhase, connected])

  // Arduino hit handler
  useEffect(() => {
    if (!connected) return
    return arduinoService.onHit((pin, peak) => {
      setPeaks({ [pin]: peak })
      if (!allPinsRef.current.includes(pin)) return

      if (endless) {
        hit(pin)
      } else if (phaseRef.current === 'window') {
        clearWindowTimer()
        machineRef.current?.hitImmediate(pin)
      }
    })
  }, [connected, hit, endless, clearWindowTimer])

  // Keyboard handler
  useEffect(() => {
    if (!keyboardEnabled) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.repeat) return

      if (endless) {
        if (e.key >= '0' && e.key <= '9') {
          const pin = (Number(e.key) - 1 + 10) % 10
          if (!allPinsRef.current.includes(pin)) return
          hit(pin)
        }
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        if (phaseRef.current === 'idle' || phaseRef.current === 'result') {
          startCountdown()
        } else if (phaseRef.current === 'gameover') {
          optionsRef.current?.onSummaryDismiss?.()
        }
        return
      }

      if (e.key === 'Escape') {
        if (phaseRef.current === 'result') {
          optionsRef.current?.onAbandon?.()
        } else if (phaseRef.current === 'gameover') {
          optionsRef.current?.onSummaryDismiss?.()
        }
        return
      }

      if (e.key >= '0' && e.key <= '9') {
        if (phaseRef.current !== 'window') return
        const pin = (Number(e.key) - 1 + 10) % 10
        if (!allPinsRef.current.includes(pin)) return
        clearWindowTimer()
        machineRef.current?.hitImmediate(pin)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyboardEnabled, endless, hit, startCountdown, clearWindowTimer])

  const score = useMemo(
    () => allPins.reduce((total, pin) => total + (gameState.scores[pin] ?? 0) * (configs[pin]?.scorePoints ?? 1), 0),
    [gameState.scores, allPins, configs]
  )

  return { ...gameState, hit, reset, peaks, score, roundPhase, countdownValue, lastRoundResult }
}
