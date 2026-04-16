import { useState } from 'react'

const PINS_KEY = 'allPins'

interface UsePins {
  allPins: number[]
  addPin: () => void
  deletePin: (pin: number) => void
}

export function usePins(): UsePins {
  const [allPins, setAllPins] = useState<number[]>(() => {
    const stored = localStorage.getItem(PINS_KEY)
    return stored ? JSON.parse(stored) : [0]
  })

  const save = (pins: number[]): void => {
    setAllPins(pins)
    localStorage.setItem(PINS_KEY, JSON.stringify(pins))
  }

  const addPin = (): void => {
    save([...allPins, allPins.length])
  }

  const deletePin = (pin: number): void => {
    save(allPins.filter((p) => p !== pin))
  }

  return { allPins, addPin, deletePin }
}
