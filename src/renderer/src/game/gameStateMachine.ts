import { VIRTUAL_MISS_PIN } from '../../../shared/config'
import { PinConfig } from '../hooks/useSettings'

export interface GameConfig {
  pinConfig: Record<number, PinConfig>
  hitDebounceMs: number
  flashDurationMs: number
  hitLimit: number
}

export interface GameState {
  totalHits: number
  scores: Readonly<Record<number, number>>
  flashingPins: ReadonlySet<number>
  isGameOver: boolean
  version: number
}

export interface GameMachineCallbacks {
  onStateChange: (state: GameState) => void
  onGameOver: (finalState: GameState) => void
  onRoundResult?: (isMiss: boolean, points: number, isGameOver: boolean) => void
}

export interface GameStateMachine {
  hit(pin: number, peak: number, timestampMs: number): void
  hitImmediate(pin: number): void
  getState(): GameState
  reset(): void
  destroy(): void
}

export function createGameStateMachine(
  config: GameConfig,
  callbacks: GameMachineCallbacks
): GameStateMachine {
  let totalHits = 0
  let scores: Record<number, number> = {}
  let flashingPins = new Set<number>()
  let isGameOver = false
  let version = 0
  let gameOverFired = false
  let destroyed = false

  let pendingPin: number | null = null
  let pendingPeak = -Infinity
  let pendingTimer: ReturnType<typeof setTimeout> | null = null
  const flashTimers = new Map<number, ReturnType<typeof setTimeout>>()

  function snapshot(): GameState {
    return {
      totalHits,
      scores: { ...scores },
      flashingPins: new Set(flashingPins),
      isGameOver,
      version,
    }
  }

  function emit(): void {
    if (destroyed) return
    const state = snapshot()
    callbacks.onStateChange(state)
    if (state.isGameOver && !gameOverFired) {
      gameOverFired = true
      callbacks.onGameOver(state)
    }
  }

  function resolveHit(pin: number): void {
    if (destroyed || isGameOver) return

    totalHits += 1
    version += 1

    const cfg = config.pinConfig[pin]
    const isMiss = pin === VIRTUAL_MISS_PIN || !cfg?.active || !!cfg?.miss

    if (!isMiss) {
      scores = { ...scores, [pin]: (scores[pin] ?? 0) + 1 }
    }

    if (totalHits >= config.hitLimit) {
      isGameOver = true
    }

    const roundPoints = isMiss ? 0 : (cfg?.scorePoints ?? 1)

    const flashTarget = isMiss ? VIRTUAL_MISS_PIN : pin
    const prevFlash = flashTimers.get(flashTarget)
    if (prevFlash) clearTimeout(prevFlash)

    flashingPins = new Set(flashingPins)
    flashingPins.add(flashTarget)

    flashTimers.set(
      flashTarget,
      setTimeout(() => {
        if (destroyed) return
        flashTimers.delete(flashTarget)
        flashingPins = new Set(flashingPins)
        flashingPins.delete(flashTarget)
        version += 1
        callbacks.onStateChange(snapshot())
      }, config.flashDurationMs)
    )

    emit()
    callbacks.onRoundResult?.(isMiss, roundPoints, isGameOver)
  }

  function hitImmediate(pin: number): void {
    if (destroyed || isGameOver) return
    resolveHit(pin)
  }

  function hit(pin: number, peak: number, _timestampMs: number): void {
    if (destroyed || isGameOver) return
    if (peak < pendingPeak) return

    if (pendingTimer !== null) clearTimeout(pendingTimer)
    pendingPin = pin
    pendingPeak = peak
    pendingTimer = setTimeout(() => {
      pendingTimer = null
      const p = pendingPin
      pendingPin = null
      pendingPeak = -Infinity
      if (p !== null) resolveHit(p)
    }, config.hitDebounceMs)
  }

  function getState(): GameState {
    return snapshot()
  }

  function reset(): void {
    if (destroyed) return

    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
      pendingTimer = null
    }
    pendingPin = null
    pendingPeak = -Infinity

    flashTimers.forEach(clearTimeout)
    flashTimers.clear()

    totalHits = 0
    scores = {}
    flashingPins = new Set()
    isGameOver = false
    gameOverFired = false
    version += 1

    callbacks.onStateChange(snapshot())
  }

  function destroy(): void {
    destroyed = true
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
      pendingTimer = null
    }
    flashTimers.forEach(clearTimeout)
    flashTimers.clear()
  }

  return { hit, hitImmediate, getState, reset, destroy }
}
