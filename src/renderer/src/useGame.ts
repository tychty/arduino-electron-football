import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { PinConfig } from './usePinConfigs'
import { VIRTUAL_MISS_PIN } from './config'

interface HitEvent {
  pin: number
  peak: number
}

interface GameState {
  hits: Record<number, number>
  score: number
  flashPin: number | null
  flashMiss: boolean
  resetScore: () => void
  injectHit: (pin: number, peak: number, debounceMs: number) => void
}

export function useGame(
  connected: boolean,
  allPins: number[],
  hitDebounceMs: number,
  flashDuration: number,
  pinConfigs: Record<number, PinConfig>
): GameState {
  const [hits, setHits] = useState<Record<number, number>>({})
  const [flashPin, setFlashPin] = useState<number | null>(null)
  const [flashMiss, setFlashMiss] = useState(false)

  const pendingRef = useRef<HitEvent[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinConfigsRef = useRef(pinConfigs)
  const flashDurationRef = useRef(flashDuration)

  useEffect(() => {
    pinConfigsRef.current = pinConfigs
  }, [pinConfigs])

  useEffect(() => {
    flashDurationRef.current = flashDuration
  }, [flashDuration])

  const resolveHit = useCallback(() => {
    const events = pendingRef.current
    pendingRef.current = []
    timerRef.current = null
    if (events.length === 0) return

    const winner = events.reduce((best, e) => (e.peak > best.peak ? e : best))
    const duration = flashDurationRef.current

    if (winner.pin === VIRTUAL_MISS_PIN) {
      setFlashMiss(true)
      setTimeout(() => setFlashMiss(false), duration)
      return
    }

    const config = pinConfigsRef.current[winner.pin]
    if (!config || !config.active) return

    if (config.miss) {
      setFlashMiss(true)
      setTimeout(() => setFlashMiss(false), duration)
      return
    }

    setHits((prev) => ({ ...prev, [winner.pin]: (prev[winner.pin] ?? 0) + 1 }))
    setFlashPin(winner.pin)
    setTimeout(() => setFlashPin(null), duration)
  }, [])

  const injectHit = useCallback(
    (pin: number, peak: number, debounceMs: number) => {
      pendingRef.current.push({ pin, peak })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(resolveHit, debounceMs)
    },
    [resolveHit]
  )

  useEffect(() => {
    if (!connected) return
    const unsub = window.arduino.onData((pin, peak) => {
      if (!allPins.includes(pin)) return
      injectHit(pin, peak, hitDebounceMs)
    })
    return () => {
      unsub()
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [connected, allPins, hitDebounceMs, injectHit])

  const score = useMemo(
    () =>
      allPins.reduce((total, pin) => {
        const hitCount = hits[pin] ?? 0
        const config = pinConfigs[pin]
        return total + hitCount * (config?.scorePoints ?? 1)
      }, 0),
    [hits, pinConfigs, allPins]
  )

  const resetScore = (): void => setHits({})

  return { hits, score, flashPin, flashMiss, resetScore, injectHit }
}
