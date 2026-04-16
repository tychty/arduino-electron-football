import { useState } from 'react'

const DEBOUNCE_DEFAULT = 200
const NOISE_DEFAULT = 5

interface PinSettings {
  debounce: number
  noise: number
  setDebounce: (value: number) => Promise<void>
  setNoise: (value: number) => Promise<void>
}

export function usePinSettings(pin: number, connected: boolean): PinSettings {
  const debounceKey = `pin_${pin}_debounce`
  const noiseKey = `pin_${pin}_noise`

  const [debounce, setDebounceState] = useState<number>(
    () => Number(localStorage.getItem(debounceKey) ?? DEBOUNCE_DEFAULT)
  )
  const [noise, setNoiseState] = useState<number>(
    () => Number(localStorage.getItem(noiseKey) ?? NOISE_DEFAULT)
  )

  const setDebounce = async (value: number): Promise<void> => {
    setDebounceState(value)
    localStorage.setItem(debounceKey, String(value))
    if (connected) await window.arduino.setDebounce(value, pin)
  }

  const setNoise = async (value: number): Promise<void> => {
    setNoiseState(value)
    localStorage.setItem(noiseKey, String(value))
    if (connected) await window.arduino.setNoiseTolerance(value, pin)
  }

  return { debounce, noise, setDebounce, setNoise }
}
