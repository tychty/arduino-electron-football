import { useEffect, useRef } from 'react'
import { VIRTUAL_MISS_PIN, KB_SYNTHETIC_PEAK } from './config'

export function useKeyboard(
  allPins: number[],
  kbDebounceMs: number,
  injectHit: (pin: number, peak: number, debounceMs: number) => void
): void {
  const allPinsRef = useRef(allPins)
  const kbDebounceRef = useRef(kbDebounceMs)
  const lastFireRef = useRef<Record<string, number>>({})

  useEffect(() => {
    allPinsRef.current = allPins
  }, [allPins])

  useEffect(() => {
    kbDebounceRef.current = kbDebounceMs
  }, [kbDebounceMs])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.repeat) return

      const now = Date.now()
      const lastFire = lastFireRef.current[e.code] ?? 0
      if (now - lastFire < kbDebounceRef.current) return
      lastFireRef.current[e.code] = now

      if (e.code === 'Space') {
        e.preventDefault()
        injectHit(VIRTUAL_MISS_PIN, KB_SYNTHETIC_PEAK, kbDebounceRef.current)
        return
      }

      if (e.key >= '0' && e.key <= '9') {
        // key = (pin + 1) % 10  →  pin = (key - 1 + 10) % 10
        const pin = (Number(e.key) - 1 + 10) % 10
        if (!allPinsRef.current.includes(pin)) return
        injectHit(pin, KB_SYNTHETIC_PEAK, kbDebounceRef.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [injectHit])
}
