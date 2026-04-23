import { useState, useEffect } from 'react'
import { arduinoService } from '../services/arduinoService'
import {
  HIT_DEBOUNCE_DEFAULT,
  FLASH_DURATION_DEFAULT,
  HIT_LIMIT_DEFAULT,
  DEBOUNCE_DEFAULT,
  NOISE_DEFAULT,
  SCORE_POINTS_DEFAULT,
} from '../../../shared/config'

export interface PinConfig {
  active: boolean
  miss: boolean
  scorePoints: number
}

export interface PinHardware {
  debounce: number
  noise: number
}

export interface GameSettings {
  hitDebounceMs: number
  flashDuration: number
  hitLimit: number
}

export interface SettingsService {
  game: GameSettings
  setGame: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
  pinConfigs: Record<number, PinConfig>
  pinConfig: (pin: number) => PinConfig
  setPinConfig: (pin: number, updates: Partial<PinConfig>) => void
  pinHardware: (pin: number) => PinHardware
  setPinHardware: (pin: number, updates: Partial<PinHardware>, connected: boolean) => Promise<void>
}

const GAME_KEYS: Record<keyof GameSettings, string> = {
  hitDebounceMs: 'hitDebounceMs',
  flashDuration: 'flashDuration',
  hitLimit: 'hitLimit',
}

const GAME_CLAMP: Record<keyof GameSettings, (v: number) => number> = {
  hitDebounceMs: (v) => (isNaN(v) ? HIT_DEBOUNCE_DEFAULT : v),
  flashDuration: (v) => (isNaN(v) ? FLASH_DURATION_DEFAULT : v),
  hitLimit: (v) => Math.floor(isNaN(v) ? HIT_LIMIT_DEFAULT : v),
}

function load<K extends keyof GameSettings>(key: K, def: GameSettings[K]): GameSettings[K] {
  return GAME_CLAMP[key](Number(localStorage.getItem(GAME_KEYS[key]) ?? def)) as GameSettings[K]
}

function loadGame(): GameSettings {
  return {
    hitDebounceMs: load('hitDebounceMs', HIT_DEBOUNCE_DEFAULT),
    flashDuration: load('flashDuration', FLASH_DURATION_DEFAULT),
    hitLimit: load('hitLimit', HIT_LIMIT_DEFAULT),
  }
}

function readPinConfig(pin: number): PinConfig {
  return {
    active: localStorage.getItem(`pin_${pin}_active`) !== 'false',
    miss: localStorage.getItem(`pin_${pin}_miss`) === 'true',
    scorePoints: Number(localStorage.getItem(`pin_${pin}_scorePoints`) ?? SCORE_POINTS_DEFAULT),
  }
}

function readPinHardware(pin: number): PinHardware {
  return {
    debounce: Number(localStorage.getItem(`pin_${pin}_debounce`) ?? DEBOUNCE_DEFAULT),
    noise: Number(localStorage.getItem(`pin_${pin}_noise`) ?? NOISE_DEFAULT),
  }
}

export function useSettings(allPins: number[]): SettingsService {
  const [game, setGameState] = useState<GameSettings>(loadGame)
  const [pinConfigs, setPinConfigs] = useState<Record<number, PinConfig>>(() =>
    Object.fromEntries(allPins.map((p) => [p, readPinConfig(p)]))
  )
  const [pinHardwares, setPinHardwares] = useState<Record<number, PinHardware>>(() =>
    Object.fromEntries(allPins.map((p) => [p, readPinHardware(p)]))
  )

  const pinKey = allPins.join(',')
  useEffect(() => {
    setPinConfigs(Object.fromEntries(allPins.map((p) => [p, readPinConfig(p)])))
    setPinHardwares(Object.fromEntries(allPins.map((p) => [p, readPinHardware(p)])))
  }, [pinKey])

  const setGame = <K extends keyof GameSettings>(key: K, value: GameSettings[K]): void => {
    const clamped = GAME_CLAMP[key](value as number) as GameSettings[K]
    setGameState((prev) => ({ ...prev, [key]: clamped }))
    localStorage.setItem(GAME_KEYS[key], String(clamped))
  }

  const pinConfig = (pin: number): PinConfig => pinConfigs[pin] ?? readPinConfig(pin)

  const setPinConfig = (pin: number, updates: Partial<PinConfig>): void => {
    setPinConfigs((prev) => ({ ...prev, [pin]: { ...prev[pin], ...updates } }))
    if (updates.active !== undefined)
      localStorage.setItem(`pin_${pin}_active`, String(updates.active))
    if (updates.miss !== undefined) localStorage.setItem(`pin_${pin}_miss`, String(updates.miss))
    if (updates.scorePoints !== undefined)
      localStorage.setItem(`pin_${pin}_scorePoints`, String(updates.scorePoints))
  }

  const pinHardware = (pin: number): PinHardware => pinHardwares[pin] ?? readPinHardware(pin)

  const setPinHardware = async (
    pin: number,
    updates: Partial<PinHardware>,
    connected: boolean
  ): Promise<void> => {
    const clamped: Partial<PinHardware> = {}
    if (updates.debounce !== undefined) {
      clamped.debounce = updates.debounce
      localStorage.setItem(`pin_${pin}_debounce`, String(clamped.debounce))
      if (connected) await arduinoService.setDebounce(clamped.debounce, pin)
    }
    if (updates.noise !== undefined) {
      clamped.noise = updates.noise
      localStorage.setItem(`pin_${pin}_noise`, String(clamped.noise))
      if (connected) await arduinoService.setNoiseTolerance(clamped.noise, pin)
    }
    setPinHardwares((prev) => ({ ...prev, [pin]: { ...prev[pin], ...clamped } }))
  }

  return { game, setGame, pinConfigs, pinConfig, setPinConfig, pinHardware, setPinHardware }
}
