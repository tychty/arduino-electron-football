import { useState, useEffect } from 'react'

export interface PinConfig {
  active: boolean
  miss: boolean
  scorePoints: number
}

interface UsePinConfigs {
  configs: Record<number, PinConfig>
  updateConfig: (pin: number, updates: Partial<PinConfig>) => void
}

function readPinConfig(pin: number): PinConfig {
  return {
    active: localStorage.getItem(`pin_${pin}_active`) !== 'false',
    miss: localStorage.getItem(`pin_${pin}_miss`) === 'true',
    scorePoints: Number(localStorage.getItem(`pin_${pin}_scorePoints`) ?? 1),
  }
}

function readAllConfigs(pins: number[]): Record<number, PinConfig> {
  return Object.fromEntries(pins.map((pin) => [pin, readPinConfig(pin)]))
}

export function usePinConfigs(allPins: number[]): UsePinConfigs {
  const [configs, setConfigs] = useState<Record<number, PinConfig>>(() => readAllConfigs(allPins))

  useEffect(() => {
    setConfigs(readAllConfigs(allPins))
  }, [allPins.join(',')])

  const updateConfig = (pin: number, updates: Partial<PinConfig>): void => {
    setConfigs((prev) => ({ ...prev, [pin]: { ...prev[pin], ...updates } }))
    if (updates.active !== undefined) localStorage.setItem(`pin_${pin}_active`, String(updates.active))
    if (updates.miss !== undefined) localStorage.setItem(`pin_${pin}_miss`, String(updates.miss))
    if (updates.scorePoints !== undefined)
      localStorage.setItem(`pin_${pin}_scorePoints`, String(updates.scorePoints))
  }

  return { configs, updateConfig }
}
