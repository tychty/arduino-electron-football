import { useEffect, useRef } from 'react'
import { VIRTUAL_MISS_PIN, KB_SYNTHETIC_PEAK } from '../../../shared/config'
import { useSettingsCtx } from '../context/SettingsContext'

export function useKeyboard(
  hit: (pin: number, peak: number) => void,
  enabled: boolean = true
): void {
  const { allPins, kbDebounceMs } = useSettingsCtx()
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
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.repeat) return

      const now = Date.now()
      const lastFire = lastFireRef.current[e.code] ?? 0
      if (now - lastFire < kbDebounceRef.current) return
      lastFireRef.current[e.code] = now

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
  }, [hit, enabled])
}
